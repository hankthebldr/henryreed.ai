# XSIAM POV Portal - Command Reference

## Overview
The XSIAM POV Portal provides a comprehensive command-line interface optimized for domain consultants conducting Proof of Value (POV) engagements. The portal focuses on real-world security demonstration workflows, customer environment management, and professional reporting.

## Command Categories

### 1. POV Lifecycle Management
Commands for managing complete POV engagements from initial planning through final reporting.

#### `pov` - POV Engagement Management
**Primary Command**: Complete POV lifecycle orchestration
```bash
pov init <customer-name> --template <template-type> [--environment <env>]
pov list [--status <status>] [--customer <customer>]
pov configure <pov-id> [--xsiam-tenant <tenant>] [--datasources <sources>]
pov execute <pov-id> --scenario <scenario-id> [--live] [--audience <type>]
pov status <pov-id> [--detailed] [--realtime]
pov report <pov-id> [--executive] [--technical] [--customer-branded]
pov metrics <pov-id> [--compare-baseline] [--business-impact]
pov cleanup <pov-id> [--preserve-evidence]
pov templates
```

**Key Features**:
- Structured POV workflow management
- Executive and technical reporting templates
- Real-time metrics and ROI calculation
- Multi-scenario orchestration
- Customer-specific customization

**Example Workflows**:
```bash
# Executive Overview POV (60 minutes)
pov init "ACME Corporation" --template executive-overview
pov configure pov-acme-exec-abc123 --xsiam-tenant acme.xdr.paloaltonetworks.com
pov execute pov-acme-exec-abc123 --scenario cloud-posture --audience executive

# Technical Deep Dive (2-3 hours)
pov init "TechCorp" --template technical-deep-dive --environment production
pov execute pov-techcorp-tech-def456 --scenario-chain advanced-attack-lifecycle
pov report pov-techcorp-tech-def456 --technical --include-detections
```

---

### 2. Template & Scenario Management
Advanced template system for customizing security scenarios to customer environments.

#### `template` - Scenario Template Management
**Primary Command**: Template customization and deployment
```bash
template list [--category <category>] [--difficulty <level>]
template show <template-id>
template customize <template-id> --customer <customer-name> [--variables]
template validate <template-id> --environment <env>
template export <template-id> --format <yaml|json>
template deploy <template-id> [--dry-run]
template clone <template-id> --name <new-template-name>
```

**Available Templates**:
- `executive-overview`: High-level security posture demonstration (60 min)
- `technical-deep-dive`: In-depth platform capabilities (2-3 hours)
- `industry-specific`: Vertical-focused scenarios with compliance (90 min)
- `advanced-ransomware-chain`: Complete ransomware attack simulation (45 min)
- `cloud-posture-assessment`: Cloud security configuration review (30 min)

**Template Features**:
- Variable substitution for customer environments
- MITRE ATT&CK technique mapping
- Detection rule generation for multiple platforms
- Execution flow with dependency tracking
- Business value alignment

**Example Usage**:
```bash
# View ransomware template details
template show advanced-ransomware-chain

# Customize for financial services customer
template customize advanced-ransomware-chain --customer "Financial Corp" \
  --variable targetSystems="Windows Servers,Domain Controllers" \
  --variable complianceFramework="PCI DSS,SOX"

# Validate template against customer environment
template validate custom-ransomware-financial --environment production
```

---

### 3. Customer Environment Management
Comprehensive customer environment setup and configuration management.

#### `customer` - Environment Configuration
**Primary Command**: Customer environment lifecycle management
```bash
customer create <customer-name> --region <region> [--environment <env>]
customer configure <customer-name> --xsiam-tenant <tenant-url>
customer test <customer-name> [--connectivity] [--permissions] [--data-ingestion]
customer status <customer-name> [--detailed]
customer integrate <customer-name> --tool <tool-name> [--test]
customer backup <customer-name> [--include-baselines]
customer cleanup <customer-name> [--preserve-config]
```

**Integration Capabilities**:
- **XSIAM/Cortex**: Native tenant integration with API validation
- **Cloud Providers**: AWS, GCP, Azure credential management
- **Security Tools**: SIEM, SOAR, EDR integration testing
- **Data Sources**: Log forwarding and ingestion validation

