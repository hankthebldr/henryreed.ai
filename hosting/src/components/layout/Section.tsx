import React from 'react';
import { SectionProps } from '../utils/types';

const spacingClasses = {
  xs: '1',
  sm: '2', 
  md: '4',
  lg: '6',
  xl: '8',
};

const Section: React.FC<SectionProps> = ({
  as: Component = 'section',
  py = 'md',
  px = 'md',
  bg,
  children,
  className = '',
  'data-testid': testId,
  ...rest
}) => {
  const pyClass = `py-${spacingClasses[py]}`;
  const pxClass = `px-${spacingClasses[px]}`;
  
  const baseClasses = [
    pyClass,
    pxClass,
  ];
  
  if (bg) {
    baseClasses.push(bg);
  }
  
  const sectionClasses = [...baseClasses, className].filter(Boolean).join(' ');

  return (
    <Component
      className={sectionClasses}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Section;
