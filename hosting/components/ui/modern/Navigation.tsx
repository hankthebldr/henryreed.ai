'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '../../../lib/utils';
import { ModernButton } from './index';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  badge?: string | number;
  isActive?: boolean;
  children?: NavigationItem[];
}

interface ModernNavigationProps {
  items: NavigationItem[];
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const ModernSidebar: React.FC<ModernNavigationProps> = ({
  items,
  className,
  onItemClick,
  collapsed = false,
  onToggleCollapsed
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item);
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-cortex-bg-tertiary/60 backdrop-blur-xl border-r border-cortex-border-secondary/50 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-cortex-border-secondary/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cortex-accent to-cortex-success rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold text-cortex-text-primary">Cortex Portal</h1>
              <p className="text-xs text-cortex-text-muted">Domain Consultant</p>
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            className="ml-auto p-1 rounded-md hover:bg-cortex-bg-hover transition-colors"
          >
            <svg 
              className={cn(
                'h-4 w-4 text-cortex-text-muted transition-transform',
                collapsed ? 'rotate-180' : ''
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            isActive={pathname === item.href}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cortex-border-secondary/50">
        {!collapsed && (
          <div className="text-xs text-cortex-text-disabled text-center">
            <p>© 2025 Henry Reed AI</p>
            <p className="mt-1">Cortex Platform v2.6</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavigationItemProps {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  collapsed,
  isActive,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        className={cn(
          'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
          isActive 
            ? 'bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/30 shadow-sm' 
            : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover',
          collapsed ? 'justify-center' : ''
        )}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
      >
        <span className={cn(
          'flex-shrink-0',
          isActive ? 'text-cortex-accent' : 'text-cortex-text-muted group-hover:text-cortex-accent'
        )}>
          {item.icon}
        </span>
        
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-cortex-accent/20 text-cortex-accent px-2 py-0.5 rounded-full text-xs font-medium">
                {item.badge}
              </span>
            )}
            {item.children && (
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-90' : ''
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </>
        )}
      </button>

      {/* Sub-items */}
      {item.children && !collapsed && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              collapsed={false}
              isActive={false}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface ModernBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const ModernBreadcrumbs: React.FC<ModernBreadcrumbsProps> = ({
  items,
  className
}) => {
  const router = useRouter();

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-2">
            {item.icon && (
              <span className="text-cortex-text-muted">{item.icon}</span>
            )}
            {item.href ? (
              <button
                onClick={() => router.push(item.href!)}
                className="text-cortex-text-muted hover:text-cortex-accent transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-cortex-text-primary font-medium">{item.label}</span>
            )}
          </div>
          {index < items.length - 1 && (
            <svg className="h-4 w-4 text-cortex-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Command Palette/Quick Actions
interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface ModernCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: QuickAction[];
}

export const ModernCommandPalette: React.FC<ModernCommandPaletteProps> = ({
  isOpen,
  onClose,
  actions
}) => {
  const [search, setSearch] = useState('');
  const [filteredActions, setFilteredActions] = useState(actions);

  useEffect(() => {
    const filtered = actions.filter(action =>
      action.label.toLowerCase().includes(search.toLowerCase()) ||
      action.description?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredActions(filtered);
  }, [search, actions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
      <div className="w-full max-w-lg mx-4 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-xl shadow-2xl animate-scale-in">
        {/* Search Input */}
        <div className="p-4 border-b border-cortex-border-secondary">
          <div className="flex items-center space-x-3">
            <svg className="h-5 w-5 text-cortex-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-cortex-text-primary placeholder-cortex-text-muted"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs text-cortex-text-disabled bg-cortex-bg-quaternary rounded border border-cortex-border-muted">
              ESC
            </kbd>
          </div>
        </div>

        {/* Actions List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-cortex-text-muted">
              <p>No commands found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-cortex-bg-hover transition-colors text-left"
                >
                  <span className="text-cortex-accent">{action.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-cortex-text-primary">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-cortex-text-muted">{action.description}</div>
                    )}
                  </div>
                  {action.shortcut && (
                    <kbd className="px-2 py-1 text-xs text-cortex-text-disabled bg-cortex-bg-quaternary rounded border border-cortex-border-muted">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};