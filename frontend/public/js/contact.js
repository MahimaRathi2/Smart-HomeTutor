document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".contact-form form");

  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstNameInput = contactForm.querySelector('input[placeholder="First Name"]');
    const lastNameInput = contactForm.querySelector('input[placeholder="Last Name"]');
    const emailInput = contactForm.querySelector('input[placeholder="Email Address"]');
    const subjectInput = contactForm.querySelector('input[placeholder="Subject"]');
    const messageInput = contactForm.querySelector('textarea');

    const firstName = firstNameInput ? firstNameInput.value.trim() : "";
    const lastName = lastNameInput ? lastNameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const subject = subjectInput ? subjectInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!firstName || !email || !message) {
      alert("Please fill in all required fields (First Name, Email, Message).");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, subject, message }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ " + data.message);
        contactForm.reset();
      } else {
        alert("❌ Error: " + (data.message || "Failed to submit message"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ An error occurred while sending message. Please try again.");
    }
  });
});