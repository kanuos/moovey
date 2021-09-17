// CONSTANTS AND DOM
const searchError = document.querySelector("#searchError");
const searchFormToggler = document.querySelector(".searchFormToggler") 
const forms = document.querySelectorAll(".searchForm");
let searchMsgEl = document.getElementById("searchMsgEl");
let submitBtn, searchInput;

if (!searchMsgEl) {
    searchMsgEl = createErrorMsgEl()
}

const VALID_CATEGORIES = ["movie", "series"];
const VALID_YEAR = {
    min : 1900,
    max : new Date().getUTCFullYear()
}
let activeForm;

// function to create the search msg element with style if not present
function createErrorMsgEl() {
    if (!searchMsgEl) {
        const span = document.createElement("span");
        span.classList.add("p-2", "text-sm", "md:text-base", "font-special", "capitalize", "block")
        span.setAttribute("id", "searchMsgEl");
        span.textContent = "Search your favorite movies and Tv shows here"
        searchError?.appendChild(span)
        return span
    }
}


// function to hide the page error
function hideErrorMsg() {
    const timer = setTimeout(() => {
        searchError?.classList.add("hidden");
    }, 4000)
    return () => clearTimeout(timer)
}

// function to show the error on page - global
function showErrorMsg(msg='') {
    if (msg) {
        if (searchError?.classList.contains("hidden")) {
            searchMsgEl.textContent = msg;
            searchError.classList.remove("hidden");
        }
    }
}

// change the form depending on search type
// either search by title or search by imdbid
// PS: helps for non-english content

function toggleForm() {
    // hide and show alternate forms
    forms?.forEach(formEl => {
        formEl.classList.toggle("hidden")
    })
    // change the active form element
    activeForm = Array.from(forms)?.find(form => !form.classList.contains("hidden"))
    activeForm.addEventListener("submit", handleFormSubmit)
    submitBtn = activeForm.querySelector("button[type='submit']")
    searchInput = activeForm.querySelector("input[type='search']")
    searchInput.addEventListener("input", toggleBtnSubmissionFunctionality)

    // change the toggler text and btn icon
    const TOGGLER_TEXT_OPTIONS = {
        "title" : "imdbid",
        "imdbid" : "title"
    }

    const togglerText = document.getElementById("togglerText");
    const togglerBtn = document.getElementById("togglerBtn");
    
    togglerText.textContent = TOGGLER_TEXT_OPTIONS[togglerText.textContent];
    
    if (togglerBtn.classList.contains("fa-toggle-on")) {
        togglerBtn.classList.remove("fa-toggle-on")
        togglerBtn.classList.add("fa-toggle-off")
    }
    else if (togglerBtn.classList.contains("fa-toggle-off")) {
        togglerBtn.classList.remove("fa-toggle-off")
        togglerBtn.classList.add("fa-toggle-on")
    }
}


function handleFormSubmit(e) {
    try {
        e.preventDefault();
        const fd = new FormData(this);

        for(let [name, value] of fd) {
            // every form will have a search field - may it be an imdbid field or a keyword field
            if (name === "keyword" || name === "imdbid") {
                if (value?.trim().length === 0){
                    throw new Error(name + " cannot be empty")
                }
            }
            // checking for valid year if submitted
            else if (name === "year") {
                if (value){
                    const validInput = Number(value);
                    if (isNaN(validInput)) {
                        throw new Error("Invalid year")
                    }
                    if (validInput < VALID_YEAR.min || validInput > VALID_YEAR.max) {
                        throw new Error(`Year must be between ${VALID_YEAR.min} - ${VALID_YEAR.max}`)
                    }
                }
            }

            // checkinf for a valid category
            else if (name === "type") {
                if (!VALID_CATEGORIES.includes(value.toLocaleLowerCase())) {
                    throw new Error("Invalid category")
                }
            }
        }

        submissionLoader()
        this.submit()
        
    } catch (error) {
        showErrorMsg(error.message)
        window.dispatchEvent(new Event("search-movie-validation-failed"))
        
    }

}

function toggleBtnSubmissionFunctionality(e) {
    const {value} = e.target;
    if (value.trim().length > 0) {
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed")
        submitBtn.removeAttribute("disabled")
        return
    }
    submitBtn.classList.add("opacity-50", "cursor-not-allowed")
    submitBtn.setAttribute("disabled", "disabled")
    return
}


function submissionLoader() {
    // hide the form toggler to prevent another form submission before the current request is being processed
    searchFormToggler?.remove()
    // style the submit button with icons
    submitBtn.classList.add("opacity-50", "cursor-not-allowed")
    submitBtn.setAttribute("disabled", "disabled")
    const searchText = submitBtn.querySelector(".searchText");
    const searchIcon = submitBtn.querySelector(".searchIcon")

    searchIcon.classList.remove("fa-search")
    searchIcon.classList.add("fa-spinner", "animate-spin")
    searchText.textContent = ` Searching`
}
// event listeners

searchFormToggler?.addEventListener("click", toggleForm)

window.addEventListener("search-movie-validation-failed", hideErrorMsg)

window.addEventListener("load", () => {
    activeForm = Array.from(forms)?.find(form => !form.classList.contains("hidden"))
    activeForm?.addEventListener("submit", handleFormSubmit)
    hideErrorMsg()
    submitBtn = activeForm?.querySelector("button[type='submit']")
    searchInput = activeForm?.querySelector("input[type='search']")
    searchInput?.addEventListener("input", toggleBtnSubmissionFunctionality)

})

