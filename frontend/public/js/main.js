// Highlight current page automatically
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll("nav a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// Show / Hide Password Eye Toggle
window.togglePasswordVisibility = function (inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
};

// Newsletter Form Handler
document.addEventListener("DOMContentLoaded", () => {
    const newsletterForms = document.querySelectorAll("form.newsletter");
    newsletterForms.forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : "";
            if (!email) {
                alert("Please enter a valid email address.");
                return;
            }
            try {
                const response = await fetch("/api/newsletter/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json();
                if (data.success) {
                    alert("✅ " + data.message);
                    form.reset();
                } else {
                    alert("❌ " + data.message);
                }
            } catch (err) {
                console.error(err);
                alert("❌ Newsletter subscription failed. Please try again.");
            }
        });
    });
});