// GLOBAL VARIABLES
const itemsPerPage = 6;
let currentPage = 1;
let allProducts = [];

// --- 1. INITIAL LOAD & SEARCH ---
document.addEventListener("DOMContentLoaded", function () {
    updateHeaderBadge();

    const token = localStorage.getItem("token");
    const profileLink = document.querySelector("#profile-icon a");
    if (profileLink && token) {
        profileLink.href = "../../user_profile/html/profile.html";
    }

    const urlParams = new URLSearchParams(window.location.search);
    const offerType = urlParams.get("offer");

    let url = "https://trendmart-backend-3o66.onrender.com/api/products/";
    if (offerType) {
        url = "https://trendmart-backend-3o66.onrender.com/api/products/filter/offer/?offer=" + offerType;
    }

    applyFilter(url);

    const searchInput = document.querySelector(".search-box");

    if (searchInput) {
        searchInput.addEventListener("keyup", function () {

            const searchText = this.value.trim();

            let searchUrl = "https://trendmart-backend-3o66.onrender.com/api/products/";

            if (searchText !== "") {
                searchUrl = `https://trendmart-backend-3o66.onrender.com/api/products/search/?q=${encodeURIComponent(searchText)}`;
            }

            applyFilter(searchUrl);
        });
    }
});


// --- 2. FILTER & FETCH ENGINE ---
function applyFilter(url) {

    fetch(url)
        .then(res => res.json())
        .then(data => {

            allProducts = data;

            currentPage = 1;

            createPagination();

            showProducts(currentPage);

        })
        .catch(err => console.error("Fetch Error:", err));
}


// Sidebar Filter Callbacks

function filterCategory() {

    const checked = document.querySelectorAll(".category-filter:checked");

    let categories = Array.from(checked).map(cb => cb.value);

    let url = categories.length === 0
        ? "https://trendmart-backend-3o66.onrender.com/api/products/"
        : `https://trendmart-backend-3o66.onrender.com/api/products/filter/category/?category=${categories.join(",")}`;

    applyFilter(url);
}


function filterPrice() {

    const minPrice = document.getElementById("min-price").value || 0;

    const maxPrice = document.getElementById("max-price").value || 100000;

    let url = `https://trendmart-backend-3o66.onrender.com/api/products/filter/price/?min_price=${minPrice}&max_price=${maxPrice}`;

    applyFilter(url);
}


function filterDiscount() {

    const checked = document.querySelectorAll(".discount-filter:checked");

    let discounts = Array.from(checked).map(cb => cb.value);

    let url = discounts.length > 0
        ? `https://trendmart-backend-3o66.onrender.com/api/products/filter/discount/?discount=${discounts.join(",")}`
        : "https://trendmart-backend-3o66.onrender.com/api/products/";

    applyFilter(url);
}


function filterRating() {

    const checked = document.querySelectorAll(".rating-filter:checked");

    let ratings = Array.from(checked).map(cb => cb.value);

    let url = ratings.length > 0
        ? `https://trendmart-backend-3o66.onrender.com/api/products/filter/rating/?rating=${ratings.join(",")}`
        : "https://trendmart-backend-3o66.onrender.com/api/products/";

    applyFilter(url);
}


function filterOffer() {

    const checked = document.querySelectorAll(".offer-filter:checked");

    let offers = Array.from(checked).map(cb => cb.value);

    let url = offers.length > 0
        ? `https://trendmart-backend-3o66.onrender.com/api/products/filter/offer/?offer=${offers.join(",")}`
        : "https://trendmart-backend-3o66.onrender.com/api/products/";

    applyFilter(url);
}


// --- 3. UI RENDERING (PRODUCTS & PAGINATION) ---
function showProducts(page) {

    const container = document.getElementById("productContainer");

    const paginationContainer = document.getElementById("pagination");

    if (!container) return;

    container.innerHTML = "";

    if (!allProducts || allProducts.length === 0) {

        container.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h3 style="color: #1f2937;">Oops! No Products Found</h3>
            </div>
        `;

        if (paginationContainer) paginationContainer.style.display = "none";

        return;
    }

    if (paginationContainer) paginationContainer.style.display = "flex";

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const start = (page - 1) * itemsPerPage;

    const end = start + itemsPerPage;

    const paginatedProducts = allProducts.slice(start, end);


    paginatedProducts.forEach(product => {

        const isLiked = wishlist.some(item => item.id === product.id);

        const likedClass = isLiked ? 'liked' : '';

        container.innerHTML += `
            <div class="all-products">

                <div class="product-top">

                    ${product.offer_type ? `<span class="offer-badge ${product.offer_type}">${product.offer_type}</span>` : ""}

                    <img src="${product.image_url}" class="product" onclick="viewProduct(${product.id})">

                    <div class="heart-head">
                        <i class="fa fa-heart heart-icon ${likedClass}" data-product='${JSON.stringify(product)}' onclick="handleWishlist(this)"></i>
                    </div>

                </div>

                <p>${product.category}</p>
                <p>${product.offer}% off</p>

                <h3>${product.name}</h3>

                <p class="stars">${getStars(product.rating)}</p>

                <p class="price">₹${product.offer_price} <span>₹${product.original_price}</span></p>

                <div class="product-actions">

                    <i class="fa fa-shopping-cart cart-icon" onclick='addToCart(${JSON.stringify(product)})'></i>

                    <button class="buy-now" onclick="buyNow(${product.id})">Buy Now</button>

                </div>

            </div>
        `;
    });
}


// --- PAGINATION ---
function createPagination() {

    const pagination = document.getElementById("pagination");

    if (!pagination) return;

    pagination.innerHTML = "";

    const pageCount = Math.ceil(allProducts.length / itemsPerPage);

    if (pageCount <= 1) return;

    for (let i = 1; i <= pageCount; i++) {

        const btn = document.createElement("button");

        btn.innerText = i;

        if (i === currentPage) btn.classList.add('active');

        btn.onclick = function () {

            currentPage = i;

            showProducts(currentPage);

            createPagination();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        pagination.appendChild(btn);
    }
}


// --- 4. ACTION HANDLERS ---

function buyNow(productId) {

    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const index = cart.findIndex(item => item.id === product.id);

    if (index === -1) {

        product.quantity = 1;

        cart.push(product);

    } else {

        cart[index].quantity += 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    updateHeaderBadge();

    window.location.href = "../../cart/html/shoppingCart.html";
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

    updateHeaderBadge();

    window.location.href = "../../cart/html/shoppingCart.html";
}


function handleWishlist(icon) {

    const productData = JSON.parse(icon.getAttribute('data-product'));

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const index = wishlist.findIndex(item => item.id === productData.id);

    if (index === -1) {

        wishlist.push(productData);

        icon.classList.add('liked');

    } else {

        wishlist.splice(index, 1);

        icon.classList.remove('liked');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    updateHeaderBadge();
}


// --- 5. HELPERS ---

function getStars(rating) {

    rating = parseFloat(rating);

    let stars = "";

    for (let i = 1; i <= 5; i++) {

        stars += i <= rating
            ? `<i class="fa-solid fa-star checked"></i>`
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


function viewProduct(productId) {

    window.location.href = `../../shop/html/product.html?id=${productId}`;
}