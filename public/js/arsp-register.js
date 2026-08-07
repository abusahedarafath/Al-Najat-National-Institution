document.addEventListener("DOMContentLoaded", () => {

    const identityType = document.querySelector(
        'select[name="identity_type"]'
    );

    const identityNumber = document.querySelector(
        'input[name="identity_number"]'
    );

    const identityLabel =
        identityNumber
            .closest(".form-group")
            .querySelector("label");

    function updateIdentityField() {

        const type = identityType.value;

        switch(type){

            case "Aadhaar":

                identityLabel.innerHTML =
                    'Aadhaar Number <span class="required">*</span>';

                identityNumber.placeholder =
                    "Enter 12-digit Aadhaar Number";

                identityNumber.maxLength = 12;

                break;

            case "PAN":

                identityLabel.innerHTML =
                    'PAN Number <span class="required">*</span>';

                identityNumber.placeholder =
                    "ABCDE1234F";

                identityNumber.maxLength = 10;

                break;

            case "Passport":

                identityLabel.innerHTML =
                    'Passport Number <span class="required">*</span>';

                identityNumber.placeholder =
                    "Passport Number";

                identityNumber.maxLength = 12;

                break;

            case "Driving Licence":

                identityLabel.innerHTML =
                    'Driving Licence Number <span class="required">*</span>';

                identityNumber.placeholder =
                    "Driving Licence Number";

                identityNumber.maxLength = 20;

                break;

            case "Voter ID":

                identityLabel.innerHTML =
                    'Voter ID Number <span class="required">*</span>';

                identityNumber.placeholder =
                    "Voter ID Number";

                identityNumber.maxLength = 20;

                break;

            case "Bank Passbook":

                identityLabel.innerHTML =
                    'Bank Account Number <span class="required">*</span>';

                identityNumber.placeholder =
                    "Bank Account Number";

                identityNumber.maxLength = 20;

                break;

            default:

                identityLabel.innerHTML =
                    'Identity Number <span class="required">*</span>';

                identityNumber.placeholder = "";

                identityNumber.maxLength = 50;

        }

    }

    identityType.addEventListener(
        "change",
        updateIdentityField
    );

    updateIdentityField();

});
