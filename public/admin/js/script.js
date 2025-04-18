// Button Status
const buttonsStatus = document.querySelectorAll("[button-status]");
if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href);

    buttonsStatus.forEach((button) => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");

            if (status) {
                url.searchParams.set("status", status);
            } else {
                url.searchParams.delete("status");
            }
            // console.log(url.href);
            window.location.href = url.href;
        })
    })
}
// End Button Status

// Form Search
const formSearch = document.querySelector("#form-search");
if (formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;

        if (keyword) {
            url.searchParams.set("keyword", keyword);
        } else {
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
// End Form Search

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

// Change Status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if(buttonChangeStatus.length > 0){
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");

    buttonChangeStatus.forEach((button) =>{
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            let statusChange = statusCurrent == "active" ? "inactive" : "active";

            // console.log(statusCurrent);
            // console.log(statusChange);
            // console.log(id);

            const action = path + `/${statusChange}/${id}?_method=PATCH`;
            formChangeStatus.action = action;

            formChangeStatus.submit();
        })
    })
}

// End Change Status

// Checkbox Multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
    const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
    const inputsId = checkboxMulti.querySelectorAll("input[name='id']");
    inputCheckAll.addEventListener("click", () => {
        if (inputCheckAll.checked) {
            inputsId.forEach(input => {
                input.checked = true;
            })
        } else {
            inputsId.forEach(input => {
                input.checked = false;
            })
        }
    })

    inputsId.forEach(input => {
        input.addEventListener("click", () => {
            const countChecked = checkboxMulti.querySelectorAll(
                "input[name='id']:checked"
            ).length;

            if (countChecked == inputsId.length) {
                inputCheckAll.checked = true;
            } else {
                inputCheckAll.checked = false;
            }
        })
    })
}
// End Checkbox Multi

// Form Change Multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault();

        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputsChecked = checkboxMulti.querySelectorAll(
            "input[name='id']:checked"
        );

        const typeChange = e.target.elements.type.value;

        if (typeChange == "delete-all") {
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa những bản ghi này?");

            if (!isConfirm) {
                return;
            }
        }

        if (inputsChecked.length > 0) {
            let ids = [];
            const inputIds = formChangeMulti.querySelector("input[name='ids']");

            inputsChecked.forEach(input => {
                const id = input.getAttribute("value");

                if (typeChange == "change-position") {
                    const position = input
                    .closest("tr")
                    .querySelector("input[name='position']").value;


                    ids.push(`${id}-${position}`);
                } else {
                    ids.push(id);
                }

            })

            inputIds.value = ids.join(", ");
            formChangeMulti.submit();
        } else {
            alert("Vui lòng chọn ít nhất 1 bản ghi!");
        }
    })
}
// End Form Change Multi

// Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0){
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonsDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa bản ghi này?");

            if(isConfirm){
                const id = button.getAttribute("data-id");
                
                const action = `${path}/${id}?_method=DELETE`;
                
                // console.log(action);
                formDeleteItem.action = action;

                formDeleteItem.submit();
            }
        })
    })
}
// End Delete Item

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

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if(uploadImage){
    const uploadImageInput = document.querySelector("[upload-image-input]");
    const uploadImagePreview = document.querySelector("[upload-image-preview]");
    uploadImageInput.addEventListener("change", (e) => {
        // console.log(e);
        const file = e.target.files[0];
        if(file){
            uploadImagePreview.src = URL.createObjectURL(file);
        }
    })
}
// End Upload Image

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