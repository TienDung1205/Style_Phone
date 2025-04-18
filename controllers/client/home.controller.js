const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

//[GET] /
module.exports.index = async (req, res) => {
    // Sản phẩm nổi bật
    const productsFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(8);

    const newProductsFeatured = productsHelper.newPriceProducts(productsFeatured);
    // End Sản phẩm nổi bật

    // Sản phẩm mới nhất
    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({position : "desc"}).limit(4);

    const newProductsNew = productsHelper.newPriceProducts(productsNew);
    // End Sản phẩm mới nhất

    res.render("client/pages/home/index.pug", {
        pageTitle:"Trang chủ",
        productsFeatured : newProductsFeatured,
        productsNew : newProductsNew
    });
}