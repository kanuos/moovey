const observer = new IntersectionObserver((entries, _observer)=> {
    entries.forEach(entry => {
        if(!entry.isIntersecting) {
            nav?.classList.add("shadow-lg")
        } 
        else {
            nav?.classList.remove("shadow-lg")
        }
    }
)}, {threshold : 0, rootMargin: "-600px 0px 0px 0px"})

observer.observe(header)

window.addEventListener("load", () => {
    nav?.classList.remove("text-white")
    nav?.classList.add("bg-white", "text-black");
    navList?.classList.remove("md:text-white")
    navList?.classList.add("md:text-black")
})