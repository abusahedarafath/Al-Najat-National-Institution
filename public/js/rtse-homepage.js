document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".rtse-service-card, .rtse-feature-card").forEach(function (card) {
        card.addEventListener("pointerdown", function () {
            card.classList.add("rtse-card-pressed");
        });

        card.addEventListener("pointerup", function () {
            card.classList.remove("rtse-card-pressed");
        });
    });
});
