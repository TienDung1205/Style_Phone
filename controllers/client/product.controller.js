const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const productsHelper = require("../../helpers/products");
const productsCategoryHelper = require("../../helpers/products-category");
const paginationHelper = require("../../helpers/pagination");

// [GET]/products
module.exports.index = async (req, res) => {
    try{
        let find = {
            status : "active",
            deleted: false
        }

        // Pagination
        const countProducts = await Product.countDocuments(find);

        let objectPagination = paginationHelper(
            {
                limitItems: 8,
                currentPage: 1
            },
            req.query,
            countProducts
        )
        
        // End Pagination

        const products = await Product.find(find)
        .sort({position : "desc"})
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

        const newProducts = productsHelper.newPriceProducts(products);
        
        res.render("client/pages/products/index.pug", {
            pageTitle: "Danh sách sản phẩm",
            products: newProducts,
            pagination: objectPagination
        });
    }catch (error) {
        res.redirect("/products");
    }
}

// [GET]/products/:slug
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slugProduct,
            status: "active"
        }
    
        const product = await Product.findOne(find);
    
        if(product.product_category_id){
            const category = await ProductCategory.findOne({
                _id : product.product_category_id,
                status : "active",
                deleted : false
            })

            product.category = category;
        }

        product.newPrice = productsHelper.newPriceProduct(product);

        res.render("client/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`/products`);
    }
}

// [GET]/products/:slugCategory
module.exports.category = async (req, res) => {
    try {
        const category = await ProductCategory.findOne({
            slug : req.params.slugCategory,
            deleted : false,
            status: "active"
        })

        const listSubCategory = await productsCategoryHelper.getSubCategory(category.id);

        const listSubCategoryId = listSubCategory.map(item => item.id);

        const find = {
            product_category_id: { $in : [category.id, ...listSubCategoryId]},
            deleted : false,
            status: "active"
        };

        // Pagination
        const countProducts = await Product.countDocuments(find);
    
        let objectPagination = paginationHelper(
            {
                limitItems: 8,
                currentPage: 1
            },
            req.query,
            countProducts
        )
        
        // End Pagination

        const products = await Product.find(find)
        .sort({position : "desc"})
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

        const newProducts = productsHelper.newPriceProducts(products);

        res.render("client/pages/products/index.pug", {
            pageTitle: category.title,
            products: newProducts,
            pagination: objectPagination
        });

    } catch (error) {
        res.redirect(`/products`);
    }
}