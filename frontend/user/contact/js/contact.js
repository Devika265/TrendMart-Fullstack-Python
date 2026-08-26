let allProductsForSlider = [];
let sliderIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    
    updateHeaderBadge();
    loadMilestones(); 
    initHeroSlider(); 
});

// --- Wishlist & Cart Count---
function updateHeaderBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishBadge = document.querySelector('#wish-icon .cart-count');
    if (wishBadge) wishBadge.innerText = wishlist.length;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.querySelector('#cart-icon .cart-count');
    if (cartBadge) cartBadge.innerText = cart.length;
}


const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        try {
            const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/contact/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                alert("✅ " + data.message);
                contactForm.reset(); 
            } else {
                alert(" Error: Message not send.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("server not connect");
        }
    });
}



async function subscribe() {
    const emailInput = document.getElementById("userEmail");
    if (!emailInput || !emailInput.value) return alert("Please enter your email");

    const formData = new FormData();
    formData.append("email", emailInput.value);

    try {
        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/subscribers/", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        alert(result.message);
        emailInput.value = "";
    } catch (error) {
        console.error("Subscribe Error:", error);
    }
}


async function initHeroSlider() {
    try {
        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/products/new-arrivals/");
        allProductsForSlider = await response.json();

        if (allProductsForSlider.length >= 3) {
            allProductsForSlider.sort(() => Math.random() - 0.5);
            updateHeroImages(); 
            setInterval(updateHeroImages, 5000); 
        }
    } catch (error) {
        console.error("Hero Slider Error:", error);
    }
}

function updateHeroImages() {
    if (allProductsForSlider.length < 3) return;

    if (sliderIndex + 3 > allProductsForSlider.length) {
        sliderIndex = 0;
        allProductsForSlider.sort(() => Math.random() - 0.5);
    }

    let selected = allProductsForSlider.slice(sliderIndex, sliderIndex + 3);
    sliderIndex += 3;

    const ids = ['hero-main', 'hero-sub-1', 'hero-sub-2'];
    ids.forEach((id, index) => {
        const imgElement = document.getElementById(id);
        if (imgElement && selected[index]) {
            imgElement.style.opacity = "0"; 
            imgElement.style.transition = "opacity 0.8s ease-in-out";
            
            setTimeout(() => {
                imgElement.src = selected[index].image_url;
                imgElement.style.opacity = "1";
            }, 700);
        }
    });
}

// --- MILESTONES LOGIC ---
async function loadMilestones() {
    const listContainer = document.getElementById('milestones-list');
    if (!listContainer) return;

    try {
        const response = await fetch('https://trendmart-backend-3o66.onrender.com/api/milestones');
        const data = await response.json();

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
    } catch (error) {
        console.error("Error loading milestones:", error);
    }
}