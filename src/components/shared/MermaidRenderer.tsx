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

            articleRoot.querySelectorAll<HTMLElement>('.mermaid').forEach((container, index) => {
                const previous = container.previousElementSibling;
                const caption = previous && previous.classList.contains('mermaid-caption') ? previous as HTMLElement : null;
                const next = container.nextElementSibling;
                const descriptionAfter = next && next.classList.contains('mermaid-description') ? next as HTMLElement : null;
                const descriptionBefore = previous && previous.classList.contains('mermaid-description') ? previous as HTMLElement : null;
                const description = descriptionAfter ?? descriptionBefore;
                const sourceLabel = container.getAttribute('aria-label')?.trim();
                const fallbackLabel = `Mermaid diagram ${index + 1}`;
                const labelText = caption?.textContent?.trim() || sourceLabel || fallbackLabel;

                container.setAttribute('role', 'img');
                container.setAttribute('aria-label', labelText);
                container.removeAttribute('aria-labelledby');
                container.removeAttribute('aria-describedby');

                if (caption) {
                    if (!caption.id) {
                        caption.id = `mermaid-caption-${index + 1}`;
                    }

                    container.setAttribute('aria-labelledby', caption.id);
                    container.removeAttribute('aria-label');
                }

                if (description) {
                    if (!description.id) {
                        description.id = `mermaid-description-${index + 1}`;
                    }

                    container.setAttribute('aria-describedby', description.id);
                }

                const svg = container.querySelector<SVGElement>('svg');
                if (!svg) {
                    return;
                }

                svg.setAttribute('role', 'img');
                svg.removeAttribute('aria-labelledby');
                svg.removeAttribute('aria-describedby');
                svg.setAttribute('aria-label', labelText);

                if (caption?.id) {
                    svg.setAttribute('aria-labelledby', caption.id);
                    svg.removeAttribute('aria-label');
                }

                if (description?.id) {
                    svg.setAttribute('aria-describedby', description.id);
                }
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
