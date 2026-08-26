let allSubscribers = [];
let currentPage = 1;
const rowsPerPage = 8;

// ===========================
// LOAD ALL SUBSCRIBERS
// ===========================
async function loadSubscribers() {
    try {
        const response = await fetch("https://trendmart-backend-3o66.onrender.com/api/subscribers/");
        allSubscribers = await response.json();
        displayPage(1);
    } catch (error) {
        console.error("Error loading subscribers:", error);
    }
}

// ===========================
// DISPLAY TABLE DATA
// ===========================
function displayPage(page) {
    currentPage = page;
    const table = document.getElementById("subscriberTable");
    table.innerHTML = "";

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = allSubscribers.slice(start, end);

    if (paginatedItems.length === 0) {
        table.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:20px;">
            No subscribers found
            </td>
        </tr>`;
        return;
    }

    paginatedItems.forEach(sub => {
        const statusText = sub.status === "subscribed" ? "Subscribed" : "Unsubscribed";

        table.innerHTML += `
        <tr>
            <td>${sub.user_id || "-"}</td>
            <td>${sub.username}
            <td>${sub.email}</td>
            <td>${new Date(sub.subscribed_at).toLocaleDateString()}</td>
            <td>${statusText}</td>
            <td>
                <button class="btn-delete" onclick="deleteSubscriber('${encodeURIComponent(sub.email)}')">
                Delete
                </button>
            </td>
        </tr>`;
    });

    renderPaginationButtons();
}

// ===========================
// PAGINATION BUTTONS
// ===========================
function renderPaginationButtons() {
    const paginationDiv = document.getElementById("pagination");
    if (!paginationDiv) return;

    paginationDiv.innerHTML = "";
    const pageCount = Math.ceil(allSubscribers.length / rowsPerPage);
    if (pageCount <= 1) return;

    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
        btn.onclick = () => {
            displayPage(i);
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
        paginationDiv.appendChild(btn);
    }
}

// ===========================
// DELETE SUBSCRIBER
// ===========================
async function deleteSubscriber(email) {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
        const response = await fetch(
            `https://trendmart-backend-3o66.onrender.com/api/subscribers/${email}`,
            { method: "DELETE" }
        );

        if (response.ok) {
            allSubscribers = allSubscribers.filter(sub => sub.email !== decodeURIComponent(email));
            const pageCount = Math.ceil(allSubscribers.length / rowsPerPage);
            if (currentPage > pageCount) currentPage = pageCount;
            displayPage(currentPage || 1);
        } else {
            console.error("Delete failed:", await response.text());
        }

    } catch (error) {
        console.error("Delete failed:", error);
    }
}

// ===========================
// INITIAL LOAD
// ===========================
loadSubscribers();