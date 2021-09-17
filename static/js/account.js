// CONSTANTS AND FLAGS
const ACTIVE_BTN_STYLE = ["hover:scale-105", "hover:shadow-lg", "focus:shadow-lg", "focus:scale-105"]
const INACTIVE_BTN_STYLE = ["cursor-not-allowed", "opacity-50"]
const VALIDATION_SPECS = {
    password : {
        maxLength : 20,
        minLength : 6,
    }, 
    confirmPassword : {
        maxLength : 20,
        minLength : 6,
    }, 
    newPassword : {
        maxLength : 20,
        minLength : 6,
    }, 
    name : {
        maxLength : 15,
        minLength : 3,
    },
    email : {
        pattern : new RegExp("^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+\....?.?.?$")
    },
}

// DOM Elements
const accountGlobalError = document.getElementById("accountGlobalError");
const workingInputs = document.querySelectorAll("input[data-tag='visible']");
const hiddenInputs = document.querySelectorAll(".hiddenField");
const submitBtn = document.querySelector("button[type='submit']");
const passwordViewTogglers = document.querySelectorAll(".togglePassword")
const form = document.forms[0];


// Temporary variables and Flags
let passwordFieldVisibility = {};

//  functions
function hideErrorMsg() {
    // if accountGLobalError is present clear the error message and hide the element
    if (accountGlobalError) {
        accountGlobalError.textContent = ''
        accountGlobalError?.classList.add("hidden")
    }
}

// submit the form to the server after basic client side validations
function handleFormSubmit(e) {
    let canSubmitForm = isValidForm()
    if (canSubmitForm) {
        this.submit()
        startSubmitBtnAnimation()
        return;
    }
    e.preventDefault()
}


// highlight the elemetn style as per its dataset
function highlightElementStyle(HTMLElement) {
    if (HTMLElement){
        const {active, inactive} = HTMLElement.dataset;
        HTMLElement.classList.remove(inactive)
        HTMLElement.classList.add(active)
    }
}


// highlight the elemetn style as per its dataset
function removeElementHighlightStyle(HTMLElement) {
    if (HTMLElement){
        const {active, inactive} = HTMLElement.dataset;
        HTMLElement.classList.add(inactive)
        HTMLElement.classList.remove(active)
    }
}


function highlightInputField(input) {
    const label = document.querySelector(`label[for="${input.dataset["name"]}"]`)
    if (label) {
        highlightElementStyle(label)
        highlightElementStyle(input)
    }
}


function removeInputFieldHighlight(input) {
    const label = document.querySelector(`label[for="${input.dataset["name"]}"]`)
    if (label) {
        removeElementHighlightStyle(label)
        removeElementHighlightStyle(input)
    }
}


// accepts a keyboard input 
function readInput(e) {
    // this = the input field
    // e    = event has target value, name ...
    const {target : {value, dataset : {name}}} = e;
    const correspondingHiddenInput = document.querySelector(`input[name="${name}"]`)
    if (correspondingHiddenInput) {
        correspondingHiddenInput.value = value.trim()
        window.dispatchEvent(new Event("state-change"))

        if (["password", "newPassword", "confirmPassword"].includes(name)) {
            e.target.dataset["content"] = value.trim()
        }
    }

    if (value.trim().length > 0) {
        highlightInputField(this)
        return        
    }
    removeInputFieldHighlight(this)
}


// check whether the input field is valid
function isValidInput(value, specs) {
    const validationBoolArr = Object.keys(specs).map(el => {
        if (el === "maxLength"){
            return value.length <= specs[el]
        }
        if (el === "minLength"){
            return value.length >= specs[el]
        } 
        if (el === "pattern"){
            return specs[el].test(value)
        }
    })
    
    return validationBoolArr.every(el => el === true)
}


// toggle the submit button between disabled and enabled state depending on the form inputs' states
function toggleBtnFunctionality() {
    const canSubmitForm = isValidForm()

    if (canSubmitForm) {
        submitBtn?.removeAttribute("disabled")
        submitBtn?.classList.remove(...INACTIVE_BTN_STYLE)
        submitBtn?.classList.add(...ACTIVE_BTN_STYLE)
        return
    }
    disableBtn()
}


// disable btn
function disableBtn(){
    submitBtn?.setAttribute("disabled", "disabled")
    submitBtn?.classList.add(...INACTIVE_BTN_STYLE)
    submitBtn?.classList.remove(...ACTIVE_BTN_STYLE)
}

// check whether the form can be submitted - client side validation
function isValidForm() {
    let isValid = Array.from(hiddenInputs)?.map(({name, value}) => isValidInput(value, VALIDATION_SPECS[name])).every(el => el === true);
    const passwordFields = document.querySelectorAll("input[data-type='password']");
    if (passwordFields.length > 1) {
        // has confirm password field
        const [newPassword, confirmPassword] = Array.from(passwordFields).map(({dataset:{content}}) => content.trim())
        isValid = isValid && (newPassword === confirmPassword)
    }
    return isValid
}


function startSubmitBtnAnimation() {
    const defaultIcon = document.getElementById("btnDefaultIcon"), 
        loadIcon = document.getElementById("btnLoadIcon"),
        btnText = document.getElementById("btnText");
    const {load} = btnText.dataset;
    if (load) {
        btnText.textContent = load;
    }  
    defaultIcon?.classList.add("hidden")
    loadIcon?.classList.remove("hidden")
    disableBtn()
}


function togglePasswordFieldType() {
    // this = the btn that was clicked
    // icons 
    const iTags = this.querySelectorAll("i");
    //  it will be used to traverse to its corresponding password field
    const visiblePasswordField = this.previousElementSibling;
    const dataName = visiblePasswordField.dataset["name"];
    
    // toggle the state
    passwordFieldVisibility[dataName] = !passwordFieldVisibility[dataName];
    
    // change the icon
    iTags?.forEach(iTag => iTag?.classList.toggle("hidden"))
    
    // after toggling if the visibilty is set to true : show the password as text
    if (passwordFieldVisibility[dataName]) {
        visiblePasswordField.value = Array(visiblePasswordField.value.length).fill('•').join("")
        return
    }
    visiblePasswordField.value = visiblePasswordField.dataset["content"]
    // after toggling if the visibilty is set to false : show the password as password •

}


// Event listeners
window.addEventListener("load", () => {
    // set the password visibility fields
    document.querySelectorAll("input[data-type='password']")?.forEach(el => passwordFieldVisibility[el.dataset["name"]] = false)
    // hide the msg
    const timer = setTimeout(hideErrorMsg, 4000)
    return () => clearTimeout(timer)
})

window.addEventListener("state-change", toggleBtnFunctionality)

form?.addEventListener("submit", handleFormSubmit)

workingInputs?.forEach(input => input.addEventListener("input", readInput))
workingInputs?.forEach(input => input.addEventListener("paste", e => e.preventDefault()))

passwordViewTogglers?.forEach(toggler => toggler.addEventListener("click", togglePasswordFieldType))