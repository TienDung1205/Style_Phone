const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

//[GET] /search
module.exports.index = async (req, res) => {
    const keyword = req.query.keyword;

    let newProducts = [];

    if(keyword){
        const regex = new RegExp(keyword, "i");
        const products = await Product.find({
            title: regex,
            deleted: false,
            status: "active"
        })
        newProducts = productsHelper.newPriceProducts(products);
    }

    res.render("client/pages/search/index.pug", {
        pageTitle:"Kết quả tìm kiếm",
        keyword: keyword,
        products: newProducts
    });
}