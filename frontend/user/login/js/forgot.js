const PasswordReset = {
    API_URL: 'https://trendmart-backend-3o66.onrender.com/api/auth/forgot-password',

    init() {
        this.form = document.getElementById('forgotPasswordForm');
        this.passwordInput = document.getElementById('newPassword');
        
        this.toggleIcon = document.getElementById('togglePasswordIcon'); 

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleReset(e));
        }

        // Eye icon 
        if (this.toggleIcon) {
            this.toggleIcon.style.cursor = "pointer";
            this.toggleIcon.addEventListener('click', () => this.togglePasswordVisibility());
        }
    },

    togglePasswordVisibility() {
        
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        this.toggleIcon.classList.toggle('fa-eye');
        this.toggleIcon.classList.toggle('fa-eye-slash');
    },

    async handleReset(event) {
        event.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        const newPassword = this.passwordInput.value;

        
        if (newPassword.length < 5) {
            alert("Security Alert: Use at least 6 characters.");
            return;
        }

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, new_password: newPassword })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Success! Password updated.");
                window.location.href = "login.html";
            } else {
                alert(result.detail || "Reset failed.");
            }
        } catch (error) {
            alert("Server connection failed.");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => PasswordReset.init());