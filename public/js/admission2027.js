document.addEventListener("DOMContentLoaded", () => {

    const steps = document.querySelectorAll(".wizard-step");
    const progressSteps = document.querySelectorAll(".wizard-progress .step");

    function showStep(index) {

        steps.forEach((step, i) => {
            step.style.display = (i === index) ? "block" : "none";
        });

        progressSteps.forEach((step, i) => {
            if (i <= index) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

// ==========================
// Auto-select course from URL
// ==========================

const params = new URLSearchParams(window.location.search);
const selectedCourse = params.get("course");

const courseSelect = document.getElementById("course");

if (courseSelect && selectedCourse) {
    courseSelect.value = selectedCourse;
}




    // Show first step
    showStep(0);

// ==========================
// STEP 1 Validation
// ==========================

const next1 = document.getElementById("nextStep1");

if (next1) {

    next1.addEventListener("click", () => {

        const step1 = document.getElementById("step1");

        const requiredFields = step1.querySelectorAll("[required]");

        let valid = true;

        requiredFields.forEach(field => {

            field.style.border = "";

            if (!field.value.trim()) {

                field.style.border = "2px solid red";

                valid = false;

            }

        });

        const mobile = step1.querySelector('input[name="mobile"]');

        if (mobile && mobile.value.trim() !== "") {

            const mobilePattern = /^[6-9][0-9]{9}$/;

            if (!mobilePattern.test(mobile.value.trim())) {

                mobile.style.border = "2px solid red";

                alert("Please enter a valid 10-digit Indian mobile number.");

                return;

            }

        }

        if (!valid) {

            alert("Please fill in all required fields before proceeding.");

            return;

        }

        showStep(1);

    });

}


// ==========================
// STEP 2 Validation
// ==========================

const back2 = document.getElementById("backStep2");
const next2 = document.getElementById("nextStep2");

if (back2) {
    back2.addEventListener("click", () => {
        showStep(0);
    });
}

if (next2) {

    next2.addEventListener("click", () => {

        const step2 = document.getElementById("step2");

        const requiredFields = step2.querySelectorAll("[required]");

        let valid = true;

        requiredFields.forEach(field => {

            field.style.border = "";

            if (!field.value.trim()) {

                field.style.border = "2px solid red";

                valid = false;

            }

        });

        // Passing Year Validation
        const yearField = step2.querySelector('input[name="passing_year"]');

        if (yearField && yearField.value.trim() !== "") {

            const year = parseInt(yearField.value);

            const currentYear = new Date().getFullYear();

            if (year < 2000 || year > currentYear) {

                yearField.style.border = "2px solid red";

                alert("Please enter a valid passing year.");

                return;

            }

        }

        if (!valid) {

            alert("Please complete all required academic information.");

            return;

        }

        showStep(2);

    });

}


// ==========================
// STEP 3 Validation
// ==========================

const back3 = document.getElementById("backStep3");
const next3 = document.getElementById("nextStep3");

if (back3) {
    back3.addEventListener("click", () => {
        showStep(1);
    });
}

if (next3) {

    next3.addEventListener("click", () => {

        const step3 = document.getElementById("step3");

        let valid = true;

        // Clear previous borders
        step3.querySelectorAll("input, select, textarea").forEach(field => {
            field.style.border = "";
        });

        // Course is mandatory
        const course = step3.querySelector("#course");

        if (!course.value.trim()) {
            course.style.border = "2px solid red";
            valid = false;
        }

        // If applicant is Hafiz, institution is required
        const hafiz = step3.querySelector('[name="is_hafiz"]');
        const hifzInstitution = step3.querySelector('[name="hifz_institution"]');

        if (hafiz.value === "Yes" && !hifzInstitution.value.trim()) {
            hifzInstitution.style.border = "2px solid red";
            valid = false;
        }

        // If Mishkat completed, registration number is required
        const mishkat = step3.querySelector('[name="mishkat_completed"]');
        const registration = step3.querySelector('[name="mishkat_registration"]');

        if (mishkat.value === "Yes" && !registration.value.trim()) {
            registration.style.border = "2px solid red";
            valid = false;
        }

        if (!valid) {
            alert("Please complete all required course information.");
            return;
        }

        showStep(3);

    });

}

// ==========================
// STEP 4 Validation
// ==========================

const back4 = document.getElementById("backStep4");
const next4 = document.getElementById("nextStep4");

if (back4) {
    back4.addEventListener("click", () => {
        showStep(2);
    });
}

if (next4) {

    next4.addEventListener("click", () => {

        const step4 = document.getElementById("step4");

        let valid = true;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf"
        ];

        const maxSize = 2 * 1024 * 1024; // 2 MB

        step4.querySelectorAll('input[type="file"]').forEach(fileInput => {

            fileInput.style.border = "";

            // Required files
            if (fileInput.required && fileInput.files.length === 0) {
                fileInput.style.border = "2px solid red";
                valid = false;
                return;
            }

            if (fileInput.files.length > 0) {

                const file = fileInput.files[0];

                // File type validation
                if (!allowedTypes.includes(file.type)) {
                    fileInput.style.border = "2px solid red";
                    alert(fileInput.name + " has an unsupported file type.");
                    valid = false;
                    return;
                }

                // File size validation
                if (file.size > maxSize) {
                    fileInput.style.border = "2px solid red";
                    alert(fileInput.name + " must be 2 MB or smaller.");
                    valid = false;
                    return;
                }

            }

        });

        if (!valid) {
            alert("Please upload all required documents correctly.");
            return;
        }

buildPreview();
showStep(4);
    });

}


    // ==========================
    // STEP 5
    // ==========================
    const back5 = document.getElementById("backStep5");

    if (back5) {
        back5.addEventListener("click", () => {
            showStep(3);
        });
    }

// ==========================
// STEP 5 Preview & Declaration
// ==========================

const declaration = document.getElementById("declaration");
const submitButton = document.getElementById("submitApplication");

if (declaration && submitButton) {

    declaration.addEventListener("change", function () {

        submitButton.disabled = !this.checked;

    });

}

function buildPreview() {

    const form = document.getElementById("admissionWizard");
    const preview = document.getElementById("previewContent");

    if (!form || !preview) return;

    const data = new FormData(form);

    let html = `
        <table class="preview-table">
            <thead>
                <tr>
                    <th>Field</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [key, value] of data.entries()) {

        if (value instanceof File) {

            if (value.name) {

                html += `
                    <tr>
                        <td>${key}</td>
                        <td>${value.name}</td>
                    </tr>
                `;

            }

        } else {

            html += `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                </tr>
            `;

        }

    }

    html += `
            </tbody>
        </table>
    `;

    preview.innerHTML = html;

}


});
