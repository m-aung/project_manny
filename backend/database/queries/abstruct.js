// actions reducers combination

const actionCreators = () => {
  return (typeName,payload)=>{
    return {
      type: typeName.toUpperCase,
      payload
    }
  }
}

const createAction = actionCreators()
const insertAction = createAction('insert', 'INSERT INTO')


const insertValues = (itemsToAdd , action) => {
  const columns = itemsToAdd.map((item, id) => item.column).join(',')
  const columnParams = itemsToAdd.map((item,id)=>`$${id+1}`).join(',')
  const params = itemsToAdd.map((item,id)=> item.value)
  return {
  string:`${action.payload} users(${columns}) VALUES (${columnParams}) RETURNING *` , params}
}

