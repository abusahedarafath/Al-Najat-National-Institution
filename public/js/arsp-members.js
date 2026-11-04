document.addEventListener("DOMContentLoaded", function () {
    // Circular portrait carousel
    document.querySelectorAll(".arsp-carousel-viewport").forEach(function (viewport) {
        const track = viewport.querySelector(".arsp-carousel-track");
        if (!track || track.children.length < 2) return;

        const originalCards = Array.from(track.children);
        const originalCount = originalCards.length;

        originalCards.forEach(function (card) {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            track.appendChild(clone);
        });

        let paused = false;
        let animationFrame = null;
        let lastTime = 0;
        const speed = 36;
        const loopPoint = track.scrollWidth / 2;

        // Start at the duplicated set so movement begins from the first person.

        function animate(timestamp) {
            if (!lastTime) lastTime = timestamp;

            const delta = Math.min((timestamp - lastTime) / 1000, 0.05);
            lastTime = timestamp;

            if (!paused) {
                viewport.scrollLeft += speed * delta;

                // Seamlessly jump to the matching position in the original set.
                if (viewport.scrollLeft >= loopPoint) {
                    viewport.scrollLeft -= loopPoint;
                }
            }

            animationFrame = requestAnimationFrame(animate);
        }

        viewport.addEventListener("mouseenter", function () {
            paused = true;
        });

        viewport.addEventListener("mouseleave", function () {
            paused = false;
            lastTime = 0;
        });

        viewport.addEventListener("touchstart", function () {
            paused = true;
        }, { passive: true });

        viewport.addEventListener("touchend", function () {
            setTimeout(function () {
                paused = false;
                lastTime = 0;
            }, 1800);
        }, { passive: true });

        viewport.addEventListener("focusin", function () {
            paused = true;
        });

        viewport.addEventListener("focusout", function () {
            paused = false;
            lastTime = 0;
        });

        viewport.addEventListener("wheel", function () {
            paused = true;
            clearTimeout(viewport._arspWheelTimer);
            viewport._arspWheelTimer = setTimeout(function () {
                paused = false;
                lastTime = 0;
            }, 1800);
        }, { passive: true });

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            animationFrame = requestAnimationFrame(animate);
        }

        window.addEventListener("pagehide", function () {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        }, { once: true });
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
