const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const productsHelper = require("../../helpers/products");

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

    const records = await Order.find({status: "success"});

    for (const record of records) {
        if(record.user_id){
            const user = await User.findOne({
                _id: record.user_id
            }).select("-password")

            record.user = user;
        }

        if (record.products.length > 0) {
            for (const item of record.products) {
                item.newPrice = productsHelper.newPriceProduct(item); // newPrice
                item.totalPrice = item.newPrice * item.quantity;
            }
        }
    
        record.totalPrice = record.products.reduce((sum, item) => sum + item.totalPrice, 0);

    }

    let users = await User.find({}).select("-password");

    // Tạo map lưu tổng chi tiêu và số đơn theo userId
    const userStats = {};
    for (const record of records) {
        const userId = record.user_id?.toString();
        if (!userId) continue;
        if (!userStats[userId]) {
            userStats[userId] = { total: 0, totalOrder: 0 };
        }
        userStats[userId].total += record.totalPrice;
        userStats[userId].totalOrder += 1;
    }

    // Gán lại cho từng user
    for (const user of users) {
        const stat = userStats[user._id.toString()] || { total: 0, totalOrder: 0 };
        user.total = stat.total;
        user.totalOrder = stat.totalOrder;
    }

    users.sort((a, b) => b.total - a.total);

    // Lấy top 3 người chi nhiều nhất
    const top3Users = users.slice(0, 3);

    res.render("admin/pages/dashboard/index.pug", {
        pageTitle:"Trang tổng quan",
        statistic: statistic,
        top3Users: top3Users
    });
}