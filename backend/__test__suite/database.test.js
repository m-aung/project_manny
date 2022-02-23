require('jest')
const db = require('../database/services/db')
const userQueries = require('../database/queries/users')
const tableQueries = require('../database/queries/tables')

test('Insert query for users table', ()=>{
  const today = new Date('2022-02-22 19:10:25-07')
  const queryParams = [{column: "username", params: "test1"},{column: "password", params: "test1"},{column: "email", params: "test1@test.io"},{column: "premium", params: "false"},{column: "created_on", params: today }]
  let query = userQueries.insertValues(queryParams)
  console.log('query:',query)
  let expectedQuery = 'INSERT INTO users(username,password,email,premium,created_on) VALUES ($1,$2,$3,$4,$5) RETURNING *'
  expect(query.string).toBe(expectedQuery)
})
