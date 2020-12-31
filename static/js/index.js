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

loginForm && (loginForm.onsubmit = async e => {
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
        .then(data => data.json())
        .then(({success, redirectTo}) => {
            if(success){
                window.location.href = redirectTo
            }
        })
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


// search movie and write review section
const searchMovieForm = document.getElementById("step-1");
const searchFormMessage = document.getElementById("search-error");
const movieSearchResult = document.getElementById("movie-search-result")
const noImageURL = `https://cannabisbydesignphysicians.com/wp-content/themes/apexclinic/images/no-image/No-Image-Found-400x264.png`;

function setDefaultImage () {
    console.log("setting up default image on eror");
    this.onerror = null;
    this.src = noImageURL;
}

async function selectMovie(imdbid){
    try {
        // request for movies table fill with imdbid search
        const response = await fetch('/dashboard/updateMovie', {
            method : 'POST', 
            body : JSON.stringify({
                imdbid
            }),
            headers : {
                'Content-Type' : 'Application/json'
            }
        });
        const data = await response.json();
        console.log(data);
        if(!data.error){
            // on success hide form step 1
            // show form step 2
        }
        else {
            // show error message
        }
    }
    catch(err){

    }
}

if(searchMovieForm) {
    searchMovieForm.onsubmit = async e => {
        e.preventDefault();
        movieSearchResult.innerHTML = "";
        const searchKeyword = document.querySelector("input[name='searchKeyword']");
        if(searchKeyword.value.trim().length > 0){
            searchFormMessage.classList.remove("hidden");
            searchFormMessage.innerHTML =  `<div class="flex justify-center items center my-4">
                <span class="loader block mx-1 transition  h-5 w-5 rounded-full bg-gray-400"></span>
                <span class="loader block mx-1 transition  h-5 w-5 rounded-full bg-gray-500"></span>
                <span class="loader block mx-1 transition h-5 w-5 rounded-full bg-gray-600"></span>
            </div>`;
            try {
                const serverResponse = await fetch("/blogs/search", {
                    method : 'POST', 
                    headers : {
                        'Content-Type': 'Application/JSON'
                    },
                    body : JSON.stringify({
                        keyword : searchKeyword.value.trim()
                    })
                });
                const responseData = await serverResponse.json();
                const {data, dbMode} = responseData;
                console.log(data);
                let innerHTMLString = ''
                if(data && data.length > 0) {
                    data.forEach(datum => {
                        let img = ''
                        if(datum.poster === 'N/A' || datum.Poster === 'N/A') {
                            img = noImageURL;
                        } 
                        innerHTMLString += `<article  
                        onclick="selectMovie('${datum.imdbid}')"
                        class="m-2 mx-auto block w-44 overflow-hidden rounded-md bg-gray-100 shadow-md transform hover:scale-105 hover:shadow-xl transition-all cursor-pointer">
                        <img
                            onerror = "setDefaultImage()"
                            src="${img.length > 0 ? img : (datum.Poster || datum.poster)}" 
                            class="object-cover" 
                            alt="${datum.title || datum.Title} poster"/>
                        <section class="flex items-center flex-col justify-around">
                            <strong class="capitalize block p-2 text-gray-500 font-semibold text-sm text-center">
                                ${datum.title || datum.Title}
                            </strong>
                        </section>
                    </article>`
                    });
                    searchFormMessage.innerHTML = '';
                    if(innerHTMLString.trim().length > 0){
                        movieSearchResult.innerHTML = innerHTMLString.trim();
                        movieSearchResult.parentElement.classList.remove("hidden");
                        movieSearchResult.parentElement.classList.add("grid");
                    }
                }
                else {
                    searchFormMessage.innerHTML = 'No Movie with title found';
                    setTimeout(() => {
                        searchFormMessage.innerHTML = '';
                    }, 3000)
                }
            }
            catch(err){
                console.log(err);
            }
        }
        else {
            searchFormMessage.classList.remove("hidden");
            searchFormMessage.innerHTML = `Search keyword cannot be empty`;
            setTimeout(()=> {
                searchFormMessage.classList.add("hidden");
            }, 2000)
        }
    searchKeyword.value = '';
    }
}




//  star rating functionality
window.onload = rate(3)
function rate(rating){
    const ratingElement = document.getElementById('reviewRating');
    const displayStars =  document.getElementById('displayStars');
    const MAX_RATING = 5;

    if(!isNaN(rating) && ratingElement){
        ratingElement.value = Number(rating);
        displayStars.innerHTML = ''
        let ratingHTMLString = '';
        for(let i =1; i <= Number(rating); i++){
            ratingHTMLString += `<li class="text-red-600 text-2xl" onclick="rate(${i})">&starf;</li>`
        }
        for(let i =rating + 1 ; i <= MAX_RATING ; i++){
            ratingHTMLString += `<li class="text-gray-600 text-2xl" onclick="rate(${i})">&starf;</li>`
        }
        displayStars.innerHTML = ratingHTMLString
    }
}