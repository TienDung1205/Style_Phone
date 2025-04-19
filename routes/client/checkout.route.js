const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/checkout.controller");

const validate = require("../../validates/client/order.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.get("/", authMiddleware.requireAuth, controller.index);

router.post("/order", validate.order, controller.order);

router.get("/success/:orderId", authMiddleware.requireAuth, controller.success);

router.get('/:productId', authMiddleware.requireAuth, controller.buyNow);

router.post('/buy-now/order', validate.order, controller.buyNowOrder);

module.exports = router;