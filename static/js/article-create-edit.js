// autoHeightField -- class
window.addEventListener("load", () => {
    hideLoader()
    hideError()
})


// function to hide the load screen
function hideLoader() {
    const loadScreen = document.getElementById("loadScreen");
    loadScreen?.remove()
}


// function to hide the error msg if any
function hideError() {
    const pageError = document.getElementById("pageError");
    const t = setTimeout(()=> {
        pageError?.classList.add("hidden")
    }, 4000)
    return () => clearTimeout(t)
}