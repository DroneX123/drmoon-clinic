let currentAnimationFrameId: number | null = null;
let cleanupListeners: (() => void) | null = null;

export const smoothScrollTo = (targetId: string, duration: number = 1000) => {
    // 1. Cancel any existing animation immediately
    if (currentAnimationFrameId !== null) {
        cancelAnimationFrame(currentAnimationFrameId);
        currentAnimationFrameId = null;
    }
    if (cleanupListeners) {
        cleanupListeners();
        cleanupListeners = null;
    }

    const target = document.getElementById(targetId);
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    // Cleanup function definition
    const cleanup = () => {
        if (currentAnimationFrameId !== null) {
            cancelAnimationFrame(currentAnimationFrameId);
            currentAnimationFrameId = null;
        }
        window.removeEventListener('wheel', onUserScroll);
        window.removeEventListener('touchmove', onUserScroll);
        window.removeEventListener('touchstart', onUserScroll);
        cleanupListeners = null;
    };

    cleanupListeners = cleanup;

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

        // Easing function: easeOutExpo (Starts fast, slows down gently)
        // This fixes the "freeze" feeling at the start
        const ease = (t: number, b: number, c: number, d: number) => {
            return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        };

        const run = ease(timeElapsed, startPosition, distance, duration);

        // Use Math.round to avoid sub-pixel jitter on some screens
        window.scrollTo(0, Math.round(run));

        if (timeElapsed < duration) {
            currentAnimationFrameId = requestAnimationFrame(animation);
        } else {
            cleanup();
        }
    };

    currentAnimationFrameId = requestAnimationFrame(animation);
};
