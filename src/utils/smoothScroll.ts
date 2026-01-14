export const smoothScrollTo = (targetId: string, duration: number = 1000) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    let animationFrameId: number;

    const cleanup = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('wheel', onUserScroll);
        window.removeEventListener('touchmove', onUserScroll);
        window.removeEventListener('touchstart', onUserScroll);
    };

    const onUserScroll = () => {
        // User interrupted the scroll
        cleanup();
    };

    // Add listeners to detect user interaction
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('touchstart', onUserScroll, { passive: true });

    const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;

        // Easing function (easeInOutCubic) for smoother start/end
        const ease = (t: number, b: number, c: number, d: number) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        };

        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);

        if (timeElapsed < duration) {
            animationFrameId = requestAnimationFrame(animation);
        } else {
            cleanup();
        }
    };

    animationFrameId = requestAnimationFrame(animation);
};
