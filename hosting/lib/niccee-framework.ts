/**
 * NICCEE Framework for XSIAM Data Implementation
 *
 * Network, Identity, Cloud, Container, Endpoint, Email
 * Comprehensive data source integration framework with business value mapping
 */

export type NIRiskCategory = 'critical' | 'high' | 'medium' | 'low';

export interface NIDataSource {
  id: string;
  name: string;
  category: 'network' | 'identity' | 'cloud' | 'container' | 'endpoint' | 'email';
  description: string;
  dataTypes: string[];
  vendors: string[];
  ingestionMethods: string[];
  useCase: string;
  businessValue: string[];
  testCases: string[];
  riskImpact: NIRiskCategory;
  deploymentComplexity: 'low' | 'medium' | 'high';
  timeToValue: string;
  mitreAttackCoverage: string[];
}

export interface NIIntegrationPlaybook {
  category: 'network' | 'identity' | 'cloud' | 'container' | 'endpoint' | 'email';
  title: string;
  icon: string;
  description: string;
  dataSources: NIDataSource[];
  keyBenefits: string[];
  deploymentSteps: string[];
  validationChecklist: string[];
  businessValueProps: {
    riskReduction: string;
    efficiencyGain: string;
    costSavings: string;
    complianceImpact: string;
  };
}

/**
 * NICCEE Data Sources Catalog
 */
