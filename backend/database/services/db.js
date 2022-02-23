const { Pool } = require('pg');
const config = require('../config');
const pool = new Pool(config.db);

/**
 * Query the database using the pool
 * @param {*} query 
 * @param {*} params 
 * 
 */
const query = async (queryFunc, params) =>{
  try{
    const queryStr = queryFunc()
    const result = await pool.query(queryStr, params);
    return result.rows;
  }catch (err){
    console.error (err.message)
  }

}

module.exports = {
  query
}