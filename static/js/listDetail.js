// DOM elements
const listDetailHeaderElements = document.querySelectorAll(".list-detail__appear");
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const closeDeleteModalBtn = document.getElementById("closeDeleteModal");
const openDeleteModalBtn = document.getElementById("openDeleteModal");
const listBody = document.getElementById("listBody");
const readList = document.getElementById("readList");
const listItemContainer = document.querySelectorAll(".list-item-container");
const expandListMenu = document.querySelectorAll(".expandListMenu")

window.addEventListener("load", ()=> {
    document.documentElement.scrollTo(0,0)
    headerAnimation();
})


function headerAnimation(){
    let timer;
    listDetailHeaderElements?.forEach(el => {
        const elDelay = Array.from(el.classList).find(cls => cls.match(/^list-detail__appear--/)).split("--")[1] ?? 0;
        timer = setTimeout(()=> {
            if (el.classList.contains("scale-0")){
                el.classList.remove('scale-0')
                el.classList.add('scale-100')
            }
        }, [500 * parseInt(elDelay)])
    })
    return () => clearTimeout(timer)
}


function toggleDeleteModal(){
    deleteConfirmModal?.classList.toggle("scale-0");
    deleteConfirmModal?.classList.toggle("scale-100");
}

closeDeleteModalBtn?.addEventListener("click", toggleDeleteModal)
openDeleteModalBtn?.addEventListener("click", toggleDeleteModal)

readList?.addEventListener("click", ()=> {
    listBody.scrollIntoView({
        behavior: "smooth"
    })
})



const sectionObserver = new IntersectionObserver(entries =>{
    entries.forEach(entry => {
        if(entry.isIntersecting){
            const index = Array.from(listItemContainer).indexOf(entry.target);
            sectionAnimation(index)
            return
        }
    })
}, {
    threshold : 0.5
})


listItemContainer?.forEach(section => {
    sectionObserver.observe(section)
})

function sectionAnimation(sectionIndex){
    const article = listItemContainer.item(sectionIndex)?.querySelector("div")
    const timer = setTimeout(function() {
        article.classList.remove("scale-0")
        article.classList.add("scale-100")
        return () => clearTimeout(timeout)
    }, 500)
    sectionObserver.unobserve(listItemContainer.item(sectionIndex))
    return () => clearTimeout(timer)
}


expandListMenu?.forEach(menuBtn => {
    menuBtn.addEventListener("click", function() {
        menuBtn.nextElementSibling.classList.toggle("scale-0");
        menuBtn.nextElementSibling.classList.toggle("scale-100");
    })
    const close = menuBtn.nextElementSibling.firstElementChild
    close?.addEventListener("click", () => {
        menuBtn.nextElementSibling.classList.toggle("scale-0");
        menuBtn.nextElementSibling.classList.toggle("scale-100");
    })
})

// add 

/*
<article class="relative my-4 mx-auto shadow-xl hover:scale-105 hover:shadow-2xl transform transition-all flex-shrink-0 rounded-md w-60 bg-white">
    <img src="<% if(movie.poster === 'N/A') { %>/static/assets/placeholder.jpg <% } else { %> <%= movie.poster %> <% } %>" 
    class="h-80 w-full block object-cover rounded-t-md">
    <div class="flex flex-col p-2 h-20">
        <strong class="capitalize text-gray-600 text-sm"><%= movie.title %></strong>
        <span class="capitalize text-gray-500 text-xs"><%= movie.type %></span>
    </div>
    <small class="absolute -top-2 -left-2 text-xs py-1 px-3 text-white bg-pink-600"><%= movie.year %></small>
</article>
*/