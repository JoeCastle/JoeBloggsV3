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

type TransformSection =
    | { type: 'content'; label?: string; lines: string[] }
    | { type: 'arrow'; text: string };

function parseTransformSections(source: string): TransformSection[] {
    const lines = source.replace(/\n$/, '').split('\n');
    const sections: TransformSection[] = [];

    let current: TransformSection | null = null;

    const flushCurrent = () => {
        if (!current) {
            return;
        }

        if (current.type === 'content' && !current.label && current.lines.length === 0) {
            current = null;
            return;
        }

        sections.push(current);
        current = null;
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('↓')) {
            flushCurrent();
            sections.push({ type: 'arrow', text: trimmed });
            continue;
        }

        if (trimmed.endsWith(':')) {
            flushCurrent();
            current = {
                type: 'content',
                label: trimmed.slice(0, -1),
                lines: [],
            };
            continue;
        }

        if (!current || current.type !== 'content') {
            current = { type: 'content', lines: [] };
        }

        if (trimmed === '' && current.lines.length === 0) {
            continue;
        }

        current.lines.push(line);
    }

    flushCurrent();

    return sections;
}

function sectionToNodes(section: TransformSection): Element[] {
    if (section.type === 'arrow') {
        return [{
            type: 'element',
            tagName: 'p',
            properties: { className: ['transform-visual-arrow'] },
            children: [{ type: 'text', value: section.text }],
        }];
    }

    const nodes: Element[] = [];

    if (section.label) {
        nodes.push({
            type: 'element',
            tagName: 'p',
            properties: { className: ['transform-visual-label'] },
            children: [{ type: 'text', value: section.label }],
        });
    }

    if (section.lines.length > 0) {
        nodes.push({
            type: 'element',
            tagName: 'pre',
            properties: { className: ['transform-visual-body'] },
            children: [{ type: 'text', value: section.lines.join('\n') }],
        });
    }

    return nodes;
}

export const rehypeTransformVisual: Plugin<[], Root> = () => {
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
            if (!classNames.includes('language-transform')) {
                return;
            }

            const source = collectText(codeElement);
            const sections = parseTransformSections(source);

            const wrapper: Element = {
                type: 'element',
                tagName: 'div',
                properties: { className: ['transform-visual'] },
                children: sections.flatMap(sectionToNodes),
            };

            parent.children[index!] = wrapper;
        });
    };
};
