/**
 * Behavioral Analytics Service
 * Comprehensive user event and behavioral logging for the Cortex DC Portal
 *
 * This service captures:
 * - User interactions (clicks, form submissions, navigation)
 * - Feature usage patterns
 * - Performance metrics
 * - Error tracking
 * - Session analytics
 * - Engagement metrics
 */

import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

// Event Categories
export type EventCategory =
  | 'navigation'
  | 'interaction'
  | 'feature_usage'
  | 'content'
  | 'performance'
  | 'error'
  | 'auth'
  | 'data_operation'
  | 'export'
  | 'upload'
  | 'search'
  | 'notification';

// Event Actions
export type EventAction =
  | 'click'
  | 'view'
  | 'edit'
  | 'create'
  | 'delete'
  | 'submit'
  | 'download'
  | 'upload'
  | 'search'
  | 'filter'
  | 'sort'
  | 'expand'
  | 'collapse'
  | 'hover'
  | 'scroll'
  | 'focus'
  | 'blur';

// Session data
export interface UserSession {
  sessionId: string;
  userId: string;
  userRole?: string;
  startTime: Date;
  lastActivityTime: Date;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    viewport: { width: number; height: number };
  };
  referrer?: string;
  landingPage?: string;
}

// Event payload
export interface BehavioralEvent {
  // Identity
  sessionId: string;
  userId: string;
  userRole?: string;

  // Event classification
  category: EventCategory;
  action: EventAction;
  label?: string;

  // Context
  component?: string;
  feature?: string;
  page?: string;
  path?: string;

  // Metadata
  metadata?: Record<string, any>;

  // Performance
  timestamp: Date;
  loadTime?: number;

  // Engagement
  elementId?: string;
  elementText?: string;
  targetUrl?: string;

  // Technical
  errorMessage?: string;
  stackTrace?: string;

  // Value
  value?: number;
  success?: boolean;
}

// Aggregated metrics
export interface EngagementMetrics {
  userId: string;
  sessionCount: number;
  totalSessionDuration: number;
  avgSessionDuration: number;
  totalEvents: number;
  featureUsage: Record<string, number>;
  mostUsedFeatures: { feature: string; count: number }[];
  errorRate: number;
  lastActive: Date;
  engagementScore: number; // 0-100
}

