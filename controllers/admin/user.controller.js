const md5 = require("md5");
const User = require("../../models/user.model");

const systemConfig = require("../../config/system");
// [GET] /admin/users
module.exports.index = async (req, res) =>{
    let find = {
        deleted: false
    }

    const records = await User.find(find).select("-password");

    res.render("admin/pages/users/index.pug", {
        pageTitle:"Danh sách khách hàng",
        records: records
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
