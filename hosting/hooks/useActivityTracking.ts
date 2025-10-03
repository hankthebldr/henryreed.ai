/**
 * Activity Tracking Hook
 * Comprehensive user activity monitoring and analytics integration
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { userManagementService, UserActivity } from '../lib/user-management';

interface ActivityTrackingOptions {
  userId?: string;
  sessionId?: string;
  enabled?: boolean;
}

interface TrackActivityParams {
  action: string;
  feature: string;
  metadata?: Partial<UserActivity['metadata']>;
  performance?: Partial<UserActivity['performance']>;
}

export const useActivityTracking = (options: ActivityTrackingOptions = {}) => {
  const { userId = 'current_user', sessionId = 'current_session', enabled = true } = options;
  
  // Track page views and navigation
  const previousPage = useRef<string>('');
  const pageStartTime = useRef<number>(Date.now());
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Track user activity
  const trackActivity = useCallback((params: TrackActivityParams) => {
    if (!enabled) return;

    const { action, feature, metadata = {}, performance = {} } = params;
    
    try {
      // Automatically capture performance metrics
      const loadTime = performance.loadTime || (Date.now() - pageStartTime.current);
      
      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : undefined;

      userManagementService.logActivity(
        userId,
        sessionId,
        action,
        feature,
        {
          page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          component: metadata.component,
          duration: metadata.duration,
          success: metadata.success ?? true,
          errorMessage: metadata.errorMessage,
          trrId: metadata.trrId,
          sdwId: metadata.sdwId,
          povId: metadata.povId,
          customerId: metadata.customerId,
          ...metadata
        }
      );
    } catch (error) {
      console.warn('Failed to track activity:', error);
    }
  }, [userId, sessionId, enabled]);

  // Track page views
  const trackPageView = useCallback((pageName?: string) => {
    if (!enabled) return;

    const currentPage = pageName || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
    const now = Date.now();
    
    // Track time spent on previous page
    if (previousPage.current && previousPage.current !== currentPage) {
      const timeSpent = now - pageStartTime.current;
      trackActivity({
        action: 'page_view_duration',
        feature: 'navigation',
        metadata: {
          page: previousPage.current,
          duration: timeSpent,
          success: true
        }
      });
    }
    
    // Track new page view
    trackActivity({
      action: 'page_view',
      feature: 'navigation',
      metadata: {
        page: currentPage,
        success: true
      }
    });
    
    previousPage.current = currentPage;
    pageStartTime.current = now;
  }, [trackActivity, enabled]);

  // Track feature usage
  const trackFeatureUsage = useCallback((feature: string, action: string, metadata?: Partial<UserActivity['metadata']>) => {
    trackActivity({
      action: `${feature}_${action}`,
      feature,
      metadata
    });
  }, [trackActivity]);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    if (!enabled) return;

    trackActivity({
      action: 'error_occurred',
      feature: context || 'system',
      metadata: {
        success: false,
        errorMessage: error.message,
        component: context
      }
    });
  }, [trackActivity]);

  // Track performance metrics
  const trackPerformance = useCallback((action: string, startTime: number, feature: string) => {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    trackActivity({
      action,
      feature,
      metadata: {
        success: true,
        duration
      },
      performance: {
        loadTime: duration,
        responseTime: duration
      }
    });
  }, [trackActivity]);

  // Auto-track user interactions
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Track page load
    trackPageView();

    // Track route changes (for SPAs)
    const handlePopState = () => {
      trackPageView();
    };

    // Track clicks on important elements
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const buttonText = button?.textContent?.trim();
        const feature = button?.getAttribute('data-feature') || 'ui_interaction';
        
        trackActivity({
          action: 'button_click',
          feature,
          metadata: {
            component: buttonText || 'unknown_button',
            success: true
          }
        });
      }

      // Track navigation links
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        const href = link?.getAttribute('href');
        
        if (href) {
          trackActivity({
            action: 'navigation_click',
            feature: 'navigation',
            metadata: {
              component: href,
              success: true
            }
          });
        }
      }
    };

    // Track form submissions
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formId = form?.id || form?.className || 'unknown_form';
      
      trackActivity({
        action: 'form_submit',
        feature: 'form_interaction',
        metadata: {
          component: formId,
          success: true
        }
      });
    };

    // Track errors
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), 'global_error');
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(String(event.reason)), 'unhandled_promise');
    };

    // Set up performance observer
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            trackActivity({
              action: 'page_load_performance',
              feature: 'performance',
              performance: {
                loadTime: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
                responseTime: Math.round(navEntry.responseEnd - navEntry.requestStart)
              }
            });
          }
        });
      });

      try {
        performanceObserver.current.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (e) {
        // Performance observer not supported
        performanceObserver.current = null;
      }
    }

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [enabled, trackPageView, trackActivity, trackError]);

  // Track session end
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      // Track session end
      const timeSpent = Date.now() - pageStartTime.current;
      trackActivity({
        action: 'session_end',
        feature: 'session',
        metadata: {
          duration: timeSpent,
          success: true
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, trackActivity]);

  return {
    trackActivity,
    trackPageView,
    trackFeatureUsage,
    trackError,
    trackPerformance
  };
};

// Higher-order component for automatic activity tracking
export const withActivityTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string
) => {
  const TrackedComponent = (props: P) => {
    const { trackFeatureUsage } = useActivityTracking();
    
    useEffect(() => {
      trackFeatureUsage(feature, 'component_mounted');
      
      return () => {
        trackFeatureUsage(feature, 'component_unmounted');
      };
    }, [trackFeatureUsage]);
    
    return React.createElement(WrappedComponent, props);
  };
  
  return TrackedComponent;
};

// Activity tracking context provider
export const ActivityProvider: React.FC<{ 
  children: React.ReactNode;
  userId?: string;
  sessionId?: string;
}> = ({ children, userId, sessionId }) => {
  useActivityTracking({ userId, sessionId });
  return React.createElement(React.Fragment, null, children);
};
