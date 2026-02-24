import { paginationConstants } from "../common/index.js"

//setting up number of items to be fetched per page
const getPagination = (_page, _limit) => {
    const limit = _limit ? +_limit : paginationConstants.ITEM_LIMIT;
    const offset = _page ? (_page - 1) * limit : paginationConstants.DEFAULT_PAGE;

    return { limit, offset };
};

//get paginated data and organize it into totalItems, items, totalPages, currentPage
const getPagingData = (items, page, limit, totalItems) => {
    const currentPage = page ? +page : paginationConstants.DEFAULT_PAGE;
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage };
};

export {
    getPagination,
    getPagingData
}