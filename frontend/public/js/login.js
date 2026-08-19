// Quick fill demo accounts function for testing role-based authentication
function quickFillDemo(role, email, password) {
  const radioBtn = document.querySelector(`input[name="role"][value="${role}"]`);
  if (radioBtn) {
    radioBtn.checked = true;
  }

  const emailInput = document.getElementById("emailInput") || document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById("passwordInput") || document.querySelector('input[type="password"]');

  if (emailInput) emailInput.value = email;
  if (passwordInput) passwordInput.value = password;

  if (typeof showToast === "function") {
    showToast(`Selected ${role.toUpperCase()} role panel with demo credentials.`);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm") || document.querySelector("form");

  const urlParams = new URLSearchParams(window.location.search);
  const registeredRole = urlParams.get("registeredRole") || localStorage.getItem("userRole") || "student";

  if (registeredRole) {
    const targetRole = registeredRole.toLowerCase();
    const radioBtn = document.querySelector(`input[name="role"][value="${targetRole}"]`);
    if (radioBtn) {
      radioBtn.checked = true;
    }
  }

  const savedEmail = localStorage.getItem("userEmail");
  const emailInput = document.getElementById("emailInput") || document.querySelector('input[type="email"]');
  if (savedEmail && emailInput && !emailInput.value) {
    emailInput.value = savedEmail;
  }

  if (!form) return;

  form.addEventListener("submit", function (e) {
    const selectedRole = document.querySelector('input[name="role"]:checked');
    const email = document.getElementById("emailInput") || document.querySelector('input[type="email"]');
    const password = document.getElementById("passwordInput") || document.querySelector('input[type="password"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!selectedRole) {
      e.preventDefault();
      alert("Please select your account panel role (Student, Tutor, Parent, or Admin) before signing in.");
      return;
    }

    if (!email || !password || email.value.trim() === "" || password.value.trim() === "") {
      e.preventDefault();
      alert("Please fill in both email and password.");
      return;
    }

    if (!emailRegex.test(email.value.trim())) {
      e.preventDefault();
      alert("Please enter a valid email address.");
      return;
    }

    localStorage.setItem("userEmail", email.value.trim());
    localStorage.setItem("userRole", selectedRole.value);
  });

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function () {
      const selectedRole = document.querySelector('input[name="role"]:checked');
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput && emailInput.value) {
        localStorage.setItem("userEmail", emailInput.value.trim());
      }
      if (selectedRole) {
        localStorage.setItem("userRole", selectedRole.value);
      }
    });
  }
});
