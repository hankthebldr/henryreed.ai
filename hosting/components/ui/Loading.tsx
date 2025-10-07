'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  fullscreen = false,
  className 
}: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => (
    <div className={cn(
      'animate-spin rounded-full border-4 border-cortex-border-muted border-t-cortex-orange',
      sizes[size]
    )} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-bounce rounded-full bg-cortex-orange',
            size === 'sm' && 'h-1 w-1',
            size === 'md' && 'h-2 w-2',
            size === 'lg' && 'h-3 w-3',
            size === 'xl' && 'h-4 w-4'
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={cn(
      'animate-pulse bg-gradient-to-r from-cortex-orange to-cortex-green rounded-full',
      sizes[size]
    )} />
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      <div className="animate-pulse bg-cortex-bg-quaternary h-4 rounded-md w-3/4" />
      <div className="animate-pulse bg-cortex-bg-quaternary h-4 rounded-md w-1/2" />
      <div className="animate-pulse bg-cortex-bg-quaternary h-4 rounded-md w-5/6" />
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      fullscreen && 'min-h-screen',
      className
    )}>
      {renderVariant()}
      {text && (
        <div className={cn(
          'text-cortex-text-muted font-medium',
          textSizes[size]
        )}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-cortex-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-cortex-bg-tertiary/80 backdrop-blur-xl border border-cortex-border-secondary rounded-2xl p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Skeleton component for content loading
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse bg-cortex-bg-quaternary rounded-md',
      className
    )} />
  );
}