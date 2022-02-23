/**
 * @itemsToAdd {object} {column: 'name of the column', value: 'value of the column'}
 *
 */

const selectAll = () => ({string:`SELECT * from users`, params: null})
const insertValues = (itemsToAdd) => {
  const columns = itemsToAdd.map((item, id) => item.column).join(',')
  const columnParams = itemsToAdd.map((item,id)=>`$${id+1}`).join(',')
  const params = itemsToAdd.map((item,id)=> item.value)
  return {
  string:`INSERT INTO users(${columns}) VALUES (${columnParams}) RETURNING *` , params}}

module.exports= {
  selectAll,
  insertValues,
}
