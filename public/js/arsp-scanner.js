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


    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showResult(data) {
        /*
         * RTSE PUBLIC RESULT
         * -----------------
         * Dedicated public presentation for a published RTSE result.
         */
        if (data.type === "rtse_result") {
            if (data.valid && data.result) {
                const student = data.result;
                const rank = Number(student.overall_rank);

                const rankText =
                    Number.isFinite(rank) && rank > 0
                        ? `Rank ${escapeHtml(rank)}`
                        : "Result Verified";

                result.className =
                    "arsp-scanner-result rtse-scanner-result valid";

                result.innerHTML = `
                    <div class="rtse-scanner-congratulations">

                        <div class="rtse-scanner-confetti">
                            🎉
                        </div>

                        <div class="rtse-scanner-success-title">
                            Congratulations!
                        </div>

                        <div class="rtse-scanner-success-subtitle">
                            RTSE 2026 Result Verified
                        </div>

                        <div class="rtse-scanner-student-name">
                            ${escapeHtml(
                                student.full_name || "Student"
                            )}
                        </div>

                        <div class="rtse-scanner-rank">
                            🏆 ${rankText}
                        </div>

                        <div class="rtse-scanner-details">

                            <div>
                                <span>Class</span>
                                <strong>
                                    ${escapeHtml(
                                        student.class || "—"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Section</span>
                                <strong>
                                    ${escapeHtml(
                                        student.section || "—"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Year</span>
                                <strong>
                                    ${escapeHtml(
                                        student.application_year || "2026"
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div class="rtse-scanner-verified">
                            ✓ Official ARSP QR Verification
                        </div>

                    </div>
                `;

                return;
            }

            result.className =
                "arsp-scanner-result rtse-scanner-result invalid";

            result.innerHTML = `
                <div class="rtse-scanner-invalid">

                    <div class="rtse-scanner-invalid-icon">
                        !
                    </div>

                    <div class="rtse-scanner-invalid-title">
                        RTSE Result Unavailable
                    </div>

                    <div class="rtse-scanner-invalid-message">
                        ${escapeHtml(
                            data.message ||
                            "This RTSE result could not be verified."
                        )}
                    </div>

                </div>
            `;

            return;
        }

        /*
         * Existing ARSP scanner result handling.
         * Member, Appointment and Tiranga responses remain supported.
         */
        result.className =
            "arsp-scanner-result " +
            (data.valid ? "valid" : "invalid");

        let html = `
            <div class="scanner-result-title">
                ${data.valid ? "✓ VALID" : "✕ INVALID"}
            </div>

            <div class="scanner-result-message">
                ${escapeHtml(data.message || "")}
            </div>
        `;

        if (data.member) {
            html += `
                <div class="scanner-member">
                    <strong>
                        ${escapeHtml(data.member.full_name || "")}
                    </strong>

                    <span>
                        ${escapeHtml(data.member.member_id || "")}
                    </span>
                </div>
            `;
        }

        if (data.document_number) {
            html += `
                <div class="scanner-document">
                    Document:
                    ${escapeHtml(data.document_number)}
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
