document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("exploreProductsContainer");
     updateHeaderBadge(); 

    
    fetch("http://127.0.0.1:8000/api/products/")
        .then((res) => res.json())
        .then((products) => {
            if (!container) return;
            container.innerHTML = "";

            
            products.slice(6, 12).forEach((product) => {
                
                const productData = JSON.stringify(product).replace(/'/g, "\\'");

                container.innerHTML += `
                <div class="product-card">
                    <div class="product-tumb">
                        <img src="${product.image_url}" onclick="viewProduct(${product.id})" style="cursor:pointer;">
                    </div>
                    <div class="product-details">
                        <span class="product-catagory">${product.category}</span>
                        <h4>${product.name}</h4>
                        <div class="product-bottom-details">
                            <div class="product-price">
                                ₹${product.offer_price}
                                <small>₹${product.original_price}</small>
                            </div>
                            <button class="shop-now-btn" 
                                onclick='directToCart(${productData})'>
                                Shop Now
                            </button>
                        </div>
                    </div>
                </div>
                `;
            });
        })
        .catch((err) => console.log("Product load error:", err));
});


function viewProduct(id) {
    window.location.href = "../../shop/html/product.html?id=" + id;
}


function directToCart(product) {
    
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


async function subscribe() {

    const email = document.getElementById("userEmail").value;

    const formData = new FormData();
    formData.append("email", email);

    const response = await fetch("http://127.0.0.1:8000/api/subscribers/", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    alert(result.message);

    document.getElementById("userEmail").value = "";
}