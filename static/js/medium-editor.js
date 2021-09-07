const ACTIVE_LINK_CLASS = "text-pink-600";
const richTextFields = document.querySelectorAll(".richTextField");

let mediumEditor;
richTextFields?.forEach(field => {
    mediumEditor = new MediumEditor(field, {
        activeButtonClass : ACTIVE_LINK_CLASS,
        buttonLabels : 'fontawesome',
        disableExtraSpaces : true,
        disableReturn : field.dataset["return"] || false,
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

})



window.addEventListener("load", () => mediumEditor?.setup())
