import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root, Text } from 'hast';

/**
 * Normalizes HAST className values to a predictable string array.
 * @param value Unknown HAST className value.
 * @returns Normalized class name tokens.
 */
function getClassNames(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value === 'string') {
        return value.split(/\s+/).filter(Boolean);
    }

    return [];
}

/**
 * Recursively extracts plain text from an element subtree.
 * @param node HAST element node.
 * @returns Flattened text content.
 */
function collectText(node: Element): string {
    return node.children
        .map((child) => {
            if (child.type === 'text') {
                return (child as Text).value;
            }

            if (child.type === 'element') {
                return collectText(child as Element);
            }

            return '';
        })
        .join('');
}

function detectMermaidDiagramLabel(source: string): string {
    const firstLine = source
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0)
        ?.toLowerCase() ?? '';

    if (firstLine.startsWith('flowchart')) return 'Flowchart diagram';
    if (firstLine.startsWith('sequencediagram')) return 'Sequence diagram';
    if (firstLine.startsWith('classdiagram')) return 'Class diagram';
    if (firstLine.startsWith('statediagram')) return 'State diagram';
    if (firstLine.startsWith('erdiagram')) return 'Entity relationship diagram';
    if (firstLine.startsWith('journey')) return 'Journey diagram';
    if (firstLine.startsWith('gantt')) return 'Gantt chart';
    if (firstLine.startsWith('pie')) return 'Pie chart';
    if (firstLine.startsWith('gitgraph')) return 'Git graph diagram';

    return 'Mermaid diagram';
}

/**
 * Replaces fenced mermaid code blocks with Mermaid-compatible div containers.
 * @returns Rehype plugin transformer.
 */
export const rehypeMermaid: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, 'element', (node, index, parent) => {
            const element = node as Element;

            if (!parent || !Array.isArray(parent.children) || element.tagName !== 'pre') {
                return;
            }

            const codeNode = element.children[0];
            if (!codeNode || codeNode.type !== 'element') {
                return;
            }

            const codeElement = codeNode as Element;
            if (codeElement.tagName !== 'code') {
                return;
            }

            const classNames = getClassNames(codeElement.properties?.className);
            if (!classNames.includes('language-mermaid')) {
                return;
            }

            const mermaidSource = collectText(codeElement).replace(/\n$/, '');
            const ariaLabel = detectMermaidDiagramLabel(mermaidSource);

            const mermaidBlock: Element = {
                type: 'element',
                tagName: 'div',
                properties: {
                    className: ['mermaid'],
                    role: 'img',
                    ariaLabel,
                },
                children: [{ type: 'text', value: mermaidSource }],
            };

            parent.children[index!] = mermaidBlock;
        });
    };
};