class BehavioralAnalyticsService {
  private db = getFirestore();
  private currentSession: UserSession | null = null;
  private eventQueue: BehavioralEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  // Configuration
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly COLLECTION_NAME = 'behavioral_events';
  private readonly SESSIONS_COLLECTION = 'user_sessions';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.setupEventListeners();
      this.startPeriodicFlush();
      this.startSessionMonitoring();
    }
  }

  /**
   * Initialize user session
   */
  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    const userId = this.getUserId();

    this.currentSession = {
      sessionId,
      userId,
      startTime: new Date(),
      lastActivityTime: new Date(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      referrer: document.referrer,
      landingPage: window.location.href
    };

    // Store session in localStorage
    sessionStorage.setItem('cortex_session', JSON.stringify(this.currentSession));

    // Log session start
    this.logEvent({
      category: 'auth',
      action: 'view',
      label: 'session_start',
      component: 'session_manager'
    });
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logEvent({
          category: 'navigation',
          action: 'blur',
          label: 'page_hidden'
        });
        this.flush(); // Flush events before potentially closing
      } else {
        this.logEvent({
          category: 'navigation',
          action: 'focus',
          label: 'page_visible'
        });
      }
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.logEvent({
        category: 'error',
        action: 'view',
        label: 'global_error',
        errorMessage: event.message,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        success: false
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logEvent({
        category: 'error',
        action: 'view',
        label: 'unhandled_rejection',
        errorMessage: event.reason?.message || String(event.reason),
        success: false
      });
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.logEvent({
        category: 'navigation',
        action: 'view',
        label: 'page_exit'
      });
      this.flush(true); // Synchronous flush
    });

    // Track performance
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;

          this.logEvent({
            category: 'performance',
            action: 'view',
            label: 'page_load',
            loadTime,
            metadata: {
              dns: timing.domainLookupEnd - timing.domainLookupStart,
              tcp: timing.connectEnd - timing.connectStart,
              request: timing.responseStart - timing.requestStart,
              response: timing.responseEnd - timing.responseStart,
              dom: timing.domComplete - timing.domLoading,
              total: loadTime
            }
          });
        }, 0);
      });
    }
  }

  /**
   * Log a behavioral event
   */
  public logEvent(event: Partial<BehavioralEvent>): void {
    if (!this.currentSession) {
      console.warn('No active session, event not logged');
      return;
    }

    const fullEvent: BehavioralEvent = {
      sessionId: this.currentSession.sessionId,
      userId: this.currentSession.userId,
      userRole: this.getUserRole(),
      category: event.category || 'interaction',
      action: event.action || 'click',
      label: event.label,
      component: event.component,
      feature: event.feature,
      page: event.page || this.getCurrentPage(),
      path: event.path || window.location.pathname,
      metadata: event.metadata,
      timestamp: new Date(),
      loadTime: event.loadTime,
      elementId: event.elementId,
      elementText: event.elementText,
      targetUrl: event.targetUrl,
      errorMessage: event.errorMessage,
      stackTrace: event.stackTrace,
      value: event.value,
      success: event.success !== undefined ? event.success : true
    };

    this.eventQueue.push(fullEvent);
    this.updateSessionActivity();

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): void {
    this.logEvent({
      category: 'feature_usage',
      action: action as EventAction,
      feature,
      label: `${feature}_${action}`,
      metadata,
      value: 1
    });
  }

  /**
   * Track navigation
   */
  public trackNavigation(from: string, to: string, metadata?: Record<string, any>): void {
    this.logEvent({
      category: 'navigation',
      action: 'view',
      label: 'route_change',
      metadata: {
        from,
        to,
        ...metadata
      }
    });
  }

  /**
   * Track content interaction
   */
  public trackContentInteraction(contentType: string, contentId: string, action: string, metadata?: Record<string, any>): void {
    this.logEvent({
      category: 'content',
      action: action as EventAction,
      label: `${contentType}_${action}`,
      metadata: {
        contentType,
        contentId,
        ...metadata
      }
    });
  }

  /**
   * Track search query
   */
  public trackSearch(query: string, resultsCount: number, metadata?: Record<string, any>): void {
    this.logEvent({
      category: 'search',
      action: 'search',
      label: 'search_query',
      metadata: {
        query,
        resultsCount,
        queryLength: query.length,
        ...metadata
      },
      value: resultsCount
    });
  }

  /**
   * Track data export
   */
  public trackExport(exportType: string, recordCount: number, format: string): void {
    this.logEvent({
      category: 'export',
      action: 'download',
      label: `export_${exportType}`,
      metadata: {
        exportType,
        recordCount,
        format
      },
      value: recordCount
    });
  }

  /**
   * Track upload
   */
  public trackUpload(fileType: string, fileSize: number, success: boolean): void {
    this.logEvent({
      category: 'upload',
      action: 'upload',
      label: `upload_${fileType}`,
      metadata: {
        fileType,
        fileSize,
        fileSizeMB: (fileSize / 1024 / 1024).toFixed(2)
      },
      value: fileSize,
      success
    });
  }

  /**
   * Flush events to Firestore
   */
  private async flush(synchronous = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    const flushOperation = async () => {
      try {
        const batch = eventsToFlush.map(event => ({
          ...event,
          timestamp: Timestamp.fromDate(event.timestamp)
        }));

        // Write to Firestore
        const promises = batch.map(event =>
          addDoc(collection(this.db, this.COLLECTION_NAME), event)
        );

        await Promise.all(promises);
        console.log(`Flushed ${batch.length} behavioral events`);
      } catch (error) {
        console.error('Failed to flush behavioral events:', error);
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToFlush);
      }
    };

    if (synchronous && navigator.sendBeacon) {
      // Use sendBeacon for synchronous sending before page unload
      const payload = JSON.stringify(eventsToFlush);
      navigator.sendBeacon('/api/analytics/events', payload);
    } else {
      await flushOperation();
    }
  }

  /**
   * Start periodic flush
   */
  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    this.sessionCheckInterval = setInterval(() => {
      if (this.currentSession) {
        const inactiveTime = Date.now() - this.currentSession.lastActivityTime.getTime();

        if (inactiveTime > this.SESSION_TIMEOUT) {
          this.endSession();
          this.initializeSession();
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * End current session
   */
  private endSession(): void {
    if (this.currentSession) {
      this.logEvent({
        category: 'auth',
        action: 'view',
        label: 'session_end',
        component: 'session_manager',
        metadata: {
          sessionDuration: Date.now() - this.currentSession.startTime.getTime()
        }
      });
      this.flush(true);
    }
  }

  /**
   * Update session activity timestamp
   */
  private updateSessionActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivityTime = new Date();
      sessionStorage.setItem('cortex_session', JSON.stringify(this.currentSession));
    }
  }

  /**
   * Generate engagement metrics for a user
   */
  public async generateEngagementMetrics(userId: string, days: number = 30): Promise<EngagementMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(this.db, this.COLLECTION_NAME),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => doc.data() as BehavioralEvent);

    // Calculate metrics
    const sessions = new Set(events.map(e => e.sessionId));
    const featureUsage: Record<string, number> = {};
    let errorCount = 0;

    events.forEach(event => {
      if (event.feature) {
        featureUsage[event.feature] = (featureUsage[event.feature] || 0) + 1;
      }
      if (event.category === 'error') {
        errorCount++;
      }
    });

    const mostUsedFeatures = Object.entries(featureUsage)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate engagement score (0-100)
    const sessionScore = Math.min(sessions.size * 2, 30);
    const eventScore = Math.min(events.length / 10, 30);
    const featureScore = Math.min(Object.keys(featureUsage).length * 2, 30);
    const qualityScore = Math.max(10 - errorCount, 0);
    const engagementScore = sessionScore + eventScore + featureScore + qualityScore;

    return {
      userId,
      sessionCount: sessions.size,
      totalSessionDuration: 0, // TODO: Calculate from session start/end events
      avgSessionDuration: 0,
      totalEvents: events.length,
      featureUsage,
      mostUsedFeatures,
      errorRate: events.length > 0 ? errorCount / events.length : 0,
      lastActive: events[0]?.timestamp || new Date(),
      engagementScore: Math.min(Math.round(engagementScore), 100)
    };
  }

  /**
   * Helper methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    // Try to get from auth context or localStorage
    const storedUser = localStorage.getItem('cortex_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.id || user.email || 'anonymous';
      } catch {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  private getUserRole(): string | undefined {
    const storedUser = localStorage.getItem('cortex_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.role;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private getCurrentPage(): string {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return hash ? `${path}${hash}` : path;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    this.endSession();
  }
}

// Export singleton instance
export const behavioralAnalyticsService = new BehavioralAnalyticsService();

// Export class for testing
export { BehavioralAnalyticsService };
