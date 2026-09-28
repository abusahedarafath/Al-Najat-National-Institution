document.addEventListener("DOMContentLoaded", () => {
    // Validate uploaded PYQ PDF files.
    document.querySelectorAll('input[type="file"][name="pdf"]').forEach(input => {
        input.addEventListener("change", () => {
            const file = input.files && input.files[0];

            if (
                file &&
                file.type !== "application/pdf" &&
                !file.name.toLowerCase().endsWith(".pdf")
            ) {
                alert("Please select a PDF file.");
                input.value = "";
            }
        });
    });

    const openModal = modal => {
        if (!modal) return;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("rtse-pyq-modal-lock");

        const firstField = modal.querySelector(
            "input:not([type='hidden']), select, textarea"
        );

        if (firstField) {
            setTimeout(() => firstField.focus(), 50);
        }
    };

    const closeModal = modal => {
        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        if (!document.querySelector(".rtse-pyq-modal.is-open")) {
            document.body.classList.remove("rtse-pyq-modal-lock");
        }
    };

    // Open popup buttons.
    document.querySelectorAll(".rtse-pyq-modal-open").forEach(button => {
        button.addEventListener("click", () => {
            const modalId = button.dataset.modalTarget;
            const modal = document.getElementById(modalId);

            openModal(modal);
        });
    });

    // Close buttons and backdrop.
    document.querySelectorAll(".rtse-pyq-modal-close").forEach(button => {
        button.addEventListener("click", () => {
            closeModal(button.closest(".rtse-pyq-modal"));
        });
    });

    // Close with Escape.
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;

        const modal = document.querySelector(".rtse-pyq-modal.is-open");

        if (modal) {
            closeModal(modal);
        }
    });
});
