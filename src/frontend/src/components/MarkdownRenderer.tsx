
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-blockquote-alert";
import rehypeHighlight from "rehype-highlight";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw"

import "katex/dist/katex.min.css";

import "highlight.js/styles/github-dark.css";
import "@/markdown.css";
import rust from "highlight.js/lib/languages/rust";
import { common } from "lowlight";

const languages = {
    ...common,
    rust,
};

interface MarkdownRendererProps {
    content: string;
    ref: React.RefObject<any>
}



export function MarkdownRenderer({
    content, ref
}: MarkdownRendererProps) {
    return (
        <article ref={ref} className="markdown-body min-h-0 min-w-0 flex-1 overflow-y-auto text-left p-4">
            <ReactMarkdown 
                remarkPlugins={[
                    remarkGfm,
                    remarkGithubAlerts,
                    remarkMath,
                ]}
                rehypePlugins={[
                    [rehypeHighlight, { languages }],
                    rehypeKatex,
                    rehypeRaw,
                    
                ]}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
