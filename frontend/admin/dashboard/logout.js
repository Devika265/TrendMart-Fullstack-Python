function handleAdminLogout() {
    console.log("Admin logging out...");

    const confirmLogout = confirm("Are you sure you want to logout from the Admin Dashboard?");

    if (confirmLogout) {

        localStorage.clear();
        sessionStorage.clear();

        console.log("Admin session cleared successfully.");
        window.location.href = "/frontend/user/login/html/login.html";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "admin") {
        console.warn("Unauthorized access detected!");
        window.location.href = "/frontend/user/login/html/login.html";
    }
});
