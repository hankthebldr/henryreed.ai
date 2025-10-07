'use client';

import React, { useState, useMemo } from 'react';
import CortexButton from './CortexButton';

// Content item types
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: 'secops' | 'cloud-security' | 'detection-rules' | 'scenarios' | 'templates' | 'playbooks';
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  author: string;
  version: string;
  lastUpdated: string;
  usageCount: number;
  rating: number;
  content: {
    type: 'json' | 'yaml' | 'xml' | 'text' | 'markdown';
    data: any;
  };
  metadata: {
    estimatedTime?: string;
    prerequisites?: string[];
    platforms?: string[];
    mitreAttck?: string[];
    dataTypes?: string[];
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
  isFavorite?: boolean;
}

// Sample content library data
const CONTENT_LIBRARY: ContentItem[] = [
  // SecOps Items
  {
    id: 'secops-001',
    title: 'Advanced Persistent Threat Detection',
    description: 'Multi-stage APT detection rules with behavioral analytics and MITRE ATT&CK mapping',
    category: 'secops',
    subcategory: 'threat-hunting',
    difficulty: 'advanced',
    tags: ['apt', 'threat-hunting', 'behavioral', 'mitre-attack'],
    author: 'Security Team',
    version: '2.1.0',
    lastUpdated: '2024-01-15',
    usageCount: 47,
    rating: 4.8,
    content: {
      type: 'yaml',
      data: {
        detection_rules: [
          {
            name: 'APT Lateral Movement',
            technique: 'T1021',
            query: 'event_type="process_creation" AND (process_name CONTAINS "psexec" OR process_name CONTAINS "wmic")',
            severity: 'high'
          }
        ]
      }
    },
    metadata: {
      estimatedTime: '45 minutes',
      prerequisites: ['SIEM access', 'Threat intelligence feeds'],
      platforms: ['Windows', 'Linux'],
      mitreAttck: ['T1021', 'T1055', 'T1078'],
      dataTypes: ['process', 'network', 'file'],
      riskLevel: 'high'
    }
  },
  {
    id: 'secops-002',
    title: 'Insider Threat Monitoring Playbook',
    description: 'Comprehensive playbook for detecting and responding to insider threats',
    category: 'secops',
    subcategory: 'playbooks',
    difficulty: 'intermediate',
    tags: ['insider-threat', 'ueba', 'monitoring', 'response'],
    author: 'SOC Team',
    version: '1.3.0',
    lastUpdated: '2024-01-20',
    usageCount: 32,
    rating: 4.6,
    content: {
      type: 'markdown',
      data: `# Insider Threat Monitoring Playbook
      
## Overview
This playbook provides step-by-step procedures for detecting insider threats...

## Detection Scenarios
1. Unusual data access patterns
2. After-hours activity spikes
3. Privilege escalation attempts
      `
    },
    metadata: {
      estimatedTime: '30 minutes',
      prerequisites: ['UEBA platform', 'HR data integration'],
      platforms: ['Cloud', 'On-premises'],
      dataTypes: ['authentication', 'file-access', 'email'],
      riskLevel: 'medium'
    }
  },

  // Cloud Security Items
  {
    id: 'cloud-001',
    title: 'AWS Security Misconfigurations',
    description: 'Detection rules for common AWS security misconfigurations and compliance violations',
    category: 'cloud-security',
    subcategory: 'aws',
    difficulty: 'intermediate',
    tags: ['aws', 'misconfiguration', 'compliance', 'cspm'],
    author: 'Cloud Security Team',
    version: '3.2.1',
    lastUpdated: '2024-01-18',
    usageCount: 89,
    rating: 4.9,
    content: {
      type: 'json',
      data: {
        rules: [
          {
            service: 'S3',
            check: 'bucket_public_read',
            severity: 'critical',
            remediation: 'Apply bucket policy to restrict public access'
          },
          {
            service: 'IAM',
            check: 'overprivileged_users',
            severity: 'high',
            remediation: 'Review and reduce user permissions'
          }
        ]
      }
    },
    metadata: {
      estimatedTime: '20 minutes',
      prerequisites: ['AWS CloudTrail', 'Config service'],
      platforms: ['AWS'],
      dataTypes: ['cloudtrail', 'config', 'iam'],
      riskLevel: 'high'
    }
  },
  {
    id: 'cloud-002',
    title: 'Azure AD Attack Detection',
    description: 'Advanced detection scenarios for Azure Active Directory attacks and anomalies',
    category: 'cloud-security',
    subcategory: 'azure',
    difficulty: 'advanced',
    tags: ['azure-ad', 'identity', 'authentication', 'attack-detection'],
    author: 'Identity Security Team',
    version: '2.0.0',
    lastUpdated: '2024-01-22',
    usageCount: 56,
    rating: 4.7,
    content: {
      type: 'yaml',
      data: {
        detection_scenarios: [
          {
            name: 'Azure AD Brute Force',
            description: 'Detect brute force attacks against Azure AD',
            query: 'SigninLogs | where ResultType != "0" | summarize count() by UserPrincipalName',
            threshold: 10
          }
        ]
      }
    },
    metadata: {
      estimatedTime: '35 minutes',
      prerequisites: ['Azure AD Premium', 'Security Center'],
      platforms: ['Azure'],
      mitreAttck: ['T1110', 'T1078'],
      dataTypes: ['signin', 'audit', 'risk-events'],
      riskLevel: 'high'
    }
  },
  {
    id: 'cloud-003',
    title: 'GCP Security Command Center Rules',
    description: 'Security rules and findings for Google Cloud Platform Security Command Center',
    category: 'cloud-security',
    subcategory: 'gcp',
    difficulty: 'intermediate',
    tags: ['gcp', 'security-command-center', 'findings', 'compliance'],
    author: 'GCP Security Team',
    version: '1.5.0',
    lastUpdated: '2024-01-19',
    usageCount: 23,
    rating: 4.4,
    content: {
      type: 'json',
      data: {
        findings: [
          {
            category: 'OPEN_FIREWALL',
            severity: 'HIGH',
            description: 'Firewall rule allows unrestricted access',
            remediation: 'Restrict firewall rules to necessary ports and sources'
          }
        ]
      }
    },
    metadata: {
      estimatedTime: '25 minutes',
      prerequisites: ['Security Command Center API', 'Cloud Asset Inventory'],
      platforms: ['GCP'],
      dataTypes: ['audit-logs', 'asset-inventory', 'security-findings'],
      riskLevel: 'medium'
    }
  },

  // Detection Rules
  {
    id: 'detection-001',
    title: 'Ransomware Behavior Detection',
    description: 'Machine learning-based detection for ransomware behavior patterns',
    category: 'detection-rules',
    subcategory: 'malware',
    difficulty: 'expert',
    tags: ['ransomware', 'machine-learning', 'behavioral', 'file-encryption'],
    author: 'ML Security Team',
    version: '4.1.2',
    lastUpdated: '2024-01-21',
    usageCount: 67,
    rating: 4.9,
    content: {
      type: 'yaml',
      data: {
        ml_model: {
          algorithm: 'random_forest',
          features: ['file_entropy', 'encryption_activity', 'process_behavior'],
          threshold: 0.85
        },
        detection_logic: 'High entropy file creation + Process termination + Registry modification'
      }
    },
    metadata: {
      estimatedTime: '60 minutes',
      prerequisites: ['ML platform', 'Endpoint data', 'File system monitoring'],
      platforms: ['Windows', 'Linux', 'macOS'],
      mitreAttck: ['T1486', 'T1490'],
      dataTypes: ['process', 'file', 'registry'],
      riskLevel: 'critical'
    }
  },
  {
    id: 'detection-002',
    title: 'Living off the Land Detection',
    description: 'Detect malicious use of legitimate system tools and binaries',
    category: 'detection-rules',
    subcategory: 'evasion',
    difficulty: 'advanced',
    tags: ['lolbins', 'evasion', 'legitimate-tools', 'abuse'],
    author: 'Threat Research Team',
    version: '2.3.0',
    lastUpdated: '2024-01-17',
    usageCount: 41,
    rating: 4.6,
    content: {
      type: 'yaml',
      data: {
        binaries: ['powershell.exe', 'wmic.exe', 'certutil.exe', 'bitsadmin.exe'],
        suspicious_patterns: [
          'powershell.exe -enc',
          'wmic process call create',
          'certutil -urlcache -split -f'
        ]
      }
    },
    metadata: {
      estimatedTime: '40 minutes',
      prerequisites: ['Process monitoring', 'Command line logging'],
      platforms: ['Windows'],
      mitreAttck: ['T1218', 'T1059', 'T1105'],
      dataTypes: ['process', 'command-line'],
      riskLevel: 'high'
    }
  },

  // Scenarios
  {
    id: 'scenario-001',
    title: 'Multi-Cloud Attack Simulation',
    description: 'Comprehensive attack simulation across AWS, Azure, and GCP environments',
    category: 'scenarios',
    subcategory: 'attack-simulation',
    difficulty: 'expert',
    tags: ['multi-cloud', 'attack-simulation', 'red-team', 'cross-platform'],
    author: 'Red Team',
    version: '1.0.0',
    lastUpdated: '2024-01-23',
    usageCount: 18,
    rating: 4.8,
    content: {
      type: 'yaml',
      data: {
        phases: [
          'reconnaissance',
          'initial_access',
          'privilege_escalation',
          'lateral_movement',
          'data_exfiltration'
        ],
        duration: '4 hours',
        objectives: ['Test detection coverage', 'Validate response procedures']
      }
    },
    metadata: {
      estimatedTime: '4 hours',
      prerequisites: ['Multi-cloud access', 'Simulation tools', 'Monitoring setup'],
      platforms: ['AWS', 'Azure', 'GCP'],
      riskLevel: 'high'
    }
  }
];

