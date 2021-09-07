const textFields = document.querySelectorAll(".textField");

textFields?.forEach(field => {
    field.addEventListener("keypress", () => {
        field.value = field.value.replaceAll("  ", " ").replaceAll("\n", " ").replaceAll("\r", " ")
    })
})