export const NICCEE_DATA_SOURCES: NIDataSource[] = [
  // ===== NETWORK =====
  {
    id: 'network-firewall',
    name: 'Next-Gen Firewalls (NGFW)',
    category: 'network',
    description: 'Palo Alto Networks firewalls, Cisco ASA, Fortinet FortiGate network traffic logs',
    dataTypes: ['Traffic Logs', 'Threat Logs', 'URL Filtering', 'WildFire Analysis'],
    vendors: ['Palo Alto Networks', 'Cisco', 'Fortinet', 'Check Point'],
    ingestionMethods: ['Syslog', 'API', 'Broker VM'],
    useCase: 'Lateral movement detection, C2 communication blocking, data exfiltration prevention',
    businessValue: [
      'Reduce attack surface by 60%',
      'Block 99.8% of known threats at perimeter',
      'Prevent lateral movement in 94% of incidents'
    ],
    testCases: [
      'Outbound C2 connection attempt to known malicious IP',
      'Port scanning activity across multiple subnets',
      'Unusual protocol usage (e.g., DNS tunneling)',
      'Large data transfer to external destination'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'medium',
    timeToValue: '1-2 weeks',
    mitreAttackCoverage: ['T1071 - Application Layer Protocol', 'T1090 - Proxy', 'T1048 - Exfiltration Over Alternative Protocol']
  },
  {
    id: 'network-netflow',
    name: 'NetFlow / IPFIX',
    category: 'network',
    description: 'Network flow data from routers, switches, and network monitoring tools',
    dataTypes: ['Flow Records', 'Bandwidth Metrics', 'Connection Metadata'],
    vendors: ['Cisco NetFlow', 'Juniper J-Flow', 'Open-source IPFIX'],
    ingestionMethods: ['NetFlow Collector', 'IPFIX', 'Broker VM'],
    useCase: 'Network anomaly detection, bandwidth abuse, internal reconnaissance',
    businessValue: [
      'Detect 87% of internal reconnaissance activity',
      'Reduce MTTD for lateral movement by 75%',
      'Identify shadow IT and unauthorized services'
    ],
    testCases: [
      'Host scanning multiple internal IPs rapidly',
      'Abnormal data volume from workstation to server',
      'Communication with rare/new internal destination',
      'Protocol anomaly (e.g., RDP from non-admin workstation)'
    ],
    riskImpact: 'high',
    deploymentComplexity: 'low',
    timeToValue: '3-5 days',
    mitreAttackCoverage: ['T1046 - Network Service Discovery', 'T1021 - Remote Services', 'T1041 - Exfiltration Over C2']
  },

  // ===== IDENTITY =====
  {
    id: 'identity-ad',
    name: 'Active Directory (AD)',
    category: 'identity',
    description: 'Windows Active Directory authentication logs, group policy changes, privileged access',
    dataTypes: ['Logon Events', 'Account Changes', 'Group Membership', 'Kerberos Tickets'],
    vendors: ['Microsoft AD', 'Azure AD', 'Okta', 'Ping Identity'],
    ingestionMethods: ['Windows Event Forwarding', 'Syslog', 'API'],
    useCase: 'Credential theft detection, privilege escalation, golden ticket attacks',
    businessValue: [
      'Detect 95% of credential compromise attempts',
      'Reduce privilege escalation incidents by 82%',
      'Prevent lateral movement via stolen credentials'
    ],
    testCases: [
      'Failed logon attempts followed by successful logon (brute force)',
      'Account added to Domain Admins group',
      'Kerberos TGT request anomaly (golden ticket)',
      'Privileged account logon from unusual location/device'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'medium',
    timeToValue: '1 week',
    mitreAttackCoverage: ['T1078 - Valid Accounts', 'T1558 - Steal or Forge Kerberos Tickets', 'T1134 - Access Token Manipulation']
  },
  {
    id: 'identity-okta',
    name: 'Cloud Identity Providers (Okta, Azure AD)',
    category: 'identity',
    description: 'Cloud-based identity and access management (IAM) authentication logs',
    dataTypes: ['SSO Events', 'MFA Challenges', 'API Tokens', 'Conditional Access'],
    vendors: ['Okta', 'Azure AD', 'OneLogin', 'Duo Security'],
    ingestionMethods: ['API', 'Webhooks', 'Cloud Connector'],
    useCase: 'Account takeover detection, MFA bypass attempts, impossible travel',
    businessValue: [
      'Detect account takeover in <5 minutes',
      'Reduce unauthorized cloud access by 91%',
      'Automate MFA enforcement based on risk signals'
    ],
    testCases: [
      'Logon from IP geolocation 500+ miles from previous logon within 1 hour',
      'Multiple failed MFA challenges followed by success',
      'New device enrollment without approval',
      'API token created and used from unusual location'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'low',
    timeToValue: '2-3 days',
    mitreAttackCoverage: ['T1078.004 - Cloud Accounts', 'T1556 - Modify Authentication Process', 'T1621 - Multi-Factor Authentication Request Generation']
  },

  // ===== CLOUD =====
  {
    id: 'cloud-aws',
    name: 'AWS CloudTrail & VPC Flow Logs',
    category: 'cloud',
    description: 'AWS audit logs, API activity, network flow logs from AWS infrastructure',
    dataTypes: ['CloudTrail Events', 'VPC Flow Logs', 'GuardDuty Findings', 'Config Changes'],
    vendors: ['Amazon Web Services'],
    ingestionMethods: ['S3 Bucket', 'CloudWatch', 'Kinesis Firehose'],
    useCase: 'Cloud misconfigurations, privilege escalation, data exfiltration from S3',
    businessValue: [
      'Detect 92% of cloud misconfigurations within 15 minutes',
      'Prevent 98% of public S3 bucket exposures',
      'Reduce cloud security incidents by 76%'
    ],
    testCases: [
      'IAM policy change granting admin privileges',
      'Public S3 bucket creation or ACL modification',
      'Root account usage',
      'EC2 instance launched in unusual region',
      'Unusual volume of S3 GetObject API calls'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'medium',
    timeToValue: '1 week',
    mitreAttackCoverage: ['T1530 - Data from Cloud Storage', 'T1078.004 - Cloud Accounts', 'T1098 - Account Manipulation']
  },
  {
    id: 'cloud-azure',
    name: 'Azure Activity Logs & Network Security Groups',
    category: 'cloud',
    description: 'Azure subscription activity, resource changes, network security group logs',
    dataTypes: ['Activity Logs', 'NSG Flow Logs', 'Azure AD Logs', 'Storage Logs'],
    vendors: ['Microsoft Azure'],
    ingestionMethods: ['Event Hub', 'Storage Account', 'API'],
    useCase: 'Azure resource tampering, network security bypass, storage account access',
    businessValue: [
      'Detect unauthorized Azure resource changes in real-time',
      'Prevent data leakage from Azure Storage by 94%',
      'Reduce Azure security misconfigurations by 81%'
    ],
    testCases: [
      'Network Security Group rule allowing inbound RDP from internet',
      'Storage account key regeneration',
      'VM deployed with public IP in production VNet',
      'Role assignment to external user'
    ],
    riskImpact: 'high',
    deploymentComplexity: 'medium',
    timeToValue: '1 week',
    mitreAttackCoverage: ['T1562 - Impair Defenses', 'T1078.004 - Cloud Accounts', 'T1580 - Cloud Infrastructure Discovery']
  },
  {
    id: 'cloud-gcp',
    name: 'GCP Audit Logs & VPC Flow Logs',
    category: 'cloud',
    description: 'Google Cloud Platform audit logs, network flow data, IAM changes',
    dataTypes: ['Admin Activity', 'Data Access', 'VPC Flow Logs', 'GKE Logs'],
    vendors: ['Google Cloud Platform'],
    ingestionMethods: ['Pub/Sub', 'Cloud Storage', 'Logging API'],
    useCase: 'GCP IAM abuse, Kubernetes cluster compromise, BigQuery data exfiltration',
    businessValue: [
      'Detect GCP security violations within 10 minutes',
      'Prevent 89% of GKE cluster compromises',
      'Reduce BigQuery data exfiltration risk by 93%'
    ],
    testCases: [
      'Service account key created and downloaded',
      'BigQuery table exported to external GCS bucket',
      'GKE pod with privileged container launched',
      'Firewall rule allowing ingress from 0.0.0.0/0'
    ],
    riskImpact: 'high',
    deploymentComplexity: 'medium',
    timeToValue: '1 week',
    mitreAttackCoverage: ['T1078.004 - Cloud Accounts', 'T1552.001 - Credentials In Files', 'T1613 - Container and Resource Discovery']
  },

  // ===== CONTAINER =====
  {
    id: 'container-kubernetes',
    name: 'Kubernetes Audit Logs',
    category: 'container',
    description: 'K8s API server logs, admission controller events, pod lifecycle events',
    dataTypes: ['API Requests', 'RBAC Changes', 'Pod Events', 'Network Policies'],
    vendors: ['Kubernetes', 'OpenShift', 'Rancher', 'EKS/AKS/GKE'],
    ingestionMethods: ['Fluentd', 'Filebeat', 'API Webhook'],
    useCase: 'Container breakout, privilege escalation, malicious pod deployment',
    businessValue: [
      'Detect 96% of container escape attempts',
      'Prevent unauthorized pod deployments',
      'Reduce K8s security incidents by 78%'
    ],
    testCases: [
      'Pod created with hostPID or hostNetwork: true',
      'Service account token mounted unnecessarily',
      'RBAC role binding granting cluster-admin',
      'Pod exec command executed on production pod'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'high',
    timeToValue: '2 weeks',
    mitreAttackCoverage: ['T1611 - Escape to Host', 'T1610 - Deploy Container', 'T1552.007 - Container API']
  },
  {
    id: 'container-docker',
    name: 'Docker Runtime Logs',
    category: 'container',
    description: 'Docker daemon logs, container lifecycle events, image pull activities',
    dataTypes: ['Container Events', 'Image Pulls', 'Volume Mounts', 'Network Attachments'],
    vendors: ['Docker', 'containerd', 'Podman'],
    ingestionMethods: ['Docker Logging Driver', 'Syslog', 'Fluentd'],
    useCase: 'Malicious image deployment, container privilege escalation, volume tampering',
    businessValue: [
      'Detect malicious container images before execution',
      'Prevent 91% of container-based attacks',
      'Reduce container sprawl and shadow workloads'
    ],
    testCases: [
      'Container launched with --privileged flag',
      'Image pulled from untrusted registry',
      'Container with sensitive host volume mount (/etc, /var/run/docker.sock)',
      'Container running as root user unnecessarily'
    ],
    riskImpact: 'high',
    deploymentComplexity: 'medium',
    timeToValue: '1 week',
    mitreAttackCoverage: ['T1610 - Deploy Container', 'T1611 - Escape to Host', 'T1613 - Container and Resource Discovery']
  },

  // ===== ENDPOINT =====
  {
    id: 'endpoint-xdr',
    name: 'Cortex XDR Agents',
    category: 'endpoint',
    description: 'Endpoint telemetry from Cortex XDR agents on Windows, macOS, Linux',
    dataTypes: ['Process Execution', 'File Events', 'Network Connections', 'Registry Changes', 'DLL Loads'],
    vendors: ['Palo Alto Networks Cortex XDR'],
    ingestionMethods: ['Native Integration', 'Cloud Delivery'],
    useCase: 'Ransomware detection, fileless malware, living-off-the-land attacks',
    businessValue: [
      'Block 99.9% of known and unknown malware',
      'Detect ransomware in <30 seconds',
      'Reduce MTTR for endpoint incidents by 89%'
    ],
    testCases: [
      'Rapid file encryption pattern (ransomware simulation)',
      'PowerShell download and execute from unusual parent process',
      'Credential dumping tool execution (Mimikatz)',
      'Unsigned executable from temp directory'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'low',
    timeToValue: '3-5 days',
    mitreAttackCoverage: ['T1486 - Data Encrypted for Impact', 'T1059 - Command and Scripting Interpreter', 'T1003 - OS Credential Dumping']
  },
  {
    id: 'endpoint-edr',
    name: 'Third-Party EDR (CrowdStrike, SentinelOne)',
    category: 'endpoint',
    description: 'Endpoint detection and response telemetry from non-Cortex EDR solutions',
    dataTypes: ['Detection Alerts', 'Process Tree', 'Behavioral Analytics'],
    vendors: ['CrowdStrike Falcon', 'SentinelOne', 'Microsoft Defender ATP'],
    ingestionMethods: ['API', 'Syslog', 'CEF'],
    useCase: 'Unified endpoint visibility, cross-platform threat correlation',
    businessValue: [
      'Consolidate multi-vendor EDR alerts into single pane',
      'Improve detection coverage by 67% through cross-correlation',
      'Reduce alert fatigue by 73%'
    ],
    testCases: [
      'EDR alert correlation with network traffic (C2 validation)',
      'Endpoint malware detection triggers cloud investigation',
      'Multi-stage attack reconstruction across EDR + firewall logs'
    ],
    riskImpact: 'high',
    deploymentComplexity: 'medium',
    timeToValue: '1 week',
    mitreAttackCoverage: ['T1059 - Command and Scripting Interpreter', 'T1055 - Process Injection', 'T1547 - Boot or Logon Autostart Execution']
  },

  // ===== EMAIL =====
  {
    id: 'email-o365',
    name: 'Microsoft 365 Email Security',
    category: 'email',
    description: 'Office 365 email logs, phishing attempts, malicious attachments, data loss prevention',
    dataTypes: ['Message Trace', 'Mailbox Audit', 'DLP Events', 'Safe Attachments', 'Safe Links'],
    vendors: ['Microsoft 365', 'Exchange Online Protection'],
    ingestionMethods: ['Graph API', 'Management Activity API', 'Webhooks'],
    useCase: 'Phishing detection, business email compromise (BEC), sensitive data leakage',
    businessValue: [
      'Detect 98% of phishing attempts before user interaction',
      'Prevent BEC attacks saving avg $180K per incident',
      'Reduce email-based malware delivery by 94%'
    ],
    testCases: [
      'Email with malicious attachment bypassing initial filters',
      'Spoofed sender from executive domain (CEO fraud)',
      'Email with URL redirecting to credential harvesting page',
      'Large volume of emails sent from compromised account'
    ],
    riskImpact: 'critical',
    deploymentComplexity: 'low',
    timeToValue: '2-3 days',
    mitreAttackCoverage: ['T1566 - Phishing', 'T1534 - Internal Spearphishing', 'T1114 - Email Collection']
  },
  {
    id: 'email-gateway',
    name: 'Secure Email Gateways (Proofpoint, Mimecast)',
    category: 'email',
    description: 'Third-party email security gateway logs and threat intelligence',
    dataTypes: ['Email Threat Logs', 'URL Rewrites', 'Attachment Sandboxing', 'Impersonation Detection'],
    vendors: ['Proofpoint', 'Mimecast', 'Barracuda'],
    ingestionMethods: ['Syslog', 'API', 'CEF'],
    useCase: 'Advanced phishing detection, email-based ransomware, vendor email compromise',
    businessValue: [
      'Block 97% of advanced phishing campaigns',
      'Detect vendor email compromise attempts',
      'Reduce email security alert noise by 68%'
    ],
    testCases: [
      'Email with obfuscated URL evading initial scan',
      'Attachment with macro executing PowerShell',
      'Display name spoofing targeting finance team',
      'Email thread hijacking after account compromise'
    ],
    riskImpact: 'high',
    deploymentComplexity: 'low',
    timeToValue: '3-5 days',
    mitreAttackCoverage: ['T1566.001 - Spearphishing Attachment', 'T1566.002 - Spearphishing Link', 'T1598 - Phishing for Information']
  }
];

/**
 * NICCEE Integration Playbooks
 */
export const NICCEE_PLAYBOOKS: NIIntegrationPlaybook[] = [
  {
    category: 'network',
    title: 'Network Security Monitoring',
    icon: '🌐',
    description: 'Deploy comprehensive network visibility with firewall logs, NetFlow, and IDS/IPS data',
    dataSources: NICCEE_DATA_SOURCES.filter(ds => ds.category === 'network'),
    keyBenefits: [
      'Detect lateral movement in real-time',
      'Block command-and-control communications',
      'Identify data exfiltration attempts',
      'Map internal network topology and assets'
    ],
    deploymentSteps: [
      'Configure syslog forwarding from firewalls to XSIAM Broker VM',
      'Enable NetFlow export from core routers/switches',
      'Deploy IDS/IPS sensors at network choke points',
      'Validate log ingestion and create baseline traffic patterns',
      'Enable automated response rules for high-confidence threats'
    ],
    validationChecklist: [
      'Firewall logs ingesting at expected volume (>10K events/min)',
      'NetFlow covering 90%+ of internal network segments',
      'Alert on port scan generates incident within 2 minutes',
      'C2 communication to known bad IP triggers automatic block',
      'Data exfiltration detection validated with test transfer'
    ],
    businessValueProps: {
      riskReduction: '60% reduction in attack surface',
      efficiencyGain: '75% faster MTTD for lateral movement',
      costSavings: '$890K avg savings from prevented breaches',
      complianceImpact: 'Meets NIST 800-53 network monitoring controls'
    }
  },
  {
    category: 'identity',
    title: 'Identity & Access Security',
    icon: '🔐',
    description: 'Monitor authentication events, privilege escalation, and credential theft across AD and cloud IAM',
    dataSources: NICCEE_DATA_SOURCES.filter(ds => ds.category === 'identity'),
    keyBenefits: [
      'Detect credential compromise within minutes',
      'Prevent privilege escalation attacks',
      'Identify account takeover attempts',
      'Enforce least-privilege access principles'
    ],
    deploymentSteps: [
      'Deploy Windows Event Forwarding for AD domain controllers',
      'Integrate cloud IAM providers (Okta, Azure AD) via API',
      'Enable privileged account monitoring and session recording',
      'Configure MFA anomaly detection rules',
      'Implement automated account lockout for high-risk events'
    ],
    validationChecklist: [
      'AD logon events ingesting from all domain controllers',
      'Cloud IAM logs showing SSO events and MFA challenges',
      'Golden ticket attack simulation detected within 5 minutes',
      'Impossible travel alert triggered for test scenario',
      'Privileged account usage tracked with full audit trail'
    ],
    businessValueProps: {
      riskReduction: '95% detection rate for credential theft',
      efficiencyGain: '82% reduction in privilege escalation incidents',
      costSavings: '$1.2M avg savings from preventing account takeover',
      complianceImpact: 'Satisfies SOC 2, ISO 27001 identity controls'
    }
  },
  {
    category: 'cloud',
    title: 'Cloud Security Posture Management',
    icon: '☁️',
    description: 'Continuous monitoring of AWS, Azure, GCP for misconfigurations, policy violations, and threats',
    dataSources: NICCEE_DATA_SOURCES.filter(ds => ds.category === 'cloud'),
    keyBenefits: [
      'Detect cloud misconfigurations in near real-time',
      'Prevent public cloud resource exposure',
      'Monitor cloud infrastructure changes',
      'Enforce cloud security policies automatically'
    ],
    deploymentSteps: [
      'Configure AWS CloudTrail and VPC Flow Logs to send to XSIAM',
      'Enable Azure Activity Logs and NSG Flow Logs via Event Hub',
      'Set up GCP Audit Logs export to Cloud Storage bucket',
      'Deploy cloud compliance policies (CIS benchmarks)',
      'Create automated remediation workflows for critical findings'
    ],
    validationChecklist: [
      'CloudTrail events ingesting from all AWS accounts',
      'Azure Activity Logs showing resource changes',
      'GCP Audit Logs capturing IAM and API activity',
      'Public S3 bucket alert triggered within 10 minutes of creation',
      'Cloud security posture score calculated daily'
    ],
    businessValueProps: {
      riskReduction: '92% of misconfigurations detected within 15 minutes',
      efficiencyGain: '76% reduction in cloud security incidents',
      costSavings: '$650K avg savings from preventing cloud breaches',
      complianceImpact: 'Continuous compliance for PCI-DSS, HIPAA cloud requirements'
    }
  },
  {
    category: 'container',
    title: 'Container & Kubernetes Security',
    icon: '📦',
    description: 'Monitor container runtimes, Kubernetes clusters, and orchestration platforms for threats',
    dataSources: NICCEE_DATA_SOURCES.filter(ds => ds.category === 'container'),
    keyBenefits: [
      'Detect container escape attempts',
      'Prevent malicious pod deployments',
      'Monitor K8s RBAC changes',
      'Identify vulnerable container images'
    ],
    deploymentSteps: [
      'Deploy Fluentd/Filebeat to collect K8s audit logs',
      'Configure Docker logging driver to forward to XSIAM',
      'Enable admission controller webhooks for policy enforcement',
      'Integrate container image scanning results',
      'Create runtime anomaly detection rules'
    ],
    validationChecklist: [
      'K8s API server logs ingesting from all clusters',
      'Container lifecycle events visible in XSIAM',
      'Privileged pod creation generates high-severity alert',
      'Container escape simulation triggers incident',
      'Image vulnerability scanning integrated'
    ],
    businessValueProps: {
      riskReduction: '96% container escape detection rate',
      efficiencyGain: '78% reduction in K8s security incidents',
      costSavings: '$420K avg savings from preventing container breaches',
      complianceImpact: 'Meets CIS Kubernetes Benchmark requirements'
    }
  },
  {
    category: 'endpoint',
    title: 'Endpoint Detection & Response',
    icon: '💻',
    description: 'Deploy comprehensive endpoint visibility with XDR agents and third-party EDR integration',
    dataSources: NICCEE_DATA_SOURCES.filter(ds => ds.category === 'endpoint'),
    keyBenefits: [
      'Block malware at pre-execution stage',
      'Detect ransomware in <30 seconds',
      'Investigate endpoint incidents with full telemetry',
      'Respond to threats automatically'
    ],
    deploymentSteps: [
      'Deploy Cortex XDR agents to all endpoints',
      'Integrate third-party EDR solutions via API',
      'Configure behavioral analytics and ML models',
      'Enable automated isolation for critical threats',
      'Create endpoint investigation playbooks'
    ],
    validationChecklist: [
      'XDR agents deployed to 95%+ of endpoints',
      'Process execution and file events ingesting',
      'Ransomware simulation detected and blocked',
      'PowerShell download-execute pattern triggers alert',
      'Endpoint isolation tested and functional'
    ],
    businessValueProps: {
      riskReduction: '99.9% malware detection rate',
      efficiencyGain: '89% reduction in MTTR',
      costSavings: '$2.1M avg savings from preventing ransomware',
      complianceImpact: 'Satisfies PCI-DSS endpoint security requirements'
    }
  },
  {
    category: 'email',
    title: 'Email Security & Phishing Defense',
    icon: '📧',
    description: 'Monitor email traffic for phishing, BEC, malicious attachments, and data leakage',
    dataSources: NICCEE_DATA_SOURCES.filter(ds => ds.category === 'email'),
    keyBenefits: [
      'Detect phishing before user clicks',
      'Prevent business email compromise',
      'Block malicious attachments',
      'Identify compromised email accounts'
    ],
    deploymentSteps: [
      'Integrate M365 via Graph API and Management Activity API',
      'Configure email gateway (Proofpoint/Mimecast) syslog forwarding',
      'Enable email threat intelligence enrichment',
      'Deploy automated phishing response playbooks',
      'Create DLP policies for sensitive data'
    ],
    validationChecklist: [
      'Email logs ingesting from M365 and gateway',
      'Phishing simulation email detected within 2 minutes',
      'CEO fraud test scenario triggers BEC alert',
      'Malicious attachment quarantined automatically',
      'Compromised account sending spam detected'
    ],
    businessValueProps: {
      riskReduction: '98% phishing detection rate',
      efficiencyGain: '94% reduction in email-based malware',
      costSavings: '$180K avg savings per prevented BEC attack',
      complianceImpact: 'Meets GDPR, CCPA email data protection requirements'
    }
  }
];

/**
 * Business Value Framework Mapping
 */
export const NICCEE_BUSINESS_VALUE_FRAMEWORK = {
  riskReduction: {
    title: 'Risk Reduction',
    metrics: [
      'Attack surface reduction percentage',
      'Threat detection coverage (MITRE ATT&CK)',
      'Mean time to detect (MTTD)',
      'Mean time to respond (MTTR)',
      'False positive reduction rate'
    ],
    nicceeImpact: {
      network: 'Reduces attack surface by 60%, detects lateral movement 75% faster',
      identity: '95% credential theft detection, 82% fewer privilege escalations',
      cloud: '92% of misconfigurations caught within 15 minutes',
      container: '96% container escape detection, 78% fewer K8s incidents',
      endpoint: '99.9% malware block rate, ransomware detected in <30 seconds',
      email: '98% phishing detection, prevents $180K avg BEC loss'
    }
  },
  efficiencyGain: {
    title: 'Operational Efficiency',
    metrics: [
      'Analyst time saved per week',
      'Alert triage time reduction',
      'Investigation time reduction',
      'Automation coverage percentage',
      'Tool consolidation savings'
    ],
    nicceeImpact: {
      network: '40 hours/week analyst time saved on manual log review',
      identity: 'Automated credential compromise investigation (15min vs 4hrs)',
      cloud: 'Cloud compliance reporting automated (5min vs 8hrs/week)',
      container: 'K8s security posture continuous vs monthly manual audits',
      endpoint: '89% MTTR reduction, automated endpoint isolation',
      email: '73% alert fatigue reduction, automated phishing triage'
    }
  },
  costSavings: {
    title: 'Cost Savings & Avoidance',
    metrics: [
      'Security incident cost avoidance',
      'Tool consolidation savings',
      'Downtime reduction savings',
      'Compliance penalty avoidance',
      'Cyber insurance premium reduction'
    ],
    nicceeImpact: {
      network: '$890K avg breach prevention, reduced perimeter security tools',
      identity: '$1.2M avg account takeover prevention',
      cloud: '$650K avg cloud breach prevention, eliminated 3rd party CSPM tool',
      container: '$420K avg container breach prevention',
      endpoint: '$2.1M avg ransomware prevention',
      email: '$540K avg annual phishing/BEC prevention'
    }
  },
  complianceImpact: {
    title: 'Compliance & Audit',
    metrics: [
      'Audit preparation time reduction',
      'Continuous compliance coverage',
      'Policy violation detection rate',
      'Compliance reporting automation',
      'Audit finding reduction'
    ],
    nicceeImpact: {
      network: 'NIST 800-53 network monitoring controls continuously validated',
      identity: 'SOC 2, ISO 27001 identity controls automated',
      cloud: 'PCI-DSS, HIPAA cloud requirements continuous compliance',
      container: 'CIS Kubernetes Benchmark automated assessment',
      endpoint: 'PCI-DSS endpoint security continuous monitoring',
      email: 'GDPR, CCPA email data protection compliance automated'
    }
  }
};

/**
 * Get playbook by category
 */
export function getPlaybookByCategory(category: string): NIIntegrationPlaybook | undefined {
  return NICCEE_PLAYBOOKS.find(p => p.category === category);
}

/**
 * Get data sources by category
 */
export function getDataSourcesByCategory(category: string): NIDataSource[] {
  return NICCEE_DATA_SOURCES.filter(ds => ds.category === category);
}

/**
 * Get high-risk data sources
 */
export function getHighRiskDataSources(): NIDataSource[] {
  return NICCEE_DATA_SOURCES.filter(ds => ds.riskImpact === 'critical' || ds.riskImpact === 'high');
}
