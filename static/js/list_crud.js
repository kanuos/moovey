const backBtn = document.getElementById("goBackBtn");
const recommend = document.getElementById("recommend");
const recommendLabel = document.getElementById("recommendLabel");
const recommendLabelIcon = document.getElementById("recommendLabelIcon");
const addBtnIcons = document.querySelectorAll(".addBtnIcon");
const addBtnTexts = document.querySelectorAll(".addBtnText");
const addItemForm = document.querySelector("form");


// on click go to the previous page
backBtn?.addEventListener("click", function(){
    window.history.back();
})

// toggle the recommend text
recommend?.addEventListener("change", function(e){
    if (e.target.checked) {
        recommendLabel.textContent = 'recommend'
        recommendLabelIcon.innerHTML = '<i class="far fa-check-circle text-green-600"></i>'
    }
    else {
        recommendLabel.textContent = 'do not recommend'
        recommendLabelIcon.innerHTML = '<i class="far fa-times-circle text-red-600"></i>'
    }
})


addItemForm?.addEventListener("submit", () => {
    addBtnIcons?.forEach(iTag => iTag?.classList.toggle("hidden"))
    addBtnTexts?.forEach(span => span?.classList.toggle("hidden"))
})