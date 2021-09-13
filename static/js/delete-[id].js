{/* <form id="deleteForm" action="" method="POST" class="mt-0.5 font-regular font-semibold text-black w-full text-xs md:text-sm flex flex-col gap-2 max-w-sm mx-auto">
                            <small class="text-xs font-regular text-gray-500 block mt-4 mb-2">
                                Enter the title <span class="text-black lowercase font-semibold"><%= listData[0].title.trim() %></span> to confirm your action
                            </small>

                            <input type="text" id="confirmationCode" data-code="<%= listData[0].title.trim().toLowerCase() %>" class="border border-black outline-none focus:outline-none rounded p-1 ring-0 ring-offset-transparent focus:ring-offset-transparent focus:ring-0 focus:border-black">

                            <button type="submit" id="submitBtn" class="block my-3 outline-none focus:outline-none capitalize font-special font-semibold text-white text-xs shadow bg-black rounded-sm py-2 px-4 hover:-translate-y-px focus:-translate-y-px transform transition-all hover:shadow-xl focus:shadow-xl">
                                <i class="fas fa-spinner inline-block animate-spin"></i>
                                <span id="btnText" data-load="deleting" data-text="delete review">
                                    delete review
                                </span>    
                            </button>
                        </form>
 */}

// DOM Elements needed for animation and item deletiom
const deleteForm = document.querySelector("#deleteForm");
const deleteBtn = document.querySelector("#submitBtn");
const btn__Icon = deleteBtn?.querySelector("i");
const btn__Text = deleteBtn?.querySelector("#btnText");
const codeInput = document.querySelector("#confirmationCode");



function isFormSubmissible() {
    const {dataset : {code}, value} = codeInput;
    return value.trim() === code.trim()
}


codeInput?.addEventListener("keyup", () => {
    if (isFormSubmissible()) {
        if (deleteBtn.classList.contains("opacity-50")) {
            deleteBtn?.classList.remove("opacity-50", "cursor-not-allowed")
        }
        deleteBtn.removeAttribute("disabled")
        return
    }
    if (!deleteBtn.classList.contains("opacity-50")) {
        deleteBtn?.classList.add("opacity-50", "cursor-not-allowed")
    }
    deleteBtn.setAttribute("disabled", "disabled")
})



deleteForm?.addEventListener("submit", () => {
    deleteBtn?.classList.add("opacity-50", "cursor-not-allowed")
    deleteBtn.setAttribute("disabled", "disabled")
    btn__Icon?.classList.remove("hidden")
    btn__Icon?.classList.add("inline-block")
    const {load} = btn__Text.dataset;
    btn__Text.textContent = load
})