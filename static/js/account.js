const visibleInputFields = document.querySelectorAll("input[data-tag]")
const passwordField = document.querySelector("input[name='password']");
const togglePasswordBtn = document.querySelector("#togglePassword");

function setActualInputFields(event) {
    const type = event.target?.dataset["type"], value = event.target?.value;
    if (type) {
        const targetEl = document.querySelector(`input[name='${type}']`);
        targetEl.value = value;
    }
}

// when eye icon is clicked the password field shows/hides the entered password
function togglePasswordVisibility() {
    const visiblePasswordField = Array.from(visibleInputFields).find(el => el.dataset["type"] === "password");
    const inputType = visiblePasswordField.type;
    if (inputType === "text") {
        togglePasswordBtn.children[0].classList.add("fa-eye-slash")
        togglePasswordBtn.children[0].classList.remove("fa-eye")
        visiblePasswordField.setAttribute("type", "password");
        visiblePasswordField.focus()
        return
    }
    togglePasswordBtn.children[0].classList.remove("fa-eye-slash")
    togglePasswordBtn.children[0].classList.add("fa-eye")
    visiblePasswordField.setAttribute("type", "text");
    visiblePasswordField.focus()
}

function highlightInputLabel(focusEvent) {
    const input = focusEvent.target;
    const {active, inactive} = input.dataset;
    const correspondingLabel = input.previousElementSibling;
    if (!correspondingLabel?.classList.contains("text-" + active)) {
        correspondingLabel?.classList.add("text-" + active)
        correspondingLabel?.classList.remove("text-" + inactive)
        input?.classList.add("border-" + active)
        input?.classList.remove("border-" + inactive)
    }
}

function unHighlightInputLabel(focusEvent) {
    const input = focusEvent.target;
    const correspondingLabel = input.previousElementSibling;
    const {active, inactive} = input.dataset;
    if (correspondingLabel?.classList.contains("text-" + active) && !input.value) {
        correspondingLabel?.classList.add("text-" + inactive)
        correspondingLabel?.classList.remove("text-" + active)
        input?.classList.add("border-" + inactive)
        input?.classList.remove("border-" + active)
    }
}


togglePasswordBtn?.addEventListener("click", togglePasswordVisibility)

visibleInputFields?.forEach(function(field) { field.addEventListener("input", checkInput)})

visibleInputFields?.forEach(function(field) { field.addEventListener("input", setActualInputFields)})

visibleInputFields?.forEach(field => field.addEventListener("focus", highlightInputLabel))
visibleInputFields?.forEach(field => field.addEventListener("blur", unHighlightInputLabel))

let passwordError, nameError, emailError;

function checkInput(e) {
    const inputType = e.target.id;
    const hintEl = e.target.parentElement.nextElementSibling;
    if (inputType === "password") {
        passwordCheck(e.target.value, hintEl)
        return
    }
    if (inputType === "email") {
        emailCheck(e.target.value, hintEl)
        return
    }
    if (inputType === "name") {
        nameCheck(e.target.value, hintEl)
        return
    }
}

function passwordCheck(enteredPassword, passwordHintEl) {
    if (enteredPassword.length === 0) {
        passwordHintEl.textContent = ''
        passwordError = true;
        return
    }
    if (enteredPassword.length > 0 && enteredPassword.length < 8) {
        passwordHintEl.textContent = 'Password too short.'
        passwordError = true;
        return
    }
    if (enteredPassword.length > 25) {
        passwordHintEl.textContent = 'Password too long.'
        passwordError = true;
        return
    }
    passwordHintEl.textContent = ''
    passwordError = false;
}

function emailCheck(enteredEmail, emailHintEl) {
    const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    if (enteredEmail.length === 0) {
        emailHintEl.textContent = ''
        emailError = true;
        return
    }

    if (!emailRegExp.test(enteredEmail)) {
        emailHintEl.textContent = 'Invalid email'
        emailError = true;
        return
    }
    emailHintEl.textContent = ''
    emailError = false;
}

function nameCheck(enteredName, nameHintEl) {
    const nameRegEx = /^[a-zA-Z]+[\sa-zA-Z]*$/
    if (enteredName.length === 0) {
        nameError = true;
        nameHintEl.textContent = ''
        return
    }
    if (!nameRegEx.test(enteredName)) {
        nameError = true;
        nameHintEl.textContent = 'Invalid name'
        return
    }

    if (enteredName.length > 20) {
        nameError = true;
        nameHintEl.textContent = 'Name too long.'
        return
    }

    nameError = false;
    nameHintEl.textContent = ''
}

let popupMsg;

function emptyFieldsCheck(formEl) {
    const formData = new FormData(formEl);
    for (let [key, value] of formData) {
        if (!value || !value.trim()){
            const globalErrorEl = document.querySelector("#accountGlobalError");
            globalErrorEl.innerHTML = `<small>Please fill in <span class="text-pink-600 uppercase">${key}&nbsp;</span>field</small>`
            popupMsg = setTimeout(()=> globalErrorEl.innerHTML = '', 1500)
            return true
        }
    }
    return false;
}

document.forms[0].addEventListener("submit", function(e) {
    if (passwordError || nameError || emailError || emptyFieldsCheck(this)) {
        e.preventDefault()
        return () => clearTimeout(popupMsg)
    }
    this.submit()
})
