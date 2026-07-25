const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let current = 0;

function showSlide(index) {

    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    slides[index].classList.add("active");
}

function nextSlide() {

    current++;

    if (current >= slides.length) {
        current = 0;
    }

    showSlide(current);
}

function prevSlide() {

    current--;

    if (current < 0) {
        current = slides.length - 1;
    }

    showSlide(current);
}

if (slides.length > 0) {

    showSlide(current);

    setInterval(nextSlide, 5000);

    nextBtn.addEventListener("click", nextSlide);

    prevBtn.addEventListener("click", prevSlide);

}
