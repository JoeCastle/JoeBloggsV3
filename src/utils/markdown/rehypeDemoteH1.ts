import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

/**
 * Demotes markdown body h1 elements to h2 so each post page keeps a single document h1.
 * @returns Rehype plugin transformer.
 */
export const rehypeDemoteH1: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, 'element', (node) => {
            const element = node as Element;
            if (element.tagName === 'h1') {
                element.tagName = 'h2';
            }
        });
    };
};
