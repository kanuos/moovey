const carousels = document.querySelectorAll(".carousel")
const carouselLinks = document.querySelectorAll(".carouselLink")
const mainCTA = document.getElementById('mainEnd');

let isLoginMode = true, isModalOpen = false;
const modals = document.querySelectorAll(".modal");

function toggleModal(modalType=undefined){
    isModalOpen = !isModalOpen;
    if (!isModalOpen){
        hideModals();
        return
    }
    modalType ?? modalType in ["reg", "log"] ? showModal(modalType) : showModal()
    return
}

function switchModalMode(){
    isLoginMode = !isLoginMode
    if (isLoginMode){
        modals[0]?.classList.remove("scale-0")
        modals[0]?.classList.add("scale-100")
        modals[1]?.classList.add("scale-0")
        modals[1]?.classList.remove("scale-100")
    }
    else {
        modals[0]?.classList.add("scale-0")
        modals[0]?.classList.remove("scale-100")
        modals[1]?.classList.remove("scale-0")
        modals[1]?.classList.add("scale-100")
    }
}

function hideModals(){
    modals.forEach(modal => {
        if(modal?.classList.contains("scale-100")){
            modal?.classList.remove("scale-100")
            modal?.classList.add("scale-0")
        }
    })
}

function showModal(modalType){
    let index = modalType == "log" ? 0 : 1;
    hideModals();
    modals[index]?.classList.remove("scale-0")
    modals[index]?.classList.add("scale-100")
}

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

carousels?.forEach(carousel => landingParagraphObserver.observe(carousel))
carouselLinks?.forEach(link => landingLinkObserver.observe(link))
landingBtnObserver.observe(mainCTA);