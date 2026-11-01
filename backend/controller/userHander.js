// 用户控制器：处理注册 / 登录
// 密码安全方案：bcrypt 哈希存储 + JWT 签发
const bcrypt = require("bcryptjs");       // 纯 JS 实现的 bcrypt，无需编译原生模块
const jwt = require("jsonwebtoken");
const { pool } = require("../db.js");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/index.js");

// bcrypt 加盐轮数：10 是安全性与性能的常用平衡点（2^10 次迭代）
const SALT_ROUNDS = 10;

class UserController {
  /**
   * POST /user/register —— 用户注册
   * 请求体: { username: string, password: string, phone?: string }
   * 流程: 参数校验 → 查重 → bcrypt 哈希密码 → 插入数据库
   */
  async register(req, res) {
    try {
      const { username, password, phone } = req.body || {};

      // ---------- ① 参数校验 ----------
      if (!username || typeof username !== "string" || !password || typeof password !== "string") {
        return res.status(400).json({ error: "缺少参数 username 或 password" });
      }
      // 用户名长度与字符限制，防止脏数据和超长输入
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: "用户名长度需在 3-50 个字符之间" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "密码长度至少 6 位" });
      }

      // ---------- ② 查重 ----------
      // 先查一次给前端友好提示；真正防并发重复注册靠数据库 UNIQUE 约束
      const exist = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
      if (exist.rows.length > 0) {
        return res.status(409).json({ error: "用户名已被注册" });
      }

      // ---------- ③ 密码哈希 ----------
      // 永远不存明文密码：即使数据库泄露，攻击者也拿不到原始密码
      // 注意：哈希结果存进表里的 password 列（列名是历史遗留，内容是 bcrypt 哈希）
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // ---------- ④ 插入数据库 ----------
      // $1/$2/$3 是参数化查询占位符，防止 SQL 注入；phone 可选，不传则为 NULL
      // RETURNING 让 INSERT 直接返回新行，省一次查询
      const result = await pool.query(
        "INSERT INTO users (username, password, phone) VALUES ($1, $2, $3) RETURNING id, username, phone, created_at",
        [username, passwordHash, phone || null]
      );
      const user = result.rows[0];

      res.status(201).json({
        message: "注册成功",
        user: { id: user.id, username: user.username, phone: user.phone, createdAt: user.created_at },
      });
    } catch (err) {
      // 并发注册同一用户名时，UNIQUE 约束会在这里以 23505 错误兜底
      if (err.code === "23505") {
        return res.status(409).json({ error: "用户名已被注册" });
      }
      console.error("注册失败:", err);
      res.status(500).json({ error: "服务器内部错误" });
    }
  }

  /**
   * POST /user/login —— 用户登录
   * 请求体: { username: string, password: string }
   * 流程: 参数校验 → 查用户 → bcrypt 比对密码 → 签发 JWT
   */
  async login(req, res) {
    try {
      const { username, password } = req.body || {};

      // ---------- ① 参数校验 ----------
      if (!username || !password) {
        return res.status(400).json({ error: "缺少参数 username 或 password" });
      }

      // ---------- ② 查询用户 ----------
      // password 列存的是 bcrypt 哈希
      const result = await pool.query(
        "SELECT id, username, password FROM users WHERE username = $1",
        [username]
      );
      // 用户不存在时返回笼统的"用户名或密码错误"，
      // 避免攻击者借此探测哪些用户名存在
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "用户名或密码错误" });
      }
      const user = result.rows[0];

      // ---------- ③ 比对密码 ----------
      // bcrypt.compare 会自动用存储哈希里的盐重新计算并比较
      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
        return res.status(401).json({ error: "用户名或密码错误" });
      }

      // ---------- ④ 签发 JWT ----------
      // payload 只放用户 id 和用户名，不要放敏感信息（token 只是 base64，不是加密）
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.json({
        message: "登录成功",
        token,
        user: { id: user.id, username: user.username },
      });
    } catch (err) {
      console.error("登录失败:", err);
      res.status(500).json({ error: "服务器内部错误" });
    }
  }
}

module.exports = new UserController();
