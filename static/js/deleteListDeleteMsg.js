const deletedMsg = document.getElementById("deletedMsg");

window.addEventListener("load", () => {
    if (deletedMsg) {
        deletedMsg.classList.remove("scale-0")
        const timer = setTimeout(() => {
            deletedMsg.classList.add("scale-0")
        }, 4000)

        return () => clearTimeout(timer)
    }    
})