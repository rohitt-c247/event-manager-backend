/**
 * constant file
 */
const statusCodeConstant = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
    CREATED: 201,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    UNPROCESSABLE_ENTITY: 422,
    BAD_REQUEST:400,
    UNAUTHORIZE:401,
    CONFLICT:409
}
const messageConstant = {
    MEMBER: "Member",
    DEPARTMENT: "Department",
    EVENT: "Event",
    GROUP:"Group",
}
const paginationConstants = {
    ITEM_LIMIT: 100,
    DEFAULT_PAGE: 0
}

const sortingConstant = {
    ASC: "asc"
}

const status = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export {
    statusCodeConstant,
    messageConstant,
    paginationConstants,
    sortingConstant,
    status
}