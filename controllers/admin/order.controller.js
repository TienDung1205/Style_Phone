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
    let find = {
        deleted: false
    }

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
    .sort({ position: "desc"});

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

        record.purchaseDate = formatter.format(date);

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
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type; // Trạng thái mới
    const ids = req.body.ids.split(", "); // Danh sách ID đơn hàng
    const errors = []; // Mảng lưu lỗi

    try {
        // Kiểm tra toàn bộ điều kiện trước khi cập nhật
        for (const id of ids) {
            const order = await Order.findOne({ _id: id });

            if (!order) {
                errors.push(`Không tìm thấy đơn hàng với mã: ${order.code}`);
                continue;
            }

            // Kiểm tra trạng thái hợp lệ
            const validTransitions = {
                processing: ["delivering", "canceled"],
                delivering: ["success", "canceled"],
                success: ["canceled"],
                canceled: ["processing"]
            };

            if (!validTransitions[order.status].includes(type)) {
                errors.push(`Không thể chuyển trạng thái từ "${order.status}" sang "${type}" (mã: ${order.code}).`);
                continue;
            }

            // Kiểm tra số lượng sản phẩm trong kho nếu cần
            if (type === "canceled" && order.status !== "canceled") {
                for (const product of order.products) {
                    const productInfo = await Product.findOne({ _id: product.product_id }).select("stock title");

                    if (!productInfo) {
                        errors.push(`Không tìm thấy sản phẩm: ${productInfo.title}.`);
                        continue;
                    }
                }
            }

            if (order.status === "canceled" && type !== "canceled") {
                for (const product of order.products) {
                    const productInfo = await Product.findOne({ _id: product.product_id }).select("title stock");

                    if (!productInfo) {
                        errors.push(`Không tìm thấy sản phẩm: ${productInfo.title}.`);
                        continue;
                    }

                    // Kiểm tra số lượng sản phẩm trong kho
                    if (productInfo.stock < product.quantity) {
                        errors.push(`Trong kho: ${productInfo.title} chỉ còn ${productInfo.stock} sản phẩm.`);
                        continue;
                    }
                }
            }
        }

        // Nếu có lỗi, dừng lại và hiển thị tất cả lỗi
        if (errors.length > 0) {
            req.flash("error", errors.join(" "));
            return res.redirect("back");
        }

        // Nếu không có lỗi, thực hiện cập nhật
        for (const id of ids) {
            const order = await Order.findOne({ _id: id });

            // Nếu chuyển từ trạng thái khác sang "canceled", cộng lại số lượng sản phẩm vào kho
            if (type === "canceled" && order.status !== "canceled") {
                for (const product of order.products) {
                    const productInfo = await Product.findOne({ _id: product.product_id }).select("stock");

                    const newStock = productInfo.stock + product.quantity;
                    await Product.updateOne(
                        { _id: product.product_id },
                        { $set: { stock: newStock } }
                    );
                }
            }

            // Nếu chuyển từ "canceled" sang trạng thái khác, trừ số lượng sản phẩm trong kho
            if (order.status === "canceled" && type !== "canceled") {
                for (const product of order.products) {
                    const productInfo = await Product.findOne({ _id: product.product_id }).select("stock");

                    const newStock = productInfo.stock - product.quantity;
                    await Product.updateOne(
                        { _id: product.product_id },
                        { $set: { stock: newStock } }
                    );
                }
            }

            // Cập nhật trạng thái đơn hàng
            await Order.updateOne({ _id: id }, { status: type });
        }

        req.flash("success", "Cập nhật trạng thái đơn hàng thành công!");
        res.redirect("back");
    } catch (error) {
        req.flash("error", "Đã xảy ra lỗi. Vui lòng thử lại!");
        res.redirect("back");
    }
};

// [DELETE] /admin/orders/delete/:id
module.exports.deleteItem = async (req, res) =>{
    const id = req.params.id;

    await Order.updateOne({ _id: id}, {
        deleted: true,
        deletedAt: new Date()
    });
    
    req.flash('success', `Đã xóa thành công!`);

    res.redirect("back");
}

// [GET] /admin/products/orders/:id
module.exports.detail = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const order = await Order.findOne(find);

        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id : product.product_id
            }).select("title thumbnail")
    
            product.productInfo = productInfo;
    
            product.newPrice = productsHelper.newPriceProduct(product);
    
            product.totalPrice = product.newPrice * product.quantity;
        }
    
        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice , 0)

        res.render("admin/pages/orders/detail.pug", {
            pageTitle: "Chi tiết đơn hàng",
            order: order
        });
    } catch (error) {
        req.flash('error', `Đơn hàng không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}