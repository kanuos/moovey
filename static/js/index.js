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

window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
        if (navList.classList.contains("-translate-y-0")){
            document.documentElement.style.overflowY = "hidden";
            return
        }
        document.documentElement.style.overflowY = "auto";
        return
    } 
    if (window.innerWidth >= 768) {
        document.documentElement.style.overflowY = "auto";
    }
})