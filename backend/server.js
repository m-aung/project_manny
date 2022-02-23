const express = require('express');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const dbRouter = require('./middleware/router')
const youtubeRouter = require('./middleware/google_api/youtubeRouter')

const app = express();

const PORT = process.env.SERVER_PORT || 5500;



app.use(cookieParser())
app.use('/static',express.static(path.resolve(__dirname,'public')))
app.set('view engine','ejs')
app.set('views', path.resolve(__dirname, './views'))

/**
 * 1. store the playlist information in data base along with user information
 * 2. create end point for front end client
 * 3. refractor the code for modularization
 */

app.use('/db',dbRouter)
app.use('/api/youtube',youtubeRouter)
// app.use('/admin', router, (req,res)=> res.status(401))

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
