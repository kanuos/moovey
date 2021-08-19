const navToggler = document.querySelectorAll(".navMenuToggler");

navToggler.forEach(btn => btn.addEventListener("click", toggleMenu));


function toggleMenu() {
    const navMenu = document.querySelector("#navMenu");
    navMenu?.classList.toggle("-translate-y-full")
}


const navLinksWithDesc = document.querySelectorAll(".navlink-desc");

navLinksWithDesc?.forEach(navLink => {
    navLink.addEventListener("mouseenter", showActiveLinkImage)
    navLink.addEventListener("mouseleave", restoreDefaultLinkImage)
})


function showActiveLinkImage({target}) {
    if (target.tagName === "LI"){
        const src = target.dataset["target"];
        const descImages = document.querySelectorAll(".link-desc");
        descImages.forEach(article => {
            if(src === article.dataset["desc"]) {
               article.classList.add("opacity-100")
               article.classList.remove("opacity-0")
            }
            else {
                article.classList.remove("opacity-100")
                article.classList.add("opacity-0")
            }
        })
    }
}

function restoreDefaultLinkImage() {
    let activeTarget;
    navLinksWithDesc.forEach(link => {
        if (link.classList.contains("active")) {
            activeTarget = link.dataset["target"]
        }
    })
    const descImages = document.querySelectorAll(".link-desc");
    descImages.forEach(article => {
        if(activeTarget === article.dataset["desc"]) {
            article.classList.add("opacity-100")
            article.classList.remove("opacity-0")
        }
        else {
            article.classList.remove("opacity-100")
            article.classList.add("opacity-0")
        }
    })
}
