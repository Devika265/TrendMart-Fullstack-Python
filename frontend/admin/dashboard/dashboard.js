<<<<<<< HEAD
const BASE_URL = "https://trendmart-backend-3o66.onrender.com";
=======
// Dynamic Backend URL for Localhost & Live Render
const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "https://trendmart-backend-3o66.onrender.com"
    : "https://trendmart-backend-3o66.onrender.com";

>>>>>>> 535eec0
let salesChart, statusChart, productsChart;

async function initDashboard() {
    try {
        const [cardsRes, chartRes, ordersRes] = await Promise.all([
            fetch(`${BASE_URL}/api/dashboard/cards`),
            fetch(`${BASE_URL}/api/dashboard/chart`),
            fetch(`${BASE_URL}/api/dashboard/orders`)
        ]);

        const statsData = await cardsRes.json();
        const chartData = await chartRes.json();
        const ordersData = await ordersRes.json();

        // Stats Card Updates
        const elTotalProducts = document.getElementById("totalProducts");
        const elTotalOrders = document.getElementById("totalOrders");
        const elTotalUsers = document.getElementById("totalUsers");
        const elTotalSales = document.getElementById("totalSales");
        const elMonthSales = document.getElementById("monthSales");
        const elMonthOrders = document.getElementById("monthOrders");

        if (elTotalProducts) elTotalProducts.innerText = statsData.total_products ?? 0;
        if (elTotalOrders) elTotalOrders.innerText = statsData.total_orders ?? 0;
        if (elTotalUsers) elTotalUsers.innerText = statsData.total_users ?? 0;
        if (elTotalSales) elTotalSales.innerText = "₹" + (statsData.total_sales ?? 0).toLocaleString('en-IN');
        if (elMonthSales) elMonthSales.innerText = "₹" + (statsData.month_sales ?? 0).toLocaleString('en-IN');
        if (elMonthOrders) elMonthOrders.innerText = statsData.month_orders ?? 0;

        // Table
        if (Array.isArray(ordersData)) {
            renderOrdersTable(ordersData);
        }

        // Weekly Sales
        const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        const values = [0, 0, 0, 0];
        if (Array.isArray(chartData)) {
            chartData.forEach(item => { 
                if (item.week_num <= 4) values[item.week_num - 1] = item.total_sales; 
            });
        }
        renderSalesChart(labels, values);

        // Order Status
        if (statsData.status_data && Array.isArray(statsData.status_data)) {
            renderStatusChart(
                statsData.status_data.map(d => d.status), 
                statsData.status_data.map(d => d.count)
            );
        }

        // Top Products
        if (statsData.top_products && Array.isArray(statsData.top_products)) {
            renderProductsChart(
                statsData.top_products.map(p => p.name), 
                statsData.top_products.map(p => p.total_qty)
            );
        }

    } catch (error) { 
        console.error("Dashboard Init Error:", error); 
    }
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById("recentOrdersTable");
    if (!tableBody) return;

    tableBody.innerHTML = orders.map(order => {
        const status = (order.status || "").toLowerCase();
        const sClass = status === 'delivered' ? 'success' : (status === 'pending' ? 'pending' : 'process');
        return `<tr>
            <td>#${order.order_number || order.id || ''}</td>
            <td>${order.customer || order.user_email || 'Customer'}</td>
            <td><span class="${sClass}">${order.status || 'Pending'}</span></td>
        </tr>`;
    }).join('');
}

function renderSalesChart(labels, data) {
    const chartElem = document.getElementById("salesChart");
    if (!chartElem) return;
    const ctx = chartElem.getContext("2d");
    if (salesChart) salesChart.destroy();

    const minVal = data.length > 0 ? Math.min(...data) : 0;
    salesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{ label: "Sales", data: data, backgroundColor: "#4f46e5", borderRadius: 8 }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { y: { min: minVal > 45000 ? 45000 : 0 } } 
        }
    });
}

function renderStatusChart(labels, data) {
    const chartElem = document.getElementById("statusChart");
    if (!chartElem) return;
    const ctx = chartElem.getContext("2d");
    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: ['#20ea4c', '#236add', '#ee0b0b', '#ffe607'], borderWidth: 0 }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '70%', 
            plugins: { legend: { position: 'bottom' } } 
        }
    });
}

function renderProductsChart(labels, data) {
    const chartElem = document.getElementById("productsChart");
    if (!chartElem) return;
    const ctx = chartElem.getContext("2d");
    if (productsChart) productsChart.destroy();

    productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Sold', data: data, backgroundColor: '#3b82f6', borderRadius: 10 }]
        },
        options: { 
            indexAxis: 'y', 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } } 
        }
    });
}

document.addEventListener("DOMContentLoaded", initDashboard);
