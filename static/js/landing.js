// navbar style changes on scroll
function navScrollStyle() {
    const navbar = document.querySelector("nav");
    const bgImg = document.querySelector("#bgImg");
    const header = document.querySelector("header");
    const headerObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                navbar?.classList.remove("bg-opacity-0")
                navbar?.classList.add("bg-opacity-70", "shadow-xl")
                bgImg?.classList.remove("opacity-100", "sm:grayscale-0")
                bgImg?.classList.add("opacity-10", "sm:grayscale")
                entry.target.classList.add("blur-sm", "opacity-50")
                return
            }
            navbar?.classList.add("bg-opacity-0")
            navbar?.classList.remove("bg-opacity-70", "shadow-xl")
            bgImg?.classList.add("opacity-100", "sm:grayscale-0")
            bgImg?.classList.remove("opacity-10", "sm:grayscale")
            entry.target.classList.remove("blur-sm", "opacity-50")
        })
    }, {
        threshold: .5,
        rootMargin: '-100px 0px'
    })
    headerObserver.observe(header)
}
// section styles on scroll
function sectionScrollStyle() {
    const targetSections = document.querySelectorAll(".targetSection");
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting){
                entry.target.classList.remove("opacity-0")
                Array.from(entry.target.children)?.forEach(childEl => {
                    childEl.classList.remove("scale-0")
                })
                return
            }
            entry.target.classList.add("opacity-0")
            Array.from(entry.target.children)?.forEach(childEl => {
                childEl.classList.add("scale-0")
            })
        })
    }, {
        threshold: .25
    })
    
    targetSections?.forEach(target => sectionObserver.observe(target))
}

(function(){
    navScrollStyle()
    sectionScrollStyle()
})()

// image hover on small screen
const imgBoxes = document.querySelectorAll(".imgBox");

function hoverImgEffect(){
    let i;
    imgBoxes.forEach((box, index) => {
        if (box.classList.contains("z-10")) {
            i = parseInt(index + 1) % imgBoxes.length;
        }
        box.classList.remove("z-10")
        box.classList.add("grayscale", "blur-sm")
    })
    imgBoxes[i].classList.add("z-10")
    imgBoxes[i].classList.remove("grayscale", "blur-sm")
}

let imgEffect; 
window.addEventListener("unload", () => clearInterval(imgEffect))
window.addEventListener("load", () => {
    imgEffect = setInterval(hoverImgEffect, 3000)
})