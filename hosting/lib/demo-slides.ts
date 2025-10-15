/**
 * Demo Slideshow Content
 *
 * Pre-built demo presentations for XSIAM POV engagements
 */

export interface Slide {
  title: string;
  content: string;
  type?: 'title' | 'content' | 'bullets' | 'code' | 'chart' | 'image';
  bgColor?: string;
  textColor?: string;
}

export interface DemoPresentation {
  id: string;
  name: string;
  description: string;
  icon: string;
  slides: Slide[];
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

/**
 * XSIAM Platform Overview Demo
 */
export const XSIAM_PLATFORM_OVERVIEW: DemoPresentation = {
  id: 'xsiam-overview',
  name: 'XSIAM Platform Overview',
  description: 'Executive overview of Cortex XSIAM capabilities',
  icon: '🎯',
  slides: [
    {
      type: 'title',
      title: 'Cortex XSIAM',
      content: 'Extended Security Intelligence and Automation Management',
    },
    {
      type: 'content',
      title: 'The Challenge',
      content: `Organizations today face an overwhelming volume of security alerts, fragmented tools, and increasing complexity in threat landscapes.

Traditional SIEM solutions require extensive tuning, generate false positives, and lack the context needed for effective threat response.

XSIAM addresses these challenges with AI-driven automation and unified telemetry.`,
    },
    {
      type: 'bullets',
      title: 'Key Capabilities',
      content: `Unified Data Ingestion - Collect telemetry from any source
AI-Powered Detection - Machine learning reduces false positives by 95%
Automated Investigation - Context-rich insights accelerate response
Integrated Response - Orchestrate actions across your security stack
Attack Surface Management - Continuous visibility and validation`,
    },
    {
      type: 'chart',
      title: 'ROI Impact',
      content: 'Average XSIAM customer results:\n• 82% reduction in MTTD (Mean Time to Detect)\n• 91% reduction in MTTR (Mean Time to Respond)\n• 70% reduction in analyst workload\n• $2.4M average annual savings',
    },
    {
      type: 'bullets',
      title: 'POV Success Criteria',
      content: `Deploy 3-5 core use cases in production
Validate detection coverage against MITRE ATT&CK
Measure alert reduction and quality improvement
Demonstrate automated investigation workflows
Assess analyst efficiency gains`,
    },
    {
      type: 'content',
      title: 'Next Steps',
      content: `Let's design your proof of value engagement together.

We'll identify your top 3 security challenges and map them to XSIAM capabilities, ensuring measurable business outcomes within 30-45 days.`,
    },
  ],
};

/**
 * Technical Deep Dive Demo
 */
export const TECHNICAL_DEEP_DIVE: DemoPresentation = {
  id: 'technical-deep-dive',
  name: 'XSIAM Technical Deep Dive',
  description: 'Architecture and technical capabilities for security engineers',
  icon: '🔧',
  slides: [
    {
      type: 'title',
      title: 'XSIAM Technical Architecture',
      content: 'Under the Hood',
    },
    {
      type: 'bullets',
      title: 'Data Ingestion Layer',
      content: `Broker VM - On-premises data collection and forwarding
XDR Agents - Endpoint telemetry with behavioral analytics
Cloud Integrations - Native connectors for AWS, Azure, GCP
SIEM Migration - Parse existing log formats and normalize
Custom APIs - Ingest from any source via REST/Webhooks`,
    },
    {
      type: 'code',
      title: 'XQL Query Language',
      content: `// Find failed SSH logins with geolocation anomalies
dataset = xdr_data
| filter event_type = "STORY"
| filter action_remote_ip not in private_ip_ranges
| filter auth_type = "SSH" and auth_result = "FAILED"
| join type=left (
    external_data = threat_intel_feed
  ) remote_ip = threat_intel_feed.ip
| alter risk_score = if(threat_intel_feed.score > 80, "HIGH", "MEDIUM")
| filter risk_score = "HIGH"
| fields agent_hostname, remote_ip, risk_score, geo_country
| sort desc _time`,
    },
    {
      type: 'bullets',
      title: 'Detection Engineering',
      content: `BIOC Rules - Behavioral Indicators of Compromise
Correlation Rules - Multi-event threat patterns
Analytics Rules - Statistical anomaly detection
MITRE ATT&CK Mapping - Coverage validation and reporting
Custom Detections - Build your own with XQL`,
    },
    {
      type: 'bullets',
      title: 'Automation & Orchestration',
      content: `Playbooks - Automated investigation and response workflows
Scripts - Python-based custom logic and integrations
Case Management - Incident lifecycle tracking
Threat Intelligence - Enrich with STIX/TAXII feeds
Integration Hub - 600+ native integrations`,
    },
    {
      type: 'chart',
      title: 'Performance Metrics',
      content: 'XSIAM ingests 100TB+ daily at scale:\n• <2 second query latency (P95)\n• 10M+ events per second ingestion\n• 13-month hot storage retention\n• Zero-day detection with AI models',
    },
    {
      type: 'content',
      title: 'Deployment Options',
      content: `XSIAM is delivered as a fully-managed SaaS platform with global data residency options.

No infrastructure to manage. Automatic updates. Enterprise-grade SLAs.

Let's discuss your deployment requirements and compliance needs.`,
    },
  ],
};

/**
 * Ransomware Defense Demo
 */
export const RANSOMWARE_DEFENSE: DemoPresentation = {
  id: 'ransomware-defense',
  name: 'Ransomware Defense Strategy',
  description: 'Detect, prevent, and respond to ransomware attacks',
  icon: '🛡️',
  slides: [
    {
      type: 'title',
      title: 'Ransomware Defense with XSIAM',
      content: 'Multi-Layered Protection',
    },
    {
      type: 'content',
      title: 'The Ransomware Threat',
      content: `Ransomware attacks have evolved from opportunistic malware to sophisticated, multi-stage operations targeting critical infrastructure.

Average ransom demand: $5.3M
Average downtime: 21 days
Business impact: $1.85M per incident

Traditional antivirus is no longer sufficient.`,
    },
    {
      type: 'bullets',
      title: 'XSIAM Defense Layers',
      content: `Pre-Execution - File analysis, sandboxing, threat intel correlation
Execution Prevention - Behavioral blocking, exploit protection
Post-Execution - Ransomware behavior detection (file encryption patterns)
Lateral Movement - Network segmentation enforcement and alerts
Data Exfiltration - DLP policies and anomalous outbound traffic detection`,
    },
    {
      type: 'code',
      title: 'Detection Example: File Encryption',
      content: `// Detect rapid file encryption activity
dataset = xdr_data
| filter event_type = "FILE"
| filter action_file_name ~= "\\.(encrypted|locked|crypto)$"
| stats count_distinct(action_file_path) as files_affected by agent_hostname
| filter files_affected > 50
| alter severity = if(files_affected > 200, "CRITICAL", "HIGH")
| fields agent_hostname, files_affected, severity, _time`,
    },
    {
      type: 'bullets',
      title: 'Automated Response Actions',
      content: `Isolate Endpoint - Disconnect infected host from network
Kill Process - Terminate ransomware execution
Snapshot Creation - Preserve forensic evidence
Credential Reset - Rotate compromised accounts
Stakeholder Notification - Alert IR team and executives`,
    },
    {
      type: 'chart',
      title: 'Customer Success Story',
      content: 'Global Manufacturing Company:\n• Stopped WannaCry variant in 4 minutes\n• Isolated 12 endpoints automatically\n• Prevented $8M+ in potential damages\n• Zero data loss or ransom payment',
    },
    {
      type: 'content',
      title: 'Your POV Scenario',
      content: `We'll deploy a controlled ransomware simulation in your environment to demonstrate XSIAM's detection and response capabilities.

You'll see real-time blocking, automated investigation, and complete attack chain visibility.`,
    },
  ],
};

/**
 * Cloud Security Posture Demo
 */
export const CLOUD_SECURITY_POSTURE: DemoPresentation = {
  id: 'cloud-security-posture',
  name: 'Cloud Security Posture Management',
  description: 'AWS, Azure, GCP security visibility and compliance',
  icon: '☁️',
  slides: [
    {
      type: 'title',
      title: 'Cloud Security Posture Management',
      content: 'Visibility Across AWS, Azure, and GCP',
    },
    {
      type: 'bullets',
      title: 'Cloud Security Challenges',
      content: `Misconfigurations - 95% of cloud breaches due to human error
Shadow IT - Unmanaged resources and accounts
Compliance Drift - Configuration changes break compliance
Excessive Permissions - Over-privileged IAM roles and service accounts
Data Exposure - Public S3 buckets and storage containers`,
    },
    {
      type: 'bullets',
      title: 'XSIAM Cloud Coverage',
      content: `Asset Discovery - Continuous inventory of cloud resources
Misconfiguration Detection - CIS, NIST, PCI-DSS compliance checks
Identity & Access - IAM policy analysis and privilege escalation detection
Network Security - Security group and firewall rule validation
Data Protection - Encryption status and public exposure alerts`,
    },
    {
      type: 'chart',
      title: 'Common Findings',
      content: 'Typical first-scan results:\n• 87% of orgs have public S3 buckets\n• 64% have overly permissive IAM roles\n• 52% have unencrypted RDS databases\n• 41% have default VPC security groups in use',
    },
    {
      type: 'code',
      title: 'Sample Detection: Public S3 Bucket',
      content: `// Alert on newly created public S3 buckets
dataset = cloud_audit_logs
| filter cloud_provider = "AWS"
| filter event_name = "CreateBucket" or event_name = "PutBucketAcl"
| filter resource_json.ACL.Grants.Grantee.URI contains "AllUsers"
| alter severity = "HIGH"
| fields aws_account_id, bucket_name, region, requester_arn, _time`,
    },
    {
      type: 'bullets',
      title: 'Automated Remediation',
      content: `Revoke Public Access - Remove AllUsers ACL from S3 buckets
Rotate Credentials - Force password reset on exposed IAM users
Tag Non-Compliant Resources - Mark for review and remediation
Create JIRA Tickets - Auto-escalate critical findings
Notify Cloud Owners - Slack/Email alerts to resource owners`,
    },
    {
      type: 'content',
      title: 'POV Deliverable',
      content: `We'll scan your AWS/Azure/GCP environments and generate a prioritized remediation roadmap.

Expect to identify 50-200 findings in the first scan, with automated playbooks to resolve 70%+ of issues.`,
    },
  ],
};

/**
 * Insider Threat Detection Demo
 */
export const INSIDER_THREAT_DETECTION: DemoPresentation = {
  id: 'insider-threat',
  name: 'Insider Threat Detection',
  description: 'User behavior analytics and anomaly detection',
  icon: '🕵️',
  slides: [
    {
      type: 'title',
      title: 'Insider Threat Detection',
      content: 'User Behavior Analytics with XSIAM',
    },
    {
      type: 'content',
      title: 'The Insider Risk',
      content: `Insider threats account for 34% of all data breaches, with an average cost of $11.45M per incident.

Insiders have legitimate access, making detection challenging. Traditional tools focus on external threats and miss anomalous behavior from trusted users.

XSIAM uses behavioral analytics and machine learning to detect insider risk.`,
    },
    {
      type: 'bullets',
      title: 'Insider Threat Indicators',
      content: `Data Exfiltration - Large file transfers before resignation
Access Anomalies - Accessing resources outside normal scope
Time-Based Anomalies - Logins at unusual hours or locations
Credential Sharing - Same credentials used from multiple IPs
Privilege Escalation - Attempts to gain unauthorized access`,
    },
    {
      type: 'code',
      title: 'Detection: Mass File Download',
      content: `// Detect users downloading >1GB in 24 hours
dataset = xdr_data
| filter event_type = "FILE" and action_file_name contains "download"
| stats sum(action_file_size) as total_bytes by actor_primary_username
| filter total_bytes > 1073741824  // 1GB in bytes
| alter total_gb = total_bytes / 1073741824
| fields actor_primary_username, total_gb, _time
| sort desc total_gb`,
    },
    {
      type: 'bullets',
      title: 'UEBA (User & Entity Behavior Analytics)',
      content: `Baseline Normal Behavior - Learn typical patterns per user
Peer Group Analysis - Compare users in similar roles
Risk Scoring - Aggregate anomalies into risk scores
Alert Tuning - Reduce false positives with contextual thresholds
Investigation Timeline - Visual reconstruction of user activity`,
    },
    {
      type: 'chart',
      title: 'Detection Rates',
      content: 'XSIAM Insider Threat Performance:\n• 89% detection rate for data exfiltration\n• 76% detection rate for credential misuse\n• 94% reduction in false positives vs legacy SIEM\n• Average 12-minute time to alert',
    },
    {
      type: 'content',
      title: 'POV Use Case',
      content: `We'll analyze your user activity logs to establish behavioral baselines and deploy insider threat detections.

Expect to uncover 5-10 high-risk anomalies in the first week, with actionable recommendations for security and HR teams.`,
    },
  ],
};

/**
 * All available demo presentations
 */
export const DEMO_PRESENTATIONS: DemoPresentation[] = [
  XSIAM_PLATFORM_OVERVIEW,
  TECHNICAL_DEEP_DIVE,
  RANSOMWARE_DEFENSE,
  CLOUD_SECURITY_POSTURE,
  INSIDER_THREAT_DETECTION,
];

/**
 * Get demo presentation by ID
 */
export function getDemoPresentation(id: string): DemoPresentation | undefined {
  return DEMO_PRESENTATIONS.find(demo => demo.id === id);
}

/**
 * Get all demo presentations
 */
export function getAllDemoPresentations(): DemoPresentation[] {
  return DEMO_PRESENTATIONS;
}
