import './css/styles.css'
import './css/tailwind.css'
import {
  Home,
  Videos,
  Contact,
  MessageSent,
  About,
  Layout
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
  { path: "/error", 
    title: '404 Not Found',
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
    console.error(`${location.pathname} not found`)
    match = {
      route: routes[0],
      isMatch: true // [location.pathname]
    };
  }
  console.log('after match:',match)

  const {view, title, props} = match.route
  myDOM.setup(view, title, props, '#root')
};

const validateEmail = (email) => {
  if(!email) return {message: 'Email is required!'}
  const validEmail = /^\S+@\S+$/g
  return validEmail.test(email) ? null : {message: 'Email is invalid!'}
}
const validateName = ({firstName, lastName}) => {
  if(!firstName || !lastName) return {message: 'Both First and Last name are required!'}
  const validName = /^(0-9)/g
  return !validName.test(firstName) && !validName.test(lastName) ? null : {message: 'Numbers are not allowed in both names'}
}

const validSubject = (subject) => {
  return subject ? null : {message: 'Subject is required!'}
}
const validMessageBody = (messageBody) => {
  return messageBody ? null : {message: 'Message Body is required!'}
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
    const subject = await myDOM.getValue('#subject')
    const messageBody = await myDOM.getValue('#message-body')

      const nameErrorMessage = validateName({firstName,lastName})
      nameErrorMessage ? errorList.push(nameErrorMessage.message) : null

    if(email){
      const emailErrorMessage = validateEmail(email)
      emailErrorMessage ? errorList.push(emailErrorMessage) : null
    }
    if(messageBody) {
      const messageBodyErrorMessage = validMessageBody(messageBody)
      messageBodyErrorMessage ? errorList.push(messageBody) : null
    }
    const subjectErrorMessage = validSubject(subject) // make is a drop down
    console.log(errorList)
    if(errorList.length){
      console.log(`errorList: ${errorList}`)
      for(let i= 0; i< errorList.length; i++){
        if(errorList[i]) alert(errorList[i])
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