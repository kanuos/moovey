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

loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    console.log("login with data");
    const loginData = {}
    for(let [k,v] of formData.entries()){
        if(v.trim().length === 0) {
            let error = `${k} cannot be empty`;
            loginError.innerText = error;
            const msg = setTimeout(()=> {
                loginError.innerText = ''
            }, 3000);
            return () => clearTimeout(msg)
        }
        loginData[k] = v
    }
    // send data to server and act accordingly

    console.log(loginData);
})

registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    console.log("register with data");
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

    console.log(registerData);
})


// END OF LANDING AND ACCOUNT SECTION