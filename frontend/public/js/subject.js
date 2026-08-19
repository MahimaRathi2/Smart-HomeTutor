document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("subjectSearch");
    const cards = document.querySelectorAll(".subject-grid .card");

    if (search && cards.length) {
        search.addEventListener("input", () => {
            const value = search.value.trim().toLowerCase();

            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                const matches = text.includes(value);
                // Restore native flex display when matching, hide when not matching
                card.style.display = matches ? "" : "none";
            });
        });
    }
});