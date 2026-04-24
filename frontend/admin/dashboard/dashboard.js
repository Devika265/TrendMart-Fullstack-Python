const BASE_URL = "http://127.0.0.1:8000";
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

        // Stats
        document.getElementById("totalProducts").innerText = statsData.total_products;
        document.getElementById("totalOrders").innerText = statsData.total_orders;
        document.getElementById("totalUsers").innerText = statsData.total_users;
        document.getElementById("totalSales").innerText = "₹" + statsData.total_sales.toLocaleString('en-IN');
        document.getElementById("monthSales").innerText = "₹" + statsData.month_sales.toLocaleString('en-IN');
        document.getElementById("monthOrders").innerText = statsData.month_orders;

        // Table
        renderOrdersTable(ordersData);

        //  Weekly Sales
        const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        const values = [0, 0, 0, 0];
        chartData.forEach(item => { if(item.week_num <= 4) values[item.week_num-1] = item.total_sales; });
        renderSalesChart(labels, values);

        // Order Status 
        renderStatusChart(statsData.status_data.map(d => d.status), statsData.status_data.map(d => d.count));

        // Top Products
        renderProductsChart(statsData.top_products.map(p => p.name), statsData.top_products.map(p => p.total_qty));

    } catch (error) { console.error("Error:", error); }
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById("recentOrdersTable");
    tableBody.innerHTML = orders.map(order => {
        const status = order.status.toLowerCase();
        const sClass = status === 'delivered' ? 'success' : (status === 'pending' ? 'pending' : 'process');
        return `<tr><td>#${order.order_number}</td><td>${order.customer}</td><td><span class="${sClass}">${order.status}</span></td></tr>`;
    }).join('');
}

function renderSalesChart(labels, data) {
    const ctx = document.getElementById("salesChart").getContext("2d");
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{ label: "Sales", data: data, backgroundColor: "#4f46e5", borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: Math.min(...data) > 45000 ? 45000 : 0 } } }
    });
}

function renderStatusChart(labels, data) {
    const ctx = document.getElementById("statusChart").getContext("2d");
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: ['#20ea4c', '#236add', '#ee0b0b', '#ffe607'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
}

function renderProductsChart(labels, data) {
    const ctx = document.getElementById("productsChart").getContext("2d");
    if (productsChart) productsChart.destroy();
    productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Sold', data: data, backgroundColor: '#3b82f6', borderRadius: 10 }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

document.addEventListener("DOMContentLoaded", initDashboard);