/**
 * Section to change the profile picture
 * --START
 * ---------------------------------------------------------------------------------------------------
 */


// functionality to change profile picture asynchronously
const ANIMATION_STATS = {
    start : true,
    end : false,
}
async function handlePictureUpdate() {
    try {
        const formData =  new FormData(document.querySelector("#pictureForm"))
        const {size, type} = formData.get("picture")

        // client side validation : check whether the upload file is a valid image
        if (!["image/png", "image/jpg", "image/jpeg"].includes(type)) {
            throw new Error("Profile picture must be a valid image")
        }

        // client side validation : check whether the upload file is at most 5MB in size
        if (size > 5000000) {
            throw new Error("Profile picture cannot be more than 5MB in size")
        }

        // start file upload style
        loaderStyle(ANIMATION_STATS.start)
        // send image to server
        const PROFILE_URL = '/dashboard/my-profile/update-picture';
        const response = await fetch(PROFILE_URL, {
            method : "POST",
            body : formData
        })
        const data = await response.json()
        // end file upload style
        loaderStyle(ANIMATION_STATS.end)

        if (data.error) {
            throw new Error(data.error)
        }
        
        if (!data.picture) {
            throw new Error("something went wrong")
        }

        if (data.picture) {
            // if a picture url is sent as a response update the profile picture's src
            const profilePicEl = document.getElementById("profilePic");
            profilePicEl.setAttribute("src", data.picture)
        }

    } catch (error) {
        const fileUploadError = document.querySelector("#fileUploadError");
        fileUploadError.textContent = error.message;
        fileUploadError.classList.remove("hidden")
        window.dispatchEvent(new Event("file-error"))
    }
}

const pictureInput = document.querySelector("#picture");
pictureInput?.addEventListener("change", handlePictureUpdate)


window.addEventListener("load" , hideFileErrorMsg)
window.addEventListener("file-error" , hideFileErrorMsg)


function hideFileErrorMsg () {
    const timer = setTimeout(() => {
        const fileUploadError = document.querySelector("#fileUploadError");
        if (fileUploadError) {
            fileUploadError.textContent = '';
            fileUploadError.classList.add("hidden")
        }
    }, 5000)
    return () => clearTimeout(timer)
}

function loaderStyle(status) {
    // DOM elements assoicated
    const fileUploadMobileLabel = document.getElementById("fileUploadMobileLabel");
    const fileLoaderBox = document.getElementById("fileLoaderBox");

    // start loader animation
    if (status === ANIMATION_STATS.start) {
        fileLoaderBox?.classList.remove("scale-0")
        fileUploadMobileLabel?.classList.add("hidden")
        return
    }
    // end loader animation
    fileLoaderBox?.classList.add("scale-0")
    fileUploadMobileLabel?.classList.remove("hidden")
}


/**
 * ---------------------------------------------------------------------------------------------------
 * Section to change the profile picture
 * --END
 */





/**
 * Section to update profile details
 * --START
 * ---------------------------------------------------------------------------------------------------
 */
 const profileForm = document.querySelector("#profileForm")
 const autoHeightInputFields = document.querySelectorAll(".autoHeightInputField");

 // restrict users from using extra spaces and carriage returns
 autoHeightInputFields?.forEach(textarea => textarea.addEventListener("keydown", () => {
     textarea.value = textarea.value.replaceAll("\n", " ").replaceAll("\r", " ").replaceAll("  ", " ")
     calcualteFieldHeight(textarea)
 }))

//  when text is copied and pasted into fields
autoHeightInputFields?.forEach(field => field.addEventListener("paste", e => {
    const {maxLength, name} = field;
    // only the bio field allows text to be pasted
    if (["bio", "facebook", "twitter", "website"].includes(name)) {
        const value = (e.clipboardData || window.clipboardData).getData("text") 
        field.value = value.replaceAll("\n", " ").replaceAll("\r", " ").replaceAll("  ", " ").slice(0, Math.min(maxLength, value.length))
        calcualteFieldHeight(field)
        return
    }
    e.preventDefault()
}))
 
 // function to calculate the input field based on their value
 function calcualteFieldHeight(textarea = undefined) {
     if (textarea) {
         textarea.style.height = "auto"
         textarea.style.height = textarea.scrollHeight + "px"
     }
 }
 
 // calculate the field heights on load
 window.addEventListener("load", () => {
     autoHeightInputFields?.forEach(calcualteFieldHeight)
 })
 window.addEventListener("resize", () => {
     autoHeightInputFields?.forEach(calcualteFieldHeight)
 })
 

profileForm?.addEventListener("submit", handleProfileUpdate)
window.addEventListener("hide-url-error", hideURLError)



async function handleProfileUpdate(e) {
    e.preventDefault()
    const fd =  new FormData(this);

     try {
        // client side URL validation
        for (const [k,v] of fd) {
            if (["facebook", "twitter", "website"].includes(k) && v.trim().length > 0) {
                if (!checkValidURL(v)) {
                    const errorEl = document.getElementById(`${k}-error`);
                    errorEl.textContent = `${k} URL is invalid`
                    window.dispatchEvent(new CustomEvent("hide-url-error" ,{ detail : k }))
                    throw Error
                }
            }
        }
        
        // check whether the form data has changed and needs to be sent to the server
        let isFormUpdated = false;
        autoHeightInputFields?.forEach(inputEl => {
            let {value} = inputEl;
            let existingvalue = inputEl.dataset?.["existingvalue"] ?? ""
            value = value.trim(), existingvalue = existingvalue.trim()

            if (!existingvalue && value.length > 0){
                isFormUpdated = true;
            }

            // if both are non empty and same : means the value of the field has not been changed
            else if (value.length > 0 && existingvalue.length > 0 && (Boolean(value) !== Boolean(existingvalue))) {
                isFormUpdated = true;
            }
        })

        if (isFormUpdated) {
            // start loader animation
            formSubmitLoader(ANIMATION_STATS.start)
            this.submit()
        }
    } catch (error) {
        // end loader animation
        formSubmitLoader(ANIMATION_STATS.end)
    }
}

function checkValidURL(inputURL) {
    try {
        const url = new URL(inputURL)
        if (url) {
            return true
        }
    } catch (error) {
        return false
    }
}


function hideURLError(e) {
    // urlError
    const timer = setTimeout(() => {
        const urlMsgEls = document.querySelectorAll(".urlError");
        urlMsgEls?.forEach(url => {
            url.textContent = '';
            if (url.classList.contains("hidden")){
                url.classList.add("hidden")
            }
            const el = document.getElementById(e.detail);
            el.value = ''
            el.focus()
        })
    }, 3000)
    return () => clearTimeout(timer)
}

function formSubmitLoader(status){
    const loaderIcon = document.getElementById("submit-loader");
    const loaderText = document.getElementById("submit-text");
    const {text, load} = loaderText.dataset;
    // start animation
    if (status === ANIMATION_STATS.start) {
        loaderIcon?.classList.remove("hidden")
        loaderIcon?.classList.add("inline-block")
        loaderText.textContent = load
        return
    }
    loaderIcon?.classList.add("hidden")
    loaderIcon?.classList.remove("inline-block")
    loaderText.textContent = text
    // end animation
}