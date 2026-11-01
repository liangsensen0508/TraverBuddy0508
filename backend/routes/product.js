const express = require("express");
const router = express.Router();
const productHandler = require("../controller/produstHander.js");

router.get("/productList", productHandler.getProductList);
router.get("/productDetail", productHandler.getProductDetail);

module.exports = router;
