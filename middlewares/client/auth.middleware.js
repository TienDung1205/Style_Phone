const User = require("../../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;
    if(!tokenUser){
        req.flash("error", "Vui lòng đăng nhập để tiếp tục!");
        res.redirect(`back`);
        return;
    }else{
        const user = await User.findOne({
            tokenUser: tokenUser,
            status: "active",
            deleted: false
        }).select(" -password ");
        if(!user){
            req.flash("error", "Vui lòng đăng nhập để tiếp tục!");
            res.redirect(`back`);
            return;
        }else{
            res.locals.user = user;
            next();
        }
    }
}