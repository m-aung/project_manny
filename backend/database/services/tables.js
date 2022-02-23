const db = require('./db');
const {getOffset,emptyOrRows} = require('../functions/helper');
const config = require('../config');
const {createUsersTable,createPlaylistTable,createVideosTable} = require('../queries/tables')
const {selectAll, insertValues} = require('../queries/users')


const createUsers= async (page = 1) => {
  const offset = getOffset(page, config.listPerPage);
  const rows = await db.query(
    createUsersTable, 
    [offset, config.listPerPage]
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}
const createPlaylists = async (page = 1) => {
  const offset = getOffset(page, config.listPerPage);
  const rows = await db.query(
    createPlaylistTable, 
    [offset, config.listPerPage]
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}
const createVideos= async (page = 1) => {
  const offset = getOffset(page, config.listPerPage);
  const rows = await db.query(
    createVideosTable, 
    [offset, config.listPerPage]
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

const getAllUsers = async (page = 1) => {
  const offset = getOffset(page, config.listPerPage);
  const rows = await db.query(
    selectAll
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

const getMultiple= async (page = 1) => {
  const offset = getOffset(page, config.listPerPage);
  const rows = await db.query(
    createUsersTable, 
    [offset, config.listPerPage]
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

const addNewUser = async (page=1) => {
  const offset = getOffset(page, config.listPerPage);
  const rows = await db.query(
    insertValues(), 
    [offset, config.listPerPage]
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

module.exports = {
  getMultiple,
  createUsers,
  createPlaylists,
  createVideos,
  getAllUsers,
}