// CONSTANTS AND ENUMS
const errorEl = document.querySelector("#formError");
const submitBtn = document.getElementById("submitBtn")
const submitBtnText = document.getElementById("submitBtnText")
const loaderIcon = document.getElementById("loaderIcon")

const INPUT_NAMES = {
    currentPassword : "Current Password",
    newPassword : "New Password",
    confirmPassword : "Confirm Password",
}

const LOAD_STATUS = {
    "start" : true,
    "end" : false
}

// DOM elements
const passwordChangeForm = document.querySelector("#passwordForm");


// attaching event listeners to DOM elements to react to events
passwordChangeForm?.addEventListener("submit", handleFormSubmit)
window.addEventListener("load", hidePageMsgs)
window.addEventListener("hide-popup", hidePageMsgs)




// functions and utils

// function triggers when the form is submitted. 
// This form makes AJAX calls to the server
async function handleFormSubmit(e) {
    try {
        e.preventDefault();
        submissionLoaderStyle(LOAD_STATUS.start)
        const actionURL = this.getAttribute("action")
        const formData = new FormData(this);
        
        // client side validation
        checkFormValidity(formData)
        
        // send the formData to the server
        const response = await fetch(actionURL, {
            method : "POST",
            body : formData
        })

        const data = await response.json()

        submissionLoaderStyle(LOAD_STATUS.end)

        if (!data.success) {
            throw new Error(data.error)
        }
        this.reset()
        errorEl.textContent = data.message
         window.dispatchEvent(new Event("hide-popup"))   

    } catch (error) {
        errorEl.textContent = error.message
        window.dispatchEvent(new Event("hide-popup"))
    }
}


// function to hide the error messages after a delay when they arise
function hidePageMsgs() {
    const popup = setTimeout(() => {
        errorEl.textContent = ''
    }, 5000)

    return () => clearTimeout(popup)
}


// client side validation scripts
function checkFormValidity(fd) {
    for(let [name, value] of fd) {
        if (!value.trim().length) {
            throw new Error(`"${INPUT_NAMES[name]}" is required`)
        }
    }
}

// submission animation and loaders
function submissionLoaderStyle(status) {
    // start animations 
    const {text, load} = submitBtnText.dataset
    if (status === LOAD_STATUS.start) {
        loaderIcon?.classList.remove("hidden")
        submitBtn?.classList.add("opacity-50", "cursor-not-allowed", "pointer-events-none")
        submitBtnText.textContent = load;    
        return
    }
    // hide animations
    loaderIcon?.classList.add("hidden")
    submitBtn?.classList.remove("opacity-50", "cursor-not-allowed", "pointer-events-none")
    submitBtnText.textContent = text;    
}