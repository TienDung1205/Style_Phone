const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

module.exports.requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        return
    }else{
        const user = await Account.findOne({
            token: token,
            status: "active",
            deleted: false
        }).select(" -password ");
        if(!user){
            res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
            return;
        }else{
            res.locals.user = user;
            next();
        }
    }
}