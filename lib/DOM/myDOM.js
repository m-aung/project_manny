const myDOM = {

  /**
   * @componentToRender {string} store the component to render
   * @rootNode {string} main html element node
   * @title {string} store the title to change
   * @props {string{}} store states/ data in each render cycle
   * @errorList {string[]} store errorList current render cycle
   * @setup {function} initialize the DOM
   * @setTitle {function} change the stored document title
   * @render {function} renders the DOM
   * @getValue {function} get the value of an HTML element
   * @errorReport {function} export error report to console
   */

  componentToRender : null,
  rootNode : '',
  title: '',
  props:{},
  errorList : [],
  setup: (component,titleInput,props,node) => {
    myDOM.props = props
    component ? myDOM.componentToRender = component(myDOM.props) : myDOM.errorReport('No component to render!')
    node ? myDOM.rootNode = node : myDOM.errorReport('No root node to load the DOM!')
    myDOM.title = titleInput
    myDOM.setTitle(myDOM.title)
    document.addEventListener('DOMContentLoaded', myDOM.render)
    // render the components
    myDOM.render()


  },
  setTitle: (title) => {
    document.title = title
  },
  render:async () =>{
    try{
      if(myDOM.errorList.length > 0) {
        myDOM.errorList.forEach(err => {
          console.error(err)
        })
        return
       }
      const root = await document.querySelector(myDOM.rootNode)
      if(root) {
        root.innerHTML = ''
        root.innerHTML = myDOM.componentToRender
      }

    }
    catch(err){
      // make error statement
      console.error(err)
    }
  },
  getValue: async(htmlSelector)=>{
    try{
      const htmlElement = await document.querySelector(htmlSelector)
      if(htmlElement) return htmlElement.value
    }catch(err){
      //make a new error statement
      console.error(err)
    }
  },
  errorReport : (errMessage) => {
    myDOM.errorList.push(errMessage)
    console.error(errMessage)
  }
}

export default myDOM