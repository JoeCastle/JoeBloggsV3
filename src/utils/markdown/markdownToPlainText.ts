/**
 * Converts markdown content to plain text for metadata/snippet usage.
 * This strips code blocks, links, images, formatting markers, and extra spacing.
 * @param markdown Raw markdown source.
 * @returns Normalized plain text output.
 */
export function markdownToPlainText(markdown: string): string {
    return markdown
        .replace(/```[\s\S]*?```/g, '')   // Remove fenced code blocks
        .replace(/`[^`]*`/g, '')          // Remove inline code
        .replace(/!\[.*?\]\(.*?\)/g, '')  // Remove images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace [text](link) with just text
        .replace(/[#>*_\-]+/g, '')        // Remove markdown formatting symbols
        .replace(/\n{2,}/g, '\n')         // Collapse multiple newlines
        .replace(/\s{2,}/g, ' ')          // Collapse multiple spaces
        .trim();
}
