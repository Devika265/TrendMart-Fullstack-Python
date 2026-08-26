const UserAuth = {
    
    API_URL: 'http://127.0.0.1:8000/api/auth/register',
    HOME_PAGE: '../../home/html/index.html',

    init() {
        this.signupForm = document.getElementById('signupForm');
        this.passwordInput = document.getElementById('password');
        this.toggleIcon = document.getElementById('toggleSignupPassword');

        if (this.signupForm) {
            this.setupEventListeners();
        }
    },

    setupEventListeners() {
        
        if (this.toggleIcon) {
            this.toggleIcon.addEventListener('click', () => this.handlePasswordToggle());
        }

        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    },

    handlePasswordToggle() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        
        this.toggleIcon.classList.toggle('fa-eye');
        this.toggleIcon.classList.toggle('fa-eye-slash');
    },

    async handleSignup(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = this.passwordInput.value;

        // Validation
        if (!name || !email || !password) {
            alert("All fields are required!");
            return;
        }

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                
                this.persistSession(result, name);
                
                alert("Registration Successful!");
                
                setTimeout(() => {
                    window.location.href = this.HOME_PAGE;
                }, 1000);
            } else {
                alert(result.detail || "Signup failed.");
            }

        } catch (error) {
            alert("Could not connect to FastAPI server.");
        }
    },

// save local storage

    persistSession(data, fallbackName) {
        
        localStorage.setItem('role', 'customer');
        localStorage.setItem('username', fallbackName);
        
        
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => UserAuth.init());