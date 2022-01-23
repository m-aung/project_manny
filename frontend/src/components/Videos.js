  const Videos = (props) => {
    const currentScreenHeight = window.screen.height * 0.55
    const videoList = [
      { videoName:'Demo latest 1',video:'https://youtube.com/embed/yxW5yuzVi8w'},
      { videoName:'Demo latest 2',video:'https://youtube.com/embed/RnpyRe_7jZA'},
      { videoName:'Demo latest 4',video:'https://youtube.com/embed/6OcOO1k-vGE'},
      { videoName:'Demo latest 5',video:'https://youtube.com/embed/kymHxgBwbm4'},
      { videoName:'Demo latest 6',video:'https://youtube.com/embed/XcYajuXs5cw'},
      { videoName:'Demo latest 8',video:'https://youtube.com/embed/cpzxtUaOsEE'},
    ]
    const videoHeight = window.screen.height < 800 ? 600 : window.screen.height * 0.55 
    const videoWidth = window.screen.width < 800 ? 400 : window.screen.width * 0.55 

    return(
  `
  <section id="latest-videos" class="relative flex flex-wrap flex-col justify-evenly w-screen h-screen pt-2 pb-2 pl-4 pr-4">
      <div class="flex flex-between w-[40%] gap-x-3">
      <button id="btn-list" class="w-20 h-auto p-3 rounded-lg bg-rose-300">List</button>
      <button id="btn-detail" class="w-20 h-auto p-3 rounded-lg bg-rose-300">Detail</button>
      <button id="btn-latest" class="w-30 h-auto p-3 rounded-lg bg-rose-300">Latest</button>
      <button id="btn-popular" class="w-30 h-auto p-3 rounded-lg bg-rose-300">Popular</button>
      </div>
      <fieldset class="flex flex-between w-[40%] gap-x-3">
        <input id="input-search" class="w-60 p-3 bg-red-200" type="search" />
        <button id="btn-search" class="w-24 h-auto p-1 rounded-lg bg-rose-300">Search</button>
      </fieldset>
    <div id="latest-videos" class="relative flex w-screen gap-3 overflow-x-scroll"> 
      ${videoList.map(({videoName, video},idx)=>`<iframe key="${idx}" alt="${videoName}" class="flex-initial border border bg-rose-400" id="spotlight-video" width="${videoWidth}" height="${videoHeight}" src="${video}" frameborder="0" allowfullscreen></iframe>`)}
    </div> 
  </section>
  `
  )}

export default Videos