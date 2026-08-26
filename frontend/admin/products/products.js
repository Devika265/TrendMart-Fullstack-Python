let allProducts = [];
let currentPage = 1;
const itemsPerPage = 8;
const API_URL = "http://127.0.0.1:8000/api/products/";

const modal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");


const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
let productToDeleteId = null;


function showNotification(message, type = "success", duration = 2000) {
    const notif = document.getElementById("notification");
    notif.textContent = message;

    if(type === "success") notif.style.backgroundColor = "#4caf50"; // green
    else if(type === "update") notif.style.backgroundColor = "#2196F3"; // blue
    else if(type === "delete") notif.style.backgroundColor = "#f44336"; // red

    notif.style.display = "block";

    setTimeout(() => { notif.style.display = "none"; }, duration);
}


function openModal(id = null) {
    modal.style.display = "flex";
    if (id) {
        document.getElementById("modalTitle").innerText = "Edit Product";
        const product = allProducts.find(p => p.id === id);
        if (product) {
            document.getElementById("productId").value = product.id;
            document.getElementById("name").value = product.name;
            document.getElementById("description").value = product.description || ""; 
            document.getElementById("original_price").value = product.original_price;
            document.getElementById("offer").value = product.offer || 0;
            document.getElementById("offer_price").value = product.offer_price;
            document.getElementById("rating").value = product.rating;
            document.getElementById("category").value = product.category;
            document.getElementById("stock").value = product.stock;
            document.getElementById("image_url").value = product.image_url;
        }
    } else {
        document.getElementById("modalTitle").innerText = "Add Product";
        productForm.reset();
        document.getElementById("productId").value = "";
        document.getElementById("description").value = "";
    }
}

function closeModal() {
    modal.style.display = "none";
    productForm.reset();
}

window.onclick = (event) => {
    if (event.target == modal) closeModal();
    if (event.target == deleteModal) {
        deleteModal.style.display = "none";
        productToDeleteId = null;
    }
};


document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("productTableBody");
    const paginationContainer = document.getElementById("paginationControls");

    const originalInput = document.getElementById("original_price");
    const percentInput = document.getElementById("offer");
    const offerPriceInput = document.getElementById("offer_price");


    function calculateOfferPrice() {
        const original = parseFloat(originalInput.value) || 0;
        const percent = parseFloat(percentInput.value) || 0;
        if (original > 0) {
            const finalPrice = original - (original * percent / 100);
            offerPriceInput.value = Math.round(finalPrice);
        } else {
            offerPriceInput.value = "";
        }
    }

    originalInput.addEventListener("input", calculateOfferPrice);
    percentInput.addEventListener("input", calculateOfferPrice);

    // Fetch products
    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            allProducts = await response.json();
            applyFilter(); 
        } catch (err) {
            console.error("Fetch error:", err);
            tableBody.innerHTML = "<tr><td colspan='9'>Error connecting to API.</td></tr>";
        }
    }


    window.renderTable = function(page, products) {
        tableBody.innerHTML = "";
        const start = (page - 1) * itemsPerPage;
        const currentItems = products.slice(start, start + itemsPerPage);

        if (currentItems.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='9' style='text-align:center;'>No products found.</td></tr>";
            return;
        }

        currentItems.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${product.image_url}" width="40" height="40" style="border-radius:5px; object-fit:cover;"></td>
                <td><strong>${product.name}</strong></td>
                <td><span class="badge">${product.category}</span></td>
                <td><b style="color:#27ae60;">₹${product.offer_price}</b></td>
                <td style="text-decoration: line-through; color: #999;">₹${product.original_price}</td>
                <td>${generateStars(product.rating)}</td>
                <td>${product.stock}</td>
                <td>
                    <button onclick="openModal(${product.id})" class="action-btn edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deleteProduct(${product.id})" class="action-btn delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        renderPagination(products);
    };

    function generateStars(rating) {
        let stars = "";
        const r = Math.round(rating || 0);
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fa-${i <= r ? 'solid' : 'regular'} fa-star" style="color:${i <= r ? '#FFD700' : '#ccc'}; font-size:12px;"></i>`;
        }
        return stars;
    }


    function renderPagination(products) {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(products.length / itemsPerPage);
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.className = (i === currentPage) ? "page-btn active" : "page-btn";
            btn.onclick = () => { currentPage = i; renderTable(currentPage, products); };
            paginationContainer.appendChild(btn);
        }
    }


    function applyFilter() {
        const name = document.getElementById("filterName").value.toLowerCase();
        const cat = document.getElementById("filterCategory").value.toLowerCase();
        const minP = Number(document.getElementById("filterMinPrice").value) || 0;
        const maxP = Number(document.getElementById("filterMaxPrice").value) || Infinity;

        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(name) && 
            p.category.toLowerCase().includes(cat) && 
            p.offer_price >= minP && p.offer_price <= maxP
        );
        currentPage = 1;
        renderTable(currentPage, filtered);
    }

    ["filterName", "filterCategory", "filterMinPrice", "filterMaxPrice"].forEach(id => {
        document.getElementById(id).addEventListener("input", applyFilter);
    });


    productForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById("productId").value;
        const productData = {
            name: document.getElementById("name").value,
            description: document.getElementById("description").value,
            original_price: document.getElementById("original_price").value,
            offer: document.getElementById("offer").value,
            offer_price: document.getElementById("offer_price").value,
            rating: document.getElementById("rating").value,
            category: document.getElementById("category").value,
            stock: document.getElementById("stock").value,
            image_url: document.getElementById("image_url").value
        };

        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}${id}/` : API_URL;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (res.ok) {
                closeModal();
                fetchProducts();
                showNotification(id ? "Product updated successfully!" : "Product added successfully!", id ? "update" : "success");
            }
        } catch (err) { console.error("Save failed:", err); }
    };


    window.deleteProduct = (id) => {
        productToDeleteId = id;
        deleteModal.style.display = "flex";
    };

    confirmDeleteBtn.onclick = async () => {
        if (!productToDeleteId) return;
        try {
            const res = await fetch(`${API_URL}${productToDeleteId}/`, { method: "DELETE" });
            if (res.ok) {
                fetchProducts();
                showNotification("Product deleted successfully!", "delete");
            }
        } catch (err) { console.error("Delete failed:", err); }
        finally {
            deleteModal.style.display = "none";
            productToDeleteId = null;
        }
    };

    cancelDeleteBtn.onclick = () => {
        deleteModal.style.display = "none";
        productToDeleteId = null;
    };


    fetchProducts();
});