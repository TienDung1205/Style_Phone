module.exports.newPriceProducts = (products) => {
    const newProducts = products.map((item) => {
        item.newPrice = item.price - item.discountPercentage;
        return item;
    });

    return newProducts;
}

module.exports.newPriceProduct = (product) => {
    const newPrice = product.price - product.discountPercentage;
    return parseInt(newPrice);
}