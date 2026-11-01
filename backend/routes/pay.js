// 支付路由：创建订单 / 查询状态 / 接收异步通知
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const payHandler = require("../controller/payHander.js");
const { JWT_SECRET } = require("../config/index.js");

/**
 * 登录校验中间件：从请求头 Authorization: Bearer <token> 解析用户 id
 * 验证通过把 userId 挂到 req 上；失败返回 401
 */
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: "请先登录" });
  }
}

// 创建支付订单并返回支付表单（需登录）
router.post("/create", auth, payHandler.createPayOrder);

// 查询订单支付状态，未支付时主动向支付宝查一次并同步（需登录）
router.get("/status", auth, payHandler.getPayStatus);

// 支付宝异步通知（支付宝服务器调用，靠签名验证身份，不走登录校验）
router.post("/notify", payHandler.notify);

// 支付完成浏览器回跳中转：302 到前端结果页（浏览器导航，无登录态）
router.get("/return", payHandler.payReturn);

module.exports = router;
