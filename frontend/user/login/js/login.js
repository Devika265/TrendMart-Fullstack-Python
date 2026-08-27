// GLOBAL BASE API URL
const BASE_API_URL = "https://trendmart-backend-3o66.onrender.com";

function handleLogout() {
    console.log("Logout triggered");
    
    if (confirm("Are you sure you want to logout from TrendMart?")) {
        localStorage.clear(); 
        sessionStorage.clear();
        console.log("User session cleared");
        window.location.href = "../../login/html/login.html";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePasswordIcon");
    const loginForm = document.getElementById("loginForm");

    if (toggleIcon && passwordInput) {
        toggleIcon.addEventListener("click", function () {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            localStorage.clear();
            sessionStorage.clear();

            const emailInput = document.getElementById("email");
            if (!emailInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            try {
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                const response = await fetch(`${BASE_API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("role", data.role);
                    localStorage.setItem("username", data.username);

                    if (data.user_id) {
                        localStorage.setItem("userId", data.user_id);
                    }

                    alert("Login Successful! Welcome " + data.username);

                    if (data.role === "admin") {
                        window.location.href = "../../admin/dashboard/dashboard.html";
                    } else {
                        window.location.href = "../../home/html/index.html";
                    }
                } else {
                    alert("Login Failed: " + (data.detail || "Invalid credentials"));
                }
            } catch (error) {
                console.error("Login Error:", error);
                alert("Server connection failed.");
            }
        });
    }
});