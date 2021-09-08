const autoHeightInputFields = document.querySelectorAll(".autoHeightInputField");
        
// restrict users from using extra spaces and carriage returns
autoHeightInputFields?.forEach(textarea => textarea.addEventListener("keydown", () => {
    textarea.value = textarea.value.replaceAll("\n", " ").replaceAll("\r", " ").replaceAll("  ", " ")
    calcualteFieldHeight(textarea)
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
        fileUploadError.textContent = '';
        fileUploadError.classList.add("hidden")
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

