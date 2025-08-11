# POV-CLI Terminal - Docker & Kubernetes Deployment Guide

This guide covers deploying the POV-CLI Terminal application using Docker and Kubernetes.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (local or cloud)
- kubectl configured
- (Optional) Helm for package management
- (Optional) cert-manager for automatic SSL certificates

## Project Structure

```
.
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml           # Local development with Docker Compose
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml          # Namespace definition
│   ├── configmap.yaml          # Nginx configuration
│   ├── deployment.yaml         # Application deployment
│   ├── service.yaml            # Service definitions
│   ├── ingress.yaml            # Ingress controller configuration
│   ├── hpa.yaml                # Horizontal Pod Autoscaler
│   ├── pdb.yaml                # Pod Disruption Budget
│   ├── tls-secret-template.yaml # SSL certificate template
│   └── kustomization.yaml      # Kustomize configuration
└── scripts/                    # Deployment helper scripts
    ├── build.sh                # Build Docker image
    ├── deploy-k8s.sh           # Deploy to Kubernetes
    └── cleanup-k8s.sh          # Clean up Kubernetes resources
```

## Docker Deployment

### Local Development with Docker Compose

1. **Build and run the application**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Main app: http://localhost:8080
   - With proxy (if enabled): http://localhost

3. **Run with SSL proxy profile**:
   ```bash
   docker-compose --profile proxy up --build
   ```

### Manual Docker Build

1. **Build the Docker image**:
   ```bash
   docker build -t pov-cli-terminal:latest .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name pov-cli-terminal \
     -p 8080:80 \
     --restart unless-stopped \
     pov-cli-terminal:latest
   ```

3. **Health check**:
   ```bash
   curl http://localhost:8080/health
   ```

## Kubernetes Deployment

### Quick Deployment

1. **Deploy using kubectl**:
   ```bash
   kubectl apply -f k8s/
   ```

2. **Or using Kustomize**:
   ```bash
   kubectl apply -k k8s/
   ```

### Step-by-Step Deployment

1. **Create namespace**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Deploy configuration and application**:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

3. **Configure ingress and scaling**:
   ```bash
   kubectl apply -f k8s/ingress.yaml
   kubectl apply -f k8s/hpa.yaml
   kubectl apply -f k8s/pdb.yaml
   ```

4. **Verify deployment**:
   ```bash
   kubectl get all -n pov-cli
   kubectl get ingress -n pov-cli
   ```

### SSL Certificate Setup

#### Option 1: Manual Certificate (Production)
1. Obtain SSL certificates for your domains
2. Create the secret:
   ```bash
   kubectl create secret tls pov-cli-tls-secret \
     --cert=path/to/tls.crt \
     --key=path/to/tls.key \
     -n pov-cli
   ```

#### Option 2: cert-manager (Recommended)
1. Install cert-manager:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

2. Create a ClusterIssuer:
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt-prod
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: your-email@example.com
       privateKeySecretRef:
         name: letsencrypt-prod
       solvers:
       - http01:
           ingress:
             class: nginx
   ```

3. Update the ingress annotations:
   ```yaml
   annotations:
     cert-manager.io/cluster-issuer: "letsencrypt-prod"
   ```

## Configuration

### Environment Variables

The application supports the following environment variables:

- `NODE_ENV`: Set to "production" for production builds
- `NEXT_TELEMETRY_DISABLED`: Set to "1" to disable Next.js telemetry

### Resource Requirements

**Minimum resources per pod:**
- CPU: 100m
- Memory: 128Mi

**Resource limits per pod:**
- CPU: 200m
- Memory: 256Mi

### Scaling Configuration

The Horizontal Pod Autoscaler (HPA) is configured to:
- Scale between 2-10 replicas
- Scale up when CPU usage > 70% or Memory usage > 80%
- Scale down with a 5-minute stabilization window

## Monitoring and Logging

### Health Checks

The application provides a health endpoint at `/health` that returns:
- HTTP 200 with "healthy" response when the application is running
- Used by Kubernetes liveness and readiness probes

### Accessing Logs

```bash
# View application logs
kubectl logs -f deployment/pov-cli-terminal -n pov-cli

# View logs from all pods
kubectl logs -f -l app=pov-cli-terminal -n pov-cli
```

### Monitoring Metrics

The deployment includes resource requests and limits suitable for monitoring with:
- Prometheus + Grafana
- Kubernetes native monitoring
- Cloud provider monitoring (EKS/GKE/AKS)

## Troubleshooting

### Common Issues

1. **Image pull errors**:
   ```bash
   # Check if the image exists and is accessible
   docker pull pov-cli-terminal:latest
   
   # Update the image reference in deployment.yaml
   kubectl set image deployment/pov-cli-terminal pov-cli-terminal=your-registry/pov-cli-terminal:tag -n pov-cli
   ```

2. **Pod not starting**:
   ```bash
   # Check pod status
   kubectl describe pod -l app=pov-cli-terminal -n pov-cli
   
   # Check events
   kubectl get events --sort-by=.metadata.creationTimestamp -n pov-cli
   ```

3. **Ingress not working**:
   ```bash
   # Check ingress status
   kubectl describe ingress pov-cli-terminal-ingress -n pov-cli
   
   # Verify ingress controller is running
   kubectl get pods -n ingress-nginx
   ```

4. **SSL certificate issues**:
   ```bash
   # Check certificate status (if using cert-manager)
   kubectl describe certificate pov-cli-terminal-cert -n pov-cli
   
   # Check certificate secret
   kubectl get secret pov-cli-tls-secret -n pov-cli
   ```

### Performance Tuning

1. **Adjust resource limits** based on actual usage
2. **Configure HPA metrics** according to your traffic patterns
3. **Enable horizontal cluster autoscaling** for cloud deployments
4. **Use ReadinessGates** for more sophisticated deployment strategies

## Security Considerations

1. **Container Security**:
   - Runs as non-root user (UID 1001)
   - Read-only root filesystem
   - Minimal capabilities
   - Security context enforced

2. **Network Security**:
   - NetworkPolicies (add if needed)
   - Ingress TLS termination
   - CORS configuration in nginx

3. **Secrets Management**:
   - Use Kubernetes secrets for sensitive data
   - Consider external secret management (HashiCorp Vault, etc.)

## Maintenance

### Updates and Rollbacks

1. **Update the application**:
   ```bash
   kubectl set image deployment/pov-cli-terminal pov-cli-terminal=pov-cli-terminal:v1.1.0 -n pov-cli
   ```

2. **Check rollout status**:
   ```bash
   kubectl rollout status deployment/pov-cli-terminal -n pov-cli
   ```

3. **Rollback if needed**:
   ```bash
   kubectl rollout undo deployment/pov-cli-terminal -n pov-cli
   ```

### Cleanup

To remove all resources:
```bash
kubectl delete namespace pov-cli
```

Or selectively:
```bash
kubectl delete -f k8s/
```
