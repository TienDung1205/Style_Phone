const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/products-category
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
        find.title = objectSearch.regex;
    }
    // End Search

    // Pagination
    const countRecords = await ProductCategory.countDocuments(find);

    let objectPagination = paginationHelper(
        {
        limitItems: 5,
        currentPage: 1
        },
        req.query,
        countRecords
    )

    // End Pagination

    const records = await ProductCategory.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

    const newRecords = createTreeHelper.tree(records);
    
    res.render("admin/pages/products-category/index.pug", {
        pageTitle:"Danh mục sản phẩm",
        records: newRecords,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) =>{
    const status = req.params.status;
    const id = req.params.id;

    await ProductCategory.updateOne({ _id: id}, { status: status });
    
    req.flash('success', 'Cập nhật trạng thái thành công!');

    res.redirect("back");
}

// [PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) =>{
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    if(type == "active"){
        await ProductCategory.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "inactive") {
        await ProductCategory.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }
    else if (type == "delete-all") {
        await ProductCategory.updateMany({ _id: { $in: ids }}, {
            deleted: true,
            deletedAt: new Date()
        });
        req.flash('success', `Đã xóa thành công!`);
    }
    else if (type == "change-position") {
        for (const item of ids) {
            let [id, position] = item.split("-");
            position = parseInt(position);

            await ProductCategory.updateOne({ _id: id}, { 
                position: position 
            });
            req.flash('success', `Thay đổi vị trí thành công!`);
        }
        
    }else{
        
    }

    res.redirect("back");
}

// [DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) =>{
    const id = req.params.id;

    await ProductCategory.updateOne({ _id: id}, {
        deleted: true,
        deletedAt: new Date()
    });
    
    req.flash('success', `Đã xóa thành công!`);

    res.redirect("back");
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) =>{
    let find = {
        deleted: false
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/products-category/create.pug", {
        pageTitle:"Tạo danh mục sản phẩm",
        records: newRecords
    });
}

// [POST] /admin/products-category/createPost
module.exports.createPost = async (req, res) =>{
    if(req.body.position === ""){
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }

    const record = new ProductCategory(req.body);
    await record.save();
    
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
}

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }

        const data = await ProductCategory.findOne(find);
    
        const records = await ProductCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);

        res.render("admin/pages/products-category/edit.pug", {
            pageTitle:"Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords
        });
    } catch (error) {
        req.flash('error', `Danh mục không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) =>{
    if(req.body.position === ""){
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }

    try {
        await ProductCategory.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!")
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!")
    }
    
    res.redirect(`back`);
}

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }

        const data = await ProductCategory.findOne(find);
    
        const records = await ProductCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);
    
        res.render("admin/pages/products-category/detail.pug", {
            pageTitle: data.title,
            data: data,
            records: newRecords
        });
    } catch (error) {
        req.flash('error', `Danh mục không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}