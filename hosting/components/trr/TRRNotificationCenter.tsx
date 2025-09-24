'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TRR } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface Notification {
  id: string;
  type: 'due_date' | 'blocking_dependency' | 'approval_request' | 'status_change' | 
        'mention' | 'assignment' | 'test_failure' | 'milestone' | 'overdue';
  title: string;
  message: string;
  relatedTRRId?: string;
  relatedTRRTitle?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    assignee?: string;
    daysOverdue?: number;
    previousStatus?: string;
    newStatus?: string;
    mentionedBy?: string;
    blockedBy?: string[];
    approver?: string;
  };
}

interface NotificationRule {
  id: string;
  name: string;
  type: Notification['type'];
  conditions: {
    statuses?: string[];
    priorities?: string[];
    assignees?: string[];
    tags?: string[];
    projects?: string[];
  };
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    slack: boolean;
    webhookUrl?: string;
  };
  schedule?: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
    time?: string; // HH:MM format
  };
}

interface TRRNotificationCenterProps {
  notifications?: Notification[];
  trrs?: TRR[];
  currentUser?: string;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationAction?: (notification: Notification) => void;
  onRuleCreate?: (rule: Omit<NotificationRule, 'id'>) => void;
  onRuleUpdate?: (rule: NotificationRule) => void;
  onRuleDelete?: (ruleId: string) => void;
  notificationRules?: NotificationRule[];
}

