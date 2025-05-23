'use client';
import { JSX, useEffect, useState } from 'react';

/**
 * Progress bar component at the top of a blog post that shows reading progress as you scroll. 
 * @returns 
 */
export const ScrollProgressBar = (): JSX.Element => {
    const [scroll, setScroll] = useState<number>(0);

    useEffect(() => {
        const scrollContainer: HTMLElement | null = document.getElementById('page-parent');
        if (!scrollContainer) return;

        const handleScroll = (): void => {
            const scrollTop: number = scrollContainer.scrollTop;
            const scrollHeight: number = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const progress: number = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            setScroll(progress);
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        handleScroll(); // Set initial value

        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="scroll-progress-container">
            <div
                className="scroll-progress-bar"
                style={{ transform: `scaleX(${scroll / 100})` }}
            /> {/*Use transform: scaleX instead of width to avoid reflow/repaint bottlenecks in Chromium */}
        </div>
    );
};
