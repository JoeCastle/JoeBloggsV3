import React from 'react';
import { render, waitFor } from '@testing-library/react';
import MermaidRenderer from '@/components/shared/MermaidRenderer';

const initialize = vi.fn();
const run = vi.fn(async ({ nodes }: { nodes: NodeListOf<Element> }) => {
    nodes.forEach((node) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        node.appendChild(svg);
    });
});

vi.mock('mermaid', () => ({
    default: {
        initialize,
        run,
    },
}));

describe('MermaidRenderer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('wires caption and description to mermaid container and rendered svg', async () => {
        document.body.innerHTML = `
            <div class="blog-post-content">
                <p class="mermaid-caption">Pipeline overview</p>
                <div class="mermaid" aria-label="Flowchart diagram">flowchart TD\nA-->B</div>
                <p class="mermaid-description">This diagram shows how data moves between stages.</p>
            </div>
        `;

        render(<MermaidRenderer />);

        await waitFor(() => {
            expect(run).toHaveBeenCalledTimes(1);
        });

        const container = document.querySelector('.mermaid') as HTMLElement;
        const caption = document.querySelector('.mermaid-caption') as HTMLElement;
        const description = document.querySelector('.mermaid-description') as HTMLElement;
        const svg = container.querySelector('svg') as SVGElement;

        expect(caption.id).toBeTruthy();
        expect(description.id).toBeTruthy();

        expect(container.getAttribute('aria-labelledby')).toBe(caption.id);
        expect(container.getAttribute('aria-describedby')).toBe(description.id);
        expect(container.getAttribute('aria-label')).toBeNull();

        expect(svg.getAttribute('aria-labelledby')).toBe(caption.id);
        expect(svg.getAttribute('aria-describedby')).toBe(description.id);
        expect(svg.getAttribute('aria-label')).toBeNull();
    });

    it('keeps source label when no caption is present', async () => {
        document.body.innerHTML = `
            <div class="blog-post-content">
                <div class="mermaid" aria-label="Flowchart diagram">flowchart TD\nA-->B</div>
            </div>
        `;

        render(<MermaidRenderer />);

        await waitFor(() => {
            expect(run).toHaveBeenCalledTimes(1);
        });

        const container = document.querySelector('.mermaid') as HTMLElement;
        const svg = container.querySelector('svg') as SVGElement;

        expect(container.getAttribute('aria-label')).toBe('Flowchart diagram');
        expect(container.getAttribute('aria-labelledby')).toBeNull();
        expect(container.getAttribute('aria-describedby')).toBeNull();

        expect(svg.getAttribute('aria-label')).toBe('Flowchart diagram');
        expect(svg.getAttribute('aria-labelledby')).toBeNull();
        expect(svg.getAttribute('aria-describedby')).toBeNull();
    });
});
