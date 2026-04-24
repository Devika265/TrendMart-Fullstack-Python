let slides = document.querySelectorAll(".slide");
let dots = document.querySelectorAll(".dot");

let index = 0;

function showSlide(i){

    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    slides[i].classList.add("active");
    dots[i].classList.add("active");
}

function nextSlide(){
    index++;
    if(index >= slides.length){
        index = 0;
    }
    showSlide(index);
}

function prevSlide(){
    index--;
    if(index < 0){
        index = slides.length - 1;
    }
    showSlide(index);
}

document.querySelector(".next").onclick = nextSlide;
document.querySelector(".prev").onclick = prevSlide;

/* auto slide */

setInterval(nextSlide,4000);

