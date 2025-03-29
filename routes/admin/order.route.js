const express = require("express");
const multer = require('multer');
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/admin/order.controller");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get('/', controller.index);

router.patch('/change-multi', controller.changeMulti);

module.exports = router;