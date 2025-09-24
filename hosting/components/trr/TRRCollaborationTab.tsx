'use client';

import React, { useState } from 'react';
import { TRR } from '../../types/trr';
import { CortexButton } from '../CortexButton';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  edited?: boolean;
  editedAt?: string;
  parentId?: string; // For replies
  reactions?: Record<string, string[]>; // emoji -> userIds[]
}

interface Activity {
  id: string;
  type: 'status_change' | 'assignment' | 'attachment' | 'comment' | 'approval' | 'test_result';
  authorId: string;
  authorName: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

interface TRRCollaborationTabProps {
  trr: TRR;
  comments?: Comment[];
  activities?: Activity[];
  currentUserId?: string;
  currentUserName?: string;
  onAddComment?: (content: string, mentions: string[], parentId?: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onAddReaction?: (commentId: string, emoji: string) => void;
  onRemoveReaction?: (commentId: string, emoji: string) => void;
  onMention?: (userIds: string[]) => void;
}

export const TRRCollaborationTab: React.FC<TRRCollaborationTabProps> = ({
  trr,
  comments = [],
  activities = [],
  currentUserId = 'current-user',
  currentUserName = 'Current User',
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddReaction,
  onRemoveReaction,
  onMention,
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  // Sample team members for mentions
  const teamMembers = [
    { id: 'user1', name: 'Alice Johnson', role: 'Product Owner' },
    { id: 'user2', name: 'Bob Smith', role: 'Technical Lead' },
    { id: 'user3', name: 'Carol Davis', role: 'QA Lead' },
    { id: 'user4', name: 'David Wilson', role: 'Business Analyst' },
    { id: 'user5', name: 'Eve Brown', role: 'Security Lead' },
  ];

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const renderContentWithMentions = (content: string): React.ReactNode => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <span key={index} className="text-cortex-info font-medium bg-cortex-info/10 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && onAddComment) {
      const mentions = extractMentions(newComment);
      onAddComment(newComment.trim(), mentions, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
      if (mentions.length > 0 && onMention) {
        onMention(mentions);
      }
    }
  };

  const handleEditComment = (commentId: string) => {
    if (editContent.trim() && onEditComment) {
      onEditComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    }
  };

  const startEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    // Check for mentions
    const lastWord = value.split(' ').pop();
    if (lastWord?.startsWith('@') && lastWord.length > 1) {
      const searchTerm = lastWord.substring(1).toLowerCase();
      const suggestions = teamMembers
        .filter(member => member.name.toLowerCase().includes(searchTerm))
        .map(member => member.name);
      setMentionSuggestions(suggestions);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (memberName: string) => {
    const words = newComment.split(' ');
    words[words.length - 1] = `@${memberName.replace(' ', '')} `;
    setNewComment(words.join(' '));
    setShowMentions(false);
  };

  const getActivityIcon = (type: string): string => {
    const icons = {
      'status_change': '🔄',
      'assignment': '👤',
      'attachment': '📎',
      'comment': '💬',
      'approval': '✅',
      'test_result': '🧪'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getActivityColor = (type: string): string => {
    const colors = {
      'status_change': 'text-cortex-info',
      'assignment': 'text-cortex-warning',
      'attachment': 'text-cortex-success',
      'comment': 'text-cortex-text-primary',
      'approval': 'text-cortex-success',
      'test_result': 'text-cortex-info'
    };
    return colors[type as keyof typeof colors] || 'text-cortex-text-primary';
  };

  // Group comments by parent/child relationships
  const groupedComments = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      acc[comment.id] = {
        parent: comment,
        replies: comments.filter(c => c.parentId === comment.id)
      };
    }
    return acc;
  }, {} as Record<string, { parent: Comment; replies: Comment[] }>);

  const reactionEmojis = ['👍', '❤️', '😄', '🎉', '🚀', '👎'];

  return (
    <div className="space-y-6">
      {/* Collaboration Header */}
      <div className="cortex-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-cortex-text-primary">
            Collaboration & Communication
          </h3>
          
          <div className="flex items-center space-x-3">
            <div className="text-right text-sm">
              <p className="text-cortex-text-muted">Watchers:</p>
              <p className="font-medium text-cortex-text-primary">
                {trr.watchers?.length || 0} people
              </p>
            </div>
            
            <CortexButton
              variant="outline"
              icon="👥"
              onClick={() => {
                // Open watchers modal
              }}
            >
              Manage Watchers
            </CortexButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
            <div className="text-xl font-bold text-cortex-info">
              {comments.length}
            </div>
            <p className="text-sm text-cortex-text-muted">Comments</p>
          </div>
          <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
            <div className="text-xl font-bold text-cortex-warning">
              {activities.length}
            </div>
            <p className="text-sm text-cortex-text-muted">Activities</p>
          </div>
          <div className="text-center p-3 bg-cortex-bg-tertiary rounded">
            <div className="text-xl font-bold text-cortex-success">
              {trr.watchers?.length || 0}
            </div>
            <p className="text-sm text-cortex-text-muted">Watchers</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="cortex-card overflow-hidden">
        <div className="flex border-b border-cortex-border-secondary">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-cortex-green border-b-2 border-cortex-green bg-cortex-green/5'
                : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
            }`}
          >
            💬 Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-cortex-green border-b-2 border-cortex-green bg-cortex-green/5'
                : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
            }`}
          >
            📊 Activity ({activities.length})
          </button>
        </div>

