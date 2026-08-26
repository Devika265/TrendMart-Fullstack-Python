let currentProduct = null;
let allProducts = [];
let currentPage = 1;

document.addEventListener("DOMContentLoaded", async () => {

    updateHeaderBadge();

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const modal = document.getElementById("feedbackModal");
    const toggleBtn = document.getElementById("toggleFormBtn");
    const closeBtn = document.getElementById("closeModal");

    // --------- OPEN REVIEW MODAL ---------
    if (toggleBtn && modal) {
        toggleBtn.addEventListener("click", () => {
            modal.classList.add("active");
        });
    }

    // --------- CLOSE REVIEW MODAL ---------
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }

    // --------- LOAD MAIN PRODUCT ---------
    if (productId) {
        try {
            const response = await fetch(`https://trendmart-backend-3o66.onrender.com/api/products/${productId}/`);
            const product = await response.json();

            if (product) {
                currentProduct = product;

                document.getElementById("productImage").src = product.image_url;
                document.getElementById("productName").textContent = product.name;
                document.getElementById("productCategory").textContent = product.category;
                document.getElementById("productDescription").textContent = product.description;
                document.getElementById("originalPrice").textContent = "₹" + product.original_price;
                document.getElementById("offerPrice").textContent = "₹" + product.offer_price;
                document.getElementById("productRating").innerHTML = generateStars(product.rating);

                loadRelatedProducts(product.category, productId);
                loadDynamicFeedbacks(productId);

                const wishlistBtn = document.getElementById("addToWishlistBtn");
                if (wishlistBtn) wishlistBtn.addEventListener("click", () => addToWishlist(currentProduct));

                const cartBtn = document.getElementById("addToCartBtn");
                if (cartBtn) cartBtn.addEventListener("click", () => addToCart(currentProduct));
            }

        } catch (err) {
            console.error("Main Product Fetch Error:", err);
        }
    }

    // --------- FEEDBACK SUBMIT ---------
    const feedbackForm = document.getElementById("feedbackForm");

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            if (!productId) {
                alert("Product ID missing!");
                return;
            }

            const formData = {
                product_id: parseInt(productId),
                user_name: document.getElementById("reviewerName").value,
                rating: parseInt(document.getElementById("reviewRating").value),
                comment: document.getElementById("reviewerMessage").value
            };

            try {

                const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/feedback", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {

                    alert("✅ Feedback submitted successfully!");

                    feedbackForm.reset();

                    modal.classList.remove("active");

                    loadDynamicFeedbacks(productId);

                } else {
                    alert("❌ Failed to submit feedback.");
                }

            } catch (err) {
                console.error("Post Feedback Error:", err);
            }
        });
    }

    // --------- SEARCH PRODUCTS ---------
    const searchInput = document.querySelector(".search-box");

    if (searchInput) {
        searchInput.addEventListener("keyup", async function () {

            const query = this.value.trim();

            let searchUrl = query
                ? `https://trendmart-backend-3o66.onrender.com/api/products/search/query/?q=${encodeURIComponent(query)}`
                : "https://trendmart-backend-3o66.onrender.com/api/products/";

            try {

                const res = await fetch(searchUrl);
                allProducts = await res.json();

                currentPage = 1;

                createPagination();
                showProducts(currentPage);

            } catch (err) {
                console.error("Search Error:", err);
            }
        });
    }

    // --------- LOAD ALL PRODUCTS ---------
    try {

        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/products/");

        allProducts = await response.json();

        currentPage = 1;

        createPagination();
        showProducts(currentPage);

    } catch (err) {
        console.error("Load All Products Error:", err);
    }

});


// ===================== FUNCTIONS =====================

async function loadDynamicFeedbacks(pId) {

    const reviewsList = document.getElementById("reviewsList");

    if (!reviewsList) return;

    try {

        const response = await fetch(`https://trendmart-backend-3o66.onrender.com/api/feedback?product_id=${pId}`);

        const feedbacks = await response.json();

        if (!Array.isArray(feedbacks) || feedbacks.length === 0) {

            reviewsList.innerHTML = `
            <p style="color:#777;font-size:14px">
            No reviews yet for this product.
            </p>`;

            return;
        }

        reviewsList.innerHTML = feedbacks.map(item => `
        
        <div class="review-item" style="border-bottom:1px solid #eee;padding:12px 0">

            <div style="display:flex;justify-content:space-between">

                <strong>${item.user_name}</strong>

                <span style="color:#FFA500">
                ${generateStars(item.rating)}
                </span>

            </div>

            <p style="font-size:0.9rem;color:#444;margin-top:5px">
            ${item.comment}
            </p>

        </div>

        `).join('');

    } catch (err) {
        console.error("Load Feedbacks Error:", err);
    }
}


