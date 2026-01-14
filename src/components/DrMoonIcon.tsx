import React from 'react';

export const DrMoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* MOON: Crescent shape on the left/surrounding */}
        <path
            d="M 50 10 C 25 10 10 25 10 50 C 10 75 25 90 50 90 C 40 90 25 75 25 50 C 25 25 40 10 50 10 Z"
            fill="currentColor"
            stroke="none"
        />

        {/* SYMBOL (The "Cross"/Caduceus): Centered/Right */}
        <g transform="translate(48, 15) scale(0.7)">
            {/* Staff */}
            <path d="M 50 5 L 50 95" strokeWidth="6" />
            <circle cx="50" cy="5" r="5" fill="currentColor" stroke="none" />

            {/* Wings */}
            <path d="M 50 25 Q 10 10 10 35 Q 30 35 50 25" fill="currentColor" stroke="none" />
            <path d="M 50 25 Q 90 10 90 35 Q 70 35 50 25" fill="currentColor" stroke="none" />

            {/* Snakes (Intertwined) */}
            {/* Snake 1: Left loop -> Right loop */}
            <path d="M 50 90 Q 75 80 50 70 Q 25 60 50 50 Q 75 40 50 30" fill="none" strokeWidth="5" />
            {/* Snake 2: Right loop -> Left loop */}
            <path d="M 50 90 Q 25 80 50 70 Q 75 60 50 50 Q 25 40 50 30" fill="none" strokeWidth="5" />
        </g>
    </svg>
);

export default DrMoonIcon;
