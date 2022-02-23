const PORT = process.env.PORT || 5500
const base_url = `http://localhost${PORT}`
const keys = require('./client_secret.json')

const {client_id, project_id, token_uri, auth_provider_x509_cert_url, client_secret, redirect_uris} = keys.web


module.exports ={
  JWTsecret: 'manny',
  base_url,
  Oauth2Credential:{
    client_id,
    project_id,
    token_uri,
    auth_provider_x509_cert_url,
    client_secret,
    redirect_uris,
    scopes:[
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  }
}