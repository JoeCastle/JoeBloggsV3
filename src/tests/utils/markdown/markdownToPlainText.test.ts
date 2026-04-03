import { markdownToPlainText } from '@/utils/markdown/markdownToPlainText';

describe('markdownToPlainText', () => {
    it('converts markdown to plain text', () => {
        const md = '# Hello\nThis is **bold** and _italic_.';
        const result = markdownToPlainText(md);
        expect(result).toContain('Hello');
        expect(result).toContain('This is bold and italic.');
    });
}); 