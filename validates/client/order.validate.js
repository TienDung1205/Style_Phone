module.exports.order = (req, res, next) => {
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

    if(!req.body.address){
        req.flash("error", "Vui lòng nhập địa chỉ!");
        res.redirect("back");
        return;
    }

    next();
}