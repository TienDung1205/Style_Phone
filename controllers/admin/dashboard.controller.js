const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const User = require("../../models/user.model");
const Order = require("../../models/order.model");

module.exports.dashboard = async (req, res) => {

    const statistic = {
        productCategory:{
            total: await ProductCategory.countDocuments(),
            active: await ProductCategory.countDocuments({deleted: false, status: "active"}),
            inactive: await ProductCategory.countDocuments({deleted: false, status: "inactive"}),
            deleted: await ProductCategory.countDocuments({deleted: true})
        },
        product:{
            total: await Product.countDocuments(),
            active: await Product.countDocuments({deleted: false, status: "active"}),
            inactive: await Product.countDocuments({deleted: false, status: "inactive"}),
            featured: await Product.countDocuments({deleted: false, featured: "1"}),
            deleted: await Product.countDocuments({deleted: true})
        },
        user:{
            total: await User.countDocuments(),
            active: await User.countDocuments({deleted: false, status: "active"}),
            inactive: await User.countDocuments({deleted: false, status: "inactive"}),
            deleted: await User.countDocuments({deleted: true})
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