document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[type="file"][name="pdf"]').forEach(input => {
        input.addEventListener("change", () => {
            const file = input.files && input.files[0];

            if (file && file.type !== "application/pdf" &&
                !file.name.toLowerCase().endsWith(".pdf")) {
                alert("Please select a PDF file.");
                input.value = "";
            }
        });
    });
});
