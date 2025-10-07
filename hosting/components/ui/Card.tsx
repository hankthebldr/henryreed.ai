'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'solid' | 'gradient' | 'terminal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  hover = false,
  glow = false 
}: CardProps) {
  const variants = {
    default: 'bg-cortex-bg-tertiary/60 backdrop-blur-xl border border-cortex-border-secondary/30',
    glass: 'bg-cortex-bg-tertiary/40 backdrop-blur-2xl border border-cortex-border-secondary/20 shadow-lg',
    solid: 'bg-cortex-bg-tertiary border border-cortex-border-secondary',
    gradient: 'bg-gradient-to-br from-cortex-bg-tertiary/80 to-cortex-bg-quaternary/60 backdrop-blur-xl border border-cortex-border-secondary/40',
    terminal: 'bg-black/90 backdrop-blur-sm border border-cortex-green/30 shadow-glow-green'
  };

  const sizes = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl',
    xl: 'p-12 rounded-3xl'
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        variants[variant],
        sizes[size],
        hover && 'hover:scale-[1.02] hover:shadow-cortex-lg',
        glow && 'shadow-glow-orange',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function CardTitle({ children, className, icon }: CardTitleProps) {
  return (
    <h3 className={cn(
      'text-xl font-semibold text-cortex-text-primary flex items-center',
      className
    )}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-cortex-border-muted/20', className)}>
      {children}
    </div>
  );
}