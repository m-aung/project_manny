const express = require('express');
const cookieParser = require('cookie-parser')
const CONFIG = require('./middleware/google_api/config')
const google = require('googleapis').google
const jwt = require('jsonwebtoken')
const path = require('path')

const app = express();
const service = google.youtube("v3");

const PORT = process.env.SERVER_PORT || 5500;

/**
 * @client_id {String} 
 * @client_secret {String}
 * @redirect_uris {String} a list of redirect URIS
 * @access_type offline
 * @scopes {String} a list of scope
 */

const OAuth2 = google.auth.OAuth2
const {client_id,client_secret,redirect_uris, scopes} = CONFIG.Oauth2Credential
const oauth2Client = new OAuth2(client_id,client_secret,redirect_uris)


const getPlayList = async () => {
  return await service.playlists.list({
    auth: oauth2Client,
    mine: true,
    part: "snippet,contentDetails",
    maxResults: 50
  }).then(res => {
      return {
        playlist : res.data.items.map(({id,snippet,contentDetails}) => {
          const {channelId,title,thumbnails,publishedAt} = snippet
          return {
            playlistId: id, 
            channelId,
            title,
            thumbnails,
            publishedAt
          }
        })
      }
  }).catch(err => {
    console.error('***** Error from Channel Information Fetch ***** \n', err)
  })
}
const getPlaylistItems = async(id)=>{
  const response = await service.playlistItems.list({
    auth: oauth2Client,
    mine: true,
    part: "snippet,id,contentDetails",
    maxResults: 50,
    playlistId: id,
  }).then(response => {
    const video = response.data.items
    // console.log('video from playlist items: ', video)
    const channelVideoListData = response.data.items
    const channelVideoList = channelVideoListData.map(({snippet, contentDetails})=>{
      console.log('snippet:',snippet)
      const {channelTitle, title, publishedAt} = snippet
      const {videoId, videoPublishedAt} = contentDetails
      return {
        channelTitle,title,publishedAt,videoId, videoPublishedAt
      }
    })
    // console.log('channelVideoListData:',channelVideoListData)

    return {
      playlist: channelVideoList
    }
  }).catch(err => console.error('*****Validation failed*****', '\n', err))
  return response
}

app.use(cookieParser())
app.use('/static',express.static(path.resolve(__dirname,'public')))
app.set('view engine','ejs')
app.set('views', path.resolve(__dirname, './views'))

app.get('/',(req,res) => {
  const youtube = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })
  const vimeo = '#'
  res.render('index',{loginLink:{youtube, vimeo}})
})
app.get("/oauth2callback", (req, res) => {
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
app.get("/get/mychannel", async (req, res) => {
  if (!req.cookies.jwt) {
    // We haven't logged in
    return res.redirect("/");
  }

  // Add this specific user's credentials to our OAuth2 client
  oauth2Client.credentials = jwt.verify(req.cookies.jwt, CONFIG.JWTsecret);

  /**
   * Youtube v3 api response data
   * @playlistId {String} Required
   * @part {Array} list of @snippet , @contentDetails Required for playlist
   * @part {Array} list of @id , @snippet , @contentDetails Required for playlistItems
   * 
   */


  

  const playlistData = await getPlayList()
  const {playlist} = playlistData
  // console.log('playlist:',playlist)

  //response check
  if(!playlist.length < 0) {
    console.error('***** Error from Channel Information Fetch ***** \n', 'No playlist available')
    return res.send({error: 'You have no playlist available in your youtube account.'})
  }
  //id check
  if(!playlist[0].playlistId) {
    console.error('***** Error from Channel Information Fetch ***** \n', 'No playlistId')
    return res.send({error: 'Cannot connect to Youtube to obtain your information'})
  }

  const allVidoeList = []

  for(let i=0; i < playlist.length; i++){
    // console.log(playlist[i].playlistId)
    let curPlaylistItems = await getPlaylistItems(playlist[i].playlistId)
    // console.log(curPlaylistItems)
    allVidoeList.push(curPlaylistItems.playlist)
  }

  // console.log('playlist Items:',allVidoeList)
  // return res.render('videos',{videoList: allVidoeList})
  return res.send(allVidoeList)
});

app.get('/api', (req, res) => {
  const { firstname, lastname, email } = req.query;
  res
    .send(JSON.stringify({ firstname, lastname, email }))
    // .redirect('http://localhost:3030/');
});
app.get('/videoList/latest/:datefrom', (req, res) => {
  console.log(req.param);

  // query data from database
  res.send(JSON.stringify(data));
});
app.get('/auth2callback', ()=>{
  res.send(JSON.stringify({'message': 'success'}))
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
