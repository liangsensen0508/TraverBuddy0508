// 商品控制器：获取商品列表 / 获取商品详情
// 注意：product.id 为 varchar 主键；desc 是 PostgreSQL 保留字，需加双引号
const { pool } = require("../db.js");

class ProductHandler {
  /**
   * GET /product/productList —— 商品列表
   * 返回全部商品的简要字段
   */
  async getProductList(req, res) {
    try {
      const { rows } = await pool.query(
        'SELECT id, image, "desc", price, title, unit, sales, rating, original_price, discount_tag, tags FROM product'
      );
      res.json(rows);
    } catch (err) {
      console.error("获取商品列表失败:", err);
      res.status(500).json({ error: "服务器内部错误" });
    }
  }

  /**
   * GET /product/productDetail?id=xxx —— 商品详情
   * 返回单个商品的全部字段（含 tags/gallery/reviews 等 jsonb 字段）
   */
  async getProductDetail(req, res) {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "缺少参数 id" });
    }

    try {
      const { rows } = await pool.query("SELECT * FROM product WHERE id = $1", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "商品不存在" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("获取商品详情失败:", err);
      res.status(500).json({ error: "服务器内部错误" });
    }
  }
}

module.exports = new ProductHandler();
