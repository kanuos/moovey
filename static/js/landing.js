// animation DOM
const carousels = document.querySelectorAll(".carousel")
const carouselLinks = document.querySelectorAll(".carouselLink")
const mainCTA = document.getElementById('mainEnd');

// form DOM
const errorMsgs = document.querySelectorAll(".errorMsg");
const accountModeTogglerBtns = document.querySelectorAll(".accountModeToggler");
const accountModals = document.querySelectorAll(".accountModal");
const accountModalBox = document.querySelector(".accountModalBox");
const hideModal = document.querySelector(".hideModal");

const showLoginModal = document.querySelector(".showLoginModal");
const showRegisterModal = document.querySelector(".showRegisterModal");

// show hide password DOM
const showHidePassword = document.querySelectorAll(".showHidePassword");

accountModeTogglerBtns?.forEach(btn => {
    btn.addEventListener('click', toggleModalType)
})

hideModal?.addEventListener("click", () => {
    accountModalBox?.classList.add("scale-0")
    accountModalBox?.classList.remove("scale-100")
});

function showModal(){
    if(accountModalBox?.classList.contains("scale-0"))
    accountModalBox?.classList.remove("scale-100")
    accountModalBox?.classList.add("scale-100")
}

function toggleModalType() {
    accountModals?.forEach(modal => {
        modal.classList.toggle("scale-0")
        modal.classList.toggle("scale-100")
        modal.classList.toggle("pointer-events-none")
        modal.classList.toggle("pointer-events-auto")
    })
}

function registerModal(){
    showModal();
    accountModals[0]?.classList.remove("scale-100", "pointer-events-auto")
    accountModals[0]?.classList.add("scale-0", "pointer-events-none")
    accountModals[1]?.classList.add("scale-100", "pointer-events-auto")
    accountModals[1]?.classList.remove("scale-0", "pointer-events-none")
}

function loginModal(){
    showModal(); 
    accountModals[0]?.classList.add("scale-100", "pointer-events-auto")
    accountModals[0]?.classList.remove("scale-0", "pointer-events-none")
    accountModals[1]?.classList.remove("scale-100", "pointer-events-auto")
    accountModals[1]?.classList.add("scale-0", "pointer-events-none")

}

// open the login modal
showLoginModal?.addEventListener("click", loginModal)

// open the register modal
showRegisterModal?.addEventListener("click", registerModal)


// show or hide password functionality
showHidePassword?.forEach(el => el.addEventListener("click",() => showHidePasswordFn(el)));

function showHidePasswordFn(e){
    const selectedBtnType = e.dataset.target
    const btn = Array.from(showHidePassword).find(el => el.dataset.target === selectedBtnType)
    // change icon
    Array.from(btn?.children).forEach(svg => {
        svg.classList.toggle("hidden")
        svg.classList.toggle("block")
    })
    // // change the input[password] to/from input[text]
    const passwordField = btn?.previousElementSibling.previousElementSibling
    if (passwordField) {
        passwordField.getAttribute("type") === "password" ? passwordField.setAttribute("type", "text") : passwordField.setAttribute("type", "password")
    }
}



// the error messages on the login/ register form
// hide the messages if any after 3 seconds 
const popUpMsg = setTimeout(() => {
    errorMsgs?.forEach(errMsg => {
        if (!errMsg?.classList.contains("hidden")) {
            errMsg?.classList.add("hidden")
        }    
    })
}, 3000)

window.addEventListener("unload", () => {
    clearTimeout(popUpMsg)
})



// the scroll animations start
const landingParagraphObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const pTag = Array.from(entry.target.children).find(el => el.nodeName === 'P');
        if (entry.isIntersecting){        
            if (pTag.classList.contains("text-left")){
                pTag.classList.remove("-translate-x-full","scale-0","opacity-0")
                pTag.classList.add("translate-x-0","scale-100","opacity-100")
                return
            }
            if (pTag.classList.contains("text-right")){
                pTag.classList.remove("translate-x-full","scale-0","opacity-0")
                pTag.classList.add("translate-x-0","scale-100","opacity-100")
                return
            }
        }
        else{
            if (pTag.classList.contains("text-left")){
                pTag.classList.add("-translate-x-full","scale-0","opacity-0")
                pTag.classList.remove("translate-x-0","scale-100","opacity-100")
                return
            }
            if (pTag.classList.contains("text-right")){
                pTag.classList.add("translate-x-full","scale-0","opacity-0")
                pTag.classList.remove("translate-x-0","scale-100","opacity-100")
                return
            }
        }
    })
}, {
    threshold : .75,
})   

const landingBtnObserver = new IntersectionObserver((entries)=> {
    entries.forEach(entry => {
        if(!entry.isIntersecting) {
            entry.target.classList.add("scale-0")
            entry.target.classList.remove("scale-100")
            return
        }
        entry.target.classList.add("scale-100")
        entry.target.classList.remove("scale-0")
    })
}, {
    threshold : .5,
})

const landingLinkObserver = new IntersectionObserver((entries)=> {
    entries.forEach(entry => {
        if(!entry.isIntersecting) {
            entry.target.classList.add("scale-0", "opacity-10")
            entry.target.classList.remove("scale-100", "opacity-100")
            return
        }
        entry.target.classList.add("scale-100", "opacity-100")
        entry.target.classList.remove("scale-0", "opacity-10")
    })
}, {
    threshold : 0,
})


// the scroll animations start
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
carousels?.forEach(carousel => landingParagraphObserver.observe(carousel))
carouselLinks?.forEach(link => landingLinkObserver.observe(link))
landingBtnObserver.observe(mainCTA);
