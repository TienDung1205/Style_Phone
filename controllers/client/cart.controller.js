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

    // res.render("client/pages/cart/index.pug", {
    //     pageTitle: "Giỏ hàng",
    //     cartDetail: cart
    // });
    res.json(cart);
}

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
    try {
        const productId = req.params.productId;
        let quantity = parseInt(req.body.quantity);
        const cartId = req.cookies.cartId;

        // Kiểm tra số lượng sản phẩm hợp lệ
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Số lượng sản phẩm muốn thêm không hợp lệ!"
            });
        }

        const cart = await Cart.findOne({ _id: cartId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Giỏ hàng không tồn tại!"
            });
        }

        const existProductInCart = cart.products.find(item => item.product_id == productId);

        // Lấy thông tin sản phẩm
        const productInfo = await Product.findOne({ _id: productId }).select("stock");

        if (!productInfo) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại!"
            });
        }

        // Nếu sản phẩm đã tồn tại trong giỏ hàng
        if (existProductInCart) {
            let quantityNew = quantity + existProductInCart.quantity;

            if (productInfo.stock == existProductInCart.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Đã có ${existProductInCart.quantity} sản phẩm trong giỏ hàng. Bạn không thể thêm sản phẩm vào giỏ.`
                });
            }

            if (quantityNew > productInfo.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Đã có ${existProductInCart.quantity} sản phẩm trong giỏ hàng. Bạn chỉ có thể thêm tối đa ${productInfo.stock - existProductInCart.quantity} sản phẩm.`
                });
            }

            await Cart.updateOne(
                { _id: cartId, 'products.product_id': productId },
                { $set: { "products.$.quantity": quantityNew } }
            );
        } else {
            // Nếu sản phẩm chưa tồn tại trong giỏ hàng
            if (quantity > productInfo.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Bạn chỉ có thể thêm tối đa ${productInfo.stock} sản phẩm vào giỏ.`
                });
            }

            const objectCart = {
                product_id: productId,
                quantity: quantity
            };

            await Cart.updateOne(
                { _id: cartId },
                { $push: { products: objectCart } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Đã thêm sản phẩm vào giỏ hàng!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi!",
            error: error.message
        });
    }
};

//[DELETE] /cart/delete/:productId
module.exports.delete = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const productId = req.params.productId;

        await Cart.updateOne({
            _id: cartId
        }, {
            $pull: { products: { product_id: productId } }
        });

        return res.status(200).json({
            success: true,
            message: "Đã xóa sản phẩm khỏi giỏ hàng!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi!",
            error: error.message
        });
    }
};

//[GET] /cart/update/:productId/:quantity
module.exports.update = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const productId = req.params.productId;
        let quantity = parseInt(req.params.quantity);

        // Xóa sản phẩm khỏi giỏ hàng nếu số lượng <= 0
        if (quantity <= 0) {
            await Cart.updateOne({
                _id: cartId
            }, {
                $pull: { products: { product_id: productId } }
            });

            return res.status(200).json({
                success: true,
                message: "Đã xóa sản phẩm khỏi giỏ hàng!"
            });
        }

        // Kiểm tra số lượng tối đa của sản phẩm
        const productInfo = await Product.findOne({
            _id: productId
        }).select("stock");

        if (!productInfo) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại!"
            });
        }

        if (quantity > productInfo.stock) {
            return res.status(400).json({
                success: false,
                message: `Số lượng sản phẩm đã đạt tối đa!`
            });
        }

        // Cập nhật số lượng sản phẩm trong giỏ hàng
        await Cart.updateOne({
            _id: cartId,
            'products.product_id': productId
        }, {
            $set: {
                "products.$.quantity": quantity
            }
        });

        return res.status(200).json({
            success: true,
            message: "Cập nhật số lượng thành công!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi!",
            error: error.message
        });
    }
};