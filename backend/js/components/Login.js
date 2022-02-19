const Login = (props) => {
  const loginTypes = ['google', 'vimeo']
  return(
`
<section class="relative flex flex-wrap flex-col justify-evenly w-screen h-screen pt-2 pb-2 pl-4 pr-4">
    <div class="flex flex-between w-[40%] gap-x-3">
    <a id="login-link_google" class="w-20 h-auto p-3 rounded-lg bg-rose-300">login with google</a>
    <a id="login-link_viemo" class="w-20 h-auto p-3 rounded-lg bg-rose-300">login with vimeo</a>
    </div>
</section>
`
)}

export default Videos