'use client';

import React, { useState, useMemo } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

// Simple Bar Chart Component
export const BarChart: React.FC<{
  data: ChartData[];
  height?: number;
  title?: string;
  onBarClick?: (data: ChartData) => void;
}> = ({ data, height = 200, title, onBarClick }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-600">
      {title && <h3 className="text-cyan-400 font-bold mb-3 text-sm">{title}</h3>}
      <div className="space-y-2" style={{ height }}>
        {data.map((item, index) => {
          const width = (item.value / maxValue) * 100;
          const isHovered = hoveredBar === item.label;
          
          return (
            <div key={item.label} className="flex items-center space-x-3">
              <div className="text-xs text-gray-400 w-20 truncate" title={item.label}>
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div 
                  className={`h-6 rounded transition-all duration-200 cursor-pointer ${
                    item.color || (index % 2 === 0 ? 'bg-cyan-600' : 'bg-blue-600')
                  } ${isHovered ? 'opacity-80 shadow-lg' : 'opacity-70'}`}
                  style={{ width: `${width}%` }}
                  onMouseEnter={() => setHoveredBar(item.label)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onClick={() => onBarClick?.(item)}
                />
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs font-mono text-white">{item.value}</span>
                </div>
                {isHovered && (
                  <div className="absolute top-8 left-0 bg-gray-900 border border-cyan-500 p-2 rounded text-xs z-10">
                    <div className="text-cyan-400">{item.label}</div>
                    <div className="text-white">Value: {item.value}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Pie Chart Component (using CSS gradients)
export const PieChart: React.FC<{
  data: ChartData[];
  size?: number;
  title?: string;
}> = ({ data, size = 120, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const segments = useMemo(() => {
    let currentAngle = 0;
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
      
      return {
        ...item,
        percentage,
        angle,
        startAngle,
        color: item.color || colors[index % colors.length]
      };
    });
  }, [data, total]);

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-600">
      {title && <h3 className="text-cyan-400 font-bold mb-3 text-sm">{title}</h3>}
      <div className="flex items-center space-x-4">
        <div 
          className="relative rounded-full border-4 border-gray-700"
          style={{ 
            width: size, 
            height: size,
            background: `conic-gradient(${segments.map((segment, index) => 
              `${segment.color} ${index === 0 ? 0 : segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)}% ${
                segments.slice(0, index + 1).reduce((sum, s) => sum + s.percentage, 0)
              }%`
            ).join(', ')})`
          }}
        >
          <div 
            className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-mono text-white">{total}</span>
          </div>
        </div>
        <div className="space-y-1">
          {segments.map((segment, index) => (
            <div key={segment.label} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <div className="text-xs text-gray-300">
                {segment.label} ({segment.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Line Chart Component
export const LineChart: React.FC<{
  data: TimeSeriesData[];
  height?: number;
  title?: string;
  color?: string;
}> = ({ data, height = 150, title, color = '#06b6d4' }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const { minValue, maxValue } = useMemo(() => {
    const values = data.map(d => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values)
    };
  }, [data]);

  const points = useMemo(() => {
    const width = 100; // percentage
    const valueRange = maxValue - minValue;
    
    return data.map((item, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((item.value - minValue) / valueRange) * height,
      ...item
    }));
  }, [data, minValue, maxValue, height]);

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-600">
      {title && <h3 className="text-cyan-400 font-bold mb-3 text-sm">{title}</h3>}
      <div className="relative" style={{ height: height + 40 }}>
        <svg 
          width="100%" 
          height={height}
          viewBox={`0 0 100 ${height}`}
          className="absolute inset-0"
        >
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * (height / 4)}
              x2="100"
              y2={i * (height / 4)}
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="transition-all duration-200"
          />
          
          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === index ? 4 : 2}
              fill={color}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
        
        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <div 
            className="absolute bg-gray-900 border border-cyan-500 p-2 rounded text-xs z-10 pointer-events-none"
            style={{
              left: `${points[hoveredPoint].x}%`,
              top: points[hoveredPoint].y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-cyan-400">{data[hoveredPoint].date}</div>
            <div className="text-white">Value: {data[hoveredPoint].value}</div>
          </div>
        )}
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <div>{maxValue}</div>
          <div>{Math.round((maxValue + minValue) / 2)}</div>
          <div>{minValue}</div>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
export const KPICard: React.FC<{
  title: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red';
  onClick?: () => void;
}> = ({ title, value, change, format = 'number', color = 'blue', onClick }) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'duration':
        return `${val}d`;
      default:
        return val.toLocaleString();
    }
  };

  const colorClasses = {
    green: 'border-green-500 bg-green-900/20 text-green-400',
    blue: 'border-blue-500 bg-blue-900/20 text-blue-400',
    purple: 'border-purple-500 bg-purple-900/20 text-purple-400',
    yellow: 'border-yellow-500 bg-yellow-900/20 text-yellow-400',
    red: 'border-red-500 bg-red-900/20 text-red-400'
  };

  return (
    <div 
      className={`p-4 rounded border transition-all duration-200 ${
        colorClasses[color]
      } ${onClick ? 'cursor-pointer hover:bg-opacity-30' : ''}`}
      onClick={onClick}
    >
      <div className="text-sm opacity-80 mb-2">{title}</div>
      <div className="text-2xl font-mono font-bold mb-1">
        {formatValue(value)}
      </div>
      {change !== undefined && (
        <div className={`text-xs flex items-center ${
          change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
        }`}>
          {change > 0 ? '↗' : change < 0 ? '↘' : '→'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

// Dashboard Grid Component
export const DashboardGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}> = ({ children, columns = 4, gap = 4 }) => {
  return (
    <div 
      className={`grid gap-${gap}`}
      style={{ 
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
      }}
    >
      {children}
    </div>
  );
};