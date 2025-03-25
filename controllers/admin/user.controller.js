const md5 = require("md5");
const User = require("../../models/user.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/users
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
    const countUsers = await User.countDocuments(find);

    let objectPagination = paginationHelper(
        {
        limitItems: 5,
        currentPage: 1
        },
        req.query,
        countUsers
    )

    // End Pagination

    const records = await User.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .select("-password");

    res.render("admin/pages/users/index.pug", {
        pageTitle:"Danh sách khách hàng",
        records: records,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [GET] /admin/users/create
module.exports.create = async (req, res) =>{
    res.render("admin/pages/users/create.pug", {
        pageTitle:"Thêm mới khách hàng"
    });
}

// [POST] /admin/users/createPost
module.exports.createPost = async (req, res) =>{
    const emailExist = await User.findOne({
        email: req.body.email,
        deleted: false
    });
    
    if(emailExist){
        req.flash("error", `Email ${req.body.email} đã tồn tại!`);
        res.redirect("back");
    }
    else{
        req.body.password = md5(req.body.password);

        const record = new User(req.body);
        await record.save();
        
        res.redirect(`${systemConfig.prefixAdmin}/users`);
    }

}

// [GET] /admin/users/edit/:id
module.exports.edit = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const data = await User.findOne(find);
    
        res.render("admin/pages/users/edit.pug", {
            pageTitle:"Chỉnh sửa tài khoản khách hàng",
            data: data
        });
    } catch (error) {
        req.flash('error', `Tài khoản khách hàng không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/users`);
    }
}

// [PATCH] /admin/users/edit/:id
module.exports.editPatch = async (req, res) =>{
    const id = req.params.id;

    const emailExist = await User.findOne({
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
        
        await User.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật tài khoản thành công!")
    }

    res.redirect(`back`);
}

// [PATCH] /admin/users/change-status/:status/:id
module.exports.changeStatus = async (req, res) =>{
    const status = req.params.status;
    const id = req.params.id;

    await User.updateOne({ _id: id}, { status: status });
    
    req.flash('success', 'Cập nhật trạng thái thành công!');

    res.redirect("back");
}

// [PATCH] /admin/users/change-multi
module.exports.changeMulti = async (req, res) =>{
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    if(type == "active"){
        await User.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "inactive") {
        await User.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }
    else if (type == "delete-all") {
        await User.updateMany({ _id: { $in: ids }}, {
            deleted: true,
            deletedAt: new Date()
        });
        req.flash('success', `Đã xóa thành công!`);
    }else{
        
    }

    res.redirect("back");
}
