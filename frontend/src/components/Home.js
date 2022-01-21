


const Home = (props) => {
  // fetch video data here
  const spotlightVideo = { videoName:'Demo Spotlight',video:'https://youtube.com/embed/cpzxtUaOsEE'}
  const latestVideos = [
    { videoName:'Demo latest 1',video:'https://youtube.com/embed/yxW5yuzVi8w'},
    { videoName:'Demo latest 2',video:'https://youtube.com/embed/RnpyRe_7jZA'},
    { videoName:'Demo latest 4',video:'https://youtube.com/embed/6OcOO1k-vGE'},
    { videoName:'Demo latest 5',video:'https://youtube.com/embed/kymHxgBwbm4'},
    { videoName:'Demo latest 6',video:'https://youtube.com/embed/XcYajuXs5cw'},
    { videoName:'Demo latest 8',video:'https://youtube.com/embed/cpzxtUaOsEE'},
  ]
  const featureVideo = { videoName:'Demo latest 6',video:'https://youtube.com/embed/XcYajuXs5cw'}

  const videoHeight = window.screen.height < 800 ? 600 : window.screen.height * 0.55 
  const videoWidth = window.screen.width < 800 ? 400 : window.screen.width * 0.55 


  return(
  `
    <div class="relative w-full h-full flex flex-col align-center gap-y-3 pt-2 bg-blue-300"> 
      <div id="spotlight-video" class="relative flex justify-center"> 
        <iframe alt="${spotlightVideo.videoName}" class="relative flex-initial border bg-rose-400" width="${videoWidth}" height="${videoHeight}" src="${spotlightVideo.video}" frameborder="0" allowfullscreen></iframe> 
      </div> 
      <div id="latest-videos" class="relative flex gap-3 overflow-x-scroll"> 
        ${latestVideos.map(({videoName, video},idx)=>`<iframe key="${idx}" alt="${videoName}" class="relative flex-initial border bg-rose-400" id="spotlight-video" width="${videoWidth}" height="${videoHeight}" src="${video}" frameborder="0" allowfullscreen></iframe>`)}
      </div> 
      <div id="feature-video" class="relative flex justify-center"> 
        <iframe alt="${featureVideo.videoName}" class="relative flex-initial border bg-rose-400" width="${videoWidth}" height="${videoHeight}" src="${featureVideo.video}" frameborder="0" allowfullscreen></iframe> 
      </div>
    </div> 
  `
)}

export default Home

   

   