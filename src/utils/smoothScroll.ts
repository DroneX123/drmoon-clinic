export const smoothScrollTo = (targetId: string, _duration?: number) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Use native browser smooth scroll - hardware accelerated, no bugs
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};
