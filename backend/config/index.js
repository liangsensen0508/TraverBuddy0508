// 本地开发：自动加载 websocket/.env（不存在则忽略，继续用系统/平台注入的环境变量）
// 线上部署时不要把 .env 上传，直接在服务器/平台的环境变量里配置同名变量
const path = require("node:path");
try {
  process.loadEnvFile(path.join(__dirname, "..", ".env"));
} catch {
  // 没有 .env 文件时忽略
}

// 硅基流动（SiliconFlow）配置
// 官网: https://siliconflow.com
// API 文档: https://docs.siliconflow.com
// 通过环境变量 SILICONFLOW_API_KEY 传入密钥
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || "";

// 硅基流动 OpenAI 兼容端点
// 国内站（cloud.siliconflow.cn）的 Key 必须用 .cn 端点；国际站用 api.siliconflow.com
const SILICONFLOW_BASE_URL =
  process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";

// 可用模型列表: https://docs.siliconflow.com/en/userguide/models
const SILICONFLOW_MODEL =
  process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V3";

// ---------- PostgreSQL 数据库配置 ----------
// 通过环境变量传入，避免把密码硬编码在代码里
const DB_CONFIG = {
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "asd.1314", // 必填：通过环境变量 PG_PASSWORD 传入
  database: process.env.PG_DATABASE || "postgres",
};

// ---------- JWT 配置 ----------
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ---------- 支付宝 AI 网页应用收款配置 ----------
const ATPAY = {
  // 应用 APPID（沙箱应用以 9021 开头）
  appId: process.env.ATPAY_APP_ID || "",

  // 应用私钥（PKCS#1 格式，请求签名用）
  privateKey: process.env.ATPAY_PRIVATE_KEY || "",

  // 支付宝公钥（验证支付宝发来的异步通知 / 响应签名用；为空时验签不生效）
  alipayPublicKey: process.env.ATPAY_ALIPAY_PUBLIC_KEY || "",

  // 网关地址：默认沙箱，上线切换 https://openapi.alipay.com/gateway.do
  gateway: process.env.ATPAY_GATEWAY || "https://openapi-sandbox.dl.alipaydev.com/gateway.do",

  // 支付完成后浏览器回跳地址（同步回跳）。前端是 hash 路由，
  // 地址里的 # 会被支付宝网关截断，所以先回跳到后端中转，再 302 到前端结果页
  returnUrl: process.env.ATPAY_RETURN_URL || "http://localhost:3000/pay/return",

  // 前端页面地址：中转跳转的目标（本地开发为 Vite dev server）
  frontUrl: process.env.ATPAY_FRONT_URL || "http://localhost:5173",

  // 支付成功异步通知地址（必须公网可访问；本地开发留空，靠订单状态查询接口兜底）
  notifyUrl: process.env.ATPAY_NOTIFY_URL || "",
};

module.exports = {
  SILICONFLOW_API_KEY,
  SILICONFLOW_BASE_URL,
  SILICONFLOW_MODEL,
  DB_CONFIG,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ATPAY,
};
