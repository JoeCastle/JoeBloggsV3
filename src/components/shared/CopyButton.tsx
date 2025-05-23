'use client';

import { useEffect } from 'react';

const CopyButton = () => {
    useEffect(() => {
        const codeBlocks = document.querySelectorAll('pre');

        codeBlocks.forEach((block) => {
            if (block.querySelector('.copy-btn')) return;

            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.textContent = 'Copy';

            button.addEventListener('click', () => {
                const code = block.querySelector('code');
                if (code) {
                    navigator.clipboard.writeText(code.textContent || '');
                    button.textContent = 'Copied!';
                    setTimeout(() => (button.textContent = 'Copy'), 1000);
                }
            });

            block.appendChild(button);
        });
    }, []);

    return null;
};

export default CopyButton;
