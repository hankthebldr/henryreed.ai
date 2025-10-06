/**
 * User Activity Service
 * Comprehensive service for managing user-specific features including:
 * - Note taking and management
 * - Meeting capture and scheduling
 * - Activity timeline tracking
 * - User preferences and settings
 * - POV progress tracking
 */

export interface UserNote {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'meeting' | 'pov' | 'scenario' | 'customer';
  associatedId?: string; // Related POV, scenario, or customer ID
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  author: string;
}

export interface MeetingCapture {
  id: string;
  title: string;
  type: 'demo' | 'follow-up' | 'planning' | 'review' | 'customer' | 'internal';
  participants: string[];
  scheduledAt: string;
  duration?: number; // in minutes
  location?: string;
  meetingLink?: string;
  agenda: string[];
  notes: string;
  actionItems: ActionItem[];
  recordings?: string[]; // URLs to recordings
  attachments?: string[]; // File URLs
  relatedPOV?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  createdAt: string;
  completedAt?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'pov-created' | 'pov-updated' | 'meeting' | 'note' | 'scenario-generated' | 'customer-interaction' | 'milestone' | 'action-item';
  title: string;
  description: string;
  timestamp: string;
  associatedId?: string;
  metadata: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  category: 'pov' | 'customer' | 'technical' | 'administrative';
  author: string;
}

export interface UserPreferences {
  userId: string;
  theme: 'dark' | 'light' | 'auto';
  notifications: {
    email: boolean;
    inApp: boolean;
    meetingReminders: boolean;
    povUpdates: boolean;
    actionItemDues: boolean;
  };
  defaultView: 'dashboard' | 'timeline' | 'pov-list' | 'content-library';
  timeZone: string;
  dateFormat: string;
  autoSaveInterval: number;
  favoriteCommands: string[];
  customTags: string[];
  updatedAt: string;
}

export interface UserActivity {
  userId: string;
  sessionId: string;
  action: string;
  component: string;
  metadata: Record<string, any>;
  timestamp: string;
  duration?: number;
}

// Local storage keys
const STORAGE_KEYS = {
  NOTES: 'user_notes',
  MEETINGS: 'user_meetings',
  TIMELINE: 'user_timeline',
  PREFERENCES: 'user_preferences',
  ACTIVITY: 'user_activity',
  ACTION_ITEMS: 'action_items'
};

class UserActivityService {
  private currentUser: string = 'current-user@company.com';
  private sessionId: string = Date.now().toString();

  // Notes Management
  async createNote(note: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt' | 'author'>): Promise<UserNote> {
    const newNote: UserNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: this.currentUser
    };

    const notes = this.getNotes();
    notes.push(newNote);
    this.saveNotes(notes);

    // Add to timeline
    this.addTimelineEvent({
      type: 'note',
      title: 'Note Created',
      description: `Created note: ${note.title}`,
      associatedId: newNote.id,
      metadata: { noteType: note.type, tags: note.tags },
      priority: 'low',
      category: note.type === 'customer' ? 'customer' : 'administrative'
    });

