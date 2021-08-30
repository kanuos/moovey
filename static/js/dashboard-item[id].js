// toggle between tabs
const nestTabTogglers = document.querySelectorAll("[data-tab]");
nestTabTogglers?.forEach(toggler => toggler.addEventListener("click", () => {
    const {tab} = toggler.dataset;
    // style togglers
    hideNestTogglerStyle()
    toggler.classList.remove("text-gray-400")
    toggler.classList.add("text-pink-600")
    // select tabs
    const tabbedSections = document.querySelectorAll(".tabTarget");
    tabbedSections?.forEach(section => {
        if (section.dataset["target"] === tab) {
            if (section.classList.contains("hidden")){
                section.classList.remove("hidden")
            }
        } else {
            section.classList.add("hidden")
        }
    })
}))

function hideNestTogglerStyle() {
    nestTabTogglers?.forEach(toggler => {
        toggler.classList.add("text-gray-400")
        toggler.classList.remove("text-pink-600")
    })
}

