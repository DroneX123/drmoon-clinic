import React, { useEffect, useState } from 'react';

const Cursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            // Slight delay for smooth effect can be achieved with CSS transition
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over clickable elements
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false); // Hide cursor when leaving window
        };

        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('mouseover', handleMouseEnter); // Use mouseover to bubble up
        document.addEventListener('mouseleave', handleMouseLeave); // Detect leaving window

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            window.removeEventListener('mouseover', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isVisible]);

    // Don't render on touch devices (rough detection)
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return null;

    return (
        <div
            className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            {/* Main Dot */}
            <div
                className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ease-out 
                    ${isHovering ? 'scale-[2.5] bg-gold mix-blend-normal opacity-80' : 'scale-100'}
                `}
                style={{
                    marginLeft: '-8px', // Center alignment
                    marginTop: '-8px'
                }}
            />
        </div>
    );
};

export default Cursor;
