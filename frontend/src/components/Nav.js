const Nav = (props) => {
  const selectedClass = 'pt-2 pl-2 pb-10 pr-2 border-blue-300 rounded-[30%] text-red-500 bg-blue-300 '
  return(
  `
    <nav class="p-3 text-blue-500 bg-red-300"> 
      <div class="relative flex justify-end space-x-5"> 
        <span class="relative"> 
          <a class="${location.pathname === '/' ? selectedClass : ''} hover:text-red-900" href="/" data-navLink>
            Home
          </a> 
        </span> 
        <span> 
          <a class="${location.pathname === '/videos' ? selectedClass : ''} hover:text-red-900" href="/videos" data-navLink>
            Videos
          </a> 
        </span> 
        <span> 
          <a class="${location.pathname === '/about' ? selectedClass : ''} hover:text-red-900" href="/about" data-navLink>
            About
          </a> 
        </span> 
        <span> 
          <a class="${location.pathname === '/contact' ? selectedClass : ''} hover:text-red-900" href="/contact" data-navLink>
            Contact
          </a>
        </span> 
      </div> 
    </nav> 
  `
)}

export default Nav