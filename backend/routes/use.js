// 用户路由：注册 / 登录
// 注意：项目是 CommonJS 规范，统一用 require，不要混用 import
const express = require("express");
const router = express.Router();
const userController = require("../controller/userHander.js");

// POST /user/register —— 注册
router.post("/register", userController.register);

// POST /user/login —— 登录
router.post("/login", userController.login);

module.exports = router;
