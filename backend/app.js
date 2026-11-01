const express = require('express')
const { initDB } = require('./db')
const cors = require('cors')
const { CORS_ORIGINS } = require('./config')
const app = express()
// cors 中间件要在 app 创建之后、路由注册之前挂载，否则不生效
// 上线时通过环境变量 CORS_ORIGINS 配置前端正式域名（逗号分隔）；
// 未配置时回退为允许所有来源，仅适合本地开发，请勿用于生产。
app.use(cors({
  origin: CORS_ORIGINS.length
    ? (origin, cb) => {
        // 无 origin 的请求（同源 / curl / 服务端调用）直接放行
        if (!origin || CORS_ORIGINS.includes(origin)) return cb(null, true)
        return cb(new Error('Not allowed by CORS'))
      }
    : true,
  credentials: true,
}))
const port = process.env.PORT || 3000
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', require('./routes/agent'))
// 用户相关接口：注册 / 登录（路径前缀 /user）
app.use('/user', require('./routes/use'))
// 商品相关接口：获取商品列表 / 获取商品详情（路径前缀 /product）
app.use('/product', require('./routes/product'))
// 天气相关接口：查询城市天气与近 15 天预报（路径前缀 /weather）
app.use('/weather', require('./routes/weather'))
// 支付相关接口：创建订单 / 查询状态 / 异步通知（路径前缀 /pay）
app.use('/pay', require('./routes/pay'))

// 先初始化数据库（建表），再启动 HTTP 服务，
// 避免服务起来了但表还没建好的窗口期
initDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
  })
  .catch((err) => {
    // 数据库连不上直接报错退出，提示检查配置
    console.error('数据库初始化失败，请检查 config/index.js 中的 DB_CONFIG:', err.message)
    process.exit(1)
  })