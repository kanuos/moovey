// show buttons only when main section shows
const mainSection = document.querySelector("main");
const blogNav = document.querySelector("nav");
const mobilePicToggler = document.querySelector("#picToggler")
const mobileInfoToggler = document.querySelector("#infoToggler")
const asideToggler = document.querySelector("#asideToggler");

const mainObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            mobileInfoToggler?.classList.remove("opacity-0")
            mobilePicToggler?.classList.remove("opacity-0")
            asideToggler?.classList.remove("opacity-0")
            blogNav?.classList.remove("opacity-0")
            blogNav?.classList.add("shadow-lg")
            return
        }
        asideToggler?.classList.add("opacity-0")
        mobileInfoToggler?.classList.add("opacity-0")
        mobilePicToggler?.classList.add("opacity-0")
        blogNav?.classList.add("opacity-0")
        blogNav?.classList.remove("shadow-lg")
    })
}, {
    threshold: 0,
    
    rootMargin: '-300px 0px'
})
mainObserver.observe(mainSection)
// end of info toggler fn


// aside menu toggler fn
const sidebarTogglers = document.querySelectorAll(".sidebarToggler");
const asidePanelTogglers = document.querySelectorAll(".asidePanelToggler")


sidebarTogglers.forEach(toggler => toggler.addEventListener("click", toggleAsideMenu))
asidePanelTogglers.forEach(toggler => toggler.addEventListener("click", toggleAsidePanel))
mobileInfoToggler.addEventListener("click", () => showMobilePanel("info"))
mobilePicToggler.addEventListener("click", () => showMobilePanel("img"))

function toggleAsideMenu() {
    const asideDrawer = document.querySelector("#asideDrawer");
    asideDrawer?.classList.toggle("-translate-x-full")

    if (!asideDrawer.classList.contains("-translate-x-full")) {
        const hideMobBtnEvent = new Event("mb:hide-btn");
        window.dispatchEvent(hideMobBtnEvent)
        return
    }
    const showMobBtnEvent = new Event("mb:show-btn");
    window.dispatchEvent(showMobBtnEvent)
}

function toggleAsidePanel() {
    const activePanel = Array.from(document.querySelectorAll(".aside-section"))?.find(el => el.classList.contains("opacity-0"))
    hideAsidePanels()

    showAsidePanel(activePanel)
    changeAsideTogglerStyle()
}

function hideAsidePanels() {
    const panels = document.querySelectorAll(".aside-section");
    panels.forEach(panel => {
        if (!panel.classList.contains("opacity-0")){
            panel.classList.add("opacity-0")
            return
        }
    })
}

function showAsidePanel(activePanel) {
    if (activePanel) {
        activePanel.classList.remove("opacity-0")
    }
}

function changeAsideTogglerStyle() {
    asidePanelTogglers.forEach(toggler => {
        toggler.classList.toggle("bg-pink-600")
        toggler.classList.toggle("bg-gray-200")
    })
}


function showMobilePanel(panelType) {
    if (["img", "info"].includes(panelType)) {
        hideAsidePanels()
        document.querySelectorAll(".aside-section")?.forEach(el => {
            const modalType = el.dataset["modal"];
            if (modalType === panelType) {
                el.classList.remove("opacity-0")
            }
        })
        toggleAsideMenu()
    }
}


function hideMobileBtns() {
    mobileInfoToggler.classList.add("hidden")
    mobilePicToggler.classList.add("hidden")
}

function showMobileBtns() {
    mobileInfoToggler.classList.remove("hidden")
    mobilePicToggler.classList.remove("hidden")
}


window.addEventListener("mb:hide-btn", hideMobileBtns)
window.addEventListener("mb:show-btn", showMobileBtns)
window.addEventListener("load", readDuration)



// spoiler icon fn
const spoiler = document.querySelector("#spoiler");

spoiler?.addEventListener("toggle", () => {
    const detailIcons = document.querySelectorAll(".det-icon")
    detailIcons?.forEach(icon => {
        icon.classList.toggle("hidden")
    })
})



// calculate the average blog reading duration. Based on the fact that avg human being reads 150 words per minute 

function readDuration(){
    const main = document.querySelector("main");
    const allWords = main.textContent.split(' ').filter(el => el.trim().length > 0)
    const duration = document.querySelector("#duration");
    duration.textContent = Math.round(allWords.length / 150)
}


// content appear on scroll animation
const animateOnScrollElements = document.querySelectorAll(".animateOnScroll");

const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            if (entry.target.classList.contains("opacity-0")){
                entry.target.classList.remove("opacity-0")
            }
            if (entry.target.classList.contains("scale-0")){
                entry.target.classList.remove("scale-0")
            }
            return
        }
    })
}, {threshold : 0, rootMargin: getScrollObserverRootMargin()})

animateOnScrollElements?.forEach(el => scrollObserver.observe(el))


function getScrollObserverRootMargin() {
    const width = window.innerWidth;
    if (width < 640) {
        return '-20px 0px'
    }
    return '-100px 0px'
}