import './css/styles.css'
import './css/tailwind.css'
import {
  Home,
  Videos,
  Contact,
  MessageSent,
  About,
  Layout,
  ErrorMessage
} from './components'
import myDOM from './js/myDOM'

const routes = [
  { path: "/", 
    title: 'Home',
    props:{},
    view: (props) => Layout(()=>Home(props)),
  },
  { path: "/videos", 
    title: 'Videos',
    props:{},
    view: (props) => Layout(()=>Videos(props)),
  },
  { path: "/contact", 
    title: 'Contact',
    props:{},
    view: (props) => Layout(()=>Contact(props)),
  },
  { path: "/about", 
    title: 'About',
    props:{},
    view: (props)=> Layout(()=>About(props)),
  },
  { path: "/message/confirmation", 
    title: 'Confirmation',
    props:{},
    view: (props)=> Layout(()=>MessageSent(props)),
  },
];
const navigateTo = (url,props=null) => {
  // const inputURL = new URL(url)
  // console.log(inputURL)
  history.pushState(null, null, url);
  router(props);
};

const router = async (properties=null) => {

  // Test each route for potential match
  const potentialMatches = routes.map(route => {
    return {
        route: {...route, 'props':properties},
        isMatch: location.pathname === route.path 
    };
  });
  let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

  // error pathnames
  if (!match) {
    match = {
      route: { 
        path: "/error", 
        title: '404 Not Found',
        props:{},
        view: (props)=> Layout(()=>ErrorMessage({code:'404', message:"Page Not Found."})),
      },
      isMatch: true // [location.pathname]
    };
  }

  const {view, title, props} = match.route
  myDOM.setup(view, title, props, '#root')
};

const validateEmail = (email) => {
  if(!email) return {message: 'Email is required!'}
  const validEmail = /^\S+@\S+$/g
  return validEmail.test(email) ? null : {message: 'Email is invalid!'}
}
const validateName = (firstName, lastName) => {
  if(!firstName || !lastName) return {message: 'Both First and Last name are required!'}
  const validName = /^(0-9)/g
  return !validName.test(firstName) && !validName.test(lastName) ? null : {message: 'Numbers are not allowed in both names'}
}

const validSubject = (subject) => {
  return subject.length === 0 ? {message: 'Subject is required!'} : null
}
const validMessageBody = (messageBody) => {
  return messageBody.length === 0 ? {message: 'Message Body is required!'} : null
}

window.addEventListener("popstate", router);
setTimeout(router,0)

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", async(e) => {
  if (e.target.matches("[data-navLink]")) {
      e.preventDefault();
      // for(const route in routes) {
      //   if (route['title'] === document.title) route['props']['selected'] = document.title
      // }
      navigateTo(e.target.href);
  }
  if (e.target.matches("[data-submitBtn]")) {
    e.preventDefault();
    let errorList = []
    const firstName = await myDOM.getValue('#firstname')
    const lastName = await myDOM.getValue('#lastname')
    const email = await myDOM.getValue('#email')
    const subjectElement = await document.querySelector('#subject')
    const messageBodyElement = await document.querySelector('#message-body')
    const subject = await subjectElement.value
    const messageBody = await messageBodyElement.value

    const nameErrorMessage = validateName(firstName,lastName)
    const emailErrorMessage = validateEmail(email)
    const messageBodyErrorMessage = validMessageBody(messageBody)
    const subjectErrorMessage = validSubject(subject) // make is a drop down

    nameErrorMessage ? errorList.push(nameErrorMessage) : null
    emailErrorMessage ? errorList.push(emailErrorMessage) : null
    messageBodyErrorMessage ? errorList.push(messageBody) : null

    if(errorList.length){
      console.log(`errorList: ${errorList}`)
      for(let i= 0; i< errorList.length; i++){
        if(errorList[i]) alert(errorList[i]['message'])
      }
      return
    }
    else if(!errorList.length){
      const routeIndex = routes.findIndex(route => route['title'] === 'Confirmation')
      const props = {firstName,lastName,email}
      // formContainer.submit()
      navigateTo('/message/confirmation',props);
    }
  }
  });
  
  router()
});