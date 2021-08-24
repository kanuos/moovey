const testimonialSectionID = 'testimonialSection'
const testimonialDrawerOpener = document.querySelector(".testimonialToggler");
const testimonialDrawerCloser= document.querySelector("#closeTestimonial");
const testimonialSection = document.querySelector("#" + testimonialSectionID);
const testimonialEditorTogglers = document.querySelectorAll(".testimonialEditorToggler");


// write testimonial/ edit testimonial
testimonialEditorTogglers.forEach(toggler => toggler.addEventListener("click", toggleTestimonialModal))
function toggleTestimonialModal() {


    const testimonialModal = document.querySelector("#testimonialModal");
    testimonialModal?.classList.toggle("opacity-0")
    testimonialModal?.classList.toggle("scale-0")

}

// open or close the testimonial drawer from the left 
testimonialDrawerOpener?.addEventListener("click", openTestimonialDrawer)
testimonialDrawerCloser?.addEventListener("click", closeTestimonialDrawer)

function openTestimonialDrawer() {
    document.body.style.overflowY = 'hidden'
    if (testimonialSection?.classList.contains("translate-x-full"))
    testimonialSection?.classList.remove("translate-x-full")
}

function closeTestimonialDrawer() {
    document.body.style.overflowY = 'auto'
    if (!testimonialSection?.classList.contains("translate-x-full"))
        testimonialSection?.classList.add("translate-x-full")
}


// hide testimonial drawer btn on the header section
(function() {
    const mainSection = document.querySelector("#main")
    const mainObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                testimonialDrawerOpener?.classList.remove("opacity-0")
                return
            }
            testimonialDrawerOpener?.classList.add("opacity-0")
        })
    }, {
        threshold: 0,        
        rootMargin: '-300px 0px'
    })
    mainObserver.observe(mainSection)
})()


