const express = require("express");
const multer = require('multer');
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/client/user.controller");

const validate = require("../../validates/client/user.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

    router.get("/register", controller.register);

    router.post("/register", validate.registerPost, controller.registerPost);

    router.get("/register/otp", controller.otpRegister);

    router.post("/register/otp", validate.otpPost, controller.otpRegisterPost);

router.get("/login", controller.login);

router.post("/login", validate.loginPost, controller.loginPost);

router.get('/logout', controller.logout);

    router.get('/password/forgot', controller.forgotPassword);

    router.post('/password/forgot', validate.forgotPasswordPost, controller.forgotPasswordPost);

    router.get('/password/otp', controller.otpPassword);

    router.post('/password/otp', validate.otpPost, controller.otpPasswordPost);

router.get('/password/reset', controller.resetPassword);

router.post('/password/reset', validate.resetPasswordPost, controller.resetPasswordPost);

router.get("/info", authMiddleware.requireAuth, controller.info);

router.get("/change/password", authMiddleware.requireAuth, controller.changePassword);

router.post('/change/password', validate.changePasswordPost, controller.changePasswordPost);

router.get("/edit", authMiddleware.requireAuth, controller.edit);

router.patch(
    "/edit",
    upload.single('avatar'),
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.get("/order", authMiddleware.requireAuth, controller.order);

router.get("/order/detail/:id", authMiddleware.requireAuth, controller.orderDetail);

router.post('/order/canceled/:id', controller.canceledItem);

module.exports = router;