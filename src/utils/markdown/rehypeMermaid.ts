import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root, Text } from 'hast';

function getClassNames(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value === 'string') {
        return value.split(/\s+/).filter(Boolean);
    }

    return [];
}

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

            const mermaidBlock: Element = {
                type: 'element',
                tagName: 'div',
                properties: { className: ['mermaid'] },
                children: [{ type: 'text', value: mermaidSource }],
            };

            parent.children[index!] = mermaidBlock;
        });
    };
};
