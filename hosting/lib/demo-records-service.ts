// Demo Records Service - Manages demo records with Firebase integration

import { DemoRecord, DemoFilter, DemoType, DemoStatus } from '../types/demo';

class DemoRecordsService {
  private storageKey = 'cortex_demo_records';

  // Mock data for development
  private mockDemos: DemoRecord[] = [
    {
      id: 'demo-001',
      title: 'ACME Corp - Ransomware Detection POV',
      customer: 'ACME Corporation',
      type: 'pov',
      status: 'completed',
      createdAt: '2025-09-15T10:00:00Z',
      lastModified: '2025-10-10T14:30:00Z',
      createdBy: 'henry.reed@paloaltonetworks.com',
      description: 'Full POV demonstrating ransomware detection and response capabilities using XSIAM with real-world attack scenarios.',
      tags: ['ransomware', 'xsiam', 'financial-services', 'apt'],
      artifacts: [
        {
          id: 'art-001',
          name: 'ransomware-demo-script.md',
          type: 'markdown',
          uploadedAt: '2025-09-15T10:30:00Z'
        },
        {
          id: 'art-002',
          name: 'attack-logs.csv',
          type: 'csv',
          uploadedAt: '2025-09-15T11:00:00Z'
        }
      ],
      toolingConfig: {
        syslogGenerator: {
          brokerVM: 'cortex-broker-01.local',
          brokerIP: '10.50.1.100',
          brokerPort: 514,
          protocol: 'UDP',
          vendor: 'CrowdStrike',
          product: 'Falcon',
          scenario: 'T1486-ransomware',
          ratePerSecond: 50,
          duration: 45,
          enabled: true
        }
      },
      metrics: {
        views: 24,
        lastViewed: '2025-10-12T09:00:00Z',
        duration: 45,
        successRate: 95,
        logsGenerated: 12500,
        eventsProcessed: 12450
      }
    },
    {
      id: 'demo-002',
      title: 'TechStart Inc - Cloud Security Workshop',
      customer: 'TechStart Inc',
      type: 'workshop',
      status: 'in-progress',
      createdAt: '2025-10-01T09:00:00Z',
      lastModified: '2025-10-13T16:00:00Z',
      createdBy: 'henry.reed@paloaltonetworks.com',
      description: 'Multi-cloud security posture management workshop covering AWS, Azure, and GCP with Prisma Cloud integration.',
      tags: ['cloud-security', 'aws', 'azure', 'prisma-cloud', 'multi-cloud'],
      artifacts: [
        {
          id: 'art-003',
          name: 'cloud-security-workshop.md',
          type: 'markdown',
          uploadedAt: '2025-10-01T09:30:00Z'
        }
      ],
      toolingConfig: {
        syslogGenerator: {
          brokerVM: 'cortex-broker-02.local',
          brokerIP: '10.50.1.101',
          brokerPort: 514,
          protocol: 'TCP',
          vendor: 'AWS',
          product: 'CloudTrail',
          scenario: 'cloud-attack',
          enabled: true
        },
        xsiam: {
          tenantId: 'techstart-demo',
          httpEndpoint: 'https://api-techstart.xdr.us.paloaltonetworks.com',
          apiKey: 'xxx-demo-key',
          enabled: true
        }
      },
      metrics: {
        views: 8,
        lastViewed: '2025-10-13T10:00:00Z',
        duration: 120,
        logsGenerated: 5600
      }
    },
    {
      id: 'demo-003',
      title: 'Executive Briefing - Zero Trust Architecture',
      customer: 'Global Bank',
      type: 'executive-demo',
      status: 'completed',
      createdAt: '2025-09-20T14:00:00Z',
      lastModified: '2025-09-25T11:00:00Z',
      createdBy: 'henry.reed@paloaltonetworks.com',
      description: 'High-level executive presentation on Zero Trust architecture with Cortex XSIAM as the central security platform.',
      tags: ['executive', 'zero-trust', 'xsiam', 'banking'],
      artifacts: [
        {
          id: 'art-004',
          name: 'executive-briefing.pdf',
          type: 'pdf',
          uploadedAt: '2025-09-20T14:30:00Z'
        }
      ],
      metrics: {
        views: 15,
        lastViewed: '2025-10-05T13:00:00Z',
        duration: 30,
        successRate: 100
      }
    },
    {
      id: 'demo-004',
      title: 'Insider Threat Detection Scenario',
      customer: 'RetailCo',
      type: 'scenario',
      status: 'draft',
      createdAt: '2025-10-12T10:00:00Z',
      lastModified: '2025-10-13T15:00:00Z',
      createdBy: 'henry.reed@paloaltonetworks.com',
      description: 'Behavioral analytics demonstration showing detection of malicious insider activity with data exfiltration attempts.',
      tags: ['insider-threat', 'behavioral-analytics', 'retail', 'xdr'],
      artifacts: [],
      toolingConfig: {
        syslogGenerator: {
          brokerVM: 'cortex-broker-01.local',
          brokerIP: '10.50.1.100',
          brokerPort: 514,
          protocol: 'UDP',
          vendor: 'Microsoft',
          product: 'Defender',
          scenario: 'insider-threat',
          enabled: false
        }
      },
      metrics: {
        views: 2,
        lastViewed: '2025-10-13T15:00:00Z'
      }
    }
  ];

