const dashboardAside = document.querySelector("#dashboard-aside");
const dashboardAsideToggler = document.querySelector("#dashboard-aside-toggler");
const iconTexts = document.querySelectorAll(".icon-text");


// show/hide aside menu on click
dashboardAsideToggler?.addEventListener("click", function(){
    if (dashboardAside?.classList.contains("w-10")) {
        dashboardAside?.classList.remove("w-10")
        dashboardAside?.classList.add("w-3/5", "max-w-xs")
    }
    else {
        dashboardAside?.classList.add("w-10")
        dashboardAside?.classList.remove("w-3/5", "max-w-xs")
    }

    // show text and icon vs only icon
    iconTexts?.forEach(icon => {
        if (icon.classList.contains("hidden")) {
            icon.classList.remove("hidden")
            icon.classList.add("ml-1.5")
        }
        else {
            icon.classList.add("hidden")
            icon.classList.remove("ml-1.5")
        }
    })
    // show side bar show/hide icon
    Array.from(this.children).forEach(el => el.classList.toggle("hidden"))

    // blur/unblur the main element when the aside bar expands
    const main = document.querySelector("main#main");
    main.classList.toggle("blur")
})

// sort search filter fn
const optMenuToggler = document.getElementById("optMenuToggler");
const sortByOpts = document.querySelectorAll(".sortByOpt");
const sortInput = document.querySelector("input[name='sort']");
const sortTypeText = document.querySelector("#sortSelectedType");

// toggle options menu visibility
optMenuToggler?.addEventListener("click", toggleOptMenu);

sortByOpts?.forEach(option => option.addEventListener("click", () => selectSortType(option)))


function selectSortType(el) {
    const type = el.dataset.value;
    sortInput.value = type;
    sortTypeText.innerHTML = `&ldquo;${type}&rdquo;`;
    toggleOptMenu()
}

function toggleOptMenu() {
    const optList = document.querySelector(".optList");
    optList?.classList.toggle("hidden")
}



// some dashboard individual pages will have sub-tabs. 
const dashboardTabTogglers =  document.querySelectorAll(".dashboard-tab-toggler");
const dashboardTabs =  document.querySelectorAll(".dashboard-tab");


dashboardTabTogglers?.forEach(toggler => toggler.addEventListener("click", () => {
    // const selectedTab = target.dataset.target;
    toggleDashboardTab(toggler.dataset["target"])
}))


function toggleDashboardTab(tabName) {
    // change toggler style
    updateActiveTabTogglerStyle(tabName)
    // select tab
    selectTab(tabName)
}

function updateActiveTabTogglerStyle(currentTabName) {
    dashboardTabTogglers.forEach(toggler => {
        const {classList, dataset : {target}} = toggler;
        // active tab
        if (currentTabName === target) {
            if (!classList.contains("text-pink-600")) {
                classList.add("text-pink-600")
                classList.remove("text-gray-400", "hover:text-black")
            }
        }
        // inactive tab
        else {
            if (classList.contains("text-pink-600")) {
                classList.remove("text-pink-600")
                classList.add("text-gray-400", "hover:text-black")
            }
        }
    })
}

function selectTab(currentTabName) {
    dashboardTabs.forEach(section => {
        const {classList, dataset: {tab}} = section;
        
        if (tab === currentTabName) {
            // remove the hidden class
            if (classList.contains("hidden")) {
                classList.remove("hidden")
            }
        }
        else {
            // add the hidden class
            if (!classList.contains("hidden")) {
                classList.add("hidden")
            }
        }
    })
}




// function to minimize and maximize dashboard aside menu.
// when the dashboard toggler elements are clicked an Event is triggered
// that trigger response to toggling of the aside bar using the active class that is sent as a data-class attribute

function toggleDashboardMenu() {
    const dashboardMenu = document.querySelector("#dashboardMenu");
    dashboardMenu.classList.toggle(dashboardMenu.dataset["class"])
}


const dashboardMenuToggler = document.querySelectorAll(".dashboardMenuToggler");

dashboardMenuToggler?.forEach(toggler => toggler.addEventListener("click", () => {
    const e = new Event("dashboard-toggle");
    window.dispatchEvent(e)
}));



window.addEventListener("dashboard-toggle", toggleDashboardMenu)