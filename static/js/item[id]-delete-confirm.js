const deleteItemForm = document.querySelector("#deleteForm");
const confirmationCode = deleteItemForm.querySelector("input");
let hasDeleteConfirmation = false;

confirmationCode?.addEventListener("input", function(e){
    const {dataset , value} = e.target;
    const submitBtn = this.nextElementSibling
    console.log(dataset["value"], value, dataset["value"] === value);
    if (dataset["value"] === value) {
        if (submitBtn.classList.contains("opacity-50")) {
            submitBtn.classList.remove("opacity-50", "cursor-not-allowed")
        }
        hasDeleteConfirmation = true;
    } 
    else {
        hasDeleteConfirmation = false;
        if (!submitBtn.classList.contains("opacity-50")){
            submitBtn.classList.add("opacity-50", "cursor-not-allowed")
        }
    }
})


deleteItemForm.addEventListener("submit", function(e) {
    if (!hasDeleteConfirmation){
        e.preventDefault();
        return
    }
    this.submit()
})