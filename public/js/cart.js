// Cập nhật số lượng sản phẩm giỏ hàng

const inputQuantity = document.querySelectorAll("input[name='quantity']");
if(inputQuantity.length > 0){
    inputQuantity.forEach(input => {
        input.addEventListener("change", (e) => {
            const productId = input.getAttribute("product-id");
            const quantity = input.value;

            window.location.href = `/cart/update/${productId}/${quantity}`;
        })
    })
}

// End Cập nhật số lượng sản phẩm giỏ hàng
