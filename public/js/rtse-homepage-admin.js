
(function () {
    "use strict";

    function renumber(list, prefix) {
        const items = list.querySelectorAll(".rtse-repeat-item");

        items.forEach((item, index) => {
            const title = item.querySelector(".rtse-repeat-top strong");
            if (title) {
                const label = prefix === "service"
                    ? "Service "
                    : prefix === "card"
                        ? "Card "
                        : prefix === "step"
                            ? "Step "
                            : "Question ";

                title.textContent = label + (index + 1);
            }

            item.querySelectorAll("[name]").forEach(input => {
                const match = input.name.match(/^[a-z]+_\d+_(.+)$/);

                if (match) {
                    input.name = prefix + "_" + index + "_" + match[1];
                }
            });
        });
    }

    function addItem(list, prefix, html) {
        list.insertAdjacentHTML("beforeend", html);
        renumber(list, prefix);
    }

    document.addEventListener("click", function (event) {
        const remove = event.target.closest("[data-remove-item]");

        if (remove) {
            const item = remove.closest(".rtse-repeat-item");
            const list = item && item.parentElement;

            if (item && list) {
                item.remove();

                const firstInput = list.querySelector("[name]");

                if (firstInput) {
                    const match = firstInput.name.match(/^([a-z]+)_/);
                    if (match) renumber(list, match[1]);
                }
            }

            return;
        }

        const addService = event.target.closest("[data-add-service]");
        if (addService) {
            const list = addService.previousElementSibling;

            addItem(list, "service", `
                <div class="rtse-repeat-item">
                    <div class="rtse-repeat-top">
                        <strong>Service</strong>
                        <button type="button" class="rtse-remove" data-remove-item>Remove</button>
                    </div>
                    <div class="rtse-basic-grid">
                        <label class="rtse-field">
                            <span>Icon</span>
                            <input type="text" placeholder="📝">
                        </label>
                        <label class="rtse-field">
                            <span>Service Name</span>
                            <input type="text" placeholder="New Service">
                        </label>
                    </div>
                    <label class="rtse-field">
                        <span>Description</span>
                        <input type="text" placeholder="Short description">
                    </label>
                    <label class="rtse-field">
                        <span>Link</span>
                        <input type="text" placeholder="/rtse/">
                    </label>
                </div>
            `);
            return;
        }

        const addCard = event.target.closest("[data-add-card]");
        if (addCard) {
            const list = addCard.previousElementSibling;

            addItem(list, "card", `
                <div class="rtse-repeat-item">
                    <div class="rtse-repeat-top">
                        <strong>Card</strong>
                        <button type="button" class="rtse-remove" data-remove-item>Remove</button>
                    </div>
                    <label class="rtse-field">
                        <span>Card Title</span>
                        <input type="text" placeholder="New Card">
                    </label>
                    <label class="rtse-field">
                        <span>Description</span>
                        <textarea rows="3" placeholder="Describe this benefit..."></textarea>
                    </label>
                </div>
            `);
            return;
        }

        const addStep = event.target.closest("[data-add-step]");
        if (addStep) {
            const list = addStep.previousElementSibling;

            addItem(list, "step", `
                <div class="rtse-repeat-item">
                    <div class="rtse-repeat-top">
                        <strong>Step</strong>
                        <button type="button" class="rtse-remove" data-remove-item>Remove</button>
                    </div>
                    <div class="rtse-basic-grid">
                        <label class="rtse-field">
                            <span>Step Number</span>
                            <input type="text" placeholder="01">
                        </label>
                        <label class="rtse-field">
                            <span>Step Title</span>
                            <input type="text" placeholder="New Step">
                        </label>
                    </div>
                    <label class="rtse-field">
                        <span>Description</span>
                        <textarea rows="3" placeholder="Describe this step..."></textarea>
                    </label>
                </div>
            `);
            return;
        }

        const addFaq = event.target.closest("[data-add-faq]");
        if (addFaq) {
            const list = addFaq.previousElementSibling;

            addItem(list, "faq", `
                <div class="rtse-repeat-item">
                    <div class="rtse-repeat-top">
                        <strong>Question</strong>
                        <button type="button" class="rtse-remove" data-remove-item>Remove</button>
                    </div>
                    <label class="rtse-field">
                        <span>Question</span>
                        <input type="text" placeholder="Ask a question...">
                    </label>
                    <label class="rtse-field">
                        <span>Answer</span>
                        <textarea rows="4" placeholder="Write the answer..."></textarea>
                    </label>
                </div>
            `);
        }
    });
})();
