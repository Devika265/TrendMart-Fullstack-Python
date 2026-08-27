document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("trendProductsContainer");

    updateHeaderBadge();
    loadMilestones(); 
    initHeroSlider(); 

    try {
        
        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/products/new-arrivals/");
        const products = await response.json();

        if (container) {
            container.innerHTML = "";
            products.forEach((product, index) => {
                let cardClass = "card";
                if (index === 0) cardClass = "card card-wide";
                if (index === 3) cardClass = "card card-tall";
                if (index === 5) cardClass = "card card-extra-tall";

                container.innerHTML += `
                <div class="${cardClass}" onclick="viewProduct(${product.id})">
                    <img src="${product.image_url}" alt="${product.name}">
                    <div class="card-overlay">
                        <div class="card-info">
                            <h3>${product.name}</h3>
                            <p class="price">
                                ₹${product.offer_price}
                                <span style="text-decoration:line-through;color:gray;font-size:14px">
                                    ₹${product.original_price}
                                </span>
                            </p>
                            <p class="rating">
                                ${generateStars(product.rating)} (${product.rating})
                            </p>
                        </div>
                    </div>
                </div>
                `;
            });
        }
    } catch (error) {
        console.error("Trend Products Error:", error);
    }
});


let allProductsForSlider = [];

async function initHeroSlider() {
    try {
        
        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/products/");
        allProductsForSlider = await response.json();

        if (allProductsForSlider.length >= 3) {
            updateHeroImages(); 
            setInterval(updateHeroImages, 3000);
        }
    } catch (error) {
        console.error("Hero Slider Error:", error);
    }
}

function updateHeroImages() {
    const shuffled = [...allProductsForSlider].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const ids = ['hero-main', 'hero-sub-1', 'hero-sub-2'];

    ids.forEach((id, index) => {
        const imgElement = document.getElementById(id);
        if (imgElement) {
            
            imgElement.style.opacity = "0.4";
            setTimeout(() => {
                imgElement.src = selected[index].image_url;
                imgElement.style.opacity = "1";
            }, 500);
        }
    });
}

// --- MILESTONES LOGIC ---
async function loadMilestones() {
    const apiUrl = 'https://trendmart-backend-3o66.onrender.com/api/milestones';
    const listContainer = document.getElementById('milestones-list');

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (listContainer) {
            listContainer.innerHTML = '';
            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'milestones-about';
                li.innerHTML = `
                    <i class="fa-solid ${item.icon}"></i>
                    <p class="rate">${item.rate}</p>
                    <p class="note">${item.note}</p>
                `;
                listContainer.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error loading milestones:", error);
    }
}

// --- HELPER FUNCTIONS ---

function generateStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += (i <= Math.floor(rating)) ? "⭐" : "☆";
    }
    return stars;
}

function viewProduct(id) {
    window.location.href = `../../shop/html/product.html?id=${id}`;
}

async function subscribe() {
    const email = document.getElementById("userEmail").value;
    if (!email) return alert("Please enter email");

    const formData = new FormData();
    formData.append("email", email);

    try {
        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/subscribers/", {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        alert(result.message);
        document.getElementById("userEmail").value = "";
    } catch (e) {
        alert("Subscription failed!");
    }
}

function updateHeaderBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishBadge = document.querySelector('#wish-icon .cart-count');
    if (wishBadge) wishBadge.innerText = wishlist.length;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.querySelector('#cart-icon .cart-count');
    if (cartBadge) cartBadge.innerText = cart.length;
}
