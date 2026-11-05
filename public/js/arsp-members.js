document.addEventListener("DOMContentLoaded", function () {
    // Smooth, continuous right-to-left member carousel
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

        const speed = 90; // pixels per second
        const duration = loopDistance / speed;

        track.style.setProperty("--arsp-distance", "-" + loopDistance + "px");
        track.style.setProperty("--arsp-duration", duration + "s");

        function pause() {
            track.classList.add("is-paused");
        }

        function resume() {
            track.classList.remove("is-paused");
        }

        viewport.addEventListener("mouseenter", pause);
        viewport.addEventListener("mouseleave", resume);
        viewport.addEventListener("focusin", pause);
        viewport.addEventListener("focusout", resume);

        viewport.addEventListener("touchstart", pause, { passive: true });
        viewport.addEventListener("touchend", function () {
            clearTimeout(viewport._arspTouchTimer);
            viewport._arspTouchTimer = setTimeout(resume, 1800);
        }, { passive: true });
        viewport.addEventListener("touchcancel", resume, { passive: true });
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
