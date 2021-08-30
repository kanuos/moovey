// input elements or textareas where the height of the field changes on input details
const autoHeightInputs = document.querySelectorAll(".autoHeightInput");

autoHeightInputs?.forEach(input => input.addEventListener("keydown", () => calculateHeight(input)));


function calculateHeight(input) {
    input.value = input.value.replaceAll("\n", " ").replaceAll("  ", " ")
    const dummyDiv = input.previousElementSibling;
    dummyDiv.innerHTML = input.value;
    input.style.height = dummyDiv.scrollHeight + "px"
}


document.forms[0].addEventListener("submit", function(e) {
    e.preventDefault();
    const fd = new FormData(this);

    for(let i of fd) {
        console.log(i);
    }
})

window.addEventListener("load", () => {
    autoHeightInputs?.forEach(calculateHeight);
})