window.addEventListener("load", () => {
    const searchError = document.querySelector("#searchError");
    const timer = setTimeout(() => {
        searchError?.remove();
    }, 4000)

    return () => clearTimeout(timer)
})


// change the form depending on search type
// either search by title or search by imdbid
// PS: helps for non-english content

function toggleForm() {
    const forms = document.querySelectorAll(".searchForm");
    // hide and show alternate forms
    forms?.forEach(formEl => {
        formEl.classList.toggle("hidden")
    })
    // change the toggler text and btn icon
    const TOGGLER_TEXT_OPTIONS = {
        "title" : "imdbid",
        "imdbid" : "title"
    }

    const togglerText = document.getElementById("togglerText");
    const togglerBtn = document.getElementById("togglerBtn");
    
    togglerText.textContent = TOGGLER_TEXT_OPTIONS[togglerText.textContent];
    
    if (togglerBtn.classList.contains("fa-toggler-on")) {
        togglerBtn.classList.remove("fa-toggler-on")
        togglerBtn.classList.add("fa-toggler-off")
    }
    else if (togglerBtn.classList.contains("fa-toggler-off")) {
        togglerBtn.classList.remove("fa-toggler-off")
        togglerBtn.classList.add("fa-toggler-on")
    }
}

const searchFormToggler = document.querySelector(".searchFormToggler")

searchFormToggler?.addEventListener("click", toggleForm)