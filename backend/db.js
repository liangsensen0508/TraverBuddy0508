// 数据库连接模块：封装 pg 连接池，并提供连接测试
// 使用方式：在 app.js 里 `require('./db').initDB()`，之后各 controller 直接用 `pool.query(...)`
const { Pool } = require("pg");
const { DB_CONFIG } = require("./config/index.js");

// pg 连接池：内部自动管理连接的创建/复用/释放
const pool = new Pool(DB_CONFIG);

// 连接池级别的错误兜底，防止某条空闲连接异常时整个进程崩溃
pool.on("error", (err) => {
  console.error("数据库连接池异常:", err.message);
});

/**
 * 测试数据库连接是否可用（表结构由用户手动维护，此处不建表）
 */
async function initDB() {
  const client = await pool.connect(); // 从池里借一条连接
  try {
    await client.query("SELECT 1");
    console.log("数据库连接成功");
  } finally {
    client.release(); // 无论成功失败都要归还连接
  }
}

module.exports = { pool, initDB };
