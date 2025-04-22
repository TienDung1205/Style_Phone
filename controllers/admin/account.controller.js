const md5 = require("md5");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

const generateHelper = require("../../helpers/generate");

// [GET] /admin/accounts
module.exports.index = async (req, res) =>{
    let find = {
        deleted: false
    }

    // filterStatus
    const filterStatus = filterStatusHelper(req.query);
    
    if(req.query.status){
        find.status = req.query.status;
    }
    // End filterStatus

    // Search
    const objectSearch = searchHelper(req.query);

    if(objectSearch.regex){
        find.$or = [
            { fullName: objectSearch.regex },
            { phone: objectSearch.regex },
            { email: objectSearch.regex },
            { address: objectSearch.regex }
        ];
    }
    // End Search

    // Pagination
    const countAccounts = await Account.countDocuments(find);

    let objectPagination = paginationHelper(
        {
        limitItems: 8,
        currentPage: 1
        },
        req.query,
        countAccounts
    )

    // End Pagination

    const records = await Account.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .select("-password");

    res.render("admin/pages/accounts/index.pug", {
        pageTitle:"Danh sách nhân viên",
        records: records,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) =>{

    res.render("admin/pages/accounts/create.pug", {
        pageTitle:"Thêm mới nhân viên"
    });
}

// [POST] /admin/accounts/createPost
module.exports.createPost = async (req, res) =>{
    const emailExist = await Account.findOne({
        email: req.body.email,
        deleted: false
    });
    
    if(emailExist){
        req.flash("error", `Email ${req.body.email} đã tồn tại!`);
        res.redirect("back");
    }
    else{
        req.body.password = md5(req.body.password);

        const record = new Account(req.body);
        record.token = generateHelper.generateRandomString(30);
        await record.save();
        
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }

}

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const data = await Account.findOne(find);
    
        res.render("admin/pages/accounts/edit.pug", {
            pageTitle:"Chỉnh sửa tài khoản nhân viên",
            data: data
        });
    } catch (error) {
        req.flash('error', `Tài khoản nhân viên không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
}

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) =>{
    const id = req.params.id;

    const emailExist = await Account.findOne({
        _id : { $ne : id },
        email: req.body.email,
        deleted: false
    });

    if(emailExist){
        req.flash("error", `Email ${req.body.email} đã tồn tại!`);
    }
    else{
        if(req.body.password){
            req.body.password = md5(req.body.password);
        }else{
            delete req.body.password;
        }
        
        await Account.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật tài khoản thành công!")
    }

    res.redirect(`back`);
}


// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) =>{
    const status = req.params.status;
    const id = req.params.id;

    await Account.updateOne({ _id: id}, { status: status });

    req.flash('success', 'Cập nhật trạng thái thành công!');

    res.redirect("back");
}

// [PATCH] /admin/accounts/change-multi
module.exports.changeMulti = async (req, res) =>{
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    if(type == "active"){
        await Account.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "inactive") {
        await Account.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }
    else if (type == "delete-all") {
        await Account.updateMany({ _id: { $in: ids }}, {
            deleted: true,
            deletedAt: new Date()
        });
        req.flash('success', `Đã xóa thành công!`);
    }else{
        
    }

    res.redirect("back");
}

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) =>{
    const id = req.params.id;

    await Account.updateOne({ _id: id}, {
        deleted: true,
        deletedAt: new Date()
    });
    
    req.flash('success', `Đã xóa thành công!`);

    res.redirect("back");
}