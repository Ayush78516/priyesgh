// ==================== VISION CARDS FADE IN ANIMATION ====================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

window.addEventListener('load', () => {
    // Vision Cards Fade In - Individual observation
    const visionPoints = document.querySelectorAll('.vision-point');

    visionPoints.forEach((point, index) => {
        point.style.opacity = '0';
        point.style.transform = 'translateX(40px)';

        const pointObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        point.style.transition = 'all 0.8s ease';
                        point.style.opacity = '1';
                        point.style.transform = 'translateX(0)';
                    }, index * 200);
                    pointObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        pointObserver.observe(point);
    });
});


