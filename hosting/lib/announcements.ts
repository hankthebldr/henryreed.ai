/**
 * Product Announcements
 *
 * Key updates for DC Portal platform and XSIAM product
 */

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'platform' | 'product' | 'feature' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  link?: string;
  linkText?: string;
  version?: string;
  tags?: string[];
}

/**
 * Active announcements (most recent 5)
 */
export const ACTIVE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'platform-2025-01-15',
    title: 'DC Portal: Demo Slideshow Feature Launch',
    description: 'New interactive demo presentations for customer engagements. Launch full-screen slideshows with 5 pre-built XSIAM demos including Platform Overview, Technical Deep Dive, and Ransomware Defense.',
    date: '2025-01-15',
    category: 'platform',
    priority: 'high',
    icon: '🎬',
    link: '/gui#dashboard-blueprints',
    linkText: 'Try Demo Slideshow',
    version: 'v2.8.0',
    tags: ['demo', 'presentations', 'customer-engagement']
  },
  {
    id: 'product-2025-01-10',
    title: 'XSIAM 2.5: AI-Powered Alert Correlation',
    description: 'New machine learning model reduces false positives by 95%. Automated alert correlation across multiple data sources with context-rich insights and one-click investigation workflows.',
    date: '2025-01-10',
    category: 'product',
    priority: 'high',
    icon: '🤖',
    link: 'https://docs.paloaltonetworks.com/cortex/cortex-xsiam/release-notes',
    linkText: 'View Release Notes',
    version: 'XSIAM 2.5',
    tags: ['AI', 'automation', 'detection']
  },
  {
    id: 'platform-2025-01-08',
    title: 'POV Best Practices with Opportunity Stage Mapping',
    description: 'New Badass Blueprint feature maps XSIAM best practices to Salesforce opportunity stages (1-8). Filter practices by stage, view stage-specific guidance, and align POV execution with sales cycles.',
    date: '2025-01-08',
    category: 'platform',
    priority: 'medium',
    icon: '📖',
    link: '/gui',
    linkText: 'Explore Best Practices',
    version: 'v2.7.0',
    tags: ['best-practices', 'salesforce', 'pov']
  },
  {
    id: 'product-2024-12-20',
    title: 'XSIAM: Cloud Security Posture Management (CSPM)',
    description: 'Enhanced AWS, Azure, and GCP security posture monitoring. Automated compliance checks for CIS, NIST, PCI-DSS. Detect misconfigurations, excessive IAM permissions, and public exposure risks in real-time.',
    date: '2024-12-20',
    category: 'product',
    priority: 'high',
    icon: '☁️',
    link: 'https://docs.paloaltonetworks.com/cortex/cortex-xsiam/cspm',
    linkText: 'Learn More',
    version: 'XSIAM 2.4',
    tags: ['cloud', 'cspm', 'compliance']
  },
  {
    id: 'platform-2024-12-15',
    title: 'Workshop Management & Certification Tracking',
    description: 'New Workshops tab for DC enablement programs. Track certification progress, manage training sessions, and access workshop materials. Includes Business Value Framework and Portfolio Management tools.',
    date: '2024-12-15',
    category: 'platform',
    priority: 'medium',
    icon: '🎓',
    link: '/gui',
    linkText: 'Visit Workshops',
    version: 'v2.6.0',
    tags: ['training', 'enablement', 'certification']
  }
];

/**
 * Get announcements by category
 */
export function getAnnouncementsByCategory(category: Announcement['category']): Announcement[] {
  return ACTIVE_ANNOUNCEMENTS.filter(a => a.category === category);
}

/**
 * Get high priority announcements
 */
export function getHighPriorityAnnouncements(): Announcement[] {
  return ACTIVE_ANNOUNCEMENTS.filter(a => a.priority === 'high');
}

/**
 * Get platform announcements
 */
export function getPlatformAnnouncements(): Announcement[] {
  return getAnnouncementsByCategory('platform');
}

/**
 * Get product announcements
 */
export function getProductAnnouncements(): Announcement[] {
  return getAnnouncementsByCategory('product');
}

/**
 * Get latest announcement
 */
export function getLatestAnnouncement(): Announcement | undefined {
  return ACTIVE_ANNOUNCEMENTS[0];
}
