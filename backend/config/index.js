// 本地开发：自动加载 backend/.env（不存在则忽略，继续用系统/平台注入的环境变量）
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
// 优先用 DATABASE_URL（线上平台一般直接注入这一个变量）；
// 本地开发用 .env 里的 PG_HOST / PG_PORT / PG_USER / PG_PASSWORD / PG_DATABASE 分项配置
const DB_CONFIG = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.PG_HOST || "localhost",
      port: Number(process.env.PG_PORT) || 5432,
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "",
      database: process.env.PG_DATABASE || "postgres",
      // 本地 PostgreSQL 默认不启用 SSL，这里不能开，否则报 "server does not support SSL"
      ssl: false,
    };

// ---------- JWT 配置 ----------
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ---------- CORS 配置 ----------
// 允许跨域访问的前端域名，逗号分隔。留空则回退为允许所有来源（仅本地开发用）。
// 上线时请务必在环境变量里配置你的前端正式域名，例如：
//   CORS_ORIGINS=https://your-app.com,https://www.your-app.com
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---------- 支付宝 AI 网页应用收款配置 ----------
const ATPAY = {
  // 应用 APPID（沙箱应用以 9021 开头）
  appId: process.env.AIPAY_APP_ID || "",

  // 应用私钥（PKCS1 或 PKCS8 格式均可，alipay-sdk 会自动识别）
  // 控制台的「非 JAVA 语言私钥」放在 AIPAY_PRIVATE_PKCS_KEY，「JAVA 语言私钥」放在 AIPAY_PRIVATE_KEY
  privateKey: process.env.AIPAY_PRIVATE_PKCS_KEY || process.env.AIPAY_PRIVATE_KEY || "",

  // 支付宝公钥（验证支付宝发来的异步通知 / 响应签名用；为空时验签不生效）
  // 注意：必须是「支付宝公钥」(AIPAY_ALIPAY_PUBLIC_KEY)，不是你自己的「应用公钥」(AIPAY_PUBLIC_KEY)
  alipayPublicKey: process.env.AIPAY_ALIPAY_PUBLIC_KEY || "",

  // 网关地址：默认沙箱，上线切换 https://openapi.alipay.com/gateway.do
  gateway: process.env.AIPAY_GATEWAY || "https://openapi-sandbox.dl.alipaydev.com/gateway.do",

  // 支付完成后浏览器回跳地址（同步回跳）。前端是 hash 路由，
  // 地址里的 # 会被支付宝网关截断，所以先回跳到后端中转，再 302 到前端结果页
  returnUrl: process.env.AIPAY_RETURN_URL || "http://localhost:3000/pay/return",

  // 前端页面地址：中转跳转的目标（本地开发为 Vite dev server）
  frontUrl: process.env.AIPAY_FRONT_URL || "http://localhost:5173",

  // 支付成功异步通知地址（必须公网可访问；本地开发留空，靠订单状态查询接口兜底）
  notifyUrl: process.env.AIPAY_NOTIFY_URL || "",
};

module.exports = {
  SILICONFLOW_API_KEY,
  SILICONFLOW_BASE_URL,
  SILICONFLOW_MODEL,
  DB_CONFIG,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CORS_ORIGINS,
  ATPAY,
};
