---
title: "Post 2"
summary: "This is post 2"
date: "2025-04-28"
---

# Post 2!

This is the second blog post on my site.


will be **rendered as nice, colorful code**!

✅ No extra config needed (it auto-detects language like JS, HTML, CSS).

---

## 3. Add External Link Behavior and Image Styling

You can **override renderers** in `ReactMarkdown` to customize:

✅ Links open in new tab  
✅ Images styled better  

You do this by passing a `components` prop.

---

# ✍ Here's the full clean version

```tsx
// This is a comment test.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export const BlogPost = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-md my-4"
              {...props}
            />
          ),
        }}
      >
        {content}
        {/* Multiline 
        comment 
        test */}
      </ReactMarkdown>
    </div>
  );
};
