const func = new Promise(
  setInterval(()=>{
    return 'hello'
  },2000)
)

const foo = func()
const boo = foo.then()
const doo = boo.then()
console.log('foo is:', foo)
console.log('boo is:', boo)
console.log('doo is:', doo)

//<iframe class="flex-initial border border bg-rose-400" id="spotlight-video" src="https://youtube.com/embed/<%= video.videoId %>" frameborder="0" allowfullscreen></iframe>