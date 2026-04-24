document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateHeaderBadge();
});


// LOAD CART 

function loadCart() {

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cartItems");

  let subtotal = 0;

  if (!container) return;

  let html = "";

  cart.forEach((item, index) => {

    const currentPrice = Number(item.offer_price) || 0;
    const currentQty = Number(item.qty) || 1;
    const originalPrice = Number(item.original_price) || 0;

    subtotal += currentPrice * currentQty;

    html += `
    
        <div class="tm-cart-item">

            <img src="${item.image_url}" alt="${item.name}">

            <div class="tm-item-details">

                <h4>${item.name}</h4>
                <p class="tm-category">${item.category}</p>

                <div class="tm-price-row">

                    <div class="tm-price-block">

                        <span class="tm-offer-price">
                        ₹${Math.round(currentPrice).toLocaleString()}
                        </span>

                        ${
                          originalPrice > 0
                            ? `<span class="tm-original-price">
                               ₹${Math.round(originalPrice).toLocaleString()}
                               </span>`
                            : ""
                        }

                    </div>

                    <div class="qty-control">

                        <button onclick="decreaseQty(${index})">-</button>

                        <span class="qty">${currentQty}</span>

                        <button onclick="increaseQty(${index})">+</button>

                    </div>

                </div>

                <div class="tm-actions">

                    <button class="remove-btn" onclick="removeItem(${index})">
                    Remove
                    </button>

                </div>

            </div>

        </div>
    `;
  });

  container.innerHTML = html;


  // PRICE CALCULATION

  const vat = subtotal * 0.05;
  const delivery = subtotal > 0 ? 55 : 0;
  const total = subtotal + vat + delivery;

  updateElementText("subtotal", subtotal.toFixed(2));
  updateElementText("vat", vat.toFixed(2));
  updateElementText("totalPrice", total.toFixed(2));


  // CART COUNT TEXT 

  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent =
      cart.length + (cart.length === 1 ? " item" : " items");
  }

  
  updateHeaderBadge();
}


//HELPER FUNCTION 

function updateElementText(id, value) {

  const el = document.getElementById(id);

  if (el) {
    el.textContent = "₹" + value;
  }

}


//  REMOVE ITEM 

function removeItem(index) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
}


// INCREASE QTY 

function increaseQty(index) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].qty = (cart[index].qty || 1) + 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
}


//  DECREASE QTY 

function decreaseQty(index) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
}


//  GO TO CHECKOUT

function goToCheckout() {

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  window.location.href = "../../cart/html/checkout1.html";
}


// HEADER BADGE 

function updateHeaderBadge() {

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const wishBadge = document.querySelector("#wish-icon .cart-count");

  if (wishBadge) wishBadge.innerText = wishlist.length;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartBadge = document.querySelector("#cart-icon .cart-count");

  if (cartBadge) cartBadge.innerText = cart.length;
}