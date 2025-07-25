import React from 'react';
import { ContainerProps } from '../utils/types';

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const spacingClasses = {
  xs: '1',
  sm: '2',
  md: '4',
  lg: '6',
  xl: '8',
};

const Container: React.FC<ContainerProps> = ({
  maxWidth = 'full',
  centerContent = false,
  px = 'md',
  py = 'md',
  children,
  className = '',
  'data-testid': testId,
  ...rest
}) => {
  const maxWidthClass = maxWidthClasses[maxWidth];
  const pxClass = `px-${spacingClasses[px]}`;
  const pyClass = `py-${spacingClasses[py]}`;
  
  const baseClasses = [
    'w-full',
    maxWidthClass,
    'mx-auto',
    pxClass,
    pyClass,
  ];
  
  if (centerContent) {
    baseClasses.push('flex', 'justify-center', 'items-center');
  }
  
  const containerClasses = [...baseClasses, className].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Container;
