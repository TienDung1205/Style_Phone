const md5 = require("md5");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");
// [GET] /admin/my-account
module.exports.index = async (req, res) =>{
    res.render("admin/pages/my-account/index.pug", {
        pageTitle:"Thông tin cá nhân"
    });
}

// [GET] /admin/my-account/edit
module.exports.edit = async (req, res) =>{
    res.render("admin/pages/my-account/edit.pug", {
        pageTitle:"Chỉnh sửa thông tin cá nhân"
    });
}

// [PATCH] /admin/my-account/edit
module.exports.editPatch = async (req, res) =>{
    const id = res.locals.user.id;

    const emailExist = await Account.findOne({
        _id : { $ne : id },
        email: req.body.email,
        deleted: false
    });

    if(emailExist){
        req.flash("error", `Email ${req.body.email} đã tồn tại!`);
    }
    else{
        await Account.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật thông tin thành công!")
    }

    res.redirect(`back`);
}

// [GET] admin/my-account/change/password
module.exports.changePassword = async (req, res) =>{
    res.render("admin/pages/my-account/change-password", {
        pageTitle: "Đổi mật khẩu"
    })
}

// [POST] admin/my-account/change/password
module.exports.changePasswordPost = async (req, res) =>{
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;
    const token = req.cookies.token;

    const account = await Account.findOne({
        token: token,
        password: md5(oldPassword)
    })

    if(!account){
        req.flash("error", `Mật khẩu không đúng!`);
        res.redirect(`back`);
        return;
    }

    await Account.updateOne({
        token: token
    },
    {
        password: md5(password)
    })

    req.flash("success", "Đổi mật khẩu thành công!");
    res.redirect("back");
}
