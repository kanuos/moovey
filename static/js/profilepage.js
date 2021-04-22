
// START OF PROFILE PAGE TAB FUNCTIONS
const tabSelectors = document.querySelectorAll(".sectionSelector")
const tabSections = document.querySelectorAll(".tabSection")
const INITIAL_INDEX = 0

window.onload = () => {
    deselectAllTabs();
    deselectAllSections();
    selectSection(INITIAL_INDEX)
    tabSelectors[INITIAL_INDEX]?.classList.add("text-gray-700", "font-semibold")
    tabSelectors[INITIAL_INDEX]?.classList.remove("text-gray-400")
    tabSelect();
}


function tabSelect() {
    Array.from(tabSelectors)?.forEach((item, i) => {
        // change item style
        item.addEventListener("click", _ => {
            deselectAllTabs();
            deselectAllSections();
            selectSection(i)
            item.classList.add("text-gray-700", "font-semibold")
            item.classList.remove("text-gray-400")
        })
    })
}

function selectSection(i) {
    tabSections[i]?.classList.add("flex");
    tabSections[i]?.classList.remove("hidden");
}

function deselectAllSections() {
    Array.from(tabSections)?.forEach(section => {
        section.classList.remove("flex");
        section.classList.add("hidden");
    })
}

function deselectAllTabs() {
    Array.from(tabSelectors)?.forEach(tab => {
        tab.classList.remove("text-gray-700", "font-semibold");
        tab.classList.add("text-gray-400", "font-light");
    })
}

// END OF PROFILE PAGE TAB FUNCTIONS