module.exports.registerPost = (req, res, next) => {
    if(!req.body.fullName){
        req.flash("error", "Vui lòng nhập họ tên!");
        res.redirect("back");
        return;
    }

    if(!req.body.email){
        req.flash("error", "Vui lòng nhập email!");
        res.redirect("back");
        return;
    }

    if(req.body.password.length < 8){
        req.flash("error", "Mật khẩu phải có ít nhất 8 kí tự!");
        res.redirect("back");
        return;
    }

    if(!req.body.password){
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.loginPost = (req, res, next) => {
    if(!req.body.email){
        req.flash("error", "Vui lòng nhập email!");
        res.redirect("back");
        return;
    }

    if(!req.body.password){
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.forgotPasswordPost = (req, res, next) => {
    if(!req.body.email){
        req.flash("error", "Vui lòng nhập email!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.otpPost = (req, res, next) => {
    if(!req.body.otp){
        req.flash("error", "Vui lòng nhập mã otp!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.resetPasswordPost = (req, res, next) => {
    if(req.body.password.length < 8){
        req.flash("error", "Mật khẩu phải có ít nhất 8 kí tự!");
        res.redirect("back");
        return;
    }

    if(req.body.confirmPassword.length < 8){
        req.flash("error", "Mật khẩu phải có ít nhất 8 kí tự!");
        res.redirect("back");
        return;
    }

    if(!req.body.password){
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }

    if(!req.body.confirmPassword){
        req.flash("error", "Vui lòng xác nhận mật khẩu!");
        res.redirect("back");
        return;
    }

    if(req.body.password != req.body.confirmPassword){
        req.flash("error", "Mật khẩu lặp lại không đúng!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.changePasswordPost = (req, res, next) => {
    if(!req.body.oldPassword){
        req.flash("error", "Vui lòng nhập mật khẩu hiện tại!");
        res.redirect("back");
        return;
    }

    if(req.body.password.length < 8){
        req.flash("error", "Mật khẩu phải có ít nhất 8 kí tự!");
        res.redirect("back");
        return;
    }

    if(req.body.confirmPassword.length < 8){
        req.flash("error", "Mật khẩu phải có ít nhất 8 kí tự!");
        res.redirect("back");
        return;
    }

    if(!req.body.password){
        req.flash("error", "Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }

    if(!req.body.confirmPassword){
        req.flash("error", "Vui lòng xác nhận mật khẩu!");
        res.redirect("back");
        return;
    }

    if(req.body.password != req.body.confirmPassword){
        req.flash("error", "Mật khẩu lặp lại không đúng!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.editPatch = (req, res, next) => {
    if(!req.body.fullName){
        req.flash("error", "Vui lòng nhập họ tên!");
        res.redirect("back");
        return;
    }

    const phoneNumber = req.body.phone;
    const phoneRegex = /^\d{10,11}$/;

    if (!phoneRegex.test(phoneNumber)) {
        req.flash("error", "Số điện thoại không hợp lệ!");
        res.redirect("back");
        return;
    }

    next();
}
