document.addEventListener("DOMContentLoaded", function () {
    const arrow = document.querySelector(".arrow-icon");
    arrow.addEventListener("click", function () {
    window.history.back();
    });
});


document.addEventListener("DOMContentLoaded", loadSummary);
updateHeaderBadge();


function loadSummary(){

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let subtotal = 0;

    cart.forEach(item => {
        const price = Number(item.offer_price) || 0;
        const qty = Number(item.qty) || 1;

        subtotal += price * qty;
    });

    const vat = subtotal * 0.05;
    const delivery = subtotal > 0 ? 55 : 0;
    const total = subtotal + vat + delivery;

    document.getElementById("summarySubtotal").textContent = "₹" + subtotal.toFixed(2);
    document.getElementById("summaryVat").textContent = "₹" + vat.toFixed(2);
    document.getElementById("summaryDelivery").textContent = "₹" + delivery;
    document.getElementById("summaryTotal").textContent = "₹" + total.toFixed(2);

}


// address save temp

function saveAddress(){

const address = {
name: document.getElementById("name").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,
city: document.getElementById("city").value,
pincode: document.getElementById("pincode").value
};

sessionStorage.setItem("checkoutAddress", JSON.stringify(address));

window.location.href = "../../cart/html/checkout2.html";

}


// heart and cart count

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