const ErrorMessage = ({code,message}) => {
  const goBack = (e) => {
    e.preventDefault()
    console.log('clicked!')
    history.back()
  }
  return(
  `
  <div class="relative w-full h-screen flex flex-col justify-center align-center gap-x-3 bg-blue-300">
    <h1 class="p-3 text-3xl text-center"> Error Code: ${code}</h1>
    <div class="flex flex-col justify-center items-center gap-y-3 p-2" >
    <p class="ml-[5%] mr-[5%] text-m">${message}</p>
    <p class="ml-[5%] mr-[5%] text-m">Back to <span class="p-1 text-md><a href="/">Home</a></span></p>
    </div>
  </div>
  `
)}

export default ErrorMessage