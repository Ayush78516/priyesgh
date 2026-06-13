document.addEventListener("DOMContentLoaded", function () {
    const headerPath = "components/header.html";
    const footerPath = "components/footer.html";

    function loadComponent(id, path) {
        return fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${path}`);
                return response.text();
            })
            .then(html => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = html;
                    delete element.dataset.loadError;
                }
            })
            .catch(error => {
                const element = document.getElementById(id);
                if (element) {
                    element.dataset.loadError = error.message;
                }
            });
    }

    Promise.all([
        loadComponent("header-placeholder", headerPath),
        loadComponent("footer-placeholder", footerPath)
    ]).then(() => {
        const event = new CustomEvent("componentsLoaded");
        document.dispatchEvent(event);
    });
});
