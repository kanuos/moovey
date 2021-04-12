const header = document.querySelector("header");
const nav = document.querySelector("nav");
const navList = document.querySelector(".navList")

// NAVBAR SECTION START
const navbarTogglers = document.querySelectorAll(".navbarToggler");
navbarTogglers?.forEach((el, i) => el.addEventListener("click", () => {
    navList?.classList.toggle("-translate-y-full");
    navList?.classList.toggle("-translate-y-0");
    if (window.innerWidth <= 768) {
        document.documentElement.style.overflowY = "hidden";
    } 
    if (i != 0) {
        // when the close button is clicked reset the document flow
        document.documentElement.style.overflowY = "auto";
    }
}))

// scroll nav effect
const observer = new IntersectionObserver((entries, _observer)=> {
    entries.forEach(entry => {
        if(!entry.isIntersecting) {
            nav?.classList.remove("bg-transparent", "text-white");
            nav?.classList.add("bg-white", "text-black", "shadow-md");
            navList?.classList.remove("md:text-white")
            navList?.classList.add("md:text-black")
        } 
        else {
            navList?.classList.add("md:text-white")
            navList?.classList.remove("md:text-black")

            nav?.classList.add("bg-transparent", "text-white");
            nav?.classList.remove("bg-white", "text-black", "shadow-md");
        }
    }
)}, {threshold : 0.15, rootMargin: "0px 0px -5px 0px"})

observer.observe(header)

