module.exports = (query) => {
    let filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: ""
        },
        {
            name: "Hoạt động",
            status: "active",
            class: ""
        },
        {
            name: "Dừng hoạt động",
            status: "inactive",
            class: ""
        }
    ]
    
    if(query.status){
        const index = filterStatus.findIndex(item => item.status == query.status);
        if (index != -1) { // Kiểm tra xem index có hợp lệ không
            filterStatus[index].class = "active";
        }
    }else{
        const index = filterStatus.findIndex(item => {
            return item.status == "";
        })
        filterStatus[index].class = "active";
    }

    return filterStatus;
}