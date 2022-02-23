const dbRouter = require('express').Router()

const tables = require('../database/services/tables')

dbRouter.get('/', (req,res)=> res.send("Hello World"))
dbRouter.get('/create', async (req,res,next)=>{
  try {
    res.json(await tables.createUsers());
  } catch (err) {
    console.error(`Error while getting `, err.message);
    next(err);
  }
})
dbRouter.get('/new-user', async(req,res) =>{
  try {
    const {} = req.body
    res.json(await tables.createUsers());
  } catch (err) {
    console.error(`Error while getting `, err.message);
    next(err);
  }
})
dbRouter.get('/get', async (req,res,next)=>{
  try {
    res.json(await tables.getAllUsers());
  } catch (err) {
    console.error(`Error while getting `, err.message);
    next(err);
  }
})

module.exports = dbRouter