document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signupForm") || document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    const inputs = document.querySelectorAll("input[required]");
    let empty = false;

    inputs.forEach((input) => {
      if (input.type !== "checkbox" && input.value.trim() === "") {
        empty = true;
      }
    });

    if (empty) {
      e.preventDefault();
      alert("Please fill all required fields.");
      return;
    }

    const emailInput = document.querySelector('input[type="email"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
      e.preventDefault();
      alert("Please enter a valid email address.");
      return;
    }

    const passwords = document.querySelectorAll('input[type="password"]');
    if (passwords.length >= 2 && passwords[0].value !== passwords[1].value) {
      e.preventDefault();
      alert("Passwords do not match.");
      return;
    }
  });
});