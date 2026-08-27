// GLOBAL BASE API URL
window.BASE_API_URL = window.BASE_API_URL || "https://trendmart-backend-3o66.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderBadge();
    const loggedInUserId = localStorage.getItem('userId'); 

    if (loggedInUserId) {
        loadMyOrders(loggedInUserId); 
    } else {
        const wrapper = document.getElementById('orders-wrapper');
        if (wrapper) {
            wrapper.innerHTML = `
                <div class="login-prompt-container">
                    <p>Please <a href="../../login/html/login.html" class="login-link">Login</a> to view your orders.</p>
                </div>`;
        }
    }

    const filterSelect = document.querySelector('.filter-select'); 
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const selectedStatus = this.value.toLowerCase();
            
            const cards = document.querySelectorAll('.product-details-card');
            cards.forEach(card => {
                const cardStatus = card.getAttribute('data-status');
                if (selectedStatus === 'all' || selectedStatus === '' || cardStatus === selectedStatus) {
                    card.style.display = 'block'; 
                } else {
                    card.style.display = 'none'; 
                }
            });
        });
    }
});

async function loadMyOrders(userId) {
    const wrapper = document.getElementById('orders-wrapper');
    if (!wrapper) return;

    try {
        const response = await fetch(`${window.BASE_API_URL}/api/orders/my-orders/${userId}`);
        if (!response.ok) {
            wrapper.innerHTML = `<p class="error-msg">Server error. Please try again later.</p>`;
            return;
        }

        const ordersData = await response.json();
        wrapper.innerHTML = ''; 

        if (!ordersData || ordersData.length === 0) {
            wrapper.innerHTML = `<div class="no-orders"><p>No orders found.</p></div>`;
            return;
        }

        const groupedOrders = {};
        ordersData.forEach(item => {
            const orderID = item.id; 
            if (!groupedOrders[orderID]) {
                groupedOrders[orderID] = { info: item, items: [], subtotal: 0 };
            }
            const price = parseFloat(String(item.price).replace(/,/g, '')) || 0;
            const qty = parseInt(item.qty) || 1;
            groupedOrders[orderID].subtotal += (price * qty);
            groupedOrders[orderID].items.push(item);
        });

        Object.keys(groupedOrders).forEach(orderID => {
            const group = groupedOrders[orderID];
            const orderBase = group.info;
            const statusClass = orderBase.status.toLowerCase();

            // Calculations
            const vat = group.subtotal * 0.05;
            const delivery = 55;
            const grandTotal = group.subtotal + vat + delivery;

            const imagesHTML = group.items.map(item => `
                <div class="order-img-wrapper">
                    <img src="${item.img}" class="order-thumbnail" onerror="this.src='../../images/placeholder.jpg';">
                </div>
            `).join('');

            const namesHTML = group.items.map(item => `
                <div class="order-item-row">
                    <span class="item-name">${item.name} <b class="item-qty">x${item.qty}</b></span>
                    <span class="item-subtotal">₹ ${ (parseFloat(String(item.price).replace(/,/g, '')) * item.qty).toLocaleString('en-IN') }</span>
                </div>
            `).join('');

            const orderCard = `
                <div class="product-details-card" data-status="${statusClass}">
                    
                    <div class="card-header">
                        <div class="order-meta">
                            <span class="order-id-label">Order #${orderID}</span>
                            <div class="order-date-label">${orderBase.date}</div>
                        </div>
                        <div class="status-badge ${statusClass}">
                            ${orderBase.status}
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="order-images-strip">
                            ${imagesHTML}
                        </div>

                        <div class="order-items-list">
                            ${namesHTML}
                        </div>

                        <div class="order-summary-box">
                            <div class="summary-line">
                                <span>VAT (5%) + Delivery Charge</span>
                                <span>₹${(vat + delivery).toFixed(0)}</span>
                            </div>
                            <div class="summary-line total-line">
                                <span>Grand Total</span>
                                <span class="grand-total-amount">₹ ${Math.round(grandTotal).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div class="delivery-status-footer">
                            <span class="delivery-icon">🚚</span>
                            <span class="delivery-text">${orderBase.delivery_info || 'Your order is being prepared'}</span>
                        </div>
                    </div>
                </div>
            `;
            wrapper.innerHTML += orderCard;
        });

    } catch (error) {
        console.error("Error:", error);
        wrapper.innerHTML = `<p class="error-msg">Connection error. Check your internet.</p>`;
    }
}

function updateHeaderBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const wishBadge = document.querySelector('#wish-icon .cart-count');
    const cartBadge = document.querySelector('#cart-icon .cart-count');
    if (wishBadge) wishBadge.innerText = wishlist.length;
    if (cartBadge) cartBadge.innerText = cart.length;
}