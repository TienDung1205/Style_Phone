const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

//[GET] /
module.exports.index = async (req, res) => {
    try {
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
        }).sort({ position: "desc" }).limit(4);

        const newProductsNew = productsHelper.newPriceProducts(productsNew);
        // End Sản phẩm mới nhất

        // Trả về JSON
        return res.status(200).json({
            success: true,
            message: "Dữ liệu trang chủ",
            data: {
                productsFeatured: newProductsFeatured,
                productsNew: newProductsNew
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi!",
            error: error.message
        });
    }
};