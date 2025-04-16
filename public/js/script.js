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