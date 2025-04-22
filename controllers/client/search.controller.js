const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");
const paginationHelper = require("../../helpers/pagination")
//[GET] /search
module.exports.index = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        let newProducts = [];
        let find = {
            deleted: false,
            status: "active"
        }

        if (keyword) {
            const regex = new RegExp(keyword, "i");
            find.title = regex;
        }

        // Pagination
        const countProducts = await Product.countDocuments(find);

        let objectPagination = paginationHelper({
                limitItems: 16,
                currentPage: 1
            },
            req.query,
            countProducts
        )

        // End Pagination

        const products = await Product.find(find)
            .sort({
                position: "desc"
            })
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);

        newProducts = productsHelper.newPriceProducts(products);

        res.render("client/pages/search/index.pug", {
            pageTitle: "Kết quả tìm kiếm",
            keyword: keyword,
            products: newProducts,
            pagination: objectPagination
        });
    } catch (error) {
        res.redirect("/search");
    }
}