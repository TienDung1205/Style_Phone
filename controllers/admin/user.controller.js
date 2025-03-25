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
