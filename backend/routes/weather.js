// 天气路由：GET /weather?city=xx
const express = require("express");
const router = express.Router();
const { getWeather } = require("../controller/weatherHander.js");

router.get("/", getWeather);

module.exports = router;
