# Cloud Provider Integration Guide

## Overview

The CDR Lab supports cloud provider integration for more realistic security scenarios by enabling deployments across multiple cloud providers including AWS, Google Cloud Platform (GCP), and Microsoft Azure. This guide covers the complete workflow for configuring cloud credentials, managing profiles, and deploying scenarios to external cloud environments.

## Quick Start

### 1. Configure a Cloud Profile

```bash
# Interactive setup (recommended for first-time users)
cloud add --provider aws --interactive

# Command-line setup
cloud add --provider aws --name my-aws-lab
```

### 2. Validate Configuration

```bash
# Test connectivity and permissions
cloud validate my-aws-lab

# Test actual connection
cloud test-connection my-aws-lab
```

### 3. Deploy Scenarios with Cloud Resources

```bash
# Deploy with cloud profile (creates both K8s and cloud resources)
cdrlab deploy --scenario cryptominer --profile my-aws-lab --safe

# Preview what would be deployed
cdrlab deploy --scenario cryptominer --profile my-aws-lab --dry-run
```

### 4. Monitor and Manage

```bash
# Check resource usage
cloud usage my-aws-lab

# View deployment status
cdrlab status --scenario cryptominer-abc123

# Clean up when finished
cdrlab destroy --scenario cryptominer-abc123 --scope all
```

## Cloud Provider Setup

### Amazon Web Services (AWS)

#### Prerequisites
- AWS account with programmatic access
- IAM user with required permissions
- AWS CLI installed (optional but recommended)

#### Required Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "s3:*",
                "iam:GetUser",
                "iam:GetRole",
                "iam:ListRoles",
                "lambda:*",
                "logs:*",
                "cloudtrail:LookupEvents"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "aws:RequestedRegion": ["us-west-2", "us-east-1"]
                }
            }
        }
    ]
}
```

#### Setup Steps
1. **Create IAM User**:
   ```bash
   # Using AWS CLI
   aws iam create-user --user-name cdr-lab-user
   aws iam attach-user-policy --user-name cdr-lab-user --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
   ```

2. **Generate Access Keys**:
   ```bash
   aws iam create-access-key --user-name cdr-lab-user
   ```

3. **Configure CDR Lab Profile**:
   ```bash
   cloud add --provider aws --name aws-lab --interactive
   ```

### Google Cloud Platform (GCP)

#### Prerequisites
- GCP project with billing enabled
- Service account with required roles
- `gcloud` CLI installed (optional)

#### Required Roles
- `Compute Admin`
- `Storage Admin`
- `Project Viewer`
- `Logging Admin`
- `Monitoring Viewer`

#### Setup Steps
1. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create cdr-lab-sa \
       --display-name="CDR Lab Service Account"
   ```

2. **Assign Roles**:
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   gcloud projects add-iam-policy-binding $PROJECT_ID \
       --member="serviceAccount:cdr-lab-sa@$PROJECT_ID.iam.gserviceaccount.com" \
       --role="roles/compute.admin"
   ```

3. **Generate Key File**:
   ```bash
   gcloud iam service-accounts keys create ~/cdr-lab-key.json \
       --iam-account=cdr-lab-sa@$PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Configure CDR Lab Profile**:
   ```bash
   cloud add --provider gcp --name gcp-lab --interactive
   ```

### Microsoft Azure

#### Prerequisites
- Azure subscription
- Azure CLI installed
- Application registration with client secret

#### Required Permissions
- `Virtual Machine Contributor`
- `Storage Account Contributor`
- `Monitoring Reader`
- `Log Analytics Reader`

#### Setup Steps
1. **Create Application Registration**:
   ```bash
   az ad app create --display-name "CDR Lab Application"
   ```

2. **Create Service Principal**:
   ```bash
   az ad sp create-for-rbac --name "CDR Lab SP" \
       --role="Contributor" \
       --scopes="/subscriptions/YOUR_SUBSCRIPTION_ID"
   ```

3. **Configure CDR Lab Profile**:
   ```bash
   cloud add --provider azure --name azure-lab --interactive
   ```

## Profile Management

### List Profiles
```bash
# List all profiles
cloud list

# List profiles for specific provider
cloud list aws

# Show detailed information
cloud list --detailed
```

### Profile Status and Validation
```bash
# Validate profile configuration
cloud validate aws-lab

# Test actual connectivity
cloud test-connection aws-lab

# Check resource usage and costs
cloud usage aws-lab
```

### Update and Maintenance
```bash
# Set default profile
cloud set-default aws-lab

# Export profile configuration (without credentials)
cloud export aws-lab --format yaml

# Remove profile (clean up resources first)
cdrlab cleanup-orphans --scope cloud --profile aws-lab
cloud remove aws-lab
```

## Deployment Workflows

### Local + Cloud Hybrid Deployment
Deploy scenarios that span both local Kubernetes and cloud resources:

```bash
# Deploy cryptominer with cloud infrastructure
cdrlab deploy --scenario cryptominer --profile aws-lab --safe --ttl 4h

# This creates:
# - Kubernetes namespace and job (local)
# - EC2 instance for mining simulation (AWS)
# - S3 bucket for exfiltration simulation (AWS)
# - CloudTrail logging for detection (AWS)
```

### Multi-Cloud Scenarios
For advanced scenarios spanning multiple providers:

