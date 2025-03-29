module.exports = (query) => {
    let filterStatus = [{
            name: "Tất cả",
            status: "",
            class: ""
        },
        {
            name: "Thành công",
            status: "success",
            class: ""
        },
        {
            name: "Đang vận chuyển",
            status: "delivering",
            class: ""
        },
        {
            name: "Đang xử lý",
            status: "processing",
            class: ""
        },
        {
            name: "Đã hủy",
            status: "canceled",
            class: ""
        }
    ]

    if (query.status) {
        const index = filterStatus.findIndex(item => item.status == query.status);
        if (index != -1) { // Kiểm tra xem index có hợp lệ không
            filterStatus[index].class = "active";
        }
    } else {
        const index = filterStatus.findIndex(item => {
            return item.status == "";
        })
        filterStatus[index].class = "active";
    }

    return filterStatus;
}