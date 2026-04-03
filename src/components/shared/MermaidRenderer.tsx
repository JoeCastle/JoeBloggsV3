'use client';

import { useEffect } from 'react';

/**
 * Initializes and renders Mermaid diagrams contained in blog post content.
 * @returns Null, because this component only provides side effects.
 */
const MermaidRenderer = () => {
    useEffect(() => {
        const articleRoot = document.querySelector('.blog-post-content');
        if (!articleRoot || !articleRoot.querySelector('.mermaid')) {
            return;
        }

        let cancelled = false;

        const renderMermaid = async () => {
            const mermaid = (await import('mermaid')).default;
            const isDarkTheme = Boolean(document.querySelector('.theme-container.dark-theme'));

            if (cancelled) {
                return;
            }

            mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'strict',
                theme: isDarkTheme ? 'dark' : 'default',
                themeVariables: {
                    darkMode: isDarkTheme,
                    fontSize: '13px',
                    fontWeight: '500',
                },
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    wrappingWidth: 300,
                    nodeSpacing: 30,
                    rankSpacing: 40,
                    padding: 8,
                    curve: 'linear',
                },
            });

            await mermaid.run({
                nodes: articleRoot.querySelectorAll('.mermaid'),
            });
        };

        renderMermaid().catch(() => {
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return null;
};

export default MermaidRenderer;
