import React, { useState } from 'react';
import { CodeBlockProps } from '../utils/types';

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  theme = 'dark',
  showLineNumbers = false,
  highlightLines = [],
  copyable = true,
  filename,
  maxHeight = '400px',
  className = '',
  'data-testid': testId,
}) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  const lines = code.split('\n');
  
  const baseClasses = [
    'relative',
    'rounded-lg',
    'border',
    'border-border-default',
    'overflow-hidden',
    'font-mono',
    'text-sm',
  ];
  
  if (theme === 'dark') {
    baseClasses.push('bg-canvas-inset', 'text-fg-default');
  } else {
    baseClasses.push('bg-canvas-default', 'text-fg-default');
  }
  
  const codeBlockClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  return (
    <div className={codeBlockClasses} data-testid={testId}>
      {/* Header */}
      {(filename || copyable) && (
        <div className="flex items-center justify-between px-4 py-2 bg-canvas-subtle border-b border-border-muted">
          {filename && (
            <span className="text-sm text-fg-muted font-medium">
              {filename}
            </span>
          )}
          
          {copyable && (
            <button
              type="button"
              className="flex items-center px-2 py-1 text-xs text-fg-muted hover:text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-subtle rounded-sm transition-colors duration-200"
              onClick={copyToClipboard}
              aria-label="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Code content */}
      <div
        className="overflow-auto p-4"
        style={{ maxHeight }}
      >
        <pre className="whitespace-pre-wrap">
          <code
            className={`language-${language}`}
            data-lang={language}
          >
            {showLineNumbers ? (
              <div className="table w-full">
                {lines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isHighlighted = highlightLines.includes(lineNumber);
                  
                  return (
                    <div
                      key={lineNumber}
                      className={`table-row ${
                        isHighlighted
                          ? 'bg-attention-subtle border-l-2 border-attention-emphasis'
                          : ''
                      }`}
                    >
                      <div className="table-cell pr-4 text-right text-fg-muted select-none border-r border-border-muted">
                        <span className="inline-block w-8 text-xs">
                          {lineNumber}
                        </span>
                      </div>
                      <div className="table-cell pl-4">
                        <span className={isHighlighted ? 'text-attention-emphasis' : ''}>
                          {line || '\n'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
      
      {/* Language indicator */}
      {language !== 'text' && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-canvas-overlay text-fg-muted border border-border-muted">
            {language}
          </span>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
