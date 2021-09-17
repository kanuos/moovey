const liDescriptionMsg = document.getElementById("liDescriptionMsg");
const liDescriptionInput = document.querySelector("textarea[id='description']")


window.addEventListener("missing-description", null)
profileForm?.addEventListener("submit", e => {
    e.preventDefault()
    if (!liDescriptionInput.value) {
        window.dispatchEvent(new Event("missing-li-description"))
    }
})

window.addEventListener("missing-li-description", () => {
    if (liDescriptionMsg) {
        liDescriptionMsg.textContent = 'Description is missing'
        liDescriptionMsg.classList.remove("hidden")
        
        const popuo = setTimeout(()=> {
            liDescriptionMsg.classList.add("hidden")
        }, 4000)

        return () => clearTimeout(popuo)
    }
})