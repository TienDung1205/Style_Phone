const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const User = require("../../models/user.model");

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
        account:{
            total: 0,
            active: 0,
            inactive: 0
        }
    }

    res.render("admin/pages/dashboard/index.pug", {
        pageTitle:"Trang tổng quan",
        statistic: statistic
    });
}