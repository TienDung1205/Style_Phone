const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const generateHelper = require("../../helpers/generate");

const productsHelper = require("../../helpers/products");

//[GET] /checkout/
module.exports.index = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;

        const cart = await Cart.findOne({ _id: cartId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Giỏ hàng không tồn tại!"
            });
        }

        if (cart.products.length > 0) {
            for (const item of cart.products) {
                const productId = item.product_id;
                const productInfo = await Product.findOne({
                    _id: productId,
                    deleted: false,
                    status: "active"
                }).select("title thumbnail slug price discountPercentage");

                if (productInfo) {
                    productInfo.newPrice = productsHelper.newPriceProduct(productInfo);
                    item.productInfo = productInfo;
                    item.totalPrice = productInfo.newPrice * item.quantity;
                }
            }
        }

        cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

        return res.status(200).json({
            success: true,
            message: "Chi tiết giỏ hàng",
            data: cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi!",
            error: error.message
        });
    }
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;

    try {
        const cart = await Cart.findOne({ _id: cartId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Giỏ hàng không tồn tại!"
            });
        }

        const updatedProducts = [];
        const removedProductTitles = [];
        let hasChanges = false;

        for (const cartProduct of cart.products) {
            const productInfo = await Product.findOne({
                _id: cartProduct.product_id
            }).select("title price discountPercentage stock");

            if (!productInfo) {
                hasChanges = true;
                continue;
            }

            if (productInfo.stock > 0) {
                const quantityToOrder = Math.min(cartProduct.quantity, productInfo.stock);
                if (quantityToOrder < cartProduct.quantity) {
                    hasChanges = true;
                }
                updatedProducts.push({
                    product_id: cartProduct.product_id,
                    price: productInfo.price,
                    discountPercentage: productInfo.discountPercentage,
                    quantity: quantityToOrder,
                });
            } else {
                removedProductTitles.push(productInfo.title);
                hasChanges = true;
            }
        }

        if (hasChanges) {
            await Cart.updateOne({ _id: cartId }, { products: updatedProducts });
            return res.status(400).json({
                success: false,
                message: "Một số sản phẩm đã được cập nhật lại số lượng hoặc bị xóa khỏi giỏ hàng.",
                removedProducts: removedProductTitles
            });
        }

        const orderInfo = {
            cart_id: cartId,
            userInfo: userInfo,
            products: updatedProducts,
        };

        if (cart.user_id) {
            orderInfo.user_id = cart.user_id;
        }

        const order = new Order(orderInfo);
        order.code = generateHelper.generateRandomString(10);
        const countOrders = await Order.countDocuments();
        order.position = countOrders + 1;

        await order.save();

        for (const orderedProduct of updatedProducts) {
            await Product.updateOne(
                { _id: orderedProduct.product_id },
                { $inc: { stock: -orderedProduct.quantity } }
            );
        }

        await Cart.updateOne({ _id: cartId }, { products: [] });

        return res.status(201).json({
            success: true,
            message: "Đơn hàng đã được tạo thành công!",
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi trong quá trình xử lý đơn hàng!",
            error: error.message
        });
    }
};

//[POST] /checkout/success/:orderId
module.exports.success = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Đơn hàng không tồn tại!"
            });
        }

        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            }).select("title thumbnail");

            if (productInfo) {
                product.productInfo = productInfo;
                product.newPrice = productsHelper.newPriceProduct(product);
                product.totalPrice = product.newPrice * product.quantity;
            }
        }

        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

        return res.status(200).json({
            success: true,
            message: "Chi tiết đơn hàng",
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi!",
            error: error.message
        });
    }
};

//[GET] /checkout/:productId
module.exports.buyNow = async (req, res) => {
    try {
        const productId = req.params.productId;
        let quantity = parseInt(req.query.quantity, 10);

        const product = await Product.findOne({
            _id: productId,
            deleted: false,
            status: "active"
        }).select("title thumbnail slug price discountPercentage stock");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại!"
            });
        }

        if (isNaN(quantity) || quantity <= 0) {
            quantity = 1;
        }

        if (quantity > product.stock) {
            if (product.stock === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Sản phẩm tạm hết hàng!"
                });
            }
            quantity = product.stock;
        }

        product.newPrice = productsHelper.newPriceProduct(product);

        return res.status(200).json({
            success: true,
            message: "Chi tiết sản phẩm để đặt hàng ngay",
            data: {
                product,
                quantity,
                totalPrice: product.newPrice * quantity
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

//[POST] /checkout/buy-now/order
module.exports.buyNowOrder = async (req, res) => {
    try {
        const { productId, quantity, fullName, phone, address } = req.body;

        const product = await Product.findOne({
            _id: productId,
            deleted: false,
            status: "active"
        }).select("title stock price discountPercentage");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại!"
            });
        }

        const requestedQuantity = parseInt(quantity, 10);
        if (requestedQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Số lượng yêu cầu vượt quá số lượng tồn kho. Chỉ còn ${product.stock} sản phẩm.`
            });
        }

        const orderInfo = {
            userInfo: {
                fullName,
                phone,
                address,
            },
            products: [
                {
                    product_id: productId,
                    quantity: requestedQuantity,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                },
            ]
        };

        const order = new Order(orderInfo);
        order.code = generateHelper.generateRandomString(10);
        const countOrders = await Order.countDocuments();
        order.position = countOrders + 1;

        await order.save();

        product.stock -= requestedQuantity;
        await product.save();

        return res.status(201).json({
            success: true,
            message: "Đơn hàng đã được tạo thành công!",
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi trong quá trình xử lý đơn hàng!",
            error: error.message
        });
    }
};