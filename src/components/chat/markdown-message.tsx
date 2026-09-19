"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-1.5 list-disc pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-1.5 list-decimal pl-5 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="my-2 font-bold text-base first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="my-2 font-bold text-base first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="my-2 font-semibold text-sm first:mt-0">{children}</h3>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#ff8a3d] underline underline-offset-2 hover:text-[#ffa266] break-words"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-2 border-l-2 border-[#ff5c00]/50 pl-3 text-white/70 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  code: ({
    inline,
    className,
    children,
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    if (inline || !match) {
      return (
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-[#ffb284] break-words">
          {children}
        </code>
      );
    }
    return (
      <code className={`block font-mono text-[12px] leading-relaxed ${className ?? ""}`}>
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[12px] font-mono text-white/90">
      {children}
    </pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-[12.5px]">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="text-white/80">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-white/15 bg-white/5 px-2 py-1 font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-white/10 px-2 py-1 align-top">{children}</td>
  ),
};

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}