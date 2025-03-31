const md5 = require("md5");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");

const systemConfig = require("../../config/system");

const filterStatusOrderHelper = require("../../helpers/filterStatusOrder");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const productsHelper = require("../../helpers/products");

const mongoose = require('mongoose');

// [GET] /admin/orders
module.exports.index = async (req, res) =>{
    let find = {};

    // filterStatus
    const filterStatusOrder = filterStatusOrderHelper(req.query);
     
    if(req.query.status){
        find.status = req.query.status;
    }
    // End filterStatus

    // Search
    const objectSearch = searchHelper(req.query);

    if(objectSearch.regex){
        find.$or = [
            { code: objectSearch.regex },
            { "userInfo.fullName": objectSearch.regex },
            { "userInfo.phone": objectSearch.regex },
            { "userInfo.address": objectSearch.regex }
        ];
    }
    // End Search

    // Pagination
    const countOrders = await Order.countDocuments(find);
 
    let objectPagination = paginationHelper(
        {
        limitItems: 10,
        currentPage: 1
        },
        req.query,
        countOrders
    )

    // End Pagination

    const records = await Order.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    // .sort({ position: "desc"});

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

                // const productId = item.product_id;
                // const productInfo = await Product.findOne({
                //     _id: productId
                // }).select("title thumbnail slug");
                // item.productInfo = productInfo;
                item.totalPrice = item.newPrice * item.quantity;
            }
        }
    
        record.totalPrice = record.products.reduce((sum, item) => sum + item.totalPrice, 0);

        const dateString = record.createdAt;
        const date = new Date(dateString);

        const formatter = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        });

        let formattedDate = formatter.format(date);

        // Tách chuỗi thành các phần
        const parts = formattedDate.split(' ');
        const timeParts = parts[0].split(':');
        const dateParts = parts[1].split('/');

        // Tạo chuỗi định dạng mong muốn
        const finalFormattedDate = `${timeParts[0]}h${timeParts[1]} ${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;

        record.purchaseDate = finalFormattedDate;
    }

    res.render("admin/pages/orders/index.pug", {
        pageTitle:"Quản lý đặt hàng",
        records: records,
        filterStatusOrder: filterStatusOrder,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [PATCH] /admin/orders/change-multi
module.exports.changeMulti = async (req, res) =>{
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    if(type == "success"){
        await Order.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "delivering") {
        await Order.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "processing") {
        await Order.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "canceled") {
        await Order.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else{
        
    }

    res.redirect("back");
}