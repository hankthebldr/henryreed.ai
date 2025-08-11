# POV-CLI Terminal - Quick Start Guide

## 🚀 Quick Deployment Commands

### Docker Deployment

```bash
# Build and run locally
docker-compose up --build

# Access at: http://localhost:8080
```

### Kubernetes Deployment

```bash
# Quick deploy (using scripts)
./scripts/build.sh
./scripts/deploy-k8s.sh

# Manual deploy
kubectl apply -f k8s/

# Access via port forward
kubectl port-forward service/pov-cli-terminal-service 8080:80 -n pov-cli
```

## 📋 Available Scripts

| Script | Purpose |
|--------|---------|
| `./scripts/build.sh` | Build Docker image with optional registry push |
| `./scripts/deploy-k8s.sh` | Deploy to Kubernetes with full automation |
| `./scripts/cleanup-k8s.sh` | Clean up all Kubernetes resources |

## 🔧 Script Options

### Build Script
```bash
./scripts/build.sh
# Environment variables:
# IMAGE_TAG=v1.0.0 ./scripts/build.sh
# REGISTRY=your-registry.com ./scripts/build.sh
```

### Deploy Script
```bash
./scripts/deploy-k8s.sh --help
./scripts/deploy-k8s.sh --dry-run
./scripts/deploy-k8s.sh --image-tag v1.0.0 --registry your-registry.com
```

### Cleanup Script
```bash
./scripts/cleanup-k8s.sh --help
./scripts/cleanup-k8s.sh --force
```

## 🌐 Access Methods

### Local Docker
- **URL**: http://localhost:8080
- **Health**: http://localhost:8080/health

### Kubernetes
- **Port Forward**: `kubectl port-forward service/pov-cli-terminal-service 8080:80 -n pov-cli`
- **NodePort**: Check with `kubectl get service pov-cli-terminal-nodeport -n pov-cli`
- **Ingress**: Configure DNS to point to your ingress controller

## 🔍 Monitoring Commands

```bash
# Check deployment status
kubectl get all -n pov-cli

# View logs
kubectl logs -f deployment/pov-cli-terminal -n pov-cli

# Check scaling
kubectl get hpa -n pov-cli

# Check ingress
kubectl get ingress -n pov-cli
```

## 🛠️ Common Tasks

### Update Application
```bash
# Build new version
IMAGE_TAG=v1.1.0 ./scripts/build.sh

# Deploy update
./scripts/deploy-k8s.sh --image-tag v1.1.0

# Or manual update
kubectl set image deployment/pov-cli-terminal pov-cli-terminal=pov-cli-terminal:v1.1.0 -n pov-cli
```

### Scale Application
```bash
# Manual scaling
kubectl scale deployment pov-cli-terminal --replicas=5 -n pov-cli

# Auto-scaling is configured via HPA (2-10 replicas)
```

### SSL Setup
```bash
# Manual certificate
kubectl create secret tls pov-cli-tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n pov-cli

# Or use cert-manager (see DEPLOYMENT.md)
```

## 🔧 Troubleshooting

### Image Pull Issues
```bash
# Check image exists
docker images pov-cli-terminal

# Update deployment image
kubectl set image deployment/pov-cli-terminal \
  pov-cli-terminal=your-registry/pov-cli-terminal:tag -n pov-cli
```

### Pod Issues
```bash
# Check pod status
kubectl describe pod -l app=pov-cli-terminal -n pov-cli

# View events
kubectl get events --sort-by=.metadata.creationTimestamp -n pov-cli
```

### Ingress Issues
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl describe ingress pov-cli-terminal-ingress -n pov-cli
```

## 🧹 Cleanup

```bash
# Full cleanup
./scripts/cleanup-k8s.sh

# Or manual
kubectl delete namespace pov-cli
```

---

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)
