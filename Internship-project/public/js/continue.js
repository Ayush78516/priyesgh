document.addEventListener("DOMContentLoaded", function () {
    const shouldAsk = localStorage.getItem("continueRegistration");

    if (shouldAsk === "true") {
        setTimeout(() => {
            const proceed = confirm(
                "Successful! Do you want to continue registration?"
            );

            localStorage.removeItem("continueRegistration");

            if (proceed) {
                window.location.href = "/personal";
            }
        }, 500);
    }
});
