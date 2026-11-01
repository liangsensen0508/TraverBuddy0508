# 云游宝 · AI 旅游助手

面向移动端的旅游 AI 助手 H5 应用。用户可与 AI 助手「卯卯」对话咨询行程规划、火车票、天气等；同时内置杭州本地旅游商品浏览、登录注册、投诉反馈与支付宝支付等功能。

## 技术栈

- **前端**：Vue 3 + TypeScript + Vite 8 + Vant 4（移动端自适应）
- **后端**：Node.js + Express 5 + PostgreSQL（AI 对话用 SSE 流式输出）
- **其他**：支付宝沙箱支付、JWT 鉴权、SiliconFlow（DeepSeek-V3）大模型

## 目录结构

```
Travel buddy/
├── frontend/          # Vue 3 前端（H5）
├── backend/           # Express 后端 + PostgreSQL（SSE 流式）
└── .gitignore
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev        # 启动开发服务器（默认 http://localhost:5173）
```

### 后端

```bash
cd backend
cp .env.example .env   # 复制环境变量模板并填入真实密钥
npm install
npm start          # 启动后端（默认 http://localhost:3000）
```

## 环境变量

前后端均通过环境变量配置，**真实密钥不提交到仓库**：

- 后端：复制 `backend/.env.example` 为 `backend/.env` 并填写
- 前端：见 `frontend/.env.development` / `frontend/.env.production`

更多前端细节见 `frontend/README.md`。