```bash
# Deploy initial access on AWS
cdrlab deploy --scenario initial-access --profile aws-prod --safe

# Deploy lateral movement on GCP
cdrlab deploy --scenario lateral-movement --profile gcp-dev --safe

# Deploy data exfiltration on Azure
cdrlab deploy --scenario data-exfil --profile azure-test --safe
```

### Scenario Templates by Provider

#### AWS-Specific Scenarios
- **EC2 Privilege Escalation**: Exploit instance metadata service
- **S3 Bucket Enumeration**: Discover and access misconfigured buckets
- **Lambda Backdoors**: Deploy persistent functions
- **CloudTrail Evasion**: Techniques to avoid detection

#### GCP-Specific Scenarios
- **GCE Instance Breakout**: Container to host escape
- **GCS Data Exfiltration**: Large-scale data theft simulation
- **IAM Privilege Escalation**: Service account abuse
- **Kubernetes Engine Attack**: Multi-tenant cluster exploitation

#### Azure-Specific Scenarios
- **VM Privilege Escalation**: Windows and Linux techniques
- **Blob Storage Access**: Unauthorized data access
- **Azure AD Attacks**: Identity and access attacks
- **Function App Persistence**: Serverless backdoors

## Security Considerations

### Credential Security
- **Encryption**: All credentials are encrypted at rest using AES-256
- **Minimal Permissions**: Follow principle of least privilege
- **Rotation**: Regularly rotate access keys and secrets
- **Separation**: Use dedicated lab accounts separate from production
- **Expiration**: Set credential expiration dates

### Network Isolation
- **VPC/VNet Isolation**: Deploy resources in isolated networks
- **Security Groups**: Restrictive ingress/egress rules
- **Private Subnets**: Use private networking where possible
- **Network Monitoring**: Enable VPC/VNet flow logs

### Resource Limits
- **Quotas**: Set resource quotas per profile
- **Budget Alerts**: Configure spending alerts
- **Auto-Cleanup**: Mandatory TTL for all resources
- **Tagging**: Consistent resource tagging for tracking

### Audit and Monitoring
- **CloudTrail/Audit Logs**: Enable comprehensive logging
- **Resource Monitoring**: Track resource creation and deletion
- **Cost Monitoring**: Monitor spending across all scenarios
- **Compliance**: Ensure regulatory compliance in target regions

## Advanced Features

### Cost Management
```bash
# View detailed usage and costs
cloud usage aws-lab

# Export usage data for analysis
cloud export aws-lab --format json | jq '.usage'

# Set up budget alerts (coming soon)
cloud set-budget aws-lab --monthly-limit 100
```

### Multi-Region Deployments
```bash
# Deploy across multiple regions for global scenarios
cdrlab deploy --scenario global-attack --profile aws-lab --regions us-west-2,eu-west-1,ap-southeast-1
```

### Template Customization
Create custom scenario templates for your cloud environment:

```yaml
# custom-cloud-scenario.yaml
apiVersion: cdrlab.scenario/v1
kind: Scenario
metadata:
  name: custom-s3-attack
  provider: aws
spec:
  resources:
    - type: s3-bucket
      configuration:
        versioning: enabled
        publicRead: false
        encryption: aes256
    - type: ec2-instance
      configuration:
        instanceType: t3.micro
        ami: ami-0abcdef1234567890
  attackSteps:
    - name: enumerate-buckets
      technique: T1526
    - name: privilege-escalation
      technique: T1548
```

### Integration with CI/CD
Integrate cloud scenarios into your CI/CD pipeline:

```yaml
# .github/workflows/cdr-scenarios.yml
name: CDR Lab Scenarios
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
jobs:
  run-scenarios:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup CDR Lab
        run: |
          cloud add --provider aws --name ci-aws
          cloud validate ci-aws
      - name: Run Security Scenarios
        run: |
          cdrlab deploy --scenario cryptominer --profile ci-aws --safe --ttl 1h
          cdrlab validate --scenario cryptominer --checks all
          cdrlab destroy --scenario cryptominer
```

## Troubleshooting

### Common Issues

#### Authentication Errors
```bash
# Check profile configuration
cloud validate my-profile

# Test connectivity
cloud test-connection my-profile

# Verify credentials haven't expired
cloud list my-profile --detailed
```

#### Resource Quota Issues
```bash
# Check current usage
cloud usage my-profile

# Clean up old resources
cdrlab cleanup-orphans --scope cloud --profile my-profile --older-than 7d
```

#### Network Connectivity
```bash
# Test API endpoints
cloud test-connection my-profile

# Check security groups/firewall rules
# (provider-specific troubleshooting)
```

### Debug Mode
Enable debug logging for detailed troubleshooting:

```bash
export CDRLAB_LOG_LEVEL=debug
cdrlab deploy --scenario test --profile my-profile --safe
```

### Support Resources
- **Documentation**: Comprehensive guides at `/docs/`
- **Examples**: Sample configurations in `/examples/`
- **Community**: GitHub issues and discussions
- **Professional Support**: Enterprise support available

## Migration and Backup

### Backup Profile Configurations
```bash
# Export all profiles
for profile in $(cloud list --format json | jq -r '.[].name'); do
  cloud export $profile --format yaml > profiles/$profile.yaml
done
```

### Disaster Recovery
```bash
# Emergency cleanup of all cloud resources
cdrlab cleanup-orphans --scope cloud --force --older-than 0h

# Restore from backup
cloud add --from-file profiles/aws-lab.yaml
```

This comprehensive cloud provider integration enables realistic security scenarios while maintaining the safety and traceability features of the CDR Lab platform.
