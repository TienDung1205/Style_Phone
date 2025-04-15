const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

const validate = require("../../validates/client/user.validate")
const authMiddleware = require("../../middlewares/client/auth.middleware");

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

router.get("/change/password", controller.changePassword);

router.post('/change/password', validate.changePasswordPost, controller.changePasswordPost);

module.exports = router;