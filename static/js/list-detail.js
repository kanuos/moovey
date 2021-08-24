// hide testimonials btn in header section
const testimonialToggler = document.querySelector(".testimonialToggler");
const listDetailMain = document.querySelector("#main");
const mainSectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            testimonialToggler.classList.remove("opacity-0")
            return
        }
        testimonialToggler.classList.add("opacity-0")
    })
}, {threshold : 0, rootMargin: '-50px 0px'})

mainSectionObserver.observe(listDetailMain)