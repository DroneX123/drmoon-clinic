import React from 'react';

export const MoonPhaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* A stylized Moon Phase sequence or single recognizable phase */}
        {/* Central Full/Gibbous Moon represented elegantly */}
        <circle cx="12" cy="12" r="9" stroke="currentColor" />
        <path d="M12 3C17 3 21 7 21 12C21 17 17 21 12 21" />
        <path d="M12 3C9 3 6 7 6 12C6 17 9 21 12 21" stroke="currentColor" strokeDasharray="1 1" opacity="0.5" />
        {/* Simulating a phase line or 'dark side' texture */}
    </svg>
);

// Alternative: A set of phases? No, too small.
// Let's go with a clear "Crescent" which effectively communicates "Moon".
// BUT the user said "Moon Phase Icons" (plural) or specific link.
// Let's make it a nice Crescent that acts as a button.

export const MoonCrescentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

// I will use this simple clear crescent for the menu button. 
// It looks like the "Moon" icon from Lucide, but having it distinct helps if we want to customize it.
// Actually, I'll stick to the "Phase" idea: Circle with a curved line inside.



// Let's use the Lucide 'Moon' equivalent but slightly refined or just standard. 
// Actually since "replace sandwich icon (3 lines)" with "moon phase", 
// a simple crescent might be ambiguous with the logo.
// Let's try 3 small moons in a row? (Phases)
// ( ) O ( ) - looks liek a menu!
// That is actually a cool idea. 3 dots is a menu. 3 moons is a moon menu.

export const MoonMenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Left: Waxing Crescent */}
        <path d="M6 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" opacity="0.6" />

        {/* Center: Full Moon */}
        <circle cx="12" cy="12" r="2.5" />

        {/* Right: Waning Crescent */}
        <path d="M20 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" opacity="0.6" />
    </svg>
);
// I will use this "3-moon-dots" menu style. It replaces the 3-lines menu perfectly conceptually.

export default MoonMenuIcon;
