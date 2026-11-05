document.addEventListener("DOMContentLoaded", function () {
    // Native horizontal ARSP carousel with automatic movement
    document.querySelectorAll(".arsp-carousel-viewport").forEach(function (viewport) {
        const track = viewport.querySelector(".arsp-carousel-track");
        if (!track || track.children.length < 2) return;

        const originalCards = Array.from(track.children);
        const originalWidth = track.scrollWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const loopDistance = originalWidth + gap;

        originalCards.forEach(function (card) {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
            clone.querySelectorAll("a, button, input, select, textarea").forEach(el => {
                el.setAttribute("tabindex", "-1");
            });
            track.appendChild(clone);
        });

        const speed = 90;
        const dragSensitivity = 2.5;

        let hovered = false;
        let focused = false;
        let touchActive = false;
        let dragging = false;
        let activePointerId = null;
        let dragStartX = 0;
        let dragStartScroll = 0;
        let lastFrame = 0;

        function isPaused() {
            return hovered || focused || touchActive || dragging;
        }

        function normalizeScroll() {
            if (loopDistance > 0 && viewport.scrollLeft >= loopDistance) {
                viewport.scrollLeft = viewport.scrollLeft % loopDistance;
            }
        }

        function animate(timestamp) {
            if (!lastFrame) lastFrame = timestamp;

            if (!isPaused() && document.visibilityState !== "hidden") {
                const elapsed = Math.min(timestamp - lastFrame, 50);
                viewport.scrollLeft += speed * elapsed / 1000;
                normalizeScroll();
            }

            lastFrame = timestamp;
            requestAnimationFrame(animate);
        }

        viewport.addEventListener("pointerenter", function (event) {
            if (event.pointerType !== "mouse") return;
            hovered = true;
        });

        viewport.addEventListener("pointerleave", function (event) {
            if (event.pointerType !== "mouse") return;
            hovered = false;
        });

        viewport.addEventListener("focusin", function () {
            focused = true;
        });

        viewport.addEventListener("focusout", function (event) {
            if (!viewport.contains(event.relatedTarget)) focused = false;
        });

        viewport.addEventListener("touchstart", function () {
            touchActive = true;
        }, { passive: true });

        viewport.addEventListener("touchend", function () {
            touchActive = false;
        }, { passive: true });

        viewport.addEventListener("touchcancel", function () {
            touchActive = false;
        }, { passive: true });

        viewport.addEventListener("pointerdown", function (event) {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            if (event.target.closest("a, button, input, select, textarea")) return;

            dragging = true;
            activePointerId = event.pointerId;
            dragStartX = event.clientX;
            dragStartScroll = viewport.scrollLeft;

            try {
                viewport.setPointerCapture(event.pointerId);
            } catch (_) {}
        });

        viewport.addEventListener("pointermove", function (event) {
            if (!dragging || event.pointerId !== activePointerId) return;

            const distance = event.clientX - dragStartX;
            viewport.scrollLeft = dragStartScroll - distance * dragSensitivity;
        });

        function finishDragging(event) {
            if (!dragging || (event && event.pointerId !== activePointerId)) return;

            const pointerId = activePointerId;
            dragging = false;
            activePointerId = null;
            normalizeScroll();

            if (pointerId !== null && viewport.hasPointerCapture(pointerId)) {
                viewport.releasePointerCapture(pointerId);
            }
        }

        viewport.addEventListener("pointerup", finishDragging);
        viewport.addEventListener("pointercancel", finishDragging);
        viewport.addEventListener("lostpointercapture", function () {
            dragging = false;
            activePointerId = null;
        });

        requestAnimationFrame(animate);
    });

    // Responsive expandable compact member grid
    document.querySelectorAll(".arsp-design-compact_grid").forEach(function (section) {
        const grid = section.querySelector(".arsp-member-grid");
        const button = section.querySelector(".arsp-grid-toggle");
        if (!grid) return;

        const cards = Array.from(grid.children);
        let expanded = false;
        let resizeTimer;

        function updateGrid() {
            const columns = Math.max(
                1,
                getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length
            );

            const visibleCount = columns * 2;

            cards.forEach(function (card, index) {
                card.hidden = !expanded && index >= visibleCount;
            });

            const hasMore = cards.length > visibleCount;

            if (button) {
                button.hidden = !hasMore;
                button.textContent = expanded ? "Show Less" : "See All";
                button.setAttribute("aria-expanded", String(expanded));
            }
        }

        if (button) {
            button.addEventListener("click", function () {
                expanded = !expanded;
                updateGrid();
            });
        }

        updateGrid();

        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateGrid, 150);
        });
    });
});