    return newNote;
  }

  async updateNote(noteId: string, updates: Partial<UserNote>): Promise<UserNote | null> {
    const notes = this.getNotes();
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) return null;

    const updatedNote = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    notes[noteIndex] = updatedNote;
    this.saveNotes(notes);

    return updatedNote;
  }

  getNotes(filters?: {
    type?: UserNote['type'];
    tags?: string[];
    pinned?: boolean;
    archived?: boolean;
    search?: string;
  }): UserNote[] {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
    let notes: UserNote[] = stored ? JSON.parse(stored) : [];

    if (filters) {
      if (filters.type) {
        notes = notes.filter(note => note.type === filters.type);
      }
      if (filters.tags?.length) {
        notes = notes.filter(note => 
          filters.tags!.some(tag => note.tags.includes(tag))
        );
      }
      if (filters.pinned !== undefined) {
        notes = notes.filter(note => note.pinned === filters.pinned);
      }
      if (filters.archived !== undefined) {
        notes = notes.filter(note => note.archived === filters.archived);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        notes = notes.filter(note => 
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
        );
      }
    }

    return notes.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  async deleteNote(noteId: string): Promise<boolean> {
    const notes = this.getNotes();
    const filteredNotes = notes.filter(note => note.id !== noteId);
    
    if (filteredNotes.length === notes.length) return false;
    
    this.saveNotes(filteredNotes);
    return true;
  }

  private saveNotes(notes: UserNote[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  // Meeting Management
  async scheduleMeeting(meeting: Omit<MeetingCapture, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<MeetingCapture> {
    const newMeeting: MeetingCapture = {
      ...meeting,
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const meetings = this.getMeetings();
    meetings.push(newMeeting);
    this.saveMeetings(meetings);

    // Add to timeline
    this.addTimelineEvent({
      type: 'meeting',
      title: 'Meeting Scheduled',
      description: `${meeting.type} meeting: ${meeting.title}`,
      associatedId: newMeeting.id,
      metadata: { meetingType: meeting.type, participants: meeting.participants },
      priority: 'medium',
      category: meeting.type === 'customer' ? 'customer' : 'administrative'
    });

    return newMeeting;
  }

  async updateMeeting(meetingId: string, updates: Partial<MeetingCapture>): Promise<MeetingCapture | null> {
    const meetings = this.getMeetings();
    const meetingIndex = meetings.findIndex(meeting => meeting.id === meetingId);
    
    if (meetingIndex === -1) return null;

    const updatedMeeting = {
      ...meetings[meetingIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    meetings[meetingIndex] = updatedMeeting;
    this.saveMeetings(meetings);

    return updatedMeeting;
  }

  getMeetings(filters?: {
    type?: MeetingCapture['type'];
    status?: MeetingCapture['status'];
    dateRange?: { start: string; end: string };
    relatedPOV?: string;
  }): MeetingCapture[] {
    const stored = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    let meetings: MeetingCapture[] = stored ? JSON.parse(stored) : [];

    if (filters) {
      if (filters.type) {
        meetings = meetings.filter(meeting => meeting.type === filters.type);
      }
      if (filters.status) {
        meetings = meetings.filter(meeting => meeting.status === filters.status);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        meetings = meetings.filter(meeting => {
          const meetingDate = new Date(meeting.scheduledAt);
          return meetingDate >= start && meetingDate <= end;
        });
      }
      if (filters.relatedPOV) {
        meetings = meetings.filter(meeting => meeting.relatedPOV === filters.relatedPOV);
      }
    }

    return meetings.sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }

  private saveMeetings(meetings: MeetingCapture[]): void {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  }

  // Action Items Management
  async createActionItem(item: Omit<ActionItem, 'id' | 'createdAt'>): Promise<ActionItem> {
    const newItem: ActionItem = {
      ...item,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    const items = this.getActionItems();
    items.push(newItem);
    this.saveActionItems(items);

    return newItem;
  }

  async updateActionItem(itemId: string, updates: Partial<ActionItem>): Promise<ActionItem | null> {
    const items = this.getActionItems();
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return null;

    const updatedItem = {
      ...items[itemIndex],
      ...updates,
      ...(updates.status === 'done' && { completedAt: new Date().toISOString() })
    };

    items[itemIndex] = updatedItem;
    this.saveActionItems(items);

    if (updates.status === 'done') {
      this.addTimelineEvent({
        type: 'action-item',
        title: 'Action Item Completed',
        description: `Completed: ${updatedItem.description}`,
        associatedId: itemId,
        metadata: { priority: updatedItem.priority, assignee: updatedItem.assignee },
        priority: 'medium',
        category: 'administrative'
      });
    }

    return updatedItem;
  }

  getActionItems(filters?: {
    status?: ActionItem['status'];
    assignee?: string;
    priority?: ActionItem['priority'];
    overdue?: boolean;
  }): ActionItem[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTION_ITEMS);
    let items: ActionItem[] = stored ? JSON.parse(stored) : [];

    if (filters) {
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
      if (filters.assignee) {
        items = items.filter(item => item.assignee === filters.assignee);
      }
      if (filters.priority) {
        items = items.filter(item => item.priority === filters.priority);
      }
      if (filters.overdue) {
        const now = new Date();
        items = items.filter(item => 
          item.dueDate && new Date(item.dueDate) < now && item.status !== 'done'
        );
      }
    }

    return items.sort((a, b) => {
      // Sort by status (todo/in-progress first), then by priority, then by due date
      const statusOrder = { 'todo': 0, 'in-progress': 1, 'blocked': 2, 'done': 3 };
      const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  private saveActionItems(items: ActionItem[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify(items));
  }

  // Timeline Management
  addTimelineEvent(event: Omit<TimelineEvent, 'id' | 'timestamp' | 'author'>): TimelineEvent {
    const newEvent: TimelineEvent = {
      ...event,
      id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      author: this.currentUser
    };

    const timeline = this.getTimelineEvents();
    timeline.push(newEvent);
    this.saveTimeline(timeline);

    return newEvent;
  }

  getTimelineEvents(filters?: {
    type?: TimelineEvent['type'];
    category?: TimelineEvent['category'];
    dateRange?: { start: string; end: string };
    associatedId?: string;
    priority?: TimelineEvent['priority'];
  }): TimelineEvent[] {
    const stored = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    let events: TimelineEvent[] = stored ? JSON.parse(stored) : [];

    if (filters) {
      if (filters.type) {
        events = events.filter(event => event.type === filters.type);
      }
      if (filters.category) {
        events = events.filter(event => event.category === filters.category);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        events = events.filter(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= start && eventDate <= end;
        });
      }
      if (filters.associatedId) {
        events = events.filter(event => event.associatedId === filters.associatedId);
      }
      if (filters.priority) {
        events = events.filter(event => event.priority === filters.priority);
      }
    }

    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private saveTimeline(events: TimelineEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(events));
  }

  // User Preferences
  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const currentPrefs = this.getPreferences();
    const updatedPrefs = {
      ...currentPrefs,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
    return updatedPrefs;
  }

  getPreferences(): UserPreferences {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Default preferences
    const defaultPrefs: UserPreferences = {
      userId: this.currentUser,
      theme: 'dark',
      notifications: {
        email: true,
        inApp: true,
        meetingReminders: true,
        povUpdates: true,
        actionItemDues: true
      },
      defaultView: 'dashboard',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/dd/yyyy',
      autoSaveInterval: 30000, // 30 seconds
      favoriteCommands: [],
      customTags: [],
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(defaultPrefs));
    return defaultPrefs;
  }

  // Activity Tracking
  trackActivity(action: string, component: string, metadata: Record<string, any> = {}): void {
    const activity: UserActivity = {
      userId: this.currentUser,
      sessionId: this.sessionId,
      action,
      component,
      metadata,
      timestamp: new Date().toISOString()
    };

    const activities = this.getActivities();
    activities.push(activity);
    
    // Keep only last 1000 activities to prevent storage bloat
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }

    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities));
  }

  getActivities(limit: number = 100): UserActivity[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    const activities: UserActivity[] = stored ? JSON.parse(stored) : [];
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Analytics and Insights
  getInsights(): {
    totalNotes: number;
    totalMeetings: number;
    pendingActionItems: number;
    recentActivity: number;
    productivityScore: number;
    trendsLastWeek: Record<string, number>;
  } {
    const notes = this.getNotes();
    const meetings = this.getMeetings();
    const actionItems = this.getActionItems();
    const activities = this.getActivities();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentActivities = activities.filter(
      activity => new Date(activity.timestamp) > weekAgo
    );

    const pendingItems = actionItems.filter(
      item => item.status === 'todo' || item.status === 'in-progress'
    );

    // Simple productivity score based on completed vs pending items
    const completedItems = actionItems.filter(item => item.status === 'done');
    const productivityScore = actionItems.length > 0 
      ? Math.round((completedItems.length / actionItems.length) * 100)
      : 100;

    // Activity trends
    const trendsLastWeek: Record<string, number> = {};
    recentActivities.forEach(activity => {
      trendsLastWeek[activity.action] = (trendsLastWeek[activity.action] || 0) + 1;
    });

    return {
      totalNotes: notes.length,
      totalMeetings: meetings.length,
      pendingActionItems: pendingItems.length,
      recentActivity: recentActivities.length,
      productivityScore,
      trendsLastWeek
    };
  }

  // Data Management
  exportUserData(): {
    notes: UserNote[];
    meetings: MeetingCapture[];
    timeline: TimelineEvent[];
    actionItems: ActionItem[];
    preferences: UserPreferences;
    exportedAt: string;
  } {
    return {
      notes: this.getNotes(),
      meetings: this.getMeetings(),
      timeline: this.getTimelineEvents(),
      actionItems: this.getActionItems(),
      preferences: this.getPreferences(),
      exportedAt: new Date().toISOString()
    };
  }

  async importUserData(data: any): Promise<boolean> {
    try {
      if (data.notes) this.saveNotes(data.notes);
      if (data.meetings) this.saveMeetings(data.meetings);
      if (data.timeline) this.saveTimeline(data.timeline);
      if (data.actionItems) this.saveActionItems(data.actionItems);
      if (data.preferences) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const userActivityService = new UserActivityService();
export default userActivityService;