**Example Workflows**:
```bash
# Complete customer environment setup
customer create "Global Manufacturing" --region us-east-1 --environment production
customer configure "Global Manufacturing" \
  --xsiam-tenant "globalmfg.xdr.paloaltonetworks.com" \
  --datasources "windows-events,cloud-logs,network-traffic"

# Test all integrations
customer test "Global Manufacturing" --connectivity --permissions --data-ingestion

# Integrate with existing security tools
customer integrate "Global Manufacturing" --tool splunk \
  --endpoint "https://globalmfg-splunk.com:8089" --test
customer integrate "Global Manufacturing" --tool crowdstrike --validate-permissions
```

---

### 4. Enhanced CDR Lab Integration
Optimized container security scenarios with comprehensive resource management.

#### `cdrlab` - Container Security Demonstrations
**Primary Command**: Container Detection and Response scenarios
```bash
cdrlab list [scenarios|chains|detections]
cdrlab deploy --scenario <scenario> [--profile <cloud-profile>] [--safe] [--ttl <time>]
cdrlab status [<scenario-id>] [--output <format>]
cdrlab validate --scenario <scenario> [--checks <type>]
cdrlab detect gen --scenario <scenario> --pack <xsiam|splunk>
cdrlab destroy --scenario <scenario> [--dry-run] [--scope <k8s|cloud|xsiam>]
cdrlab cleanup-orphans [--scope <scope>] [--older-than <duration>]
```

**Available Scenarios**:
- `cryptominer`: Cryptocurrency mining simulation
- `container-escape`: Container breakout techniques
- `privilege-escalation`: SUID binary exploitation
- `lateral-movement`: Network traversal simulation
- `cloud-misconfig`: Infrastructure misconfiguration
- `data-exfiltration`: Storage access patterns

**Safety Features**:
- Default safe mode with simulated attacks
- Comprehensive resource ledger tracking
- Zero-residual cleanup validation
- Scoped destruction with dry-run support

---

### 5. Detection Generation & Validation
Platform-specific detection rule generation from scenario metadata.

#### Detection Generation Commands
```bash
# XSIAM detection generation
cdrlab detect gen --scenario <scenario> --pack xsiam
template customize <template-id> --generate-detections --platform xsiam

# Cross-platform detection export
template export <template-id> --detections-only --format splunk
cdrlab detect diff --scenario <scenario> --against legacy/
```

**Supported Platforms**:
- **XSIAM**: Native XQL query generation
- **Splunk**: SPL search conversion
- **Elastic**: EQL query templates
- **Sentinel**: KQL query generation

**MITRE ATT&CK Integration**:
- Automatic technique mapping
- Coverage gap analysis
- Detection rule validation
- Business impact assessment

---

### 6. Cloud Provider Integration
Multi-cloud deployment and resource management for realistic POV scenarios.

#### `cloud` - Cloud Provider Management
```bash
cloud list [--provider <provider>]
cloud add --provider <aws|gcp|azure> --interactive
cloud configure <profile-name> --region <region> [--credentials <file>]
cloud test <profile-name> --connectivity --permissions
cloud deploy --scenario <scenario> --profile <profile> [--dry-run]
```

**Provider Support**:
- **AWS**: EC2, S3, IAM, VPC integration
- **GCP**: Compute Engine, Cloud Storage, IAM
- **Azure**: Virtual Machines, Storage Accounts, Active Directory

---

### 7. AI-Powered Insights & Analytics
Intelligent scenario recommendations and outcome analysis.

#### AI and Analytics Commands
```bash
# AI-powered scenario recommendations
pov analyze <customer-name> --recommend-scenarios --business-priority
template recommend --customer-environment <env> --threats <threat-types>

# Advanced analytics
pov metrics <pov-id> --predictive-analysis --roi-projection
pov compare --customers <customer1,customer2> --benchmark-industry
```

---

### 8. Reporting & Documentation
Professional reporting suite for executive and technical stakeholders.

#### Reporting Commands
```bash
# Executive reporting
pov report <pov-id> --executive --format pdf --customer-branded
pov metrics <pov-id> --executive-summary --roi-calculation

# Technical documentation
pov report <pov-id> --technical --include-detections --include-logs
template export <template-id> --documentation --format markdown

# Custom analytics
pov analytics <pov-id> --custom-dashboard --export-data
```

**Report Types**:
- **Executive Summary**: Business impact, ROI, strategic recommendations
- **Technical Report**: Detailed results, detection analysis, implementation guide
- **Compliance Report**: Framework validation, audit trail, risk assessment
- **Metrics Dashboard**: Real-time KPIs, performance analytics

---

