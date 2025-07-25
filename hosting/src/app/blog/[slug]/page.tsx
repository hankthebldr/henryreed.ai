import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Mock data - replace with actual data fetching
const posts = [
  {
    id: 1,
    title: 'Building Terminal Interfaces with Next.js',
    content: `# Building Terminal Interfaces with Next.js

In this comprehensive guide, we'll explore how to create modern, web-based terminal emulators using Next.js and various terminal libraries.

## Introduction

Terminal interfaces have become increasingly popular in web applications, especially for developer tools and system administration interfaces. With the power of modern web technologies, we can create rich, interactive terminal experiences that rival native applications.

## Key Technologies

### XTerm.js
XTerm.js is a terminal for the web. It allows you to create fully-featured terminals in the browser that work well with screen readers.

### React Terminal UI
A React-based library for creating beautiful terminal interfaces with built-in command handling and theming support.

## Implementation Details

\`\`\`typescript
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const terminal = new Terminal({
  theme: {
    background: '#1a1a1a',
    foreground: '#00ff00',
  }
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
\`\`\`

## Conclusion

Building terminal interfaces for the web opens up new possibilities for developer tooling and system administration. With the right libraries and patterns, you can create powerful, accessible terminal experiences.`,
    excerpt: 'Exploring modern approaches to creating web-based terminal emulators.',
    slug: 'building-terminal-interfaces-nextjs',
    publishedAt: '2024-01-15',
    tags: ['Next.js', 'Terminal', 'React'],
    category: 'Development',
    author: 'Henry Reed',
    readingTime: 8,
  },
  {
    id: 2,
    title: 'XTerm.js Integration Patterns',
    content: `# XTerm.js Integration Patterns

Best practices and patterns for integrating XTerm.js into React applications effectively.

## Overview

XTerm.js is powerful, but integrating it properly with React requires understanding its lifecycle and event handling patterns.

## React Integration

\`\`\`tsx
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';

export function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal>();

  useEffect(() => {
    if (terminalRef.current && !terminal.current) {
      terminal.current = new Terminal();
      terminal.current.open(terminalRef.current);
    }

    return () => {
      terminal.current?.dispose();
    };
  }, []);

  return <div ref={terminalRef} />;
}
\`\`\`

## Performance Considerations

- Use refs instead of state for terminal instances
- Properly dispose of terminals on unmount
- Consider virtualization for large outputs

## Conclusion

Proper integration patterns ensure your terminal components are performant and maintainable.`,
    excerpt: 'Best practices for integrating XTerm.js in React applications.',
    slug: 'xterm-integration-patterns',
    publishedAt: '2024-01-10',
    tags: ['XTerm.js', 'React', 'TypeScript'],
    category: 'Tutorial',
    author: 'Henry Reed',
    readingTime: 5,
  },
];

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} - Henry Reed`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <a
            href="/blog"
            className="text-terminal-cyan font-mono hover:text-terminal-green transition-colors"
          >
            &lt; BACK_TO_BLOG
          </a>
        </nav>

        <article className="bg-hack-surface border border-terminal-green rounded-lg p-8">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-mono text-terminal-amber bg-hack-background px-2 py-1 rounded">
                {post.category}
              </span>
              <time className="text-xs font-mono text-terminal-green">
                {post.publishedAt}
              </time>
              <span className="text-xs font-mono text-terminal-cyan">
                {post.readingTime} min read
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
              {post.title}
            </h1>
            
            <p className="text-terminal-cyan mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-mono text-terminal-green">
                By {post.author}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/tags/${tag.toLowerCase()}`}
                  className="text-xs font-mono text-terminal-cyan hover:text-terminal-green px-2 py-1 bg-hack-background rounded transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          </header>

          <div className="prose prose-invert prose-green max-w-none">
            {/* Simple markdown-style content rendering - replace with proper markdown parser */}
            <div className="text-terminal-green space-y-4 font-mono text-sm leading-relaxed">
              {post.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-2xl font-bold text-terminal-green mt-8 mb-4">
                      {line.substring(2)}
                    </h1>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-xl font-bold text-terminal-cyan mt-6 mb-3">
                      {line.substring(3)}
                    </h2>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-lg font-bold text-terminal-amber mt-4 mb-2">
                      {line.substring(4)}
                    </h3>
                  );
                }
                if (line.startsWith('```')) {
                  return (
                    <div key={index} className="bg-hack-background border border-terminal-green rounded p-4 my-4">
                      <code className="text-terminal-green">{line.substring(3)}</code>
                    </div>
                  );
                }
                if (line.startsWith('`') && line.endsWith('`')) {
                  return (
                    <code key={index} className="bg-hack-background text-terminal-cyan px-2 py-1 rounded">
                      {line.substring(1, line.length - 1)}
                    </code>
                  );
                }
                if (line.trim() === '') {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="text-terminal-green">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </article>

        {/* Related Posts or Navigation */}
        <div className="mt-12 flex justify-between">
          <a
            href="/blog"
            className="px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
          >
            &lt; ALL_POSTS
          </a>
          <a
            href={`/blog/${post.slug}/edit`}
            className="px-4 py-2 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all font-mono"
          >
            EDIT_POST
          </a>
        </div>
      </div>
    </div>
  );
}
