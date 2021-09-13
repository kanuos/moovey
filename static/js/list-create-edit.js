let isEditForm = false;
const textFields = document.querySelectorAll(".textField");

textFields?.forEach(field => {
    field.addEventListener("keyup", () => {
        field.value = field.value.replaceAll("  ", " ").replaceAll("\n", " ").replaceAll("\r", " ")
        if(canSubmitForm()) {
            // make the button clickable
            styleSubmitBtn(BTN_FUNCTION.on)
        }
        else {
            // make the button un-clickable
            styleSubmitBtn(BTN_FUNCTION.off)
        }
    })
})

const form = document.forms[0];

window.addEventListener("load", () => {
    // on load hide the error messages after 4s
    hideErrorMessage()

    // check whether the form is an editForm or not
    // if form is editForm => checks to form submission are made
    isEditForm = Boolean(form.dataset["type"])
})


form?.addEventListener("submit", handleFormSubmit)


const BTN_FUNCTION = {
    "on" : true,
    "off": false
}



// functions and utils

// the server error that shows on page will be removed automatically in 4s
function hideErrorMessage() {
    const pageError = document.getElementById("pageError");
    const timer = setTimeout(() => {
        pageError.remove()
    }, 5000)

    return () => clearTimeout(timer)
}


// instead of sending the form directly to server, the form is validated at the client side
function handleFormSubmit() {
    // style the btn to disabled
    // additional style to change the btn text
    styleSubmitBtn(BTN_FUNCTION.off, BTN_FUNCTION.on)
    // submit the form
    this.submit()
}

// check whether any change to the form has been made
function canSubmitForm(){
    if (isEditForm) {
        const changeArr = Array.from(textFields).map(input => {
            let {value, dataset : {existingvalue}} = input;
            value = value.trim(), existingvalue = existingvalue.trim()
            return value !== existingvalue
        })
        return changeArr.some(el => el === true)
    }
    // when its a create new form
    return Array.from(textFields).filter(({value, name}) => {
        // at least the title field must be filled by valid characters and numbers
        if (name === "title") {
            return Boolean(value.trim().length > 0)
        }
    })
}




function styleSubmitBtn(enable, submit = false) {
    // DOM Elements
    const submitBtn = document.getElementById("submit-btn")
    const loaderIcon = document.getElementById("loader-icon")
    const btnText = document.getElementById("btn-text")
    // logic
    if (enable === BTN_FUNCTION.on) {
        if (submitBtn.classList.contains("cursor-not-allowed")) {
            submitBtn.classList.remove("cursor-not-allowed", "opacity-60")
            submitBtn.removeAttribute("disabled")
        }
        if (submit) {
            loaderIcon.classList.remove("hidden")
            loaderIcon.classList.add("inline-block")
            const {load} = btnText.dataset;
            btnText.textContent = load;
        }
    }
    else {
        if (!submitBtn.classList.contains("cursor-not-allowed")) {
            submitBtn.classList.add("cursor-not-allowed", "opacity-60")
            submitBtn.setAttribute("disabled", "disabled")
        }
    }

}



/**
 * 
 * 1.   change in the fields
 * 2.   event triggers fn
 * 3.   checks whether any actual change in data has been made
 * 4.   if change detected make btn clickable
 * 5.   
 * 
 */