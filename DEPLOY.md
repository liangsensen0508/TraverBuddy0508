# 云游宝 · 上线部署环境变量清单

> 数据库已迁移至 Neon，后端已通过 `DATABASE_URL` 连接。本文档整理上线时必须配置的环境变量，
> 供你在部署平台（Railway / Render / Fly.io / 云服务器等）的环境变量面板中直接填写。
>
> **所有真实密钥不要提交到 git**（`.env` 已被 `.gitignore` 排除）。

---

## 一、后端环境变量（部署平台配置）

| 变量名 | 是否必填 | 说明 | 示例值 |
|---|---|---|---|
| `DATABASE_URL` | ✅ 必填 | Neon 连接串，已可用，直接用你迁移好的那个 | `postgresql://neondb_owner:...@ep-xxx-pooler....aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | ✅ 必填 | JWT 签名密钥，**必须换成随机强密钥**，勿用默认值 | `openssl rand -base64 48` 生成 |
| `JWT_EXPIRES_IN` | 可选 | token 有效期，默认 `7d` | `7d` |
| `PORT` | 可选 | 后端监听端口，平台一般自动注入 | `3000`（Railway/Render 会自动注入） |
| `CORS_ORIGINS` | ✅ 上线必填 | 允许跨域的前端域名，逗号分隔；**留空 = 允许所有来源（不安全）** | `https://your-app.vercel.app` |
| `SILICONFLOW_API_KEY` | ✅ 必填 | 硅基流动大模型密钥 | `sk-...` |
| `SILICONFLOW_BASE_URL` | 可选 | 国内站用 `.cn` 端点 | `https://api.siliconflow.cn/v1` |
| `SILICONFLOW_MODEL` | 可选 | 默认 `deepseek-ai/DeepSeek-V3` | `deepseek-ai/DeepSeek-V3` |

### 支付宝 AI 付（真实收款，已开通 aipay.alipay.com）

个人创作者可用 AI 付收款，无需企业资质。接入值全部来自 **aipay.alipay.com 控制台**：

| 变量名 | 去哪拿 | 说明 |
|---|---|---|
| `ATPAY_APP_ID` | 控制台「线上验证」 | 线上 APPID（2021/2024 开头 16 位数字），替换沙箱 `9021...` |
| `ATPAY_PRIVATE_KEY` | 控制台密钥管理 | 线上应用私钥，选 **Node.js / 非 Java 格式** |
| `ATPAY_ALIPAY_PUBLIC_KEY` | 控制台密钥管理 | 线上支付宝公钥（验证异步通知签名） |
| `ATPAY_GATEWAY` | 固定值 | 改成 `https://openapi.alipay.com/gateway.do` |

> ⚠️ 上面 4 项必须**一起替换**：沙箱 APPID 配生产网关会直接报错。

| 变量名 | 当前值 | 说明 |
|---|---|---|
| `ATPAY_RETURN_URL` | 线上后端 `/pay/return?sharecode=...` | 支付宝付完款回跳的地址；托管平台需带访问码穿透拦截 |
| `ATPAY_FRONT_URL` | 线上前端地址（带 sharecode） | 回跳中转后 302 到前端结果页 |
| `ATPAY_NOTIFY_URL` | 留空 | 托管平台拦支付宝服务器请求，收不到异步通知；已用 `/pay/return` 和 `/pay/status` 主动查询兜底。迁到公网托管后再填 `https://域名/pay/notify` |

**切完线上后的验证清单**（照 AI 付控制台「线上验证」走）：

- [ ] 发起一笔 0.01 元真实支付，支付宝 APP 扫码完成付款
- [ ] 付款后自动跳回结果页并显示「已支付」（走 `/pay/return` 主动查询）
- [ ] （可选）测试退款流程
- [ ] （可选）迁移到公网托管后补配 `ATPAY_NOTIFY_URL` 并复测

---

## 二、前端环境变量（构建时生效）

`frontend/.env.production` 中的 `VITE_API_BASE_URL` 需在 `npm run build` **之前**填好：

```
VITE_API_BASE_URL = https://你的后端域名
```

> 注意：这是**构建期**变量，改完必须重新 build 才生效。结尾不要带斜杠。

---

## 三、上线检查清单

- [ ] 后端平台环境变量已配 `DATABASE_URL`、`JWT_SECRET`、`SILICONFLOW_API_KEY`、`CORS_ORIGINS`
- [ ] `JWT_SECRET` 已替换为随机强密钥（不是 `dev-secret-change-me`）
- [ ] `CORS_ORIGINS` 已填前端正式域名（不留空）
- [ ] 前端 `.env.production` 的 `VITE_API_BASE_URL` 已填后端正式地址
- [ ] 前端已执行 `npm run build` 并部署产物
- [ ] 后端启动日志出现「数据库连接成功」（确认 Neon 连接正常）
- [ ] 逐个验证：注册/登录 → AI 对话（SSE 流式）→ 商品列表 → （可选）支付
- [ ] 支付上线：AI 付线上 APPID + 私钥 + 支付宝公钥 + 生产网关（4 项一起换），0.01 元真实支付验证通过

---

## 四、安全提醒

1. **`.env` 绝不能提交到 git**，生产密钥一律走平台的环境变量/密钥管理。
2. 现在 `backend/.env` 里本地开发仍可用，但正式部署请以平台环境变量为准，不要把本地 `.env` 直接上传。
3. CORS 务必白名单化，避免任意站点盗用你的后端接口。
