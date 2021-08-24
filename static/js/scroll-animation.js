const scrollArticles = document.querySelectorAll(".scrollArticle");


const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const properties = entry.target.dataset["animate"]?.split(" ");
            const classList = entry.target.classList;

            properties?.forEach(property => {
                if (classList.contains(property)) {
                    classList.remove(property)
                }
            })
        }
    })
}, {threshold: .65})


scrollArticles?.forEach(article => {
    scrollObserver.observe(article)
})
