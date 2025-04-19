const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

// [GET] /cart
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({
        _id: cartId
    })

    if (cart.products.length > 0) {
        for (const item of cart.products) {
            const productId = item.product_id;
            const productInfo = await Product.findOne({
                _id: productId,
                deleted: false,
                status: "active"
            }).select("title thumbnail slug price discountPercentage stock");

            if(!productInfo){
                await Cart.updateOne({
                    _id: cartId
                }, {
                    $pull: { products : { product_id : productId } }
                })
            
                // req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");
        
                res.redirect("back");
                return;
            }

            productInfo.newPrice = productsHelper.newPriceProduct(productInfo);
            
            item.productInfo = productInfo;

            item.totalPrice = productInfo.newPrice * item.quantity;

            if(item.quantity > productInfo.stock){
                item.quantity = productInfo.stock
            }
        }
    }

    cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

    res.render("client/pages/cart/index.pug", {
        pageTitle: "Giỏ hàng",
        cartDetail: cart
    });
}

//[POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
    const productId = req.params.productId;
    let quantity = parseInt(req.body.quantity);
    const cartId = req.cookies.cartId;

    // Xóa sản phẩm khỏi giỏ hàng
    if(quantity <= 0){
        req.flash("error", "Số lượng sản phẩm muốn thêm không hợp lệ!");
        res.redirect("back");
        return;
    }
    // End Xóa sản phẩm khỏi giỏ hàng

    const cart = await Cart.findOne({
        _id: cartId
    })

    // console.log(cart.products);

    const existProductInCart = cart.products.find(item => item.product_id == productId);
    // Số lượng tối đa của sản phẩm
    const productInfo = await Product.findOne({
        _id: productId
    }).select("stock");
    
    //End Số lượng tối đa của sản phẩm

    if (existProductInCart) {
        // Cập nhật lại số lượng product trong giỏ hàng
        let quantityNew = quantity + existProductInCart.quantity;
        
        if(productInfo.stock == existProductInCart.quantity){
            req.flash("error", `Đã có ${existProductInCart.quantity} sản phẩm trong giỏ hàng. Bạn không thể thêm sản phẩm vào giỏ`);
            res.redirect("back");
            return;
        }

        if(quantityNew > productInfo.stock){
            req.flash("error", `Đã có ${existProductInCart.quantity} sản phẩm trong giỏ hàng. Bạn chỉ có thêm tối đa ${productInfo.stock - existProductInCart.quantity} sản phẩm`);
            res.redirect("back");
            return;
        }

        await Cart.updateOne({
            _id: cartId,
            'products.product_id': productId
        }, {
            $set: {
                "products.$.quantity": quantityNew
            }
        })
    } else {
        // Thêm mới product vào giỏ hàng

        if(quantity > productInfo.stock){
            req.flash("error", `Bạn chỉ có thêm tối đa ${productInfo.stock} sản phẩm vào giỏ`);
            res.redirect("back");
            return;
        }

        const objectCart = {
            product_id: productId,
            quantity: quantity
        }

        await Cart.updateOne({
            _id: cartId
        }, {
            $push: {
                products: objectCart
            }
        })
    }

    req.flash("success", "Đã thêm sản phẩm vào giỏ hàng!");
    res.redirect("back");
}

//[GET] /cart/delete/:productId
module.exports.delete = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;

    await Cart.updateOne({
        _id: cartId
    }, {
        $pull: { products : { product_id : productId } }
    })

    req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");

    res.redirect("back");
}

//[GET] /cart/update/:productId/:quantity
module.exports.update = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    let quantity = parseInt(req.params.quantity);
    // Xóa sản phẩm khỏi giỏ hàng
    if(quantity <= 0){
        await Cart.updateOne({
            _id: cartId
        }, {
            $pull: { products : { product_id : productId } }
        })
    
        req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");

        res.redirect("back");
        return;
    }
    // End Xóa sản phẩm khỏi giỏ hàng

    // Số lượng tối đa của sản phẩm
    const productInfo = await Product.findOne({
        _id: productId
    }).select("stock");
    
    if(quantity > productInfo.stock){
        req.flash("error", `Số lượng sản phẩm đã đạt tối đa!`);
        res.redirect("back");
        return;
    }
    //End Số lượng tối đa của sản phẩm
    
    await Cart.updateOne({
        _id: cartId,
        'products.product_id': productId
    }, {
        $set: {
            "products.$.quantity": quantity
        }
    })

    // req.flash("success", "Cập nhật số lượng thành công");

    res.redirect("back");
}