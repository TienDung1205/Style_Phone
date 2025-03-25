module.exports = (objectPagination, query, count) =>{
    if (query.page && !isNaN(parseInt(query.page))) {
        if(parseInt(query.page) < 1){
            objectPagination.currentPage = 1;
        }else{
            objectPagination.currentPage = parseInt(query.page);
        }
    } else {
        objectPagination.currentPage = 1;
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    const totalPage = Math.ceil(count/objectPagination.limitItems);
    objectPagination.totalPage = totalPage;
    
    return objectPagination;
}