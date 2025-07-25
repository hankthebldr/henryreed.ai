import React from 'react';
import { MarkdownRendererProps } from '../utils/types';

// Basic markdown renderer - for production, you'd want to use a library like react-markdown
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  components = {},
  allowedElements,
  disallowedElements,
  className = '',
  'data-testid': testId,
}) => {
  // Simple markdown parsing - in production, use a proper markdown parser
  const parseMarkdown = (text: string): React.ReactNode => {
    // Split by lines for block-level processing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';
    
    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join('\n');
        elements.push(
          <p key={elements.length} className="mb-4 text-fg-default leading-relaxed">
            {parseInlineMarkdown(paragraphText)}
          </p>
        );
        currentParagraph = [];
      }
    };
    
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={elements.length} className="mb-4 pl-6 space-y-2 list-disc">
            {listItems.map((item, index) => (
              <li key={index} className="text-fg-default">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };
    
    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        const code = codeBlockContent.join('\n');
        elements.push(
          <pre key={elements.length} className="mb-4 p-4 bg-canvas-inset border border-border-default rounded-lg overflow-x-auto">
            <code className={`language-${codeBlockLanguage} text-sm font-mono text-fg-default`}>
              {code}
            </code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
      }
    };
    
    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushParagraph();
          flushList();
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim();
        }
        return;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      // Handle headers
      if (line.startsWith('# ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h1 key={elements.length} className="mb-4 text-3xl font-bold text-fg-default">
            {parseInlineMarkdown(line.slice(2))}
          </h1>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h2 key={elements.length} className="mb-3 text-2xl font-semibold text-fg-default">
            {parseInlineMarkdown(line.slice(3))}
          </h2>
        );
        return;
      }
      
      if (line.startsWith('### ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h3 key={elements.length} className="mb-3 text-xl font-semibold text-fg-default">
            {parseInlineMarkdown(line.slice(4))}
          </h3>
        );
        return;
      }
      
      // Handle list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph();
        listItems.push(line.slice(2));
        return;
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        flushParagraph();
        flushList();
        return;
      }
      
      // Regular paragraph content
      flushList();
      currentParagraph.push(line);
    });
    
    // Flush remaining content
    flushParagraph();
    flushList();
    flushCodeBlock();
    
    return elements;
  };
  
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-canvas-inset border border-border-muted rounded text-sm font-mono text-fg-default">$1</code>');
    
    // Handle bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-fg-default">$1</strong>');
    
    // Handle italic
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-fg-default">$1</em>');
    
    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent-fg hover:text-accent-emphasis underline focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-default rounded-sm transition-colors duration-200">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };
  
  const baseClasses = [
    'prose',
    'prose-invert',
    'max-w-none',
    'text-fg-default',
  ];
  
  const markdownClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  return (
    <div
      className={markdownClasses}
      data-testid={testId}
    >
      {parseMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
