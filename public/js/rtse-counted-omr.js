window.initializeRtseCountedOmr = function (
    root,
    applicationId,
    options
) {
    options = options || {};

    const configuredUploadUrl =
        options.uploadUrl ||
        "/admin/rtse/counted-omr/" + applicationId;

    const configuredViewUrl =
        options.viewUrl ||
        "/admin/rtse/counted-omr/" + applicationId;

    root = root || document.querySelector(".rtse-popup-result");

    if (!root) return;

    /*
     * Super Scanner reuses the same Result Entry + Counted OMR
     * interface for continuous Result QR scanning.
     *
     * Keep one set of event listeners on the shared DOM and only
     * update the current student's endpoints on subsequent scans.
     */
    const scannerState =
        root.__rtseCountedOmrState ||
        {
            initialized: false,
            uploadUrl: configuredUploadUrl,
            viewUrl: configuredViewUrl,
            applicationId: Number(applicationId)
        };

    scannerState.uploadUrl = configuredUploadUrl;
    scannerState.viewUrl = configuredViewUrl;
    scannerState.applicationId = Number(applicationId);

    root.__rtseCountedOmrState = scannerState;

    if (scannerState.initialized) {
        const existingBox =
            root.querySelector("#rtseOmrExisting");

        const existingView =
            root.querySelector("#rtseOmrExistingView");

        if (existingBox) {
            existingBox.hidden = true;
        }

        if (existingView) {
            existingView.href = "#";
        }

        fetch(
            scannerState.viewUrl,
            {
                method: "GET",
                credentials: "same-origin"
            }
        )
        .then(function (response) {
            if (response.ok && existingBox && existingView) {
                existingView.href =
                    scannerState.viewUrl;

                existingBox.hidden = false;
            }
        })
        .catch(function () {});

        return;
    }

    scannerState.initialized = true;

    const cameraButton = root.querySelector("#rtseOmrCameraButton");
    const chooseButton = root.querySelector("#rtseOmrChooseButton");
    const cameraInput = root.querySelector("#rtseOmrCameraInput");
    const chooseInput = root.querySelector("#rtseOmrChooseInput");
    const editor = root.querySelector("#rtseOmrEditor");
    const stage = root.querySelector("#rtseOmrCropStage");
    const previewImage = root.querySelector("#rtseOmrPreviewImage");
    const cropBox = root.querySelector("#rtseOmrCropBox");
    const cropButton = root.querySelector("#rtseOmrCropButton");
    const cancelButton = root.querySelector("#rtseOmrCancelButton");
    const croppedPreview = root.querySelector("#rtseOmrCroppedPreview");
    const croppedImage = root.querySelector("#rtseOmrCroppedImage");
    const uploadButton = root.querySelector("#rtseOmrUploadButton");
    const retakeButton = root.querySelector("#rtseOmrRetakeButton");
    const uploadStatus = root.querySelector("#rtseOmrUploadStatus");
    const existingBox = root.querySelector("#rtseOmrExisting");
    const existingView = root.querySelector("#rtseOmrExistingView");

    const omrModal = root.querySelector("#rtseOmrModal");
    const omrModalCloseButtons =
        root.querySelectorAll("[data-rtse-omr-close]");

    if (
        !cameraButton || !chooseButton ||
        !cameraInput || !chooseInput ||
        !editor || !stage || !previewImage ||
        !cropBox || !cropButton || !cancelButton ||
        !croppedPreview || !croppedImage ||
        !uploadButton || !retakeButton ||
        !omrModal
    ) return;

    function openOmrModal() {
        omrModal.hidden = false;
        omrModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("rtse-omr-modal-open");
    }

    function closeOmrModal() {
        omrModal.hidden = true;
        omrModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("rtse-omr-modal-open");
    }

    omrModalCloseButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            closeOmrModal();
        });
    });

    let sourceFile = null;
    let croppedBlob = null;
    let objectUrl = null;

    let crop = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    let interaction = null;
    const MIN_CROP = 80;

    function showExisting(url) {
        if (!url) {
            existingBox.hidden = true;
            return;
        }

        existingView.href = url;
        existingBox.hidden = false;
    }

    fetch(
        scannerState.viewUrl,
        {
            method: "GET",
            credentials: "same-origin"
        }
    )
    .then(function (response) {
        if (response.ok) {
            showExisting(
                scannerState.viewUrl
            );
        }
    })
    .catch(function () {});

    cameraButton.addEventListener("click", function () {
        cameraInput.value = "";
        cameraInput.click();
    });

    chooseButton.addEventListener("click", function () {
        chooseInput.value = "";
        chooseInput.click();
    });

    cameraInput.addEventListener("change", handleFile);
    chooseInput.addEventListener("change", handleFile);

    function handleFile(event) {

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image.");
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            alert("The selected image is larger than 12 MB.");
            return;
        }

        sourceFile = file;
        croppedBlob = null;

        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }

        objectUrl = URL.createObjectURL(file);

        previewImage.onload = async function () {
            try {
                uploadStatus.textContent =
                    "Enhancing image like a scanner...";

                await createEnhancedPreview();

                
                editor.hidden = false;
                croppedPreview.hidden = true;
                openOmrModal();

                requestAnimationFrame(function () {
                    setupCropBox();
                });
                uploadStatus.textContent =
                    "Preview enhanced. Adjust the crop and continue.";
            } catch (error) {
                console.error(
                    "Counted OMR Preview Enhancement Error:",
                    error
                );

                editor.hidden = false;
                croppedPreview.hidden = true;
                openOmrModal();
                uploadStatus.textContent =
                    "Original preview loaded. Crop and continue.";
            }
        };

        previewImage.src = objectUrl;
    }

    async function createEnhancedPreview() {
        if (!previewImage.naturalWidth || !previewImage.naturalHeight) {
            return;
        }

        const maxDimension = 3200;

        let width = previewImage.naturalWidth;
        let height = previewImage.naturalHeight;

        const largest =
            Math.max(width, height);

        if (largest > maxDimension) {
            const scale =
                maxDimension / largest;

            width *= scale;
            height *= scale;
        }

        const canvas =
            document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));

        const ctx =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );

        if (!ctx) {
            throw new Error(
                "Unable to prepare the scanner preview."
            );
        }

        ctx.drawImage(
            previewImage,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const imageData =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

        const data = imageData.data;

        /*
         * Conservative scanner-style correction:
         * - gently lifts underexposed pages
         * - increases contrast slightly
         * - reduces colour cast
         * - preserves dark OMR marks
         */
        const brightness = 14;
        const contrast = 1.10;

        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            r =
                ((r - 128) * contrast) +
                128 +
                brightness;

            g =
                ((g - 128) * contrast) +
                128 +
                brightness;

            b =
                ((b - 128) * contrast) +
                128 +
                brightness;

            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;

            /*
             * Keep most original colour information,
             * while reducing colour cast slightly.
             */
            r =
                r * 0.88 +
                gray * 0.12;

            g =
                g * 0.88 +
                gray * 0.12;

            b =
                b * 0.88 +
                gray * 0.12;

            data[i] =
                Math.max(
                    0,
                    Math.min(255, r)
                );

            data[i + 1] =
                Math.max(
                    0,
                    Math.min(255, g)
                );

            data[i + 2] =
                Math.max(
                    0,
                    Math.min(255, b)
                );
        }

        ctx.putImageData(
            imageData,
            0,
            0
        );

        const enhancedUrl =
            canvas.toDataURL(
                "image/jpeg",
                0.95
            );

        previewImage.src = enhancedUrl;

        /*
         * Wait for the enhanced image to become the
         * actual displayed/natural image before crop
         * coordinates are calculated.
         */
        await new Promise(function (resolve, reject) {
            if (previewImage.complete &&
                previewImage.naturalWidth) {
                resolve();
                return;
            }

            previewImage.onload = function () {
                resolve();
            };

            previewImage.onerror = function () {
                reject(
                    new Error(
                        "Unable to load enhanced preview."
                    )
                );
            };
        });
    }

    function getImageDisplayRect() {
        const stageRect = stage.getBoundingClientRect();
        const imageRect = previewImage.getBoundingClientRect();

        return {
            left: imageRect.left - stageRect.left,
            top: imageRect.top - stageRect.top,
            width: imageRect.width,
            height: imageRect.height
        };
    }

    function setupCropBox() {
        const imageArea = getImageDisplayRect();
        const stageWidth = imageArea.width;
        const stageHeight = imageArea.height;

        if (!stageWidth || !stageHeight) return;

        const ratio = 0.7071;

        let width =
            Math.min(
                stageWidth * 0.82,
                stageHeight * ratio * 0.92
            );

        let height = width / ratio;

        if (height > stageHeight * 0.82) {
            height = stageHeight * 0.82;
            width = height * ratio;
        }

        crop.width = Math.max(MIN_CROP, width);
        crop.height = Math.max(MIN_CROP, height);

        crop.x =
            imageArea.left +
            Math.max(
                0,
                (stageWidth - crop.width) / 2
            );

        crop.y =
            imageArea.top +
            Math.max(
                0,
                (stageHeight - crop.height) / 2
            );

        renderCrop();
    }

    function renderCrop() {

        cropBox.style.left = crop.x + "px";
        cropBox.style.top = crop.y + "px";
        cropBox.style.width = crop.width + "px";
        cropBox.style.height = crop.height + "px";
    }

    function clampCrop() {
        const imageArea = getImageDisplayRect();

        const minX = imageArea.left;
        const minY = imageArea.top;

        const maxX =
            imageArea.left +
            Math.max(
                0,
                imageArea.width - crop.width
            );

        const maxY =
            imageArea.top +
            Math.max(
                0,
                imageArea.height - crop.height
            );

        crop.x =
            Math.max(
                minX,
                Math.min(crop.x, maxX)
            );

        crop.y =
            Math.max(
                minY,
                Math.min(crop.y, maxY)
            );
    }

    function pointerPosition(event) {

        const rect =
            stage.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    cropBox.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            const handle =
                event.target.closest(
                    ".rtse-omr-handle"
                );

            const point =
                pointerPosition(event);

            interaction = {
                pointerId: event.pointerId,
                startX: point.x,
                startY: point.y,
                original: {
                    x: crop.x,
                    y: crop.y,
                    width: crop.width,
                    height: crop.height
                },
                mode: handle
                    ? handle.className
                    : "move"
            };

            cropBox.setPointerCapture(
                event.pointerId
            );
        }
    );

    cropBox.addEventListener(
        "pointermove",
        function (event) {

            if (!interaction) return;

            const point =
                pointerPosition(event);

            const dx =
                point.x - interaction.startX;

            const dy =
                point.y - interaction.startY;

            const original =
                interaction.original;

            if (interaction.mode === "move") {

                crop.x = original.x + dx;
                crop.y = original.y + dy;

                clampCrop();
                renderCrop();

                return;
            }

            const ratio = 0.7071;

            let newWidth = original.width;
            let newHeight = original.height;
            let newX = original.x;
            let newY = original.y;

        if (
            interaction.mode.includes(
                "rtse-omr-handle-se"
            )
        ) {
            newWidth = original.width + dx;
            newHeight = newWidth / ratio;
        } else if (
            interaction.mode.includes(
                "rtse-omr-handle-sw"
            )
        ) {
            newWidth = original.width - dx;
            newHeight = newWidth / ratio;
            newX = original.x + dx;
        } else if (
            interaction.mode.includes(
                "rtse-omr-handle-ne"
            )
        ) {
            newWidth = original.width + dx;
            newHeight = newWidth / ratio;
            newY =
                original.y +
                original.height -
                newHeight;
        } else if (
            interaction.mode.includes(
                "rtse-omr-handle-nw"
            )
        ) {
            newWidth = original.width - dx;
            newHeight = newWidth / ratio;
            newX = original.x + dx;
            newY =
                original.y +
                original.height -
                newHeight;
        }

        if (
            newWidth < MIN_CROP ||
            newHeight < MIN_CROP
        ) return;

        const imageArea = getImageDisplayRect();

        if (
            newX < imageArea.left ||
            newY < imageArea.top ||
            newX + newWidth >
                imageArea.left + imageArea.width ||
            newY + newHeight >
                imageArea.top + imageArea.height
        ) return;

        crop.x = newX;
            crop.y = newY;
            crop.width = newWidth;
            crop.height = newHeight;

            renderCrop();
        }
    );

    cropBox.addEventListener(
        "pointerup",
        function () {
            interaction = null;
        }
    );

    cropBox.addEventListener(
        "pointercancel",
        function () {
            interaction = null;
        }
    );

    cancelButton.addEventListener(
        "click",
        function () {

            editor.hidden = true;
            croppedPreview.hidden = true;
            closeOmrModal();

            sourceFile = null;
            croppedBlob = null;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                objectUrl = null;
            }

            previewImage.removeAttribute("src");
        }
    );

    retakeButton.addEventListener(
        "click",
        function () {

            croppedPreview.hidden = true;
            editor.hidden = true;
            croppedBlob = null;

            uploadStatus.textContent = "";

            chooseInput.value = "";
            cameraInput.value = "";

            openChooser();
        }
    );

    cropButton.addEventListener(
        "click",
        async function () {

            if (
                !sourceFile ||
                !previewImage.naturalWidth
            ) return;

            cropButton.disabled = true;
            cropButton.textContent = "Processing...";

            try {

                const imageRect =
                    previewImage.getBoundingClientRect();

                const stageRect =
                    stage.getBoundingClientRect();

                const scaleX =
                    previewImage.naturalWidth /
                    imageRect.width;

                const scaleY =
                    previewImage.naturalHeight /
                    imageRect.height;

                const sourceX =
                    Math.max(
                        0,
                        (
                            crop.x +
                            stageRect.left -
                            imageRect.left
                        ) * scaleX
                    );

                const sourceY =
                    Math.max(
                        0,
                        (
                            crop.y +
                            stageRect.top -
                            imageRect.top
                        ) * scaleY
                    );

                const sourceWidth =
                    Math.min(
                        previewImage.naturalWidth -
                            sourceX,
                        crop.width * scaleX
                    );

                const sourceHeight =
                    Math.min(
                        previewImage.naturalHeight -
                            sourceY,
                        crop.height * scaleY
                    );

                if (
                    sourceWidth < 20 ||
                    sourceHeight < 20
                ) {
                    throw new Error(
                        "Crop area is too small."
                    );
                }

                const maxDimension = 2400;

                let outputWidth = sourceWidth;
                let outputHeight = sourceHeight;

                const largest =
                    Math.max(
                        outputWidth,
                        outputHeight
                    );

                if (largest > maxDimension) {

                    const scale =
                        maxDimension / largest;

                    outputWidth *= scale;
                    outputHeight *= scale;
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width =
                    Math.round(outputWidth);

                canvas.height =
                    Math.round(outputHeight);

                const ctx =
                    canvas.getContext(
                        "2d",
                        {
                            willReadFrequently: true
                        }
                    );

                ctx.drawImage(
                    previewImage,
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                /*
                 * Moderate scanner-like enhancement.
                 * OMR marks are intentionally preserved.
                 */
                const imageData =
                    ctx.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                const data = imageData.data;

                const brightness = 12;
                const contrast = 1.08;

                for (
                    let i = 0;
                    i < data.length;
                    i += 4
                ) {

                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];

                    r =
                        ((r - 128) * contrast) +
                        128 +
                        brightness;

                    g =
                        ((g - 128) * contrast) +
                        128 +
                        brightness;

                    b =
                        ((b - 128) * contrast) +
                        128 +
                        brightness;

                    const gray =
                        0.299 * r +
                        0.587 * g +
                        0.114 * b;

                    r = r * 0.90 + gray * 0.10;
                    g = g * 0.90 + gray * 0.10;
                    b = b * 0.90 + gray * 0.10;

                    data[i] =
                        Math.max(
                            0,
                            Math.min(255, r)
                        );

                    data[i + 1] =
                        Math.max(
                            0,
                            Math.min(255, g)
                        );

                    data[i + 2] =
                        Math.max(
                            0,
                            Math.min(255, b)
                        );
                }

                ctx.putImageData(
                    imageData,
                    0,
                    0
                );

                croppedBlob =
                    await new Promise(
                        function (resolve) {

                            canvas.toBlob(
                                resolve,
                                "image/jpeg",
                                0.94
                            );
                        }
                    );

                if (!croppedBlob) {
                    throw new Error(
                        "Unable to create cropped image."
                    );
                }

                croppedImage.src =
                    URL.createObjectURL(
                        croppedBlob
                    );

                editor.hidden = true;
                croppedPreview.hidden = false;

                uploadStatus.textContent =
                    "OMR is ready. Upload is optional.";

            } catch (error) {

                console.error(
                    "Counted OMR Crop Error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to crop the OMR."
                );

            } finally {

                cropButton.disabled = false;
                cropButton.textContent =
                    "✂️ Crop OMR";
            }
        }
    );

    uploadButton.addEventListener(
        "click",
        async function () {

            if (!croppedBlob) {
                alert("Please crop the OMR first.");
                return;
            }

            uploadButton.disabled = true;
            uploadButton.textContent = "Uploading...";

            uploadStatus.textContent =
                "Processing the OMR like a scanner...";

            try {

                const formData = new FormData();

                formData.append(
                    "counted_omr",
                    croppedBlob,
                    "counted-omr.jpg"
                );

                const response =
                    await fetch(
                        scannerState.uploadUrl,
                        {
                            method: "POST",
                            body: formData,
                            credentials: "same-origin",
                            headers: {
                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );

                let data = null;

                try {
                    data = await response.json();
                } catch (_) {}

                if (
                    !response.ok ||
                    !data ||
                    !data.success
                ) {
                    throw new Error(
                        data && data.message
                            ? data.message
                            : "Unable to upload the counted OMR."
                    );
                }

                const uploadedViewUrl =
                    data.countedOmr &&
                    data.countedOmr.view_url
                        ? data.countedOmr.view_url
                        : scannerState.viewUrl;

                showExisting(uploadedViewUrl);

                uploadStatus.textContent =
                    "✓ Counted OMR uploaded successfully.";

                uploadButton.textContent =
                    "✓ Uploaded";

                uploadButton.disabled = true;

                closeOmrModal();

            } catch (error) {

                console.error(
                    "Counted OMR Upload Error:",
                    error
                );

                uploadStatus.textContent =
                    error.message ||
                    "Unable to upload counted OMR.";

                uploadButton.disabled = false;
                uploadButton.textContent =
                    "⬆️ Upload Counted OMR";
            }
        }
    );

};
