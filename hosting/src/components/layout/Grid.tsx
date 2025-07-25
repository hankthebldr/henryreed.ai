import React from 'react';
import { GridProps } from '../utils/types';

const gapClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignItemsClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyContentClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const getGridColumnsClass = (columns: GridProps['columns']): string => {
  if (typeof columns === 'number') {
    return `grid-cols-${columns}`;
  }
  
  if (typeof columns === 'object' && columns) {
    const responsiveClasses = [];
    if (columns.sm) responsiveClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) responsiveClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) responsiveClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) responsiveClasses.push(`xl:grid-cols-${columns.xl}`);
    return responsiveClasses.join(' ');
  }
  
  return 'grid-cols-1';
};

const Grid: React.FC<GridProps> = ({
  columns = 1,
  gap = 'md',
  alignItems = 'stretch',
  justifyContent = 'start',
  children,
  className = '',
  'data-testid': testId,
  ...rest
}) => {
  const gridColumnsClass = getGridColumnsClass(columns);
  const gapClass = gapClasses[gap];
  const alignItemsClass = alignItemsClasses[alignItems];
  const justifyContentClass = justifyContentClasses[justifyContent];
  
  const baseClasses = [
    'grid',
    gridColumnsClass,
    gapClass,
    alignItemsClass,
    justifyContentClass,
  ];
  
  const gridClasses = [...baseClasses, className].filter(Boolean).join(' ');

  return (
    <div
      className={gridClasses}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Grid;
