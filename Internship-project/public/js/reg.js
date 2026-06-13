document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");

    if (!signupForm) return;

    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        // Password match validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Mark registration as pending
        localStorage.setItem("continueRegistration", "true");

        // Redirect to home page
        window.location.href = "/";
    });

    const inputs = document.querySelectorAll("input[required]");

    inputs.forEach(input => {
        input.addEventListener("blur", function () {
            if (this.value.trim() === "") {
                this.style.borderColor = "#ff4444";
            } else {
                this.style.borderColor = "var(--light-gray)";
            }
        });

        input.addEventListener("input", function () {
            if (this.value.trim() !== "") {
                this.style.borderColor = "var(--light-gray)";
            }
        });
    });
});
      // Hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        const menuOverlay = document.getElementById('menuOverlay');

        hamburger.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
        });

        menuOverlay.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });

        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 768 && this.parentElement.classList.contains('nav-item')) {
                    return;
                }
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Mobile dropdown toggle
        if (window.innerWidth <= 768) {
            const navItem = document.querySelector('.nav-item');
            if (navItem) {
                const navItemLink = navItem.querySelector('a');
                navItemLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    navItem.classList.toggle('mobile-active');
                });
            }
        }

        // Clone right buttons into mobile menu
        const navRight = document.querySelector('.nav-right');
        if (navRight && window.innerWidth <= 768) {
            const registerBtn = navRight.querySelector('.register-btn-header');
            const loginBtn = navRight.querySelector('.login-btn');
            if (registerBtn && loginBtn) {
                const registerClone = registerBtn.cloneNode(true);
                const loginClone = loginBtn.cloneNode(true);
                navMenu.appendChild(registerClone);
                navMenu.appendChild(loginClone);
            }
        }