function hideNavMenu(){
    document.getElementById('nav-menu').style.transform = "translateX(100%)";
}

// Login and Register Form fn() ▼

function hideMsg() {
    document.querySelector(".account-form-msg").style.transform = "translateY(-100%)"
    document.querySelector(".account-form-body").style.transform = "translateY(-15%)"
    document.querySelector(".account-form-body").style.marginTop = "7rem"
}

const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");

loginForm && (loginForm.onsubmit = e => {
    e.preventDefault();
    const payload = validateFields(loginForm)
    if(payload){
        fetch("/login",{
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify(payload),
            redirect : "follow"
        })
        .then(() => console.log("success"))
        .catch(console.log)
    }
})

registerForm && (registerForm.onsubmit = async e => {
    e.preventDefault();
    const payload = validateFields(registerForm)
    if(payload){
        if(payload.password !== payload.password2){
            const element = document.getElementById("password2-error");
            element.innerText = "Passwords don't match. Please retry";
            element.style.visibility = 'visible'

            return null;
        }
        try {
            const response = await fetch("/register", {
                method : "POST",
                headers : {
                    "Content-Type": "Application/JSON"
                },
                body : JSON.stringify({
                    name : `${payload.name.trim()}`,
                    email : `${payload.email.trim()}`,
                    password : `${payload.password.trim()}`,
                })
            });

            const data = await response.json();
            if(data.error && data.field){
                if(data.field === "form"){
                    const el = document.getElementById("form-msg");
                    el.innerText = data.error;
                    document.querySelector(".account-form-msg").style.transform = "translateY(0%)"
                }
                else {
                    const element = document.getElementById(`${data.field}-error`);
                    element.innerText = data.error;
                    element.style.visibility = "visible"
                    
                    setTimeout(()=> {
                        element.innerText = "";
                        element.style.visibility = "hidden"
                    }, 2000)
                }
            }
            if(data.redirected){
                window.location.href = data.url
            }
        }
        catch(err){
        }
    }
    else {
        console.log("invalid form");
    }
})

function validateFields(form){
    if (!form) return null;
    const data = new FormData(form);
    const serverRequestPayload = {};
    for(let [id, value] of data.entries()){
        if(value.trim().length === 0){
            const element = document.getElementById(`${id}-error`);
            if(id !== "password2"){
                element.innerText = `${id} cannot be empty`
            }
            else {
                element.innerText = `Confirmation password cannot be empty`
            }
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
