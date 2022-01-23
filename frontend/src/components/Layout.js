import Nav from './Nav'
import Footer from './Footer'
const Layout = (...children) => {

  const greetings = {
    title: 'Welcome to Vevo',
    subtitleOne: 'Where you can find latest Vevo videos here',
    subtitleTwo:'Exclusive videos are listed here',
  }

  const LandingElement = `
    <header class="flex flex-col justify-between w-screen h-screen bg-rose-300">
      <div class="animate-ease_in relative flex-col gap-3 pt-56 pl-4">
        <h1 class="text-5xl">${greetings.title}</h1>
        <p class="pt-3 text-lg">${greetings.subtitleOne}</p>
        <p class"pt-2 text-lg">${greetings.subtitleTwo}</p>

      </div>
      <span class="animate-bounce border w-36 p-3 rounded-lg opacity-80 bg-red-400">
      <a class="text-center" href="#main">Skip Navigation</a>
      </span>
    </header>
  `
  let currentTab = ''
  const tabs = [{path: '/', tabName:'Home'}, {path: '/videos', tabName:'Video'},{path: '/about', tabName:'About'},{path: '/contact', tabName:'Contact'}]
  tabs.forEach(({path, tabName})=> {
    if(location.pathname === path) currentTab = tabName
  })
  return(
    ` 
    ${location.pathname === '/' ? LandingElement : ''}
    <div id="main" class="relative flex flex-col w-screen h-full justify-between overflow-hidden bg-blue-300"> 
      ${Nav()}
      <div class="relative w-full h-full flex flex-col justify-center align-center items-center overflow-scroll gap-x-3 bg-blue-300"> 
        ${children.map(child=> child())}
      </div> 
        ${Footer()}
    </div>
  `
)}

export default Layout
