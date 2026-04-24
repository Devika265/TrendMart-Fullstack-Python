document.addEventListener("DOMContentLoaded", function () {
    
    const arrow = document.querySelector(".arrow-icon");
    if (arrow) {
        arrow.addEventListener("click", function () {
            window.history.back();
        });
    }

    
    updateHeaderBadge();
    loadOrderSummary();
});

// LOAD SUMMARY FROM STORAGE
function loadOrderSummary() {
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

    if (document.getElementById("summarySubtotal")) {
        document.getElementById("summarySubtotal").textContent = "₹" + subtotal.toFixed(2);
        document.getElementById("summaryVat").textContent = "₹" + vat.toFixed(2);
        document.getElementById("summaryDelivery").textContent = "₹" + delivery;
        document.getElementById("summaryTotal").textContent = "₹" + total.toFixed(2);
    }
}

//  PLACE ORDER 
async function placeOrder() {
    const btn = document.getElementById("placeOrderBtn");
    
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const addressData = JSON.parse(sessionStorage.getItem("checkoutAddress"));

    
    const loggedInUserId = localStorage.getItem('userId');

    if (!loggedInUserId) {
        alert("Please login to place an order!");
        window.location.href = "../../auth/html/login.html";
        return;
    }

    if (cart.length === 0 || !addressData) {
        alert("Cart empty-ah irukku illa address missing!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Processing...";

    // Calculations
    let subtotalValue = 0;
    const items = cart.map(item => {
        const p = Number(item.offer_price) || 0;
        const q = Number(item.qty) || 1;
        const s = p * q;
        subtotalValue += s;
        return {
            product_id: String(item.id || item.product_id || "0"),
            product_name: String(item.name || "Unknown Product"),
            quantity: parseInt(q),
            price: parseFloat(p),
            subtotal: parseFloat(s.toFixed(2))
        };
    });

    const vatValue = parseFloat((subtotalValue * 0.05).toFixed(2));
    const delivery = 55;
    const finalTotal = parseFloat((subtotalValue + vatValue + delivery).toFixed(2));

    //  PAYLOAD MAPPING
    const payload = {
        user_id: String(loggedInUserId), 
        customer_name: String(addressData.name || "Guest"),
        phone: String(addressData.phone || "0000000000"),
        address: `${addressData.address || ""}, ${addressData.city || ""} - ${addressData.pincode || ""}`,
        subtotal: subtotalValue,
        vat: vatValue,
        total_amount: finalTotal,
        payment_method: "Cash on Delivery",
        items: items
    };

    console.log("Sending Payload for User:", payload.user_id);

    try {
        const response = await fetch("http://127.0.0.1:8000/api/orders/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            sessionStorage.setItem("orderId", result.order_number);
            localStorage.removeItem("cart"); 
            window.location.href = "../../cart/html/checkout3.html";
        } else {
            console.error("Error Detail:", result.detail);
            alert("Order failed: " + (result.detail || "Error in processing"));
            btn.disabled = false;
            btn.innerText = "Place Order";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server connection failed!");
        btn.disabled = false;
        btn.innerText = "Place Order";
    }
}

// HEADER BADGE 
function updateHeaderBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishBadge = document.querySelector('#wish-icon .cart-count');
    if (wishBadge) wishBadge.innerText = wishlist.length;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.querySelector('#cart-icon .cart-count');
    if (cartBadge) cartBadge.innerText = cart.length;
}