import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

/**
 * Handles adding a wrapper div to all tables in markdown. Use for styling.
 */
export const rehypeWrapTables: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, 'element', (node, index, parent) => {
            const element = node as Element;

            if (
                element.tagName === 'table' &&
                parent &&
                Array.isArray(parent.children)
            ) {
                const parentElement = parent.type === 'element' ? (parent as Element) : null;
                const className = parentElement?.properties?.className;

                const isAlreadyWrapped =
                    parentElement?.tagName === 'div' &&
                    Array.isArray(className) &&
                    className.some((value) => value === 'markdown-table-wrapper');

                if (isAlreadyWrapped) {
                    return;
                }

                const wrapper: Element = {
                    type: 'element',
                    tagName: 'div',
                    properties: { className: ['markdown-table-wrapper'] },
                    children: [element],
                };

                parent.children[index!] = wrapper;
            }
        });
    };
};