const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const generateHelper = require("../../helpers/generate");

const productsHelper = require("../../helpers/products");

//[GET] /checkout/
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
            }).select("title thumbnail slug price discountPercentage");

            productInfo.newPrice = productsHelper.newPriceProduct(productInfo)

            item.productInfo = productInfo;

            item.totalPrice = productInfo.newPrice * item.quantity;
        }
    }

    cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

    res.render("client/pages/checkout/index.pug", {
        pageTitle: "Đặt hàng",
        cartDetail: cart
    });
}

//[POST] /checkout/order
// module.exports.order = async (req, res) => {
//     const cartId = req.cookies.cartId;
//     const userInfo = req.body;

//     try {
//         const cart = await Cart.findOne({ _id: cartId });
//         if (!cart) {
//             req.flash("error", "Giỏ hàng không tồn tại!");
//             res.redirect("back");
//             return;
//         }

//         const updatedProducts = []; // Mảng chứa thông tin sản phẩm đã được điều chỉnh
//         let hasQuantityAdjusted = false; // Biến để theo dõi xem có sản phẩm nào bị điều chỉnh số lượng hay không

//         for (const cartProduct of cart.products) {
//             const productInfo = await Product.findOne({
//                 _id: cartProduct.product_id
//             }).select("title price discountPercentage stock");

//             if (!productInfo) {
//                 // Xử lý trường hợp sản phẩm không tồn tại (có thể xóa khỏi giỏ hàng)
//                 req.flash('error', `Sản phẩm ${cartProduct.title} không tồn tại.`);
//                 // Bạn có thể chọn bỏ qua sản phẩm này hoặc thông báo cho người dùng
//                 continue;
//             }

//             let quantityToOrder = cartProduct.quantity;

//             if (productInfo.stock < cartProduct.quantity) {
//                     req.flash("error",`Sản phẩm ${productInfo.title} chỉ còn ${productInfo.stock} sản phẩm. Số lượng trong giỏ hàng của bạn đã được điều chỉnh.`
//                 );
//                 quantityToOrder = productInfo.stock;
//                 hasQuantityAdjusted = true;
//             }

//             const objectProduct = {
//                 product_id: cartProduct.product_id,
//                 price: productInfo.price,
//                 discountPercentage: productInfo.discountPercentage,
//                 quantity: quantityToOrder,
//             };
//             updatedProducts.push(objectProduct);
//         }

//         if (hasQuantityAdjusted) {
//             // Cập nhật lại giỏ hàng với số lượng đã điều chỉnh
//             await Cart.updateOne({ _id: cartId }, { products: updatedProducts });
//             req.flash("error", "Vui lòng kiểm tra lại giỏ hàng trước khi tiến hành thanh toán.");
//             res.redirect("/cart");
//             return;
//         }

//         // Nếu không có sản phẩm nào bị điều chỉnh số lượng, tiến hành tạo đơn hàng như bình thường
//         const orderInfo = {
//             cart_id: cartId,
//             userInfo: userInfo,
//             products: updatedProducts, // Sử dụng mảng sản phẩm đã được kiểm tra
//         };

//         if (cart.user_id) {
//             orderInfo.user_id = cart.user_id;
//         }

//         const order = new Order(orderInfo);
//         order.code = generateHelper.generateRandomString(10);
//         const countOrders = await Order.countDocuments();
//         order.position = countOrders + 1;

//         await order.save();

//         // Cập nhật stock cho tất cả sản phẩm đã mua
//         for (const orderedProduct of updatedProducts) {
//             await Product.updateOne(
//                 { _id: orderedProduct.product_id },
//                 { $inc: { stock: -orderedProduct.quantity } }
//             );
//         }

//         await Cart.updateOne({ _id: cartId }, { products: [] });
//         res.redirect(`/checkout/success/${order.id}`);

//     } catch (error) {
//         req.flash("error", "Đã có lỗi xảy ra trong quá trình xử lý đơn hàng. Vui lòng thử lại sau!");
//         res.redirect("back");
//     }
// };

module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;

    try {
        const cart = await Cart.findOne({ _id: cartId });
        if (!cart) {
            req.flash("error", "Giỏ hàng không tồn tại!");
            res.redirect("back");
            return;
        }

        const updatedProducts = []; // Mảng chứa thông tin sản phẩm sau khi kiểm tra
        const removedProductTitles = []; // Mảng chứa tên các sản phẩm bị xóa
        let hasChanges = false; // Biến theo dõi nếu có bất kỳ thay đổi nào (xóa hoặc điều chỉnh)

        for (const cartProduct of cart.products) {
            const productInfo = await Product.findOne({
                _id: cartProduct.product_id
            }).select("title price discountPercentage stock");

            if (!productInfo) {
                req.flash('error', `Sản phẩm ${cartProduct.title} không tồn tại.`);
                hasChanges = true;
                continue;
            }

            if (productInfo.stock > 0) {
                // Nếu còn hàng, thêm sản phẩm vào mảng updatedProducts (điều chỉnh số lượng nếu cần)
                const quantityToOrder = Math.min(cartProduct.quantity, productInfo.stock);
                if (quantityToOrder < cartProduct.quantity) {
                    req.flash(
                        "error",
                        `Sản phẩm ${productInfo.title} chỉ còn ${productInfo.stock} sản phẩm.`
                    );
                    hasChanges = true;
                }
                updatedProducts.push({
                    product_id: cartProduct.product_id,
                    price: productInfo.price,
                    discountPercentage: productInfo.discountPercentage,
                    quantity: quantityToOrder,
                });
            } else {
                // Nếu hết hàng (stock === 0), thêm tên sản phẩm vào mảng removedProductTitles
                removedProductTitles.push(productInfo.title);
                hasChanges = true;
            }
        }

        if (hasChanges) {
            await Cart.updateOne({ _id: cartId }, { products: updatedProducts });
            if (removedProductTitles.length > 0) {
                req.flash(
                    "error",
                    `Các sản phẩm sau đã hết hàng và đã được xóa khỏi giỏ hàng của bạn: ${removedProductTitles.join(", ")}.`
                );
            }
            req.flash("error", " Số lượng sản phẩm trong giỏ hàng của bạn đã được điều chỉnh. Vui lòng kiểm tra lại trước khi tiến hành thanh toán.");
            res.redirect("/cart");
            return;
        }

        // Nếu không có thay đổi nào (không có sản phẩm bị xóa hoặc điều chỉnh), tiến hành tạo đơn hàng
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
        res.redirect(`/checkout/success/${order.id}`);

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý đơn hàng:", error);
        req.flash("error", "Đã có lỗi xảy ra trong quá trình xử lý đơn hàng. Vui lòng thử lại sau!");
        res.redirect("back");
    }
};

//[POST] /checkout/success/:orderId
module.exports.success = async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.orderId
    })

    for (const product of order.products) {
        const productInfo = await Product.findOne({
            _id : product.product_id
        }).select("title thumbnail")

        product.productInfo = productInfo;

        product.newPrice = productsHelper.newPriceProduct(product);

        product.totalPrice = product.newPrice * product.quantity;
    }

    order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice , 0)

    res.render("client/pages/checkout/success.pug", {
        pageTitle: "Đặt hàng thành công",
        order: order
    });
}