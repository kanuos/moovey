const searchForms = document.querySelectorAll(".searchForm");
const formToggler = document.getElementById("formToggler");
const formMode = document.getElementById("formMode");
const showAdvanceSearchForm = document.getElementById("showAdvanceSearchForm");


formToggler?.addEventListener("click", changeForm)
window.addEventListener("load", setMaxYear)


function changeForm() {
    searchForms.forEach(form => {
        form.classList.toggle("hidden")
        form.classList.toggle("flex")
    });
    formMode.textContent = formMode.textContent.includes("advance") ? 'basic': 'advance';
}

function setMaxYear() {
    const dateField = document.querySelector("input[type='number']");
    dateField.setAttribute("max", new Date().getFullYear())
}


searchForms?.forEach(form => form.addEventListener("submit" , (e) => {
    const btn = Array.from(e.target.children).find(childEl => childEl.type === "submit");
    const input = Array.from(e.target.children).find(childEl => childEl.type === "text");
    btn.innerHTML = '<i class="fas fa-spinner animate-spin opacity-75 cursor-wait">' 
    input.setAttribute("placeholder", `Searching for "${input.value}"`);
    input.classList.add("text-transparent");
}))


showAdvanceSearchForm?.addEventListener("click", function() {
    searchForms.forEach(form => {
        if (form.classList.contains("flex")){
            form.classList.remove("flex")
            form.classList.add("hidden")
        }
    })
    searchForms[1]?.classList.remove("hidden")
    searchForms[1]?.classList.add("flex")
    window.scrollTo(0,0);
})