  /**
   * Get all demo records
   */
  async getAllDemos(): Promise<DemoRecord[]> {
    // TODO: Replace with actual Firebase fetch
    return this.mockDemos;
  }

  /**
   * Get filtered demo records
   */
  async getFilteredDemos(filter: DemoFilter): Promise<DemoRecord[]> {
    let demos = [...this.mockDemos];

    if (filter.type && filter.type.length > 0) {
      demos = demos.filter(d => filter.type!.includes(d.type));
    }

    if (filter.status && filter.status.length > 0) {
      demos = demos.filter(d => filter.status!.includes(d.status));
    }

    if (filter.customer) {
      demos = demos.filter(d =>
        d.customer.toLowerCase().includes(filter.customer!.toLowerCase())
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      demos = demos.filter(d =>
        filter.tags!.some(tag => d.tags.includes(tag))
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      demos = demos.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.customer.toLowerCase().includes(query)
      );
    }

    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      demos = demos.filter(d => {
        const created = new Date(d.createdAt);
        return created >= start && created <= end;
      });
    }

    return demos;
  }

  /**
   * Get a single demo by ID
   */
  async getDemoById(id: string): Promise<DemoRecord | null> {
    return this.mockDemos.find(d => d.id === id) || null;
  }

  /**
   * Create a new demo record
   */
  async createDemo(demo: Omit<DemoRecord, 'id' | 'createdAt' | 'lastModified'>): Promise<DemoRecord> {
    const newDemo: DemoRecord = {
      ...demo,
      id: `demo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.mockDemos.unshift(newDemo);
    // TODO: Save to Firebase
    return newDemo;
  }

  /**
   * Update an existing demo record
   */
  async updateDemo(id: string, updates: Partial<DemoRecord>): Promise<DemoRecord | null> {
    const index = this.mockDemos.findIndex(d => d.id === id);
    if (index === -1) return null;

    this.mockDemos[index] = {
      ...this.mockDemos[index],
      ...updates,
      lastModified: new Date().toISOString()
    };

    // TODO: Save to Firebase
    return this.mockDemos[index];
  }

  /**
   * Delete a demo record
   */
  async deleteDemo(id: string): Promise<boolean> {
    const index = this.mockDemos.findIndex(d => d.id === id);
    if (index === -1) return false;

    this.mockDemos.splice(index, 1);
    // TODO: Delete from Firebase
    return true;
  }

  /**
   * Get demo statistics
   */
  async getDemoStats() {
    const demos = await this.getAllDemos();

    const stats = {
      total: demos.length,
      byType: {} as Record<DemoType, number>,
      byStatus: {} as Record<DemoStatus, number>,
      totalViews: 0,
      totalLogsGenerated: 0,
      avgSuccessRate: 0,
      recentActivity: demos
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 5)
    };

    demos.forEach(demo => {
      stats.byType[demo.type] = (stats.byType[demo.type] || 0) + 1;
      stats.byStatus[demo.status] = (stats.byStatus[demo.status] || 0) + 1;
      stats.totalViews += demo.metrics?.views || 0;
      stats.totalLogsGenerated += demo.metrics?.logsGenerated || 0;
    });

    const demosWithSuccess = demos.filter(d => d.metrics?.successRate);
    if (demosWithSuccess.length > 0) {
      stats.avgSuccessRate =
        demosWithSuccess.reduce((sum, d) => sum + (d.metrics!.successRate || 0), 0) /
        demosWithSuccess.length;
    }

    return stats;
  }
}

// Export singleton instance
const demoRecordsService = new DemoRecordsService();
export default demoRecordsService;
