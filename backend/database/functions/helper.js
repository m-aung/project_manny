/* Pagination */
const getOffset = (currentPage = 1, listPerPage) => {
  return (currentPage - 1) * [listPerPage];
}
/* logger */
const emptyOrRows = (rows) => {
  if (!rows) {
    return [];
  }
  return rows;
}

module.exports = {
  getOffset,
  emptyOrRows
}