interface ContentLibraryProps {
  onSelectItem?: (item: ContentItem) => void;
  onUseTemplate?: (item: ContentItem) => void;
  className?: string;
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ 
  onSelectItem, 
  onUseTemplate,
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'usage' | 'updated'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📚' },
    { id: 'secops', name: 'SecOps', icon: '🛡️' },
    { id: 'cloud-security', name: 'Cloud Security', icon: '☁️' },
    { id: 'detection-rules', name: 'Detection Rules', icon: '🎯' },
    { id: 'scenarios', name: 'Scenarios', icon: '🎭' },
    { id: 'templates', name: 'Templates', icon: '📋' },
    { id: 'playbooks', name: 'Playbooks', icon: '📖' }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'expert', name: 'Expert' }
  ];

  // Filter and sort content
  const filteredContent = useMemo(() => {
    const filtered = CONTENT_LIBRARY.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return b.rating - a.rating;
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'text-cortex-success bg-cortex-success/10 border-cortex-success/30',
      intermediate: 'text-cortex-info bg-cortex-info/10 border-cortex-info/30',
      advanced: 'text-cortex-warning bg-cortex-warning/10 border-cortex-warning/30',
      expert: 'text-cortex-error bg-cortex-error/10 border-cortex-error/30'
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'secops': '🛡️',
      'cloud-security': '☁️',
      'detection-rules': '🎯',
      'scenarios': '🎭',
      'templates': '📋',
      'playbooks': '📖'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  const renderContentItem = (item: ContentItem) => {
    const isFavorited = favorites.has(item.id);
    
    if (viewMode === 'list') {
      return (
        <div key={item.id} className="cortex-card p-4 hover:border-cortex-green/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                <div>
                  <h3 className="font-bold text-cortex-text-primary">{item.title}</h3>
                  <p className="text-sm text-cortex-text-muted">{item.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-cortex-text-secondary">
                <span className={`px-2 py-1 rounded border ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
                <span>⭐ {item.rating}</span>
                <span>👥 {item.usageCount} uses</span>
                <span>📅 {item.lastUpdated}</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-cortex-bg-tertiary text-cortex-text-muted px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-xs text-cortex-text-muted">+{item.tags.length - 3} more</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`p-2 rounded ${isFavorited ? 'text-cortex-warning' : 'text-cortex-text-muted hover:text-cortex-warning'}`}
              >
                {isFavorited ? '★' : '☆'}
              </button>
              
              <CortexButton
                onClick={() => onSelectItem?.(item)}
                variant="outline"
                size="sm"
                icon="👁️"
              >
                View
              </CortexButton>
              
              <CortexButton
                onClick={() => onUseTemplate?.(item)}
                variant="primary"
                size="sm"
                icon="🎯"
              >
                Use
              </CortexButton>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className="cortex-card p-4 hover:border-cortex-green/50 transition-all">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{getCategoryIcon(item.category)}</span>
          <button
            onClick={() => toggleFavorite(item.id)}
            className={`text-lg ${isFavorited ? 'text-cortex-warning' : 'text-cortex-text-muted hover:text-cortex-warning'}`}
          >
            {isFavorited ? '★' : '☆'}
          </button>
        </div>
        
        <h3 className="font-bold text-cortex-text-primary mb-2">{item.title}</h3>
        <p className="text-sm text-cortex-text-muted mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(item.difficulty)}`}>
            {item.difficulty}
          </span>
          <span className="text-xs text-cortex-text-secondary">⭐ {item.rating}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-cortex-bg-tertiary text-cortex-text-muted px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <CortexButton
            onClick={() => onSelectItem?.(item)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            View
          </CortexButton>
          <CortexButton
            onClick={() => onUseTemplate?.(item)}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            Use
          </CortexButton>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cortex-text-primary">📚 Content Library</h2>
          <p className="text-cortex-text-secondary">Browse SecOps and Cloud Security content</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cortex-green text-white' : 'text-cortex-text-muted hover:text-cortex-text-primary'}`}
          >
            ⊞
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-cortex-green text-white' : 'text-cortex-text-muted hover:text-cortex-text-primary'}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary placeholder-cortex-text-muted focus:border-cortex-green focus:outline-none"
          />
        </div>
        
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:border-cortex-green focus:outline-none"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:border-cortex-green focus:outline-none"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty.id} value={difficulty.id}>
                {difficulty.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-cortex-bg-secondary border border-cortex-border-secondary rounded text-cortex-text-primary focus:border-cortex-green focus:outline-none"
          >
            <option value="rating">Sort by Rating</option>
            <option value="usage">Sort by Usage</option>
            <option value="updated">Sort by Updated</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-green">{filteredContent.length}</div>
          <div className="text-sm text-cortex-text-secondary">Items Found</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-info">{favorites.size}</div>
          <div className="text-sm text-cortex-text-secondary">Favorites</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-warning">
            {categories.filter(c => c.id !== 'all').length}
          </div>
          <div className="text-sm text-cortex-text-secondary">Categories</div>
        </div>
        <div className="cortex-card p-4 text-center">
          <div className="text-2xl font-bold text-cortex-text-accent">
            {Math.round(CONTENT_LIBRARY.reduce((acc, item) => acc + item.rating, 0) / CONTENT_LIBRARY.length * 10) / 10}
          </div>
          <div className="text-sm text-cortex-text-secondary">Avg Rating</div>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
        : 'space-y-4'
      }>
        {filteredContent.map(renderContentItem)}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-cortex-text-primary mb-2">No Content Found</h3>
          <p className="text-cortex-text-secondary">
            Try adjusting your search criteria or browse different categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;