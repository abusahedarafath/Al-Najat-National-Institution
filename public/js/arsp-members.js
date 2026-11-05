document.addEventListener("DOMContentLoaded", function () {
    // Smooth automatic carousel with manual mouse dragging and touch swiping
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
        const duration = loopDistance / speed;
        const durationMs = duration * 1000;

        track.style.setProperty("--arsp-distance", "-" + loopDistance + "px");
        track.style.setProperty("--arsp-duration", duration + "s");

        function getAnimation() {
            return track.getAnimations().find(animation =>
                animation.animationName === "arsp-member-marquee"
            );
        }

        let hovered = false;
        let focused = false;
        let dragging = false;
        let dragStartX = 0;
        let dragStartTime = 0;
        let activePointerId = null;
        let resumeTimer = null;

        function updatePause() {
            track.classList.toggle("is-paused", hovered || focused || dragging);
        }

        function pauseForInteraction() {
            clearTimeout(resumeTimer);
            updatePause();
        }

        function resumeAfterInteraction() {
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(updatePause, 2000);
        }

        viewport.addEventListener("mouseenter", function () {
            hovered = true;
            pauseForInteraction();
        });

        viewport.addEventListener("mouseleave", function () {
            hovered = false;
            updatePause();
        });

        viewport.addEventListener("focusin", function () {
            focused = true;
            pauseForInteraction();
        });

        viewport.addEventListener("focusout", function () {
            focused = false;
            updatePause();
        });

        viewport.addEventListener("pointerdown", function (event) {
            if (event.target.closest("a, button, input, select, textarea")) return;
            if (event.pointerType === "mouse" && event.button !== 0) return;

            const animation = getAnimation();
            if (!animation) return;

            event.preventDefault();
            pauseForInteraction();

            dragging = true;
            activePointerId = event.pointerId;
            dragStartX = event.clientX;
            dragStartTime = Number(animation.currentTime) || 0;

            updatePause();

            try {
                viewport.setPointerCapture(event.pointerId);
            } catch (_) {}
        });

        viewport.addEventListener("pointermove", function (event) {
            if (!dragging || event.pointerId !== activePointerId) return;

            const animation = getAnimation();
            if (!animation) return;

            const distance = event.clientX - dragStartX;
            const nextTime = dragStartTime - (distance / speed) * 1000;

            animation.currentTime = ((nextTime % durationMs) + durationMs) % durationMs;
        });

        function finishDragging(event) {
            if (!dragging || (event && event.pointerId !== activePointerId)) return;

            const pointerId = activePointerId;
            dragging = false;
            activePointerId = null;
            updatePause();

            if (pointerId !== null && viewport.hasPointerCapture(pointerId)) {
                viewport.releasePointerCapture(pointerId);
            }

            if (!hovered && !focused) {
                resumeAfterInteraction();
            }
        }

        viewport.addEventListener("pointerup", finishDragging);
        viewport.addEventListener("pointercancel", finishDragging);
        viewport.addEventListener("lostpointercapture", function () {
            if (!dragging) return;

            dragging = false;
            activePointerId = null;
            updatePause();

            if (!hovered && !focused) {
                resumeAfterInteraction();
            }
        });

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
