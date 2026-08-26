document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("categoryContainer");

    try {

        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/products/");
        const products = await response.json();

        const categoryMap = {};

        products.forEach(product => {

            if (!categoryMap[product.category]) {
                categoryMap[product.category] = [];
            }

            categoryMap[product.category].push(product);

        });

        const categories = Object.keys(categoryMap);

        container.innerHTML = "";

        categories.slice(0,6).forEach(category => {

            const items = categoryMap[category];

            // random product
            const randomProduct =
                items[Math.floor(Math.random() * items.length)];

            container.innerHTML += `

            <div class="category-item"
                 onclick="openCategory('${category}')">

                <div class="circle">
                    <img src="${randomProduct.image_url}" alt="${category}">
                </div>

                <p>${category}</p>

            </div>

            `;

        });

    } catch (error) {

        console.error("Category Load Error:", error);

    }

});



