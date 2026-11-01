// 聊天路由：HTTP POST 调用大模型（SSE 流式返回）
const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatHander.js");

router.post("/chat", chatController.chatMessage);

module.exports = router;
