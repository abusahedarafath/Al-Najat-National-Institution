/*
 * Al-Najat ERP - Form Navigation History Fix
 *
 * Successful same-origin POST forms are submitted with fetch().
 * The browser therefore does not create a new history entry for
 * the POST/redirect cycle. Once the server finishes the redirect,
 * the final URL replaces the form page in browser history.
 *
 * This preserves normal browser Back behaviour.
 */

(function () {
    "use strict";

    if (window.__alNajatFormNavigationInstalled) {
        return;
    }

    window.__alNajatFormNavigationInstalled = true;

    function shouldHandle(form) {
        if (!form) return false;

        const method = (form.getAttribute("method") || "get").toLowerCase();

        if (method !== "post") return false;

        const action = form.getAttribute("action") || window.location.href;

        let url;

        try {
            url = new URL(action, window.location.href);
        } catch (error) {
            return false;
        }

        // Only handle same-origin application forms.
        if (url.origin !== window.location.origin) {
            return false;
        }

        // Allow individual forms to opt out when necessary.
        if (form.dataset.historyFix === "off") {
            return false;
        }

        // Do not interfere with forms explicitly targeting another window.
        const target = form.getAttribute("target");

        if (target && target !== "_self") {
            return false;
        }

        return true;
    }

    async function submitForm(form) {
        const submitter = form.__alNajatSubmitter || null;

        const formData = new FormData(form);

        /*
         * FormData(form) does not always include the clicked submit
         * button's name/value in all browser situations. Add it when
         * available.
         */
        if (
            submitter &&
            submitter.name &&
            !formData.has(submitter.name)
        ) {
            formData.append(submitter.name, submitter.value || "");
        }

        const action = new URL(
            form.getAttribute("action") || window.location.href,
            window.location.href
        );

        const response = await fetch(action.href, {
            method: "POST",
            body: formData,
            credentials: "same-origin",
            redirect: "follow",
            headers: {
                "X-Al-Najat-Form-Navigation": "1"
            }
        });

        /*
         * A successful server redirect eventually gives us the final
         * URL. Replace the current form history entry with that URL.
         */
        if (response.redirected && response.url) {
            window.location.replace(response.url);
            return;
        }

        /*
         * Some successful endpoints may return 200 directly instead
         * of redirecting. In that case reload the current URL so the
         * server-rendered result remains authoritative.
         */
        if (response.ok) {
            window.location.replace(window.location.href);
            return;
        }

        /*
         * For validation/error responses, allow the server response
         * to replace the current document so the user can see the
         * actual server-generated error page/form.
         */
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("text/html")) {
            const html = await response.text();
            document.open();
            document.write(html);
            document.close();
            return;
        }

        throw new Error(
            "Form submission failed with HTTP " + response.status
        );
    }

    document.addEventListener("click", function (event) {
        const button = event.target.closest(
            "button[type='submit'], input[type='submit']"
        );

        if (!button) return;

        const form = button.form;

        if (!form) return;

        form.__alNajatSubmitter = button;
    });

    document.addEventListener("submit", function (event) {
        const form = event.target;

        if (!shouldHandle(form)) {
            return;
        }

        /*
         * Prevent the browser's normal POST navigation. The POST is
         * performed with fetch(), and the final redirected URL is then
         * opened with location.replace().
         */
        event.preventDefault();

        if (form.__alNajatSubmitting) {
            return;
        }

        form.__alNajatSubmitting = true;

        submitForm(form).catch(function (error) {
            console.error(
                "Al-Najat form navigation error:",
                error
            );

            /*
             * If JavaScript/fetch fails, fall back to the browser's
             * normal form submission rather than trapping the user.
             */
            form.__alNajatSubmitting = false;
            form.submit();
        });
    });
})();
