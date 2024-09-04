/**
 * constant file
 */
const statusCodeConstant = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
    CREATED: 201,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    UNPROCESSABLE_ENTITY: 422
}
const messageConstant = {
    MEMBER: "Member",
    DEPARTMENT: "Department",
    EVENT: "Event"
}
const paginationConstants = {
    ITEM_LIMIT: 2,
    DEFAULT_PAGE: 0
}

const sortingConstant = {
    ASC: "asc"
}

export {
    statusCodeConstant,
    messageConstant,
    paginationConstants,
    sortingConstant,
}