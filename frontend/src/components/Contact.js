const Contact = (props) => {
  return (
  `
  <div id="form-container" class="relative w-full h-screen flex flex-col justify-center items-center align-center gap-x-3 bg-blue-300">
    <form id="contact-form" class="relative flex flex-col w-[75%] h-[80%] justify-center items-center h-full gap-y-3 border rounded-xl bg-blue-100" action="http://localhost:8080/api">
      <h1 class="text-center pt-2 pb-2 text-2xl text-blue-400 text-bold">Contact Us</h1>
      <!-- user information -->
      <small>Fill all the fields below</small>
      <div class="flex flex-wrap justify-center w-[80%] gap-x-3 gap-y-3">
          <fieldset class="flex-auto">
            <input autofocus class="w-full p-1 rounded-lg" name="firstname" id="firstname" placeholder="First Name" type="text" required/>
          </fieldset>
          <fieldset class="flex-auto">
            <input autofocus class="w-full p-1 rounded-lg" name="lastname" id="lastname" placeholder="Last Name" type="text" required/>
          </fieldset>
          <fieldset class="flex-auto">
          <input class="w-full p-1 rounded-lg" name="email" id="email" placeholder="Email" type="email"/>
          </fieldset>

      </div>
      <!-- message information -->
      <div class="relative flex flex-col justify-around w-[80%] gap-y-3 ">
          <input class="p-1 rounded-lg" name="subject" placeholder="Subject" id="subject" type="text"/>
          <textarea style="resize: none;" class="rounded-lg overflow-scroll" name="messagebody" id="message-body" rows="10" placeholder="Type your message here" ></textarea>
      </div>
      <div class="p-2 ">
        <button id="contact-form-submit" class="w-auto h-auto p-2 rounded-full bg-red-300" type="submit" data-submitBtn>Send</button>
      </div>
    </form>
  </div>
  `
)
}

export default Contact

