// LANDING AND ACCOUNT SECTION 
// START 
const landings = document.querySelectorAll('.landing');
const landingNavs = document.querySelectorAll('.landing-nav');
const accountModal = document.getElementById("account");
const registerMode = document.getElementById("registerMode");
const loginMode = document.getElementById("loginMode");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerError = document.getElementById("registerError");
const loginError = document.getElementById("loginError");


function selectLanding(sectionID) {
    if(sectionID <= landings.length) {
        selectLandingNavButton(sectionID);
        landings?.forEach(el => el.classList.add("hidden"))

        landings[sectionID]?.classList.remove("hidden");        
        landings[sectionID]?.classList.add("active");        
    }
}

function selectLandingNavButton(sectionID) {
    if(sectionID <= landings.length) {
        landingNavs?.forEach(el => {
            el.classList.remove("bg-dark")
            el.classList.add("bg-light")
        })
        landingNavs[sectionID]?.classList.add("bg-dark");
        landingNavs[sectionID]?.classList.remove("bg-light");
    }
}

function openAccountModal() {
    accountModal.classList.remove("hidden")
    accountModal.classList.add("flex")
    
}
function closeAccountModal() {
    accountModal.classList.add("hidden")
    accountModal.classList.remove("flex")
}

function toggleMode() {
    registerMode.classList.toggle("hidden")
    registerMode.classList.toggle("flex")
    loginMode.classList.toggle("hidden")
    loginMode.classList.toggle("flex")
}

window.onload = () => {
    const showLogin = window.location.search?.split('=')[1]?.toLowerCase();
    if(showLogin) {
        openAccountModal();
    }
    let activeLandingSection = 0;
    const timer = setInterval(() => {
        activeLandingSection++;
        activeLandingSection %= landings.length;
        selectLanding(activeLandingSection);
        selectLandingNavButton(activeLandingSection);
    }, 10000); 
    return () => clearInterval(timer)
}


// account forms using ajax

function errorMessage(DOMElement, message) {
    DOMElement.innerText = message;
    const msg = setTimeout(()=> {
        DOMElement.innerText = ''
    }, 3000);
    return () => clearTimeout(msg)
}

// Login Form
loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const loginData = {}
    for(let [k,v] of formData.entries()){
        if(v.trim().length === 0) {
            let error = `${k} cannot be empty`;
            errorMessage(loginError, error)
        }
        loginData[k] = v
    }
    try {
        let serverResponse = await fetch("/login", {
            method : "POST",
            headers : {
                'Content-Type' : 'application/json'
            },
            redirect: 'follow',
            body : JSON.stringify(loginData)
        });
        serverResponse = await serverResponse.json();
        if(serverResponse.error) {
            errorMessage(loginError, serverResponse.errorMsg)
            return
        }
        if(serverResponse.redirected){
            window.location.href = serverResponse.url
        }
    }
    catch(err) {
        console.log(err, "login err");
    }
    // send data to server and act accordingly

})


// Register Form
registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const registerData = {}
    for(let [k,v] of formData.entries()){
        if(v.trim().length === 0) {
            let error = `${k} cannot be empty`;
            registerError.innerText = error;
            const msg = setTimeout(()=> {
                registerError.innerText = ''
            }, 3000);
            return () => clearTimeout(msg)
        }
        registerData[k] = v
    }
    // send data to server and act accordingly

    try {
        let serverResponse = await fetch("/register", {
            method : "POST",
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(registerData)
        })
        serverResponse = await serverResponse.json();
        if(serverResponse.error) {
            errorMessage(registerError, serverResponse.errorMsg)
            return
        }
        if(serverResponse.redirected){
            window.location.href = serverResponse.url
        }
    }
    catch(err) {
        console.log(err, "reg err");
    }

})


// END OF LANDING AND ACCOUNT SECTION

// START OF NAVBAR
const mainNavbarToggler = document.querySelector('#navToggler');
const navList = document.querySelector('#navList');

mainNavbarToggler?.addEventListener('click', () => {
    navList.classList.toggle("flex");
    navList.classList.toggle("hidden");
})

window.addEventListener('load', () => {
    if(window.innerWidth > 768) {
        navList.classList.remove("flex");
        navList.classList.add("hidden");
    }
    else {
        navList.classList.add("hidden");
    }
})


// END OF NAVBAR