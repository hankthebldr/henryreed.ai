'use client';

import React, { useEffect, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
  onRemove: (id: string) => void;
  showTerminalLink?: boolean;
}

function Notification({ id, type, message, timestamp, onRemove, showTerminalLink = false }: NotificationProps) {
  const { actions } = useAppState();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto-remove after 5 seconds
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => onRemove(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-900/20 text-green-400';
      case 'error': return 'border-red-500 bg-red-900/20 text-red-400';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20 text-yellow-400';
      case 'info': return 'border-blue-500 bg-blue-900/20 text-blue-400';
      default: return 'border-gray-500 bg-gray-900/20 text-cortex-text-secondary';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) return 'now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto border transition-all duration-300 ease-in-out transform
        ${getColorClasses()}
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-xl">{getIcon()}</span>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium break-words whitespace-normal leading-relaxed">
              {message}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs opacity-70">
                {formatTime(timestamp)}
              </p>
              {showTerminalLink && type === 'success' && (
                <button
                  onClick={() => {
                    actions.openTerminal();
                    actions.focusTerminal();
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 flex-shrink-0"
                  aria-label="View command output in terminal"
                >
                  View in Terminal
                </button>
              )}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs opacity-50 p-1"
              onClick={() => {
                setIsRemoving(true);
                setTimeout(() => onRemove(id), 300);
              }}
              aria-label="Close notification"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationSystem() {
  const { state, dispatch } = useAppState();
  const notifications = state.ui.notifications;

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-4 pointer-events-none" role="region" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onRemove={removeNotification}
          showTerminalLink={notification.type === 'success'}
        />
      ))}
    </div>
  );
}