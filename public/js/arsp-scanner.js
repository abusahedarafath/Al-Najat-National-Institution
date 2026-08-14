(function () {

    const openButton =
        document.getElementById("openArspScanner");

    const closeButton =
        document.getElementById("closeArspScanner");

    const modal =
        document.getElementById("arspScannerModal");

    const status =
        document.getElementById("arspScannerStatus");

    const result =
        document.getElementById("arspScannerResult");

    const manualInput =
        document.getElementById("arspManualQr");

    const manualButton =
        document.getElementById("arspManualVerify");

    if (!openButton || !modal) return;

    let scanner = null;
    let scannerRunning = false;
    let processing = false;


    function showResult(data) {

        result.className =
            "arsp-scanner-result " +
            (data.valid ? "valid" : "invalid");

        let html = `
            <div class="scanner-result-title">
                ${data.valid ? "✓ VALID" : "✕ INVALID"}
            </div>

            <div class="scanner-result-message">
                ${data.message || ""}
            </div>
        `;

        if (data.member) {

            html += `
                <div class="scanner-member">
                    <strong>
                        ${data.member.full_name || ""}
                    </strong>

                    <span>
                        ${data.member.member_id || ""}
                    </span>
                </div>
            `;
        }

        if (data.document_number) {

            html += `
                <div class="scanner-document">
                    Document:
                    ${data.document_number}
                </div>
            `;
        }

        result.innerHTML = html;
    }


    async function verify(value) {

        if (!value || processing) return;

        processing = true;

        status.textContent =
            "Verifying QR code...";

        result.innerHTML = "";
        result.className =
            "arsp-scanner-result";


        try {

            const response = await fetch(
                "/arsp/scanner/verify",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        value: value
                    })
                }
            );

            const data =
                await response.json();

            showResult(data);

        } catch (error) {

            result.className =
                "arsp-scanner-result invalid";

            result.innerHTML = `
                <div class="scanner-result-title">
                    ✕ ERROR
                </div>

                <div class="scanner-result-message">
                    Unable to contact the verification server.
                </div>
            `;

        } finally {

            processing = false;

            status.textContent =
                "Ready to scan another QR code.";
        }
    }


    async function startScanner() {

        if (scannerRunning) return;

        status.textContent =
            "Starting camera...";

        scanner =
            new Html5Qrcode("arspQrReader");

        try {

            await scanner.start(
                {
                    facingMode: "environment"
                },

                {
                    fps: 10,

                    qrbox: {
                        width: 250,
                        height: 250
                    }
                },

                function (decodedText) {

                    verify(decodedText);

                },

                function () {
                    // Normal scan failures are ignored.
                }
            );

            scannerRunning = true;

            status.textContent =
                "Point the camera at an ARSP QR code.";

        } catch (error) {

            console.error(
                "ARSP scanner error:",
                error
            );

            status.textContent =
                "Camera unavailable. Use the manual verification field below.";
        }
    }


    async function stopScanner() {

        if (!scanner || !scannerRunning)
            return;

        try {

            await scanner.stop();

            scanner.clear();

        } catch (error) {

            console.error(
                "Scanner stop error:",
                error
            );
        }

        scannerRunning = false;
        scanner = null;
    }


    openButton.addEventListener(
        "click",
        function () {

            modal.classList.add("open");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

            startScanner();
        }
    );


    closeButton.addEventListener(
        "click",
        async function () {

            await stopScanner();

            modal.classList.remove("open");

            modal.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    );


    modal.addEventListener(
        "click",
        async function (event) {

            if (event.target === modal) {

                await stopScanner();

                modal.classList.remove("open");

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }
        }
    );


    manualButton.addEventListener(
        "click",
        function () {

            verify(
                manualInput.value.trim()
            );
        }
    );


    manualInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                verify(
                    manualInput.value.trim()
                );
            }
        }
    );


})();
