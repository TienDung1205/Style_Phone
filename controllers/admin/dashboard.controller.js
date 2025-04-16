const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const User = require("../../models/user.model");
const Order = require("../../models/order.model");

module.exports.dashboard = async (req, res) => {

    const statistic = {
        productCategory:{
            total: await ProductCategory.countDocuments({deleted: false}),
            active: await ProductCategory.countDocuments({deleted: false, status: "active"}),
            inactive: await ProductCategory.countDocuments({deleted: false, status: "inactive"})
        },
        product:{
            total: await Product.countDocuments({deleted: false}),
            active: await Product.countDocuments({deleted: false, status: "active"}),
            inactive: await Product.countDocuments({deleted: false, status: "inactive"})
        },
        user:{
            total: await User.countDocuments({deleted: false}),
            active: await User.countDocuments({deleted: false, status: "active"}),
            inactive: await User.countDocuments({deleted: false, status: "inactive"})
        },
        order:{
            total: await Order.countDocuments(),
            success: await Order.countDocuments({status: "success"}),
            delivering: await Order.countDocuments({status: "delivering"}),
            processing: await Order.countDocuments({status: "processing"}),
            canceled: await Order.countDocuments({status: "canceled"})
        }
    }

    res.render("admin/pages/dashboard/index.pug", {
        pageTitle:"Trang tổng quan",
        statistic: statistic
    });
}