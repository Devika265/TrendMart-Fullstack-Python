let allProducts = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("productTableBody");
    const modal = document.getElementById("productModal");
    const form = document.getElementById("productForm");
    const originalInput = document.getElementById("original_price");
    const percentInput = document.getElementById("offer_percent");
    const offerPriceInput = document.getElementById("offer_price");

    // FETCH
    async function fetchProducts() {
        try {
            const res = await fetch("https://trendmart-backend-3o66.onrender.com/api/products/");
            allProducts = await res.json();
            rend
            erTable(currentPage, allProducts);
        } catch (e) { console.error(e); }
    }

    //  CALCULATION 
    function calculateOffer() {
        const orig = parseFloat(originalInput.value) || 0;
        const perc = parseFloat(percentInput.value) || 0;
        if (orig > 0) {
            offerPriceInput.value = Math.round(orig - (orig * perc / 100));
        } else {
            offerPriceInput.value = "";
        }
    }
    originalInput.addEventListener("input", calculateOffer);
    percentInput.addEventListener("input", calculateOffer);

    // RENDER TABLE
    function renderTable(page, products) {
        tableBody.innerHTML = "";
        const start = (page - 1) * itemsPerPage;
        products.slice(start, start + itemsPerPage).forEach(p => {
            tableBody.innerHTML += `
                <tr>
                    <td><img src="${p.image_url}" width="40"></td>
                    <td>${p.name}</td>
                    <td>${"★".repeat(Math.round(p.rating))}</td>
                    <td><b>₹${p.offer_price}</b></td>
                    <td style="text-decoration:line-through">₹${p.original_price}</td>
                    <td>${p.category}</td>
                    <td>${p.stock}</td>
                    <td>
                        <button onclick="editProduct(${p.id})">Edit</button>
                        <button onclick="deleteProduct(${p.id})">Delete</button>
                    </td>
                </tr>`;
        });
    }

    // GLOBAL ACTIONS
    window.editProduct = (id) => {
        const p = allProducts.find(item => item.id === id);
        if (!p) return;
        document.getElementById("productId").value = p.id;
        document.getElementById("name").value = p.name;
        originalInput.value = p.original_price;
        document.getElementById("category").value = p.category;
        document.getElementById("stock").value = p.stock;
        document.getElementById("image_url").value = p.image_url;
        document.getElementById("rating").value = p.rating;
        
        
        percentInput.value = Math.round(((p.original_price - p.offer_price) / p.original_price) * 100);
        offerPriceInput.value = p.offer_price;
        modal.style.display = "flex";
    };

    window.deleteProduct = async (id) => {
        if (confirm("Delete?")) {
            await fetch(`https://trendmart-backend-3o66.onrender.com/api/products/${id}/`, { method: "DELETE" });
            fetchProducts();
        }
    };

    window.closeModal = () => { modal.style.display = "none"; form.reset(); };

    document.getElementById("addProductBtn").onclick = () => {
        form.reset();
        document.getElementById("productId").value = "";
        modal.style.display = "flex";
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById("productId").value;
        const data = {
            name: document.getElementById("name").value,
            original_price: Number(originalInput.value),
            offer_price: Number(offerPriceInput.value),
            category: document.getElementById("category").value,
            stock: Number(document.getElementById("stock").value),
            image_url: document.getElementById("image_url").value,
            rating: Number(document.getElementById("rating").value)
        };
        const method = id ? "PUT" : "POST";
        const url = id ? `https://trendmart-backend-3o66.onrender.com/api/products/${id}/` : "https://trendmart-backend-3o66.onrender.com/api/products/";
        
        await fetch(url, {
            method: method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        window.closeModal();
        fetchProducts();
    };

    fetchProducts();
});
