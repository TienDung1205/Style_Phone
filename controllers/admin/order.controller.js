const md5 = require("md5");
const Order = require("../../models/order.model");

const systemConfig = require("../../config/system");

// [GET] /admin/orders
module.exports.index = async (req, res) =>{

    const records = await Order.find({})
    .sort({ position: "desc"});

    res.render("admin/pages/orders/index.pug", {
        pageTitle:"Quản lý đặt hàng",
        records: records
    });
}