const ACTIVE_LINK_CLASS = "text-pink-600";
const richTextFields = document.querySelectorAll(".richTextField");
const articleForm = document.querySelector(".articleForm");

const mediumEditor = new MediumEditor(richTextFields, {
    activeButtonClass : ACTIVE_LINK_CLASS,
    buttonLabels : 'fontawesome',
    toolbar : {
        buttons : ['bold', 'italic','underline'],
    },
    keyboardCommands : {
        commands : [
            {
                command: 'bold',
                key: 'b',
                meta: true,
                shift: false
            },
            {
                command: 'italic',
                key: 'i',
                meta: true,
                shift: false
            },
            {
                command: 'underline',
                key: 'u',
                meta: true,
                shift: false
            }
        ]
    }
});


window.addEventListener("load", () => mediumEditor.setup())

const formError = document.querySelector("#formError")

articleForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    for (let [name, value] of formData){
        
        if (!value.trim().length) {
            formError.textContent = `${name} cannot be empty`;
            formError?.classList.remove("hidden")
            formError?.classList.add("block")
            console.log("empty " + name);
            window.dispatchEvent(new Event("popup-msg"))
        }
    }
})



window.addEventListener("popup-msg", () => {
    let t = setTimeout(() => {
        formError.textContent = ``;
        formError?.classList.add("hidden")
        formError?.classList.remove("block")
    }, 2000)
    return () => clearTimeout(t)
})