# 云游宝 · AI 旅游助手

一款面向移动端的旅游 AI 助手 H5 应用。用户可以和 AI 助手「卯卯」对话，咨询行程规划、火车票、天气等问题；同时内置杭州本地旅游商品浏览、登录注册、投诉反馈等功能。

## 技术栈

- **框架**：Vue 3（`<script setup>`）+ TypeScript
- **构建**：Vite 8
- **UI 组件**：Vant 4（按需自动引入）
- **路由**：Vue Router 4（hash 模式）
- **请求**：axios（统一封装）+ fetch（AI 对话 SSE 流式）
- **样式**：Less + postcss-pxtorem（移动端自适应）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查 + 打包
npm run build
```

> 接口根地址由环境变量 `VITE_API_BASE_URL` 控制，见 `.env.development` / `.env.production`。

## 目录结构

```
agent-travel/
├── src/
│   ├── api/              # 接口封装
│   │   ├── index.ts      #   所有接口与类型定义（登录/注册/AI 对话/商品）
│   │   └── request.ts    #   axios 实例 + 拦截器 + get/post
│   ├── components/       # 通用组件（PascalCase 命名）
│   │   ├── BottomBar.vue       # 首页底部功能栏 + 输入框
│   │   ├── HomeHeader.vue      # 首页头部欢迎区
│   │   ├── ProductList.vue     # 商品横向滚动列表
│   │   ├── QuestionCard.vue    # 推荐问题卡片
│   │   ├── ChatMessage.vue     # 聊天气泡（用户/AI 消息）
│   │   ├── TrainTicketCard.vue # AI 回复中的火车票卡片
│   │   └── WeatherCard.vue     # AI 回复中的天气卡片
│   ├── views/            # 页面（kebab-case 命名）
│   │   ├── Home.vue            # 首页（AI 对话主界面）
│   │   ├── goods-list.vue      # 旅游商品列表
│   │   ├── goods-details.vue   # 商品详情
│   │   ├── complaint.vue       # 投诉与建议
│   │   ├── login.vue           # 登录
│   │   ├── register.vue        # 注册
│   │   └── profile.vue         # 个人中心
│   ├── mock/             # 本地模拟数据（接口就绪后移除）
│   │   └── cards.ts      #   火车票 / 天气卡片演示数据
│   ├── router/           # 路由配置（含登录守卫）
│   ├── utils/            # 工具函数
│   │   └── auth.ts       #   登录态管理（暂用 localStorage）
│   ├── assets/           # 静态图片
│   ├── App.vue
│   └── main.ts
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
└── index.html
```

## 页面路由

| 路径               | 名称            | 说明             | 需登录 |
| ------------------ | --------------- | ---------------- | ------ |
| `/`                | home            | 首页（AI 对话）  | 否     |
| `/goods-list`      | goods-list      | 旅游商品列表     | 否     |
| `/goods-details`   | goods-details   | 商品详情         | 否     |
| `/pay-result`      | pay-result      | 支付结果页       | 否     |
| `/complaint`       | complaint       | 投诉与建议       | 否     |
| `/login`           | login           | 登录             | 否     |
| `/register`        | register        | 注册             | 否     |
| `/profile`         | profile         | 个人中心         | 是     |

## 核心流程

1. **AI 对话**（首页）：用户输入文字或图片 → `chatApi` 用 fetch 流式读取 `/chat` 的 SSE 响应 → 打字机效果展示回复。根据问题关键词自动附加「火车票」或「天气」工具卡片（当前为演示数据）。
2. **商品浏览**：首页商品列表 / 团购页 → 点击进入详情页，数据来自 `/product/productList`、`/product/productDetail` 接口。
3. **支付**（支付宝沙箱，手机网站支付）：详情页「立即预订」→ `POST /pay/create` 创建订单并返回支付表单 → 表单提交跳转支付宝收银台 → 支付完成后经后端 `/pay/return` 中转 302 回前端 `/pay-result` → 结果页轮询 `GET /pay/status` 确认支付状态。
4. **登录态**：登录后保存后端签发的 JWT，请求拦截器自动携带 `Authorization` 头。

## 待接入项（接口就绪后）

- 火车票、天气数据当前仍为 mock（`mock/cards.ts` 固定演示数据），需替换为真实接口。
- 个人中心菜单、收藏为占位功能，需补充后端。
- 支付异步通知（`/pay/notify`）需要公网地址，部署后配置 `ATPAY_NOTIFY_URL`；本地开发靠状态查询接口兜底。