### 9. Project & Engagement Tracking
End-to-end project management for complex POV engagements.

#### `project` - Project Management Integration
```bash
project create <project-name> --customer <customer> --pov-id <pov-id>
project status <project-id> [--detailed]
project milestone <project-id> --add <milestone> --due-date <date>
project report <project-id> --stakeholder-update
```

---

### 10. Utility & System Commands
Core system functionality and terminal utilities.

#### System Commands
```bash
help [command]              # Show help for commands
clear                       # Clear terminal screen
status [--detailed]         # System status and health
search "query" [--scope]    # Search knowledge base
contact [--schedule]        # Get consultant contact information
```

---

## Command Usage Patterns

### Quick Start Workflows

#### 1. Executive Demo Setup (5 minutes)
```bash
customer create "Demo Corp" --region us-east-1
pov init "Demo Corp" --template executive-overview
pov execute pov-democorp-exec-xyz --scenario cloud-posture --audience executive
```

#### 2. Technical Validation Setup (10 minutes)
```bash
customer create "TechCorp" --environment staging
customer configure "TechCorp" --xsiam-tenant "techcorp.xdr.paloaltonetworks.com"
customer test "TechCorp" --connectivity --data-ingestion
template customize technical-deep-dive --customer "TechCorp"
pov init "TechCorp" --template custom-technical-deep-dive
```

#### 3. Multi-Scenario POV (15 minutes)
```bash
pov init "Enterprise Corp" --template industry-specific
pov configure pov-enterprise-abc123 --multi-scenario
pov execute pov-enterprise-abc123 --scenario-chain full-attack-lifecycle
pov report pov-enterprise-abc123 --executive --technical
```

### Advanced Usage Patterns

#### Automated POV Pipeline
```bash
# Scheduled POV execution
pov schedule <pov-id> --datetime "2024-01-15 14:00" --notify-completion

# Batch customer setup
customer batch-create --config customers.yaml --validate-all

# Continuous monitoring
pov monitor --all-active --alert-on-failure
```

#### Custom Template Development
```bash
# Create industry-specific template
template clone executive-overview --name healthcare-hipaa
template edit healthcare-hipaa --add-compliance "HIPAA,HITECH"
template validate healthcare-hipaa --regulatory-check

# Template version control
template export healthcare-hipaa --format yaml --include-metadata
template import updated-healthcare-template.yaml --validate
```

---

## Best Practices

### POV Preparation
1. **Customer Discovery**: Use `customer create` and `customer configure` for thorough environment setup
2. **Template Selection**: Match templates to business priorities and technical requirements
3. **Environment Testing**: Always run `customer test` before POV execution
4. **Backup Planning**: Prepare alternative scenarios for demo recovery

### Live Demonstration
1. **Audience Alignment**: Use `--audience` flags to tailor technical detail level
2. **Real-time Monitoring**: Enable `--live` and `--realtime` for dynamic demonstrations
3. **Recovery Planning**: Have `demo emergency-switch` procedures ready
4. **Value Communication**: Focus on `--business-impact` metrics

### Post-POV Activities
1. **Comprehensive Reporting**: Generate both executive and technical reports
2. **Cleanup Validation**: Use `--dry-run` before actual resource cleanup
3. **Metrics Analysis**: Compare results against baselines and industry benchmarks
4. **Documentation**: Export templates and results for customer handoff

### Professional Services Integration
1. **Project Tracking**: Link POVs to customer projects and milestones
2. **Knowledge Management**: Update templates based on POV learnings
3. **Team Collaboration**: Share successful configurations and scenarios
4. **Continuous Improvement**: Analyze POV success factors and optimize workflows

---

## Support and Resources

### Getting Help
- **Command Help**: Use `help <command>` for detailed command information
- **Interactive Help**: Commands provide usage examples and common patterns
- **Error Recovery**: Built-in troubleshooting guidance for common issues

### Documentation
- **POV Consultant Guide**: Comprehensive workflows and best practices
- **Template Library**: Detailed scenario descriptions and customization options
- **API Integration**: Technical documentation for custom integrations
- **Troubleshooting Guide**: Common issues and resolution procedures

### Professional Services
- **POV Center of Excellence**: Expert consultation and advanced scenario development
- **Customer Success Team**: Implementation guidance and best practice sharing
- **Technical Support**: Platform integration and troubleshooting assistance

---

*This command reference is optimized for domain consultants conducting XSIAM POV engagements. For the most current command documentation and updates, use the built-in `help` system.*
