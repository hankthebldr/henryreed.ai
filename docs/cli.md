# CDR Lab CLI Specification

## Overview

The CDR Lab CLI (`cdrlab`) is a unified command-line interface for managing Container Detection & Response scenarios, providing enhanced destroy/cleanup capabilities, automated detection generation, and comprehensive resource management.

## Design Principles

### Safety First
- **Default Safe Mode**: All scenarios run in safe mode with simulated attacks
- **Explicit Unsafe Mode**: Requires `--unsafe` flag + `CDRLAB_UNSAFE=1` environment variable
- **Dry Run by Default**: Destroy operations preview changes before execution
- **Resource Ledger**: All resources are tracked and labeled for safe cleanup

### Unified Command Structure
```
cdrlab <verb> <noun> [options]
```

**Verbs**: `list`, `plan`, `generate`, `deploy`, `validate`, `export`, `destroy`, `status`, `diff`, `chain`
**Nouns**: `scenarios`, `chains`, `detections`, `resources`, `pov`

## Core Commands

### `cdrlab list [type]`
List available resources and templates.

**Usage:**
```bash
cdrlab list scenarios              # List all scenario templates
cdrlab list chains                 # List available scenario chains
cdrlab list detections            # List detection rule packs
```

**Output:**
- Categorized listing with metadata
- Risk levels and complexity ratings
- MITRE ATT&CK technique mappings
- Resource requirements

### `cdrlab destroy --scenario SCEN [options]`
Enhanced destroy command with comprehensive safety features.

**Usage:**
```bash
# Safe destroy with preview
cdrlab destroy --scenario cryptominer-demo --dry-run

# Scoped destruction
cdrlab destroy --scenario cryptominer-demo --scope k8s
cdrlab destroy --scenario cryptominer-demo --scope cloud --profile aws-dev

# Force destroy (for unsafe scenarios)
cdrlab destroy --scenario cryptominer-demo --force
```

**Safety Features:**
- **Resource Ledger Integration**: Tracks all created resources
- **Dry Run Preview**: Shows resources to be deleted with counts
- **Scoped Cleanup**: Target specific providers (k8s, cloud, xsiam)
- **Confirmation Gates**: Different confirmation levels for safe vs unsafe
- **Zero-Residual Validation**: Verifies complete cleanup
- **Orphan Detection**: Identifies and handles stuck resources

**Options:**
- `--dry-run`: Preview destruction without executing
- `--force`: Skip safety confirmations (unsafe mode only)
- `--scope <provider>`: Limit to specific provider (k8s|cloud|xsiam|all)
- `--since <duration>`: Only destroy resources older than specified time
- `--ttl <duration>`: Set auto-cleanup TTL

### `cdrlab status [--scenario SCEN] [options]`
Enhanced status command with ledger reconciliation.

**Usage:**
```bash
cdrlab status                                    # All scenarios
cdrlab status --scenario cryptominer-demo       # Specific scenario
cdrlab status --output json                     # JSON output for automation
```

**Features:**
- **Resource Summary**: Active vs destroyed resource counts
- **Operations Log**: Historical operations with outcomes
- **Drift Detection**: Compare ledger with live resources
- **Health Checks**: Resource and configuration validation
- **Performance Metrics**: Deployment and response times

### `cdrlab detect gen --scenario SCEN [options]`
Automated detection generation from scenario metadata.

**Usage:**
```bash
cdrlab detect gen --scenario cryptominer-demo --pack xsiam
cdrlab detect gen --scenario cryptominer-demo --pack splunk
cdrlab detect diff --scenario cryptominer-demo --against legacy/
```

**Features:**
- **Template-Based Generation**: Platform-specific detection templates
- **MITRE ATT&CK Mapping**: Automatic technique to detection mapping
- **Multi-Platform Support**: XSIAM, Splunk, Elastic, Sentinel
- **Validation Testing**: Verify detection coverage and accuracy
- **Export Formats**: YAML, JSON, XML for various platforms

### `cdrlab validate --scenario SCEN [options]`
Comprehensive scenario validation.

