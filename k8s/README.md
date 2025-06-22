# Pad Kubernetes Deployment

This directory contains all the Kubernetes manifests needed to deploy Pad to your cluster.

## Quick Start

1. **Update configuration:**
   ```bash
   # Update the domain in configmap.yaml and httproute.yaml
   sed -i 's/pad.example.com/your-actual-domain.com/g' k8s/configmap.yaml k8s/httproute.yaml
   
   # Generate your secret
   kubectl create secret generic pad-secrets \
     --from-literal=BETTER_AUTH_SECRET='your-super-secret-key-here' \
     --namespace=pad --dry-run=client -o yaml > k8s/secret-generated.yaml
   ```

2. **Deploy to cluster:**
   ```bash
   # Apply all manifests
   kubectl apply -f k8s/
   
   # Watch deployment
   kubectl get pods -n pad -w
   ```

## Files Overview

- `namespace.yaml` - Creates the pad namespace
- `configmap.yaml` - Non-sensitive environment variables
- `secret.yaml` - Sensitive environment variables (update before deploying)
- `pvc.yaml` - Persistent volume claims for data and uploads (uses NFS storage class)
- `deployment.yaml` - Main application deployment with init container for permissions
- `service.yaml` - ClusterIP service for internal communication
- `httproute.yaml` - Gateway API HTTPRoute for external access (includes Ingress alternative)

## Prerequisites

- Kubernetes cluster with NFS storage class configured
- Gateway API installed (or Ingress controller for alternative setup)
- Persistent volumes available for NFS storage class

## Configuration

### Required Updates

1. **Domain Configuration:**
   - Update `NEXT_PUBLIC_BASE_URL` in `configmap.yaml`
   - Update hostname in `httproute.yaml`

2. **Secrets:**
   - Generate a secure `BETTER_AUTH_SECRET`
   - Add any OAuth secrets if using social login

3. **Storage:**
   - Adjust PVC sizes in `pvc.yaml` if needed
   - Verify NFS storage class name matches your cluster

4. **Gateway/Ingress:**
   - Update Gateway reference in `httproute.yaml`
   - Or use the Ingress configuration instead

## Deployment Commands

```bash
# Create namespace first
kubectl apply -f k8s/namespace.yaml

# Create secrets (update with your values)
kubectl create secret generic pad-secrets \
  --from-literal=BETTER_AUTH_SECRET='your-secret-here' \
  --namespace=pad

# Apply remaining manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/httproute.yaml

# Check status
kubectl get all -n pad
```

## Troubleshooting

```bash
# Check pod logs
kubectl logs -n pad -l app=pad -f

# Check init container logs
kubectl logs -n pad -l app=pad -c volume-permissions

# Check PVC status
kubectl get pvc -n pad

# Check HTTPRoute status
kubectl describe httproute -n pad pad-route
```

## Health Checks

The deployment includes comprehensive health checks:
- **Startup Probe:** Allows up to 2 minutes for initial startup
- **Liveness Probe:** Restarts container if unhealthy
- **Readiness Probe:** Removes from service if not ready

All probes use the `/api/health` endpoint.

## Security

- Runs as non-root user (1001:1001)
- Init container properly sets file permissions for NFS volumes
- Secrets are stored in Kubernetes secrets
- Security contexts prevent privilege escalation
- Read-only root filesystem where possible