const md5 = require("md5");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Register = require("../../models/register.model");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

const paginationHelper = require("../../helpers/pagination");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const productsHelper = require("../../helpers/products");

//[GET] /user/register
module.exports.register = async (req, res) => {
    const tokenUser = req.cookies.tokenUser;
    const user = await User.findOne({tokenUser: tokenUser});
    if(user){
        res.redirect(`/`);
    }
    else{
        res.render("client/pages/user/register", {
            pageTitle: "Đăng ký tài khoản"
        })
    }
}

//[POST] /user/register
module.exports.registerPost = async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    let password = req.body.password;
    
    const existEmail = await User.findOne({
        email: email
    });

    if (existEmail) {
        req.flash("error", "Email đã tồn tại!");
        res.redirect("back");
        return;
    }
    password = md5(password);

            // const user = new User(req.body);
            // await user.save();

            // req.flash("success", "Đăng ký thành công!");

            // res.redirect("/user/login");
    const otp = generateHelper.generateRandomNumber(6);

    const objectRegister = {
        fullName: fullName,
        email: email,
        password: password,
        otp: otp,
        expireAt: Date.now()
    }

    const register = new Register(objectRegister);
    await register.save();

    // Gửi mã OTP cho email
    const subject = "Mã OTP xác minh đăng ký";
    const html = `
        Chúng tôi đã nhận được yêu cầu đăng ký tài khoản tại StylePhone của bạn. Hãy nhập mã này: <b>${otp}</b>
        <hr>
        Thời gian hiệu lực là 2 phút.
    `
    sendMailHelper.sendMail(email, subject, html);
    res.redirect(`/user/register/otp?email=${email}`);
}

// [GET] /user/register/otp
module.exports.otpRegister = async (req, res) =>{
    const tokenUser = req.cookies.tokenUser;
    const user = await User.findOne({tokenUser: tokenUser});
    if(user){
        res.redirect(`/`);
    }
    else{
        const email = req.query.email;

        res.render("client/pages/user/otp-register", {
            pageTitle: "Nhập mã OTP xác thực",
            email: email
        })
    }
}

// [POST] /user/register/otp
module.exports.otpRegisterPost = async (req, res) =>{
    const email = req.body.email;
    const otp = req.body.otp;

    const register = await Register.findOne({
        email: email,
        otp: otp
    })

    if(!register){
        req.flash("error", "Mã OTP không hợp lệ. Vui lòng thử lại!");
        res.redirect("back");
        return;
    }

    // const user = await User.findOne({
    //     email: email
    // })

    // res.cookie("tokenUser", user.tokenUser);

    // res.redirect("/user/password/reset");
    const objectUser = {
        fullName: register.fullName,
        email: register.email,
        password: register.password
    }

    const existEmail = await User.findOne({
        email: objectUser.email
    });

    if (existEmail) {
        req.flash("error", "Email đã tồn tại!");
        res.redirect("back");
        return;
    }

    const user = new User(objectUser);
    user.tokenUser = generateHelper.generateRandomString(30);
    await user.save();

    req.flash("success", "Đăng ký thành công!");

    res.cookie("tokenUser", user.tokenUser);
    res.redirect(`/`);
}

//[GET] /user/login
module.exports.login = async (req, res) => {
    const tokenUser = req.cookies.tokenUser;
    const user = await User.findOne({tokenUser: tokenUser});
    if(user){
        res.redirect(`/`);
    }
    else{
        res.render("client/pages/user/login", {
            pageTitle: "Đăng nhập"
        })
    }
}

//[POST] /user/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    })

    if (!user) {
        req.flash("error", `Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!`);
        res.redirect(`back`);
        return;
    }

    if (md5(password) != user.password) {
        req.flash("error", `Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!`);
        res.redirect(`back`);
        return;
    }

    if (user.status == "inactive") {
        req.flash("error", `Tài khoản đã bị khóa!`);
        res.redirect(`back`);
        return;
    }

    const cart = await Cart.findOne({
        user_id : user.id
    })

    if(cart){
        res.cookie("cartId", cart.id);
    }else{
        await Cart.updateOne({
            _id : req.cookies.cartId
        },
        {
            user_id: user.id
        })
    }

    res.cookie("tokenUser", user.tokenUser, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    });
    req.flash("success", `Đăng nhập thành công!`);
    res.redirect(`/`);
}

