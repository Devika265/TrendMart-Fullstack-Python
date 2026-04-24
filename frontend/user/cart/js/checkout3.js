document.addEventListener("DOMContentLoaded", function () {
    const arrow = document.querySelector(".arrow-icon");
    updateHeaderBadge();
    arrow.addEventListener("click", function () {
    window.history.back();
    });
});


// success

document.addEventListener("DOMContentLoaded", function(){

const orderId = sessionStorage.getItem("orderId");

document.getElementById("orderId").textContent = orderId;

});

function goHome(){

window.location.href = "../../home/html/index.html";

}



// track order

function trackOrder(){
    const orderId = document.getElementById("orderId").textContent;
    // URL-laye order ID-ai anupunna, track page-la backend-kitta track panna easy-ah irukum
    window.location.href = `../html/trackOrder.html?orderId=${orderId}`;
}



function updateHeaderBadge() {
    // Wishlist count
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishBadge = document.querySelector('#wish-icon .cart-count');
    if (wishBadge) wishBadge.innerText = wishlist.length;

    // Cart count
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.querySelector('#cart-icon .cart-count');
    if (cartBadge) cartBadge.innerText = cart.length;
}