**Usage:**
```bash
cdrlab validate --scenario cryptominer-demo --checks all
cdrlab validate --scenario cryptominer-demo --checks k8s
cdrlab validate --scenario cryptominer-demo --checks security
```

**Validation Types:**
- **Infrastructure**: Resource deployment and configuration
- **Security**: Detection rules and network policies
- **Performance**: Response times and resource utilization
- **Compliance**: Label coverage and security contexts
- **Zero-Residual**: Post-cleanup validation

### `cdrlab cleanup-orphans [options]`
Clean up orphaned resources across all providers.

**Usage:**
```bash
cdrlab cleanup-orphans --scope k8s --older-than 7d
cdrlab cleanup-orphans --scope cloud --profile aws-dev
cdrlab cleanup-orphans --scope xsiam --dry-run
```

**Features:**
- **Age-Based Cleanup**: Remove resources older than threshold
- **Label-Based Discovery**: Find unlabeled or mislabeled resources
- **Provider-Specific Logic**: Custom cleanup per provider
- **Batch Processing**: Efficient bulk operations with retry/backoff

## Advanced Features

### POV Plan Management
Orchestrate multiple scenarios with explicit cleanup policies.

```yaml
# pov-plan.yaml
apiVersion: cdrlab.pov/v1
kind: PovPlan
id: pov-ransomware-gcp
title: Ransomware POV on GCP and endpoints
cleanupPolicy:
  onSuccess: destroy
  onFailure: retain-with-ttl
  ttl: 4h
steps:
  - scenario: initial-access-phish
    timeout: 10m
  - scenario: ransomware-encryptor
    depends: [initial-access-phish]
    timeout: 15m
  - scenario: exfiltration-gcs
    depends: [ransomware-encryptor]
    timeout: 20m
```

**Usage:**
```bash
cdrlab pov run pov-plan.yaml
cdrlab pov destroy pov-plan.yaml
cdrlab pov validate pov-plan.yaml
```

### Resource Ledger
Each scenario maintains a detailed ledger for traceability.

```json
{
  "scenarioId": "cryptominer-demo",
  "povId": "pov-ransomware-001",
  "createdAt": "2024-01-15T10:00:00Z",
  "overlay": "safe",
  "accountContext": "gcp-dev-project",
  "resources": [
    {
      "id": "ns-1",
      "type": "Namespace",
      "provider": "k8s",
      "identity": "cdr-lab",
      "location": "cluster-1",
      "labels": {
        "managed-by": "cdrlab",
        "cdrlab.scenario": "cryptominer-demo",
        "cdrlab.version": "v1.0"
      },
      "uid": "ns-12345",
      "createdAt": "2024-01-15T10:00:00Z",
      "status": "active"
    }
  ],
  "opsLog": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "operation": "deploy",
      "outcome": "success",
      "message": "Deployed cryptominer scenario with 4 resources"
    }
  ]
}
```

### Standard Labels
All resources receive standardized labels for tracking and cleanup:

```yaml
labels:
  managed-by: cdrlab
  cdrlab.scenario: <scenario-id>
  cdrlab.version: v1.0
  cdrlab.pov: <pov-id>          # When part of POV plan
  cdrlab.chain: <chain-id>      # When part of scenario chain
  owner: <user-or-team>
  created-at: <iso8601-timestamp>
```

## Provider-Specific Implementations

### Kubernetes Plugin
**Discovery**: `kubectl api-resources --verbs=list -o name`
**Deletion Order**: Jobs/Pods → Services → RBAC → CRDs → Namespaces
**Stuck Handling**: Remove finalizers, force-delete terminating pods
**Validation**: Empty namespace check, resource count verification

### Cloud Providers Plugin
**AWS**: Tag-based selection with account/region allowlists
**GCP**: Label-based with project allowlists, storage bucket protection
**Azure**: Resource group per scenario for one-shot cleanup

### XSIAM/XDR Plugin
**Discovery**: Content by label prefix or description fingerprint
**Deletion**: Soft delete with recycle bin, hard delete with --force
**Dependencies**: Resolve content pack order for safe removal

## Global Flags

