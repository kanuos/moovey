const liDescriptionMsg = document.getElementById("liDescriptionMsg");
const liDescriptionInput = document.querySelector("textarea[id='description']")
const listItemForm = document.getElementById("listItemForm");
const submitBtn = listItemForm.querySelector("button[type='submit']");


window.addEventListener("missing-description", null)

listItemForm?.addEventListener("submit", function(e) {
    e.preventDefault()
    if (!liDescriptionInput.value) {
        window.dispatchEvent(new Event("missing-li-description"))
        return
    }
    loaderStyle()
    this.submit()
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

function loaderStyle() {
    const icon = submitBtn?.querySelector("#submit-loader")
    icon.classList.remove("hidden")
    const text = submitBtn?.querySelector("#submit-text")
    text.textContent = text.dataset["load"]
    submitBtn.classList.add("cursor-not-allowed", "opacity-50")
    submitBtn.setAttribute("disabled", "disabled")
}

liDescriptionInput?.addEventListener("input", handleBtnDisability)



function handleBtnDisability() {
    const {value, dataset : {existingvalue}} = this;

    // if the entered new description is different from the previous description
    if (value !== existingvalue && value.trim().length > 0) {
        submitBtn.removeAttribute("disabled")
        submitBtn.classList.remove("cursor-not-allowed", "opacity-50")
        return
    }
    submitBtn.setAttribute("disabled", "disabled")
    if (!submitBtn.classList.contains("cursor-not-allowed") && !submitBtn.classList.contains("opacity-50")) {
        submitBtn.classList.add("cursor-not-allowed", "opacity-50")
    }
    

}