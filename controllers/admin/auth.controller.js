const md5 = require("md5");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const generateHelper = require("../../helpers/generate");

// [GET] /admin/auth/login
module.exports.login = async (req, res) =>{
    const token = req.cookies.token;
    const user = await Account.findOne({
        token: token,
        status: "active",
        deleted: false
    });
    if(user){
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    }
    else{
        res.render("admin/pages/auth/login.pug", {
            pageTitle:"Admin đăng nhập"
        });
    }
}

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) =>{

    const email = req.body.email;
    const password = req.body.password;

    const user = await Account.findOne({
        email: email,
        deleted: false
    })

    if(!user){
        req.flash("error", `Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!`);
        res.redirect(`back`);
        return;
    }

    if(md5(password) != user.password){
        req.flash("error", `Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!`);
        res.redirect(`back`);
        return;
    }

    if(user.status == "inactive"){
        req.flash("error", `Tài khoản đã bị khóa!`);
        res.redirect(`back`);
        return;
    }

    res.cookie("token", user.token);
    req.flash("success", `Đăng nhập thành công!`);
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
}

// [GET] /admin/auth/logout
module.exports.logout = async (req, res) =>{
    const token = req.cookies.token;
    const account = await Account.findOne({token: token});
    if(account){
        account.token = generateHelper.generateRandomString(30);
        await account.save();
    }
    res.clearCookie(`token`);
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}