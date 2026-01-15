export const smoothScrollTo = (targetId: string, duration?: number) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const isMobile = window.innerWidth < 768;

    // For desktop with custom duration, use smooth animation
    if (!isMobile && duration) {
        const targetPosition = target.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const animation = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);

            window.scrollTo(0, startPosition + distance * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    } else {
        // Mobile or no duration: use native smooth scroll
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};