async function loadRelatedProducts(category, currentId) {

    try {

        const res = await fetch(`https://trendmart-backend-3o66.onrender.com/api/products/`);

        const data = await res.json();

        const related = data.filter(p =>
            p.category.trim().toLowerCase() === category.trim().toLowerCase()
            && p.id != currentId
        );

        const container = document.getElementById("relatedProductContainer");

        if (!container) return;

        container.innerHTML = "";

        related.slice(0, 3).forEach(item => {

            const productData = encodeURIComponent(JSON.stringify(item));

            container.innerHTML += `
            
            <div class="all-products">

                <div class="product-top">

                    <img src="${item.image_url}" 
                    class="product" 
                    onclick='viewProduct(${item.id})'>

                </div>

                <p>${item.category}</p>

                <h3>${item.name}</h3>

                <p class="stars">
                ${generateStars(item.rating)}
                </p>

                <p class="price">
                ₹${item.offer_price}
                </p>

                <p class="price" style="text-decoration: line-through; color:#ccc">
                ₹${item.original_price}
                </p>

                <button class="buy-now"
                onclick="addToCartData('${productData}')">
                Buy Now
                </button>

            </div>`;
        });

    } catch (err) {
        console.error("Related Products Error:", err);
    }
}


function addToCartData(encodedData) {
    addToCart(JSON.parse(decodeURIComponent(encodedData)));
}

function addToWishlistData(encodedData) {
    addToWishlist(JSON.parse(decodeURIComponent(encodedData)));
}


function addToCart(product) {

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const index = cart.findIndex(p => p.id === product.id);

    if (index === -1) {
        product.quantity = 1;
        cart.push(product);
    }
    else {
        cart[index].quantity += 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    updateHeaderBadge();

    window.location.href = "../../cart/html/shoppingCart.html";
}


function addToWishlist(product) {

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (!wishlist.some(p => p.id === product.id))
        wishlist.push(product);

    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    updateHeaderBadge();

    window.location.href = "../../wishlist/html/wishlist.html";
}


function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}


function generateStars(rating) {

    let stars = "";

    for (let i = 1; i <= 5; i++) {

        stars += (i <= Math.floor(rating))
            ? `<i class="fa-solid fa-star"></i>`
            : `<i class="fa-regular fa-star"></i>`;
    }

    return stars;
}


function updateHeaderBadge() {

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const wishBadge = document.querySelector('#wish-icon .cart-count');
    const cartBadge = document.querySelector('#cart-icon .cart-count');

    if (wishBadge) wishBadge.innerText = wishlist.length;
    if (cartBadge) cartBadge.innerText = cart.length;
}


function createPagination() {

    const pagination = document.getElementById("pagination");

    if (!pagination) return;

    pagination.innerHTML = "";

    const pageCount = Math.ceil(allProducts.length / 6);

    for (let i = 1; i <= pageCount; i++) {

        const btn = document.createElement("button");

        btn.innerText = i;

        if (i === currentPage)
            btn.classList.add("active");

        btn.addEventListener("click", () => {

            currentPage = i;

            showProducts(currentPage);

            createPagination();

        });

        pagination.appendChild(btn);
    }
}


function showProducts(page) {

    const container = document.getElementById("productContainer");

    if (!container) return;

    container.innerHTML = "";

    const start = (page - 1) * 6;

    allProducts.slice(start, start + 6).forEach(product => {

        const productData = encodeURIComponent(JSON.stringify(product));

        container.innerHTML += `
        
        <div class="all-products">

            <div class="product-top">

                <img src="${product.image_url}" 
                class="product" 
                onclick='viewProduct(${product.id})'>

            </div>

            <h3>${product.name}</h3>

            <p class="price">
            ₹${product.offer_price}
            </p>

            <button class="buy-now"
            onclick="addToCartData('${productData}')">
            Buy Now
            </button>

        </div>`;
    });

}