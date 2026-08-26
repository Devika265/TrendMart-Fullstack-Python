document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://trendmart-backend-3o66.onrender.com/api/contact/";
    let allContacts = [];
    let currentPage = 1;
    const rowsPerPage = 8; 

    //  Fetch Data from API
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            allContacts = data;
            displayPage(1);  
        })
        .catch(error => {
            console.error("Error fetching contacts:", error);
            const tableBody = document.getElementById("contactTableBody");
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: red;">Failed to load data.</td></tr>`;
        });

    // Function to Display Specific Page
    function displayPage(page) {
        currentPage = page;
        const tableBody = document.getElementById("contactTableBody");
        tableBody.innerHTML = ""; 

        // Pagination Calculation
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedItems = allContacts.slice(start, end);

        if (paginatedItems.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No records found.</td></tr>`;
            return;
        }

        // Render Rows
        paginatedItems.forEach(contact => {
            const row = `
                <tr>
                    <td>${contact.name}</td>
                    <td>${contact.email}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.subject}</td>
                    <td>${contact.message}</td>
                    <td>${contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '---'}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        renderPaginationButtons();
    }

    //  Function to Create Pagination Buttons
    function renderPaginationButtons() {
        const paginationDiv = document.getElementById("pagination");
        if (!paginationDiv) return;  

        paginationDiv.innerHTML = "";
        const pageCount = Math.ceil(allContacts.length / rowsPerPage);

        if (pageCount <= 1) return; 

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.classList.add("page-btn");
            if (i === currentPage) btn.classList.add("active");

            btn.addEventListener("click", function () {
                displayPage(i);
                window.scrollTo(0, 0); 
            });

            paginationDiv.appendChild(btn);
        }
    }
});