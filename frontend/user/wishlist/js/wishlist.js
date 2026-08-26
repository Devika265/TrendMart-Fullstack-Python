document.addEventListener("DOMContentLoaded", () => {
    const wishlistBody = document.querySelector(".wishlist-table tbody");
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    updateHeaderBadge();

    if (wishlist.length === 0) {
        wishlistBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Wishlist empty!</td></tr>";
        return;
    }

    
    wishlistBody.innerHTML = wishlist.map(product => `
        <tr>
            <td><img src="${product.image_url}" class="product-img"></td>
            <td>
                <h4 class="product-title">${product.name}</h4>
                <p class="product-desc">${product.category}</p>
            </td>
            <td class="price">₹${product.offer_price}</td>
            <td class="stock">${product.stock}</td>
            <td><button class="cart-btn" onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button></td>
            <td><i class="fa-solid fa-trash remove-icon" onclick="removeFromWishlist(${product.id})"></i></td>
        </tr>
    `).join('');
});


function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    location.reload(); 
}


function addToCart(product) {
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    
    const index = cart.findIndex(item => item.id === product.id);

    if (index === -1) {
        
        product.quantity = 1;
        cart.push(product);
    } else {
        
        cart[index].quantity += 1;
    }

    
    localStorage.setItem('cart', JSON.stringify(cart));

    window.location.href = "../../cart/html/shoppingCart.html"; 
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


async function subscribe() {

    const email = document.getElementById("userEmail").value;

    const formData = new FormData();
    formData.append("email", email);

    const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/subscribers/", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    alert(result.message);

    document.getElementById("userEmail").value = "";
}