const CONFIG = require('./config')
const google = require('googleapis').google
const jwt = require('jsonwebtoken')
const googleAPI = require('express')()
const path = require('path')

const OAuth2 = google.auth.OAuth2
const {client_id,client_secret,redirect_uris, scopes} = CONFIG.Oauth2Credential
const oauth2client = new OAuth2(client_id,client_secret,redirect_uris)

googleAPI.set('view engine','ejs')
googleAPI.set('views', path.resolve(__dirname, '../../views'))

googleAPI.get('/',(req,res) => {
  const loginLink = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })
  res.render('index',{loginLink})
})
googleAPI.get("/oauth2callback", (req, res) => {
  if (req.query.error) {
    // The user did not give us permission.
    return res.redirect("/"); // account access denied page here
  } else {
    oauth2Client.getToken(req.query.code, function(err, token) {
      if (err) return res.redirect("/"); // make ivalid token page here

      // Store the credentials given by google into a jsonwebtoken in a cookie called 'jwt'
      res.cookie("jwt", jwt.sign(token, CONFIG.JWTsecret));
      return res.redirect("/get/mychannel");
    });
  }
});
googleAPI.get("/get/mychannel", (req, res) => {
  if (!req.cookies.jwt) {
    // We haven't logged in
    return res.redirect("/");
  }

  // Add this specific user's credentials to our OAuth2 client
  oauth2Client.credentials = jwt.verify(req.cookies.jwt, CONFIG.JWTsecret);

  // Get the youtube service
  const service = google.youtube("v3");

  console.log(service)
});

module.exports= googleAPI