- `--profile <name>`: Use named configuration profile
- `--project <id>`: Target specific cloud project/account
- `--cluster <name>`: Target specific Kubernetes cluster
- `--labels <key=value>`: Additional resource labels
- `--log-level <level>`: Logging verbosity (debug|info|warn|error)
- `--non-interactive`: Disable all prompts for automation
- `--output <format>`: Output format (table|json|yaml)

## Safety Mechanisms

### Execution Locks
Per-scenario lock files prevent concurrent operations:
```
.cdrlab/locks/cryptominer-demo.lock
```

### Policy Configuration
Global policy enforcement via `.cdrlab/policy.yaml`:
```yaml
maxResourcesPerScenario: 100
maxTTL: 24h
forbiddenAPIs:
  - /api/v1/nodes
  - /api/v1/persistentvolumes
allowedNamespaces:
  - cdr-lab
  - cdr-test
  - default
```

### Confirmation Gates
- **Safe Mode**: Single confirmation for destroy operations
- **Unsafe Mode**: Type scenario ID + additional confirmation
- **High Risk**: Type "EXTREME_RISK_ACCEPTED" for critical operations

## Terminal Integration

The CDR Lab commands are integrated into the Henry Reed AI terminal interface as part of the scenario management system. Users can access enhanced destroy/cleanup and detection generation capabilities directly through the terminal.

**Available in Terminal:**
```bash
# Enhanced scenario management
cdrlab list scenarios
cdrlab destroy --scenario cryptominer-demo --dry-run
cdrlab status --scenario cryptominer-demo
cdrlab detect gen --scenario cryptominer-demo --pack xsiam
cdrlab cleanup-orphans --scope k8s --older-than 7d

# Legacy scenario commands (still available)
scenario list
scenario generate --scenario-type cryptominer --provider gcp
scenario destroy cryptominer-demo
scenario validate cryptominer-demo
```

## Success Criteria

### Safety
- ✅ 0 unintended deletions in safe mode across all test suites
- ✅ 100% resource labeling coverage
- ✅ All scenarios include destroy and validation sections

### Performance
- ✅ 99% of scenario destroys complete within 5 minutes (P90)
- ✅ 0 orphaned resources older than 24h in CI environments
- ✅ Detection generation covers 90% of scenarios with ATT&CK mapping

### Quality
- ✅ Zero-residual validation passes for all cleanup operations
- ✅ Resource ledger accuracy maintained across all operations
- ✅ Multi-scope cleanup (K8s + Cloud + XSIAM) working end-to-end

## Examples

### Complete Workflow
```bash
# 1. List available scenarios
cdrlab list scenarios

# 2. Deploy a scenario (safe mode)
cdrlab deploy --scenario cryptominer --safe --ttl 2h

# 3. Check status
cdrlab status --scenario cryptominer

# 4. Generate detections
cdrlab detect gen --scenario cryptominer --pack xsiam

# 5. Validate deployment
cdrlab validate --scenario cryptominer --checks all

# 6. Preview cleanup
cdrlab destroy --scenario cryptominer --dry-run

# 7. Execute cleanup
cdrlab destroy --scenario cryptominer

# 8. Verify zero-residual
cdrlab validate --scenario cryptominer --checks zero-residual
```

### Multi-Scope Cleanup
```bash
# Clean up Kubernetes resources only
cdrlab destroy --scenario cryptominer --scope k8s

# Clean up cloud resources with profile
cdrlab destroy --scenario cryptominer --scope cloud --profile aws-dev

# Clean up XSIAM content
cdrlab destroy --scenario cryptominer --scope xsiam --force

# Clean up everything
cdrlab destroy --scenario cryptominer --scope all
```

### Orphan Management
```bash
# Find orphaned resources
cdrlab cleanup-orphans --scope k8s --older-than 7d --dry-run

# Clean up cloud orphans
cdrlab cleanup-orphans --scope cloud --older-than 1d --profile gcp-dev

# Emergency cleanup (all providers)
cdrlab cleanup-orphans --older-than 0h --force
```

This CLI specification provides a comprehensive framework for safe, traceable, and efficient management of CDR lab scenarios with enhanced destroy/cleanup capabilities and automated detection generation.
