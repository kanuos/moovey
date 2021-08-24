const sortList = document.querySelector("#sortList");
const sortByText = document.querySelector("#sortByText");
const toggleSortByBtn = document.querySelector("#toggleSortByBtn");
const sortOptions = document.querySelectorAll("li[data-sortType]");

const optionClasses = {
    "ACTIVE" : "text-white",
    "INACTIVE" : "text-gray-500",
    "INACTIVE:HOVER" : "hover:text-gray-300",
}

toggleSortByBtn?.addEventListener("click", toggleSortListDisplay)
sortOptions?.forEach(function(option) {
    option.addEventListener("click", selectOption)
})


function selectOption() {
    setActiveSortType(this.dataset["sorttype"]);
    toggleSortListDisplay()
}


function setActiveSortType(type = null) {
    // active classes   : text-white active
    // inactive classes : text-pink-600 hover:text-gray-400

    type = type ?? sortOptions[0]?.dataset["sorttype"]
    sortOptions?.forEach(li => {
        li.classList.remove("active", optionClasses.ACTIVE);
        li.classList.add(optionClasses.INACTIVE, optionClasses["INACTIVE:HOVER"]);
        if (!li.children[0].classList.contains("invisible")) {
            li.children[0].classList.add("invisible")
        }
    })
    sortOptions?.forEach(li => {
        if (li.dataset["sorttype"] === type) {
            li.classList.add(optionClasses.ACTIVE, "active")
            li.classList.remove(optionClasses.INACTIVE, optionClasses["INACTIVE:HOVER"])
            if (li.children[0].classList.contains("invisible")) {
                li.children[0].classList.remove("invisible")
            }   
            setInput(type)
        }
    });    
}


function toggleSortListDisplay() {
    sortList?.classList.toggle("-translate-y-full")
    sortList?.classList.toggle("pointer-events-none")
    sortList?.classList.toggle("scale-0")
}


function setInput(type) {
    sortByText.textContent = type;
    document.querySelector("input[name='sort']").value = type;
}


window.addEventListener("load", () => setActiveSortType())