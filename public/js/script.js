// Show Alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert){
    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");
    setTimeout(() =>{
        showAlert.classList.add("alert-hidden");
    }, time)

    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden");
    })
}
// End Show Alert

//Drop down
document.addEventListener('DOMContentLoaded', function() {
    var dropdown = document.querySelector('.dropdown');
    var dropdownMenu = document.querySelector('.dropdown-menu');
    var timeout;

    dropdown.addEventListener('mouseenter', function() {
        clearTimeout(timeout);
        dropdownMenu.classList.add('show');
    });

    dropdown.addEventListener('mouseleave', function() {
        timeout = setTimeout(function() {
            dropdownMenu.classList.remove('show');
        }, 150);
    });

    dropdownMenu.addEventListener('mouseenter', function() {
        clearTimeout(timeout);
        dropdownMenu.classList.add('show');
    });

    dropdownMenu.addEventListener('mouseleave', function() {
        timeout = setTimeout(function() {
            dropdownMenu.classList.remove('show');
        }, 150);
    });
});
//End Drop down

// Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
    let url = new URL(window.location.href);
    buttonsPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination");

            url.searchParams.set("page", page);

            window.location.href = url.href;
        })
    })
}
// End Pagination

// Canceled Item
const buttonsCanceled = document.querySelectorAll("[button-canceled]");
if(buttonsCanceled.length > 0){
    const formCanceledItem = document.querySelector("#form-canceled-item");
    const path = formCanceledItem.getAttribute("data-path");

    buttonsCanceled.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc chắn muốn hủy đơn hàng này?");

            if(isConfirm){
                const id = button.getAttribute("data-id");
                
                const action = `${path}/${id}?_method=POST`;
                
                // console.log(action);
                formCanceledItem.action = action;

                formCanceledItem.submit();
            }
        })
    })
}
// Canceled Item

// Check Phone

const phoneInputs = document.querySelectorAll('input[name="phone"]');

phoneInputs.forEach(phoneInput => {
  phoneInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    // Ví dụ kiểm tra độ dài tối thiểu và tối đa (tùy chỉnh theo nhu cầu)
    if (this.value.length < 10 || this.value.length > 11) {
      // Hiển thị thông báo lỗi (tùy chọn)
      console.log("Số điện thoại phải có từ 10 đến 11 chữ số.");
      // Có thể thêm class 'is-invalid' để hiển thị lỗi trực quan
      this.classList.add('is-invalid');
    } else {
      this.classList.remove('is-invalid');
      // Có thể thêm class 'is-valid' nếu cần
      this.classList.add('is-valid');
    }
  });
});

// End Check Phone

// Thêm vào giỏ hàng và Mua ngay
// Lấy các phần tử input số lượng từ DOM
document.addEventListener("DOMContentLoaded", () => {
    const quantityInput = document.getElementById("quantity-input");
    const cartQuantityInput = document.getElementById("cart-quantity");
    const buyNowQuantityInput = document.getElementById("buy-now-quantity");

    // Đồng bộ giá trị khi form "Thêm vào giỏ hàng" được submit
    document.getElementById("add-to-cart-form").addEventListener("submit", (e) => {
        cartQuantityInput.value = quantityInput.value;
    });

    // Đồng bộ giá trị khi form "Mua ngay" được submit
    document.getElementById("buy-now-form").addEventListener("submit", (e) => {
        buyNowQuantityInput.value = quantityInput.value;
    });
});
// End Thêm vào giỏ hàng và Mua ngay

// prevent-double-submit
document.querySelectorAll("form.prevent-double-submit").forEach(form => {
    const submitButton = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function () {
        submitButton.disabled = true;
    });
});
// End prevent-double-submit

// prevent-double-click
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".prevent-double-click").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            link.style.pointerEvents = "none";
            link.textContent = ".....";
            setTimeout(() => {
                window.location.href = link.getAttribute("href");
            }, 300);
        });
    });
});
// End prevent-double-click

// Show Footer on Scroll
document.addEventListener('DOMContentLoaded', function () {
    const footer = document.querySelector('footer.footer'); // Định nghĩa footer

    if (!footer) {
        // console.error('Footer element not found!');
        return;
    }

    window.addEventListener('scroll', function () {
        // Kiểm tra nếu người dùng kéo xuống cuối trang
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            footer.classList.add('show'); // Hiển thị footer
        } else {
            footer.classList.remove('show'); // Ẩn footer
        }
    });
});
// End Show Footer on Scroll