        <div className="p-6">
          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* New Comment Form */}
              <div className="relative">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-cortex-green text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {currentUserName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                      rows={3}
                      className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                    />
                    
                    {/* Mention Suggestions */}
                    {showMentions && mentionSuggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 bg-cortex-bg-primary border border-cortex-border-secondary rounded shadow-lg max-h-40 overflow-y-auto">
                        {mentionSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => insertMention(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-cortex-bg-hover text-cortex-text-primary"
                          >
                            @{suggestion.replace(' ', '')}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-sm text-cortex-text-muted">
                        <span>💡 Use @username to mention team members</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {replyingTo && (
                          <CortexButton
                            onClick={() => setReplyingTo(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel Reply
                          </CortexButton>
                        )}
                        <CortexButton
                          onClick={handleSubmitComment}
                          variant="primary"
                          size="sm"
                          icon="💬"
                          disabled={!newComment.trim()}
                        >
                          {replyingTo ? 'Reply' : 'Comment'}
                        </CortexButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {Object.values(groupedComments).length > 0 ? (
                <div className="space-y-6">
                  {Object.values(groupedComments)
                    .sort((a, b) => new Date(b.parent.timestamp).getTime() - new Date(a.parent.timestamp).getTime())
                    .map(({ parent, replies }) => (
                      <div key={parent.id} className="space-y-4">
                        {/* Parent Comment */}
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-cortex-info text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {parent.authorName.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-cortex-bg-tertiary p-4 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-medium text-cortex-text-primary">
                                    {parent.authorName}
                                  </h5>
                                  <p className="text-sm text-cortex-text-muted">
                                    {formatTimeAgo(parent.timestamp)}
                                    {parent.edited && ' (edited)'}
                                  </p>
                                </div>
                                
                                {parent.authorId === currentUserId && (
                                  <div className="flex items-center space-x-1">
                                    <CortexButton
                                      onClick={() => startEditComment(parent)}
                                      variant="outline"
                                      size="sm"
                                      icon="✏️"
                                    />
                                    <CortexButton
                                      onClick={() => onDeleteComment?.(parent.id)}
                                      variant="outline"
                                      size="sm"
                                      icon="🗑️"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {editingComment === parent.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:outline-none focus:ring-2 focus:ring-cortex-green/50"
                                    rows={3}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <CortexButton
                                      onClick={() => setEditingComment(null)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Cancel
                                    </CortexButton>
                                    <CortexButton
                                      onClick={() => handleEditComment(parent.id)}
                                      variant="primary"
                                      size="sm"
                                      icon="💾"
                                    >
                                      Save
                                    </CortexButton>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-cortex-text-primary">
                                  {renderContentWithMentions(parent.content)}
                                </div>
                              )}
                              
                              {/* Reactions */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-cortex-border-secondary">
                                <div className="flex items-center space-x-2">
                                  {reactionEmojis.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => onAddReaction?.(parent.id, emoji)}
                                      className="text-sm hover:bg-cortex-bg-hover px-2 py-1 rounded transition-colors"
                                    >
                                      {emoji}
                                      {parent.reactions?.[emoji]?.length ? (
                                        <span className="ml-1 text-cortex-text-muted">
                                          {parent.reactions[emoji].length}
                                        </span>
                                      ) : null}
                                    </button>
                                  ))}
                                </div>
                                
                                <CortexButton
                                  onClick={() => setReplyingTo(parent.id)}
                                  variant="outline"
                                  size="sm"
                                  icon="↩️"
                                >
                                  Reply
                                </CortexButton>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="ml-11 space-y-3">
                            {replies
                              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                              .map(reply => (
                                <div key={reply.id} className="flex space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-cortex-warning text-white rounded-full flex items-center justify-center text-xs font-medium">
                                      {reply.authorName.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-cortex-bg-hover p-3 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                        <h6 className="text-sm font-medium text-cortex-text-primary">
                                          {reply.authorName}
                                        </h6>
                                        <span className="text-xs text-cortex-text-muted">
                                          {formatTimeAgo(reply.timestamp)}
                                        </span>
                                      </div>
                                      <div className="text-sm text-cortex-text-primary">
                                        {renderContentWithMentions(reply.content)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-cortex-text-muted mb-4">No comments yet</p>
                  <p className="text-sm text-cortex-text-secondary">
                    Start the conversation by adding the first comment!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(activity => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-cortex-bg-tertiary rounded-lg">
                        <span className={`text-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-cortex-text-primary">
                              <span className="font-medium">{activity.authorName}</span>{' '}
                              <span>{activity.description}</span>
                            </p>
                            <span className="text-sm text-cortex-text-muted">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                          {activity.metadata && (
                            <div className="mt-1 text-sm text-cortex-text-secondary">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-cortex-text-muted">No activity recorded yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TRRCollaborationTab;