// [GET] /user/logout
module.exports.logout = async (req, res) =>{
    res.clearCookie(`tokenUser`);
    res.clearCookie(`cartId`);
    res.redirect(`/`);
}

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) =>{
    const tokenUser = req.cookies.tokenUser;
    const user = await User.findOne({tokenUser: tokenUser});
    if(user){
        res.redirect(`/`);
    }
    else{
        res.render("client/pages/user/forgot-password", {
            pageTitle: "Quên mật khẩu"
        })
    }
}

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) =>{
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    })

    if (!user) {
        req.flash("error", `Email không tồn tại!`);
        res.redirect(`back`);
        return;
    }

    if (user.status == "inactive") {
        req.flash("error", `Tài khoản đã bị khóa!`);
        res.redirect(`back`);
        return;
    }
    // Lưu thông tin vào DB
    const otp = generateHelper.generateRandomNumber(6);

    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    }

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    // Gửi mã OTP cho email
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Chúng tôi đã nhận được yêu cầu đổi mật khẩu của bạn tại StylePhone. Hãy nhập mã này: <b>${otp}</b>
        <hr>
        Thời gian hiệu lực là 2 phút.
    `
    sendMailHelper.sendMail(email, subject, html);
    res.redirect(`/user/password/otp?email=${email}`);
}

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) =>{
    const tokenUser = req.cookies.tokenUser;
    const user = await User.findOne({tokenUser: tokenUser});
    if(user){
        res.redirect(`/`);
    }
    else{
        const email = req.query.email;

        res.render("client/pages/user/otp-password", {
            pageTitle: "Nhập mã OTP xác thực",
            email: email
        })
    }
}

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) =>{
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    })

    if(!result){
        req.flash("error", "Mã OTP không hợp lệ. Vui lòng thử lại!");
        res.redirect("back");
        return;
    }

    const user = await User.findOne({
        email: email
    })

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/user/password/reset");
}

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) =>{
    try{
        const email = res.locals.user.email;
        const result = await ForgotPassword.findOne({
            email: email
        })

        if(!result){
            req.flash("error", "Đã có lỗi xảy ra. Vui lòng thử lại sau!");
            res.redirect("back");
            return;
        }
        res.render("client/pages/user/reset-password", {
            pageTitle: "Nhập mật khẩu mới"
        })
    }catch(error){
        req.flash("error", "Đã có lỗi xảy ra. Vui lòng thử lại sau!");
        res.redirect(`back`);
        return;
    }
}

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) =>{
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    await User.updateOne({
        tokenUser: tokenUser
    },
    {
        password: md5(password)
    })

    req.flash("success", "Đổi mật khẩu thành công!");
    // res.clearCookie(`tokenUser`);
    // res.redirect("/user/login");
    res.redirect("/");
}

// [GET] /user/info
module.exports.info = async (req, res) =>{
    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản"
    })
}

// [GET] /user/change/password
module.exports.changePassword = async (req, res) =>{
    res.render("client/pages/user/change-password", {
        pageTitle: "Đặt lại mật khẩu"
    })
}

// [POST] /user/change/password
module.exports.changePasswordPost = async (req, res) =>{
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    const user = await User.findOne({
        tokenUser: tokenUser,
        password: md5(oldPassword)
    })
    if(!user){
        req.flash("error", `Mật khẩu không đúng!`);
        res.redirect(`back`);
        return;
    }
    // console.log(oldPassword);
    // console.log(password);

    // console.log(user);

    await User.updateOne({
        tokenUser: tokenUser
    },
    {
        password: md5(password)
    })

    req.flash("success", "Đổi mật khẩu thành công!");
    res.redirect("back");
}

// [GET] /user/edit
module.exports.edit = async (req, res) =>{
    res.render("client/pages/user/edit", {
        pageTitle: "Chỉnh sửa thông tin tài khoản"
    })
}

// [PATCH] /user/edit
module.exports.editPatch = async (req, res) =>{
    const id = res.locals.user.id;
    await User.updateOne({ _id: id }, req.body);
    req.flash("success", "Cập nhật thông tin thành công!");
    res.redirect(`back`);
}

// [GET] /user/order
module.exports.order = async (req, res) =>{
    try{
        const id = res.locals.user.id;
        const find = {
            user_id: id
        }

        // Pagination
        const countOrders = await Order.countDocuments(find);

        let objectPagination = paginationHelper(
            {
            limitItems: 8,
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
                    item.newPrice = productsHelper.newPriceProduct(item);

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

        res.render("client/pages/user/order", {
            pageTitle:"Đơn hàng của tôi",
            records: records,
            pagination: objectPagination
        });
    }catch(error){
        req.flash("error", `Đã có lỗi xảy ra. Vui lòng thử lại sau!`);
        res.redirect(`/`);
        return;
    }
}

// [GET] /user/order/:id
module.exports.orderDetail = async (req, res) =>{
    try {
        const user_id = res.locals.user.id;
        const find = {
            _id: req.params.id,
            user_id: user_id
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

        res.render("client/pages/user/order-detail.pug", {
            pageTitle: "Chi tiết đơn hàng",
            order: order
        });
    } catch (error) {
        req.flash('error', `Đơn hàng không tồn tại!`);
        res.redirect(`/user/order`);
    }
}

// [POST] /user/order/canceled/:id
module.exports.canceledItem = async (req, res) =>{
    const id = req.params.id;

    const order = await Order.findOne({ _id: id});

    if(order.status != "processing"){
        req.flash("error", `Không thể hủy đơn hàng này`);
        res.redirect("back");
        return;
    }

    for (const product of order.products) {
        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("stock");

        const newStock = productInfo.stock + product.quantity;
        await Product.updateOne({
            _id: product.product_id
        }, {
            $set: {
                stock: newStock
            }
        });

    }

    await Order.updateOne({ _id: id}, {
        status: "canceled"
    });
    
    req.flash('success', `Đã hủy đơn hàng!`);

    res.redirect("back");
}