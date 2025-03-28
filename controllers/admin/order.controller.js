const md5 = require("md5");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");

const systemConfig = require("../../config/system");

const filterStatusOrderHelper = require("../../helpers/filterStatusOrder");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

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
            { "userInfo.fullName": objectSearch.regex },
            { "userInfo.phone": objectSearch.regex },
            { "userInfo.address": objectSearch.regex }
        ];
    }
    // End Search

    const records = await Order.find(find)
    .sort({ position: "desc"});

    for (const record of records) {
        if(record.user_id){
            const user = await User.findOne({
                _id: record.user_id
            }).select("-password")

            record.user = user;
        }
    }

    res.render("admin/pages/orders/index.pug", {
        pageTitle:"Quản lý đặt hàng",
        records: records,
        filterStatusOrder: filterStatusOrder,
        keyword: objectSearch.keyword
    });
}