export const TRRNotificationCenter: React.FC<TRRNotificationCenterProps> = ({
  notifications = [],
  trrs = [],
  currentUser = 'Anonymous',
  onNotificationRead,
  onNotificationAction,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  notificationRules = [],
}) => {
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'rules' | 'settings'>('notifications');
  const [filterType, setFilterType] = useState<'all' | Notification['type']>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // Generate real-time notifications from TRRs
  const generatedNotifications = useMemo(() => {
    const generated: Notification[] = [];
    const now = new Date();

    trrs.forEach(trr => {
      // Due date notifications
      if (trr.dueDate) {
        const dueDate = new Date(trr.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          generated.push({
            id: `due-${trr.id}`,
            type: 'due_date',
            title: 'TRR Due Soon',
            message: `TRR "${trr.title}" is due in ${daysUntilDue} days`,
            relatedTRRId: trr.id,
            relatedTRRTitle: trr.title,
            priority: daysUntilDue <= 2 ? 'high' : daysUntilDue <= 5 ? 'medium' : 'low',
            isRead: false,
            createdAt: now,
            actionUrl: `/trr/${trr.id}`,
            actionLabel: 'View TRR',
            metadata: { daysOverdue: daysUntilDue < 0 ? Math.abs(daysUntilDue) : undefined },
          });
        } else if (daysUntilDue < 0) {
          generated.push({
            id: `overdue-${trr.id}`,
            type: 'overdue',
            title: 'TRR Overdue',
            message: `TRR "${trr.title}" is ${Math.abs(daysUntilDue)} days overdue`,
            relatedTRRId: trr.id,
            relatedTRRTitle: trr.title,
            priority: 'critical',
            isRead: false,
            createdAt: now,
            actionUrl: `/trr/${trr.id}`,
            actionLabel: 'Review TRR',
            metadata: { daysOverdue: Math.abs(daysUntilDue) },
          });
        }
      }

      // Blocking dependency notifications
      if (trr.dependencies && trr.dependencies.length > 0) {
        const blockedBy = trr.dependencies.filter(depId => {
          const dep = trrs.find(t => t.id === depId);
          return dep && dep.status !== 'completed' && dep.status !== 'validated';
        });

        if (blockedBy.length > 0) {
          generated.push({
            id: `blocked-${trr.id}`,
            type: 'blocking_dependency',
            title: 'TRR Blocked by Dependencies',
            message: `TRR "${trr.title}" is blocked by ${blockedBy.length} incomplete dependencies`,
            relatedTRRId: trr.id,
            relatedTRRTitle: trr.title,
            priority: 'high',
            isRead: false,
            createdAt: now,
            actionUrl: `/trr/${trr.id}`,
            actionLabel: 'View Dependencies',
            metadata: { blockedBy },
          });
        }
      }

      // Test failure notifications
      if (trr.testCases && trr.testCases.some(tc => tc.status === 'failed')) {
        const failedTests = trr.testCases.filter(tc => tc.status === 'failed');
        generated.push({
          id: `test-fail-${trr.id}`,
          type: 'test_failure',
          title: 'Test Cases Failed',
          message: `${failedTests.length} test case(s) failed in TRR "${trr.title}"`,
          relatedTRRId: trr.id,
          relatedTRRTitle: trr.title,
          priority: 'high',
          isRead: false,
          createdAt: now,
          actionUrl: `/trr/${trr.id}?tab=testing`,
          actionLabel: 'View Tests',
        });
      }

      // Approval request notifications
      if (trr.sdwProgress && trr.sdwProgress.some(step => step.status === 'pending_approval')) {
        const pendingApprovals = trr.sdwProgress.filter(step => step.status === 'pending_approval');
        generated.push({
          id: `approval-${trr.id}`,
          type: 'approval_request',
          title: 'Approval Required',
          message: `${pendingApprovals.length} approval(s) pending for TRR "${trr.title}"`,
          relatedTRRId: trr.id,
          relatedTRRTitle: trr.title,
          priority: 'medium',
          isRead: false,
          createdAt: now,
          actionUrl: `/trr/${trr.id}?tab=sdw`,
          actionLabel: 'Review & Approve',
        });
      }
    });

    return generated;
  }, [trrs]);

  // Combine manual and generated notifications
  const allNotifications = useMemo(() => {
    return [...notifications, ...generatedNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, generatedNotifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = allNotifications;

    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered;
  }, [allNotifications, filterType, showUnreadOnly]);

  // Get notification counts by type
  const notificationCounts = useMemo(() => {
    const counts = allNotifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const unreadCount = allNotifications.filter(n => !n.isRead).length;
    
    return {
      all: allNotifications.length,
      unread: unreadCount,
      ...counts,
    };
  }, [allNotifications]);

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'due_date': return '📅';
      case 'overdue': return '🚨';
      case 'blocking_dependency': return '🚧';
      case 'approval_request': return '✋';
      case 'status_change': return '🔄';
      case 'mention': return '💬';
      case 'assignment': return '👤';
      case 'test_failure': return '❌';
      case 'milestone': return '🎯';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: Notification['priority']): string => {
    switch (priority) {
      case 'critical': return 'border-l-cortex-error bg-cortex-error/5';
      case 'high': return 'border-l-cortex-warning bg-cortex-warning/5';
      case 'medium': return 'border-l-cortex-info bg-cortex-info/5';
      case 'low': return 'border-l-cortex-success bg-cortex-success/5';
      default: return 'border-l-cortex-border-secondary';
    }
  };

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (onNotificationRead && !notification.isRead) {
      onNotificationRead(notification.id);
    }
  }, [onNotificationRead]);

  const handleNotificationAction = useCallback((notification: Notification) => {
    if (onNotificationAction) {
      onNotificationAction(notification);
    }
    handleNotificationClick(notification);
  }, [onNotificationAction, handleNotificationClick]);

  // New rule creation state
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    name: '',
    type: 'due_date',
    conditions: {},
    enabled: true,
    channels: {
      inApp: true,
      email: false,
      slack: false,
    },
    schedule: {
      immediate: true,
      daily: false,
      weekly: false,
    },
  });

  const handleCreateRule = async () => {
    if (!onRuleCreate || !newRule.name || !newRule.type) return;

    try {
      await onRuleCreate(newRule as Omit<NotificationRule, 'id'>);
      setNewRule({
        name: '',
        type: 'due_date',
        conditions: {},
        enabled: true,
        channels: {
          inApp: true,
          email: false,
          slack: false,
        },
        schedule: {
          immediate: true,
          daily: false,
          weekly: false,
        },
      });
      setShowCreateRule(false);
    } catch (error) {
      console.error('Failed to create notification rule:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">Notifications</h2>
          <p className="text-cortex-text-secondary">
            Stay informed about TRR events and important updates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {notificationCounts.unread > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-cortex-error/10 border border-cortex-error/20 rounded-lg">
              <span className="text-cortex-error text-sm font-medium">
                {notificationCounts.unread} unread
              </span>
            </div>
          )}

          <CortexButton
            onClick={() => setShowCreateRule(true)}
            variant="outline"
            icon="+"
            size="sm"
          >
            Create Rule
          </CortexButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-cortex-border-secondary">
        <nav className="flex space-x-8">
          {[
            { key: 'notifications', label: 'Notifications', count: notificationCounts.all },
            { key: 'rules', label: 'Rules', count: notificationRules.length },
            { key: 'settings', label: 'Settings', count: undefined },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.key
                  ? 'border-cortex-green text-cortex-text-primary'
                  : 'border-transparent text-cortex-text-muted hover:text-cortex-text-primary hover:border-cortex-border-secondary'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-1 bg-cortex-bg-secondary text-cortex-text-muted rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications Tab */}
      {selectedTab === 'notifications' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-cortex-text-muted">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary text-sm"
              >
                <option value="all">All ({notificationCounts.all})</option>
                {Object.entries(notificationCounts)
                  .filter(([key]) => key !== 'all' && key !== 'unread')
                  .map(([type, count]) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                    </option>
                  ))}
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-cortex-border-secondary"
              />
              <span className="text-sm text-cortex-text-primary">Show unread only</span>
            </label>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No notifications</h3>
                <p className="text-cortex-text-secondary">
                  {showUnreadOnly ? 'No unread notifications' : 'All caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`cortex-card p-4 border-l-4 cursor-pointer transition-all ${
                    getPriorityColor(notification.priority)
                  } ${!notification.isRead ? 'ring-2 ring-cortex-green/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-xl mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-cortex-text-primary">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-cortex-green rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-cortex-text-secondary text-sm mb-2">
                          {notification.message}
                        </p>
                        
                        {notification.relatedTRRTitle && (
                          <div className="flex items-center space-x-2 text-xs text-cortex-text-muted">
                            <span>📋</span>
                            <span>{notification.relatedTRRTitle}</span>
                          </div>
                        )}

                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {notification.metadata.daysOverdue && (
                              <span className="text-xs px-2 py-1 bg-cortex-error/20 text-cortex-error rounded">
                                {notification.metadata.daysOverdue} days overdue
                              </span>
                            )}
                            {notification.metadata.blockedBy && (
                              <span className="text-xs px-2 py-1 bg-cortex-warning/20 text-cortex-warning rounded">
                                Blocked by {notification.metadata.blockedBy.length} TRRs
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-cortex-text-muted">
                        {notification.createdAt.toLocaleDateString()}
                      </span>
                      
                      {notification.actionLabel && (
                        <CortexButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notification);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          {notification.actionLabel}
                        </CortexButton>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-6">
          <div className="cortex-card">
            <div className="p-4 border-b border-cortex-border-secondary">
              <h3 className="font-semibold text-cortex-text-primary">Notification Rules</h3>
            </div>

            <div className="divide-y divide-cortex-border-secondary">
              {notificationRules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-2">No notification rules</h3>
                  <p className="text-cortex-text-secondary mb-6">
                    Create rules to customize when and how you receive notifications
                  </p>
                  <CortexButton
                    onClick={() => setShowCreateRule(true)}
                    variant="primary"
                  >
                    Create Your First Rule
                  </CortexButton>
                </div>
              ) : (
                notificationRules.map((rule) => (
                  <div key={rule.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-xl">{getNotificationIcon(rule.type)}</div>
                        
                        <div>
                          <h4 className="font-medium text-cortex-text-primary">{rule.name}</h4>
                          <p className="text-sm text-cortex-text-secondary capitalize">
                            {rule.type.replace('_', ' ')} notifications
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-cortex-text-muted">Channels:</span>
                              {rule.channels.inApp && <span className="text-xs px-2 py-1 bg-cortex-info/20 text-cortex-info rounded">In-App</span>}
                              {rule.channels.email && <span className="text-xs px-2 py-1 bg-cortex-success/20 text-cortex-success rounded">Email</span>}
                              {rule.channels.slack && <span className="text-xs px-2 py-1 bg-cortex-warning/20 text-cortex-warning rounded">Slack</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) => onRuleUpdate?.({ ...rule, enabled: e.target.checked })}
                            className="rounded border-cortex-border-secondary"
                          />
                          <span className="text-sm text-cortex-text-primary">Enabled</span>
                        </label>

                        <CortexButton
                          onClick={() => setEditingRule(rule)}
                          variant="outline"
                          size="sm"
                          icon="✏️"
                        />

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete rule "${rule.name}"?`)) {
                              onRuleDelete?.(rule.id);
                            }
                          }}
                          className="text-cortex-error hover:text-cortex-error-dark"
                          title="Delete rule"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-6">
          <div className="cortex-card p-6">
            <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Global Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-cortex-border-secondary"
                  />
                  <span className="text-sm text-cortex-text-primary">Enable desktop notifications</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-cortex-border-secondary"
                  />
                  <span className="text-sm text-cortex-text-primary">Enable email notifications</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-cortex-border-secondary"
                  />
                  <span className="text-sm text-cortex-text-primary">Enable Slack notifications</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Daily digest time
                </label>
                <input
                  type="time"
                  className="px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                  defaultValue="09:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Slack webhook URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cortex-bg-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-cortex-border-secondary">
              <h3 className="text-lg font-semibold text-cortex-text-primary">Create Notification Rule</h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                  placeholder="Enter rule name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Notification Type
                </label>
                <select
                  value={newRule.type || 'due_date'}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary"
                >
                  <option value="due_date">Due Date</option>
                  <option value="overdue">Overdue</option>
                  <option value="blocking_dependency">Blocking Dependency</option>
                  <option value="approval_request">Approval Request</option>
                  <option value="status_change">Status Change</option>
                  <option value="test_failure">Test Failure</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cortex-text-primary mb-2">
                  Notification Channels
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.inApp || false}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        channels: { ...newRule.channels!, inApp: e.target.checked }
                      })}
                      className="rounded border-cortex-border-secondary"
                    />
                    <span className="text-sm text-cortex-text-primary">In-app notifications</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.email || false}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        channels: { ...newRule.channels!, email: e.target.checked }
                      })}
                      className="rounded border-cortex-border-secondary"
                    />
                    <span className="text-sm text-cortex-text-primary">Email notifications</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.slack || false}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        channels: { ...newRule.channels!, slack: e.target.checked }
                      })}
                      className="rounded border-cortex-border-secondary"
                    />
                    <span className="text-sm text-cortex-text-primary">Slack notifications</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-cortex-border-secondary flex justify-end space-x-3">
              <CortexButton
                onClick={() => setShowCreateRule(false)}
                variant="outline"
              >
                Cancel
              </CortexButton>
              <CortexButton
                onClick={handleCreateRule}
                variant="primary"
                disabled={!newRule.name || !newRule.type}
              >
                Create Rule
              </CortexButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRRNotificationCenter;