const express = require("express");
const multer = require('multer');
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/admin/my-account.controller");
const validate = require("../../validates/admin/account.validate");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get('/', controller.index);

router.get('/edit', controller.edit);

router.patch(
    '/edit',
    upload.single('avatar'),
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.get("/change/password", controller.changePassword);

router.post('/change/password', validate.changePasswordPost, controller.changePasswordPost);

module.exports = router;