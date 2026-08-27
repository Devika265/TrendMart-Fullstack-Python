let offers = [];
let currentIndex = 0;
let timer = null;


async function loadOffers() {

    try {

        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/offers/");
        offers = await response.json();

        if (offers.length > 0) {
            showOffer();
        }

    } catch (error) {
        console.error("Error loading offers:", error);
    }

}


function showOffer() {

    const offer = offers[currentIndex];
    document.getElementById("offerTitle").innerText = offer.title;
    document.getElementById("offerDescription").innerText = offer.description;
    document.getElementById("offerImage").src = offer.image;

    const container = document.getElementById("offerContainer");
    container.classList.remove("combo-bg", "bogo-bg", "festival-bg");

    if (offer.offer_type === "combo") {
        container.classList.add("combo-bg");
    }

    if (offer.offer_type === "bogo") {
        container.classList.add("bogo-bg");
    }

    if (offer.offer_type === "festival") {
        container.classList.add("festival-bg");
    }

    container.onclick = function () {
        window.location.href = "../../shop/html/shop.html?offer=" + offer.offer_type;
    };

    startCountdown(offer.end_date);

}


// COUNTDOWN TIMER
function startCountdown(endDate) {

    if (timer) {
        clearInterval(timer);
    }

    const end = new Date(endDate).getTime();

    timer = setInterval(function () {

        const now = new Date().getTime();
        const distance = end - now;

        if (distance <= 0) {
            clearInterval(timer);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days;
        document.getElementById("hours").innerText = hours;
        document.getElementById("minutes").innerText = minutes;
        document.getElementById("seconds").innerText = seconds;

    }, 1000);

}


// AUTO SLIDE
function slideOffers() {

    if (offers.length === 0) return;

    currentIndex++;

    if (currentIndex >= offers.length) {
        currentIndex = 0;
    }

    showOffer();

}


setInterval(slideOffers, 3000);

loadOffers();