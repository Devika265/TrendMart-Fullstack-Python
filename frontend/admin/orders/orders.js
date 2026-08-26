const API_URL = "https://trendmart-backend-3o66.onrender.com/api/orders";
let allOrders = []; 
let filteredOrders = []; 
let currentPage = 1;
const rowsPerPage = 8; 

async function loadOrders() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allOrders = Array.isArray(data) ? data : (data.data || []); 
        filteredOrders = [...allOrders]; 
        displayPage(1); 
    } catch (error) {
        console.error("Load Error:", error);
    }
}

function displayPage(page) {
    currentPage = page;
    const tableBody = document.getElementById("orderTable");
    if(!tableBody) return;
    tableBody.innerHTML = "";

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = filteredOrders.slice(start, end);

    paginatedItems.forEach(order => {
        const row = document.createElement("tr");
        const statusClass = order.status ? order.status.toLowerCase() : "pending";
        
        row.innerHTML = `
            <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : '---'}</td>
            <td><strong>#${order.order_number}</strong></td>
            <td>${order.user_id || '---'}</td>
            <td>${order.customer_name || 'Guest'}</td>
            <td>₹ ${order.total_amount || 0}</td>
            <td>${order.payment_method || '---'}</td>
            <td><span id="status-span-${order.id}" class="status ${statusClass}">${order.status}</span></td>
            <td>
                <select class="order-status" onchange="updateOrder(${order.id}, this)">
                    <option value="" disabled selected>Update</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </td>
        `;
        tableBody.appendChild(row);
    });
    renderPagination(filteredOrders.length);
}

// THE FIXED ACTION LOGIC
async function updateOrder(id, selectElement) {
    const newStatus = selectElement.value;
    const statusSpan = document.getElementById(`status-span-${id}`);

    console.log(`Attempting to update Order ID: ${id} to Status: ${newStatus}`);

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            
            if (statusSpan) {
                statusSpan.innerText = newStatus;
                statusSpan.className = `status ${newStatus.toLowerCase()}`;
                console.log("UI Updated successfully");
            } else {
                console.error(`Could not find span with ID: status-span-${id}`);
            }

            const index = allOrders.findIndex(o => o.id == id);
            if (index !== -1) allOrders[index].status = newStatus;

            selectElement.selectedIndex = 0;
        } else {
            const errorText = await response.text();
            console.error("Server Error:", errorText);
            alert("Backend rejection! Database-la update aagala.");
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Server connect aagala. Check if Backend is running.");
    }
}

// Pagination & Search Logic
function renderPagination(totalItems) {
    const paginationDiv = document.getElementById("pagination");
    if(!paginationDiv) return;
    paginationDiv.innerHTML = "";
    const pageCount = Math.ceil(totalItems / rowsPerPage);
    if (pageCount <= 1) return; 

    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.className = (i === currentPage) ? "page-btn active" : "page-btn";
        btn.onclick = () => { displayPage(i); window.scrollTo(0, 0); };
        paginationDiv.appendChild(btn);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById("searchInput").value.trim().toUpperCase().replace('#', '');
    filteredOrders = allOrders.filter(order => 
        String(order.order_number).toUpperCase().includes(searchTerm) || 
        String(order.customer_name).toUpperCase().includes(searchTerm)
    );
    displayPage(1); 
}

window.onload = () => {
    loadOrders();
    const searchInput = document.getElementById("searchInput");
    if(searchInput) searchInput.addEventListener("input", handleSearch);
};