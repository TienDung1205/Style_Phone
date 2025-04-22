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

    // if(query.page){
    //     objectPagination.currentPage = parseInt(query.page);
    // }
    // else{
    //     objectPagination.currentPage = 1;
    // }

    const totalPage = Math.ceil(count/objectPagination.limitItems);
    objectPagination.totalPage = totalPage;


    if(objectPagination.currentPage > totalPage && totalPage != 0){
        objectPagination.currentPage = totalPage;
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
    
    return objectPagination;
}