const navButton = document.querySelector('.plus-btn')
const modal = document.querySelector('.modal')
const closeButton = document.querySelector('.close')

navButton.addEventListener('click', (e) => {
    modal.style.display = 'block';
    navButton.style.display = 'none'
});

window.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && e.target !== navButton) {
        modal.style.display = 'none';
        navButton.style.display = 'block';
    }
});

closeButton.addEventListener('click', (e) => {
    modal.style.display = 'none';
    navButton.style.display = 'block';
})