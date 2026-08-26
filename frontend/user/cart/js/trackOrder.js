document.addEventListener("DOMContentLoaded", async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const orderId =
        urlParams.get("id") ||
        urlParams.get("orderId") ||
        sessionStorage.getItem("orderId");

    if (!orderId) {
        alert("Order ID missing!");
        return;
    }

    try {
        const response = await fetch(`https://trendmart-backend-3o66.onrender.com/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
            console.error("Server error:", data.detail);
            return;
        }

        console.log("Order Data:", data);

        localStorage.removeItem('cart');
        updateHeaderBadge();

        // HEADER
        const orderIdEl = document.getElementById("orderId");
        const orderDateEl = document.getElementById("orderDate");

        if (orderIdEl) orderIdEl.textContent = data.order_number;
        if (orderDateEl) orderDateEl.textContent =
            new Date(data.created_at).toLocaleDateString();


        // PRODUCT LIST
        const productList = document.getElementById("productList");
        if (!productList) return;

        productList.innerHTML = "";
        let subtotal = 0;

        if (data.items && data.items.length > 0) {
            data.items.forEach((item) => {
                const itemSubtotal = Number(item.subtotal) || 0;
                subtotal += itemSubtotal;

                const itemRow = document.createElement("div");
                itemRow.className = "product-card";

                itemRow.innerHTML = `
                    <div class="product-info">
                        <h4>${item.product_name}</h4>
                        <span>₹${item.price} x ${item.quantity}</span>
                    </div>
                    <div class="price">₹${itemSubtotal.toFixed(2)}</div>
                `;
                productList.appendChild(itemRow);
            });
        } else {
            productList.innerHTML = "<p>No items found.</p>";
        }


        // BILL SUMMARY
        const vat = subtotal * 0.05;
        const delivery = 55;
        const total = subtotal + vat + delivery;

        const subtotalEl = document.getElementById("summarySubtotal");
        const vatEl = document.getElementById("summaryVat");
        const deliveryEl = document.getElementById("summaryDelivery");
        const totalEl = document.getElementById("summaryTotal");

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (vatEl) vatEl.textContent = `₹${vat.toFixed(2)}`;
        if (deliveryEl) deliveryEl.textContent = `₹${delivery.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;


        // STATUS
        if (data.status && typeof updateStatusTracker === "function") {
            updateStatusTracker(data.status);
        }

    } catch (err) {
        console.error("JS Error:", err);
    }
});


// heart and cart count function
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

updateHeaderBadge();