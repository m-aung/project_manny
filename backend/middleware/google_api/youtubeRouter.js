const CONFIG = require('./config')
const google = require('googleapis').google
const service = google.youtube("v3");

const youtubeRouter = require('express').Router()

/**
 * @client_id {String} 
 * @client_secret {String}
 * @redirect_uris {String} a list of redirect URIS
 * @access_type offline
 * @scopes {String} a list of scope
 * @getPlayList {function} async function for getting all playlist information from youtube
 * @getPlayListItems {function} async function for getting all items of one playlist
 * @response {object} example response from google api is in data
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
          console.log('contentDetails:',contentDetails) // to test the data
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
    const {items,contentDetails} = response.data
    // console.log('contentDetails:', contentDetails)
    // console.log('items:', items)

    const channelVideoList = items.map(({snippet, contentDetails})=>{
      // console.log('snippet:',snippet)
      const {channelTitle, title, thumbnails} = snippet
      const {videoId, videoPublishedAt} = contentDetails
      return {
        channelTitle,title,videoId, videoPublishedAt, thumbnails
      }
    })
    return {
      playlist: channelVideoList
    }
  }).catch(err => console.error('*****Validation failed*****', '\n', err))
  return response
}




//root route
youtubeRouter.get('/',(req,res) => {
  const youtube = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })
  const vimeo = '#' // add vimeo client here
  res.render('index',{loginLink:{youtube, vimeo}})
})

// the route name can be modified at youtube developer board. This is for youtube redirect link after successful login
youtubeRouter.get("/oauth2callback", (req, res) => {
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

// route to display the data
youtubeRouter.get("/get/mychannel", async (req, res) => {
  if (!req.cookies.jwt) {
    // We haven't logged in
    return res.redirect("/");
  }

  // Add this specific user's credentials to our OAuth2 client
  oauth2Client.credentials = jwt.verify(req.cookies.jwt, CONFIG.JWTsecret);
  const allVidoeList = []

  /**
   * Youtube v3 api response data
   * @playlistId {string} Required
   * @part {array} list of @snippet , @contentDetails Required for playlist
   * @part {array} list of @id , @snippet , @contentDetails Required for playlistItems
   * @allVidoeList {array} list of all video informations
   */

  const playlistData = await getPlayList()
  const {playlist} = playlistData

  //response check
  if(!playlist.length < 0) {
    console.error('***** Error from Channel Information Fetch ***** \n', 'No playlist available')
    return res.send({error: 'You have no playlist available in your youtube account.'})
  }
  //id check
  if(!playlist[0].playlistId) {
    console.error('***** Error from Channel Information Fetch ***** \n', 'No video id')
    return res.send({error: 'Cannot connect to Youtube to obtain your information'})
  }

  for(let i=0; i < playlist.length; i++){
    let curPlaylistItems = await getPlaylistItems(playlist[i].playlistId)
    // console.log('curPlaylistItems:',curPlaylistItems)
    console.log('playlist: ', curPlaylistItems)
    allVidoeList.push(curPlaylistItems.playlist)
  }
  console.log(allVidoeList)
  // return res.send(allVidoeList)
  return res.render('videos',{videoList: allVidoeList})
});

module.exports = youtubeRouter