const MessageSent = (props) => {
  const {firstName, lastName, email} = props
  return(
  `
  <div class="relative w-full h-[80%] flex flex-col align-center gap-x-3 bg-blue-300">
    <h1 class="p-3 text-3xl text-center"> Thank you ${firstName} ${lastName}</h1>
    <div class="flex flex-col justify-center items-center gap-y-3 p-2" >
    <p class="ml-[5%] mr-[5%] text-m">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dignissimos tempora distinctio deleniti beatae ut repellendus, aspernatur animi placeat nisi, molestiae veniam neque impedit quasi hic voluptates vero amet quidem sapiente.</p>
    <p class="text-m">We will contact you shortly via ${email}</p>
    </div>
  </div>
  `
)}

export default MessageSent