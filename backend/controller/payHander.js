// 支付控制器：创建订单并生成支付表单 / 接收支付宝异步通知 / 查询订单支付状态
// 支付产品：支付宝手机网站支付 alipay.trade.wap.pay（H5 页面跳转收银台）
const { AlipaySdk } = require("alipay-sdk");
const { pool } = require("../db.js");
const { ATPAY } = require("../config/index.js");

// 订单有效期（分钟）：超时未支付自动作废
const ORDER_EXPIRE_MINUTES = 30;

// 支付宝客户端：应用私钥给请求签名，支付宝公钥校验响应（公钥未配置时校验自动跳过）
const alipayClient = new AlipaySdk({
  appId: ATPAY.appId,
  privateKey: ATPAY.privateKey,
  alipayPublicKey: ATPAY.alipayPublicKey || undefined,
  gateway: ATPAY.gateway,
});

/** 生成带随机后缀的单号，降低同一毫秒内重复的概率 */
function createNo(prefix) {
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}${Date.now()}${suffix}`;
}

/**
 * 生成支付宝 H5 支付表单
 * 返回一段自动提交的 HTML 表单，前端写入页面即可跳转到支付宝收银台
 * @param orderNo 商户订单号（支付成功后凭它对账）
 * @param subject 商品名（收银台展示）
 * @param amount 金额字符串（两位小数，如 "128.00"）
 */
function createPayForm(orderNo, subject, amount) {
  return alipayClient.pageExec("alipay.trade.wap.pay", {
    method: "POST",
    bizContent: {
      out_trade_no: orderNo,
      total_amount: amount,
      subject,
      product_code: "QUICK_WAP_WAY", // 手机网站支付的固定产品码
    },
    // 同步回跳：付完款浏览器先到后端中转 /pay/return（地址不能带 #，会被网关截断），
    // 再由中转 302 到前端结果页
    returnUrl: ATPAY.returnUrl,
    // 异步通知：需要公网可达；本地开发不传，靠订单状态查询接口兜底
    ...(ATPAY.notifyUrl ? { notifyUrl: ATPAY.notifyUrl } : {}),
  });
}

/**
 * GET /pay/return —— 支付完成后的浏览器中转跳转
 * 支付宝把用户带回这里（附带回跳参数），我们取出订单号后 302 到前端结果页。
 * 浏览器地址栏导航不会携带登录 token，所以本接口不做登录校验。
 */

/** 把订单标记为支付成功（业务订单 + 支付单一起更新） */
async function markOrderPaid(orderNo, tradeNo) {
  await pool.query(
    `UPDATE orders SET status = 'PAID', update_time = NOW()
     WHERE order_no = $1 AND status = 'WAIT_PAY'`,
    [orderNo]
  );
  await pool.query(
    `UPDATE pay_orders SET status = 'SUCCESS', alipay_trade_no = $2, update_time = NOW()
     WHERE order_no = $1`,
    [orderNo, tradeNo]
  );
}

/**
 * 主动向支付宝查询订单的真实支付状态，已支付就同步进数据库
 * @returns 已支付返回 true（数据库已更新），其余情况返回 false
 */
async function syncFromAlipay(orderNo) {
  const result = await alipayClient.exec("alipay.trade.query", {
    bizContent: { out_trade_no: orderNo },
  });
  // code 10000 表示接口调用成功；40004 表示交易不存在（用户还没付）
  if (result.code !== "10000") return false;
  if (result.tradeStatus !== "TRADE_SUCCESS" && result.tradeStatus !== "TRADE_FINISHED") {
    return false;
  }
  await markOrderPaid(orderNo, result.tradeNo);
  return true;
}

class PayHandler {
  /**
   * GET /pay/return —— 支付完成后的浏览器中转跳转
   * 支付宝把用户带回这里（附带回跳参数），取出订单号后 302 到前端结果页。
   * 浏览器地址栏导航不会携带登录 token，所以本接口不做登录校验。
   * 注意：托管平台收不到支付宝的异步通知（notify），
   * 所以在这里主动向支付宝查一次真实状态并同步数据库，
   * 这样用户付完款回到结果页时能立刻看到「已支付」。
   */
  async payReturn(req, res) {
    // 支付宝回跳时会带上 out_trade_no（商户订单号）
    const orderNo = req.query.out_trade_no || req.query.orderNo || "";
    if (orderNo) {
      // 查询失败不阻断跳转，结果页还会再查一次
      await syncFromAlipay(orderNo).catch(() => {});
    }
    const target = orderNo
      ? `${ATPAY.frontUrl}/#/pay-result?orderNo=${encodeURIComponent(orderNo)}`
      : `${ATPAY.frontUrl}/#/pay-result`;
    res.redirect(302, target);
  }

  /**
   * POST /pay/create —— 创建订单并返回支付宝支付表单
   * 请求体：{ productId }；用户身份从 JWT 解析（不信任前端传 userId）
   * 返回：{ order_no, pay_amount, expire_time, pay_form }
   */
  async createPayOrder(req, res) {
    const { productId } = req.body || {};
    const userId = req.userId; // 由路由的 auth 中间件解析写入
    if (!productId) {
      return res.status(400).json({ message: "productId 不能为空" });
    }

    // 事务中的所有 SQL 必须用同一个 client，保证订单和支付单一起成功或回滚
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 金额和商品名以数据库为准，不信任前端传值
      const productResult = await client.query(
        "SELECT id, title, price FROM product WHERE id = $1 FOR UPDATE",
        [productId]
      );
      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "商品不存在" });
      }
      const product = productResult.rows[0];
      const payAmount = Number(product.price);
      if (!Number.isFinite(payAmount) || payAmount <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "商品价格异常" });
      }

      // 同一用户同时只保留一笔未过期的待支付订单
      const existing = await client.query(
        `SELECT order_no, product_id FROM orders
         WHERE user_id = $1 AND status = 'WAIT_PAY' AND expire_time > NOW()
         LIMIT 1`,
        [userId]
      );
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        await client.query("ROLLBACK");
        // 买的是同一件商品：复用旧订单直接继续支付
        if (row.product_id === productId) {
          const info = await client.query(
            `SELECT o.order_no, o.pay_amount, o.expire_time, p.title
             FROM orders o JOIN product p ON p.id = o.product_id
             WHERE o.order_no = $1`,
            [row.order_no]
          );
          const order = info.rows[0];
          return res.json({
            order_no: order.order_no,
            pay_amount: order.pay_amount,
            expire_time: order.expire_time,
            pay_form: createPayForm(order.order_no, order.title, Number(order.pay_amount).toFixed(2)),
          });
        }
        // 买的是别的商品：先处理旧订单
        return res.status(409).json({
          message: "您有一笔待支付订单，请先完成支付或等待其过期",
          order_no: row.order_no,
        });
      }

      const orderNo = createNo("ORDER");
      const payNo = createNo("PAY");
      const expireTime = new Date(Date.now() + ORDER_EXPIRE_MINUTES * 60 * 1000);

      await client.query(
        `INSERT INTO orders (order_no, user_id, product_id, pay_amount, expire_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderNo, userId, productId, payAmount, expireTime]
      );
      await client.query(
        `INSERT INTO pay_orders (pay_no, order_no, pay_amount)
         VALUES ($1, $2, $3)`,
        [payNo, orderNo, payAmount]
      );
      await client.query("COMMIT");

      return res.status(201).json({
        order_no: orderNo,
        pay_amount: payAmount.toFixed(2),
        expire_time: expireTime,
        pay_form: createPayForm(orderNo, product.title, payAmount.toFixed(2)),
      });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("创建支付订单失败:", error);
      return res.status(500).json({ message: "创建支付订单失败" });
    } finally {
      client.release();
    }
  }

  /**
   * GET /pay/status?orderNo=xxx —— 查询订单支付状态
   * 本地开发没有公网通知地址时，这里是确认支付结果的兜底手段：
   * 服务端主动调支付宝查询接口，把真实状态同步进数据库后再返回
   */
  async getPayStatus(req, res) {
    const { orderNo } = req.query;
    if (!orderNo) {
      return res.status(400).json({ message: "缺少参数 orderNo" });
    }

    // 只能查自己的订单
    const result = await pool.query(
      `SELECT order_no, pay_amount, status, expire_time
       FROM orders WHERE order_no = $1 AND user_id = $2`,
      [orderNo, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "订单不存在" });
    }
    const order = result.rows[0];

    if (order.status === "WAIT_PAY") {
      if (new Date(order.expire_time).getTime() <= Date.now()) {
        // 超时未支付：作废订单
        await pool.query(
          `UPDATE orders SET status = 'CANCELED', update_time = NOW() WHERE order_no = $1`,
          [orderNo]
        );
        order.status = "CANCELED";
      } else {
        // 未过期：向支付宝查一次真实状态（查询失败不影响返回当前状态）
        try {
          if (await syncFromAlipay(orderNo)) {
            order.status = "PAID";
          }
        } catch (error) {
          console.error("查询支付宝订单状态失败:", error.message);
        }
      }
    }

    return res.json({
      status: order.status,
      pay_amount: order.pay_amount,
      expire_time: order.expire_time,
    });
  }

  /**
   * POST /pay/notify —— 支付宝支付成功的异步通知（支付宝服务器调用，无登录态）
   * 安全要点：
   *  1. 必须用支付宝公钥验签，防止伪造通知
   *  2. 通知金额必须与订单一致，防止篡改
   *  3. 处理成功返回纯文本 "success"，否则支付宝会按策略持续重试
   */
  async notify(req, res) {
    // 没配置支付宝公钥就无法验签：拒绝处理，避免被伪造通知刷单
    if (!ATPAY.alipayPublicKey) {
      console.error("[pay/notify] 未配置 ATPAY_ALIPAY_PUBLIC_KEY，无法验签，通知已拒绝");
      return res.send("fail");
    }
    if (!alipayClient.checkNotifySign(req.body)) {
      console.warn("[pay/notify] 验签失败:", req.body.out_trade_no);
      return res.send("fail");
    }

    const { out_trade_no, trade_no, trade_status, total_amount } = req.body;
    // 非支付成功类通知（如交易关闭）直接应答 success，让支付宝停止重试
    if (trade_status !== "TRADE_SUCCESS" && trade_status !== "TRADE_FINISHED") {
      return res.send("success");
    }

    const order = await pool.query(
      "SELECT pay_amount FROM orders WHERE order_no = $1",
      [out_trade_no]
    );
    if (order.rows.length === 0) {
      return res.send("fail");
    }
    if (Number(order.rows[0].pay_amount) !== Number(total_amount)) {
      console.error(`[pay/notify] 金额不一致，订单 ${out_trade_no}`);
      return res.send("fail");
    }

    await markOrderPaid(out_trade_no, trade_no);
    return res.send("success");
  }
}

module.exports = new PayHandler();
