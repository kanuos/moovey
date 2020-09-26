const closeNav = document.querySelector('.close-list');
const openNav = document.querySelector('.nav-toggler');
const tabs = document.querySelectorAll('.tab-selector');

const navExpand = document.querySelector('.nav-list-menu');

closeNav.addEventListener('click', () => {
	navExpand.style.transform = "translateX(200%)";
});

openNav.addEventListener('click', () => {
	navExpand.style.transform = "translateX(0%)";
})


tabs.forEach(tab => {
	tab.addEventListener('')
})