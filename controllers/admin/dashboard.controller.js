const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const User = require("../../models/user.model");
const Order = require("../../models/order.model");

module.exports.dashboard = async (req, res) => {

    const statistic = {
        productCategory:{
            total: await ProductCategory.countDocuments({deleted: false})
        },
        product:{
            total: await Product.countDocuments({deleted: false}),
            active: await Product.countDocuments({deleted: false, status: "active"})
        },
        user:{
            total: await User.countDocuments()
        },
        order:{
            processing: await Order.countDocuments({status: "processing"})
        }
    }

    res.render("admin/pages/dashboard/index.pug", {
        pageTitle:"Trang tổng quan",
        statistic: statistic
    });
}