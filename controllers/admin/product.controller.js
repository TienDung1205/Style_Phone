const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/products
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
    const countProducts = await Product.countDocuments(find);

    let objectPagination = paginationHelper(
        {
        limitItems: 4,
        currentPage: 1
        },
        req.query,
        countProducts
    )

    // End Pagination

    const products = await Product.find(find)
    .sort({ position: "desc"})
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

    res.render("admin/pages/products/index.pug", {
        pageTitle:"Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) =>{
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({ _id: id}, { status: status });
    
    req.flash('success', 'Cập nhật trạng thái thành công!');

    res.redirect("back");
}

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) =>{
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    if(type == "active"){
        await Product.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }else if (type == "inactive") {
        await Product.updateMany({ _id: { $in: ids }}, {status : type});
        req.flash('success', `Cập nhật trạng thái thành công!`);
    }
    else if (type == "delete-all") {
        await Product.updateMany({ _id: { $in: ids }}, {
            deleted: true,
            deletedAt: new Date()
        });
        req.flash('success', `Đã xóa thành công!`);
    }
    else if (type == "change-position") {
        for (const item of ids) {
            let [id, position] = item.split("-");
            position = parseInt(position);

            await Product.updateOne({ _id: id}, { 
                position: position 
            });
            req.flash('success', `Thay đổi vị trí thành công!`);
        }
        
    }else{
        
    }

    res.redirect("back");
}

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) =>{
    const id = req.params.id;

    await Product.updateOne({ _id: id}, {
        deleted: true,
        deletedAt: new Date()
    });
    
    req.flash('success', `Đã xóa thành công!`);

    res.redirect("back");
}

// [GET] /admin/products/create
module.exports.create = async (req, res) =>{
    let find = {
        deleted: false
    }

    const category = await ProductCategory.find(find);

    const newCategory = createTreeHelper.tree(category);

    res.render("admin/pages/products/create.pug", {
        pageTitle:"Thêm mới sản phẩm",
        category: newCategory
    });
}

// [POST] /admin/products/createPost
module.exports.createPost = async (req, res) =>{
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    
    if(req.body.position === ""){
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }

    const product = new Product(req.body);
    await product.save();
    
    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await Product.findOne(find);
    
        const category = await ProductCategory.find({
            deleted: false
        });
    
        const newCategory = createTreeHelper.tree(category);
    
        res.render("admin/pages/products/edit.pug", {
            pageTitle:"Chỉnh sửa sản phẩm",
            product: product, 
            category: newCategory
        });
    } catch (error) {
        req.flash('error', `Sản phẩm không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) =>{
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    if(req.body.position === ""){
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }

    try {
        await Product.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!")
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!")
    }
    
    res.redirect(`back`);
}

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) =>{
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await Product.findOne(find);

        const category = await ProductCategory.find({
            deleted: false
        });
        
        const newCategory = createTreeHelper.tree(category);
    
        res.render("admin/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product,
            category: newCategory
        });
    } catch (error) {
        req.flash('error', `Sản phẩm không tồn tại!`);
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}