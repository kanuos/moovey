const forgotMsgEl = document.getElementById("forgotMsg");
const form = document.forms[0];

window.addEventListener("load", hideErrorMsg)
window.addEventListener("hide-error", hideErrorMsg)

form?.addEventListener("submit", handleFormSubmit)


// function to clear the error message (if any) in 4 seconds
function hideErrorMsg() {
    const timer = setTimeout(() => {
        if (forgotMsgEl) {
            forgotMsgEl.textContent = ''
            forgotMsgEl.classList.add("hidden")  
        }
    }, 4000)

    return () => clearTimeout(timer)
}

function isValidEmail(email) {
    const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    if (email.length === 0) {
        return {
            success : false,
            message : "Email cannot be empty"
        }
    }

    if (!emailRegExp.test(email)) {
        return {
            success : false,
            message : "Invalid email address"
        }
    }

    return {
        success : true
    }
}


function handleFormSubmit(e) {
    e.preventDefault()
    const email = new FormData(this).get("email")
    const {success, message} = isValidEmail(email)
    if (!success) {
        forgotMsgEl.textContent = message
        forgotMsgEl?.classList.remove("hidden")
        window.dispatchEvent(new Event("hide-error"))  
        return
    }
    const submitBtn = document.getElementById("submitBtn")
    const btnText = document.getElementById("btnText")
    const btnIcon = document.getElementById("btnIcon")
    btnText.textContent = 'Submitting'
    btnIcon.classList.remove("hidden")
    submitBtn.setAttribute("disabled", "disabled")
    submitBtn.classList.add("cursor-not-allowed")
    this.submit()
}