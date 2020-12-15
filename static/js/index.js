function hideNavMenu(){
    document.getElementById('nav-menu').style.transform = "translateX(100%)";
}

// Login and Register Form fn() ▼

function hideMsg() {
    document.querySelector(".account-form-msg").style.transform = "translateY(-100%)"
    document.querySelector(".account-form-body").style.transform = "translateY(-20%)"
    document.querySelector(".account-form-body").style.marginTop = "7rem"
}

const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");

loginForm && (loginForm.onsubmit = e => {
    e.preventDefault();
    const payload = validateFields(loginForm)
    console.log(payload);
})

registerForm && (registerForm.onsubmit = e => {
    e.preventDefault();
    const payload = validateFields(registerForm)
    console.log(payload);
})

function validateFields(form){
    if (!form) return null;
    const data = new FormData(form);
    const serverRequestPayload = {};
    for(let [id, value] of data.entries()){
        if(value.trim().length === 0){
            const element = document.getElementById(`${id}-error`);
            element.innerText = `${id} cannot be empty`
            element.style.visibility = 'visible'
            return ;
        }
        else {
            serverRequestPayload[`${id}`] = value.trim();
        }
    }
    return serverRequestPayload;
}

function activeInputAndLabel(input) {
    if(input.value.trim().length > 0){
        input.style.borderColor = "var(--text)"
        input.nextElementSibling.nextElementSibling.style.visibility = 'hidden'
        input.nextElementSibling.classList.add("active-label")
    }else{
        input.style.borderColor = "var(--bg-dark)"
        input.nextElementSibling.nextElementSibling.style.visibility = 'visible'
        input.nextElementSibling.classList.remove("active-label")
    }
}

const allInputs = document.querySelectorAll(".account-form-control")
allInputs.forEach(input => {
    input.addEventListener('keyup',() => activeInputAndLabel(input))
})

window.load = () => {
    document.getElementsByTagName("form")[0].focus()
}