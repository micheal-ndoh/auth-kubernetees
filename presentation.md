# Kubernetes Deployment Presentation

## 1. Overview
- This project is deployed using Kubernetes, which manages containers for both backend and frontend.
- All configuration, secrets, and service exposure are handled via Kubernetes manifests in the `k8s/` directory.

---

## 2. Docker Images & CI/CD
- **Backend and frontend are each built into their own Docker images.**
- Images are built and pushed to GitHub Container Registry (GHCR) using a GitHub Actions workflow.
- The workflow automates image building and pushing on every commit to the `main` branch.

---

## 3. Kubernetes Manifests: Line-by-Line Explanations

### backend-deployment.yaml
```yaml
apiVersion: apps/v1              # Uses the apps/v1 API for Deployments
kind: Deployment                 # This resource is a Deployment
metadata:
  name: backend                  # The name of the Deployment is 'backend'
spec:
  replicas: 1                    # Run 1 pod (can be scaled up)
  selector:
    matchLabels:
      app: backend               # Select pods with label app=backend
  template:
    metadata:
      labels:
        app: backend             # Pods created will have label app=backend
    spec:
      containers:
      - name: backend            # Name of the container
        image: ghcr.io/micheal-ndoh/auth-kubernetees-backend:latest # Docker image to use
        ports:
        - containerPort: 3000    # Expose port 3000 in the container
        env:
        - name: JWT_SALT         # Set env var JWT_SALT from Secret
          valueFrom:
            secretKeyRef:
              name: backend-secret
              key: JWT_SALT
        - name: JWT_SECRET       # Set env var JWT_SECRET from Secret
          valueFrom:
            secretKeyRef:
              name: backend-secret
              key: JWT_SECRET
        - name: JWT_EXPIRATION   # Set env var JWT_EXPIRATION from ConfigMap
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: JWT_EXPIRATION
```

---

### frontend-deployment.yaml
```yaml
apiVersion: apps/v1              # Uses the apps/v1 API for Deployments
kind: Deployment                 # This resource is a Deployment
metadata:
  name: frontend                 # The name of the Deployment is 'frontend'
spec:
  replicas: 1                    # Run 1 pod
  selector:
    matchLabels:
      app: frontend              # Select pods with label app=frontend
  template:
    metadata:
      labels:
        app: frontend            # Pods created will have label app=frontend
    spec:
      containers:
      - name: frontend           # Name of the container
        image: ghcr.io/micheal-ndoh/auth-kubernetees-frontend:latest # Docker image to use
        imagePullPolicy: IfNotPresent # Use local image if available
        ports:
        - containerPort: 80      # Expose port 80 in the container
        envFrom:
        - configMapRef:
            name: frontend-config # Load all env vars from frontend-config ConfigMap
```

---

### backend-secret.yaml
```yaml
apiVersion: v1                   # Uses the core v1 API
kind: Secret                     # This resource is a Secret
metadata:
  name: backend-secret           # The name of the Secret
 type: Opaque                    # Opaque means arbitrary user-defined data
data:
  JWT_SALT: ry533h242g24r53y     # Base64-encoded value for JWT_SALT
  JWT_SECRET: ry533h242g24r53yuy # Base64-encoded value for JWT_SECRET
```
- **Note:** In production, these values should be securely generated and base64-encoded.

---

### backend-configmap.yaml
```yaml
apiVersion: v1                   # Uses the core v1 API
kind: ConfigMap                  # This resource is a ConfigMap
metadata:
  name: backend-config           # The name of the ConfigMap
data:
  JWT_EXPIRATION: "86400"        # JWT expiration time in seconds
```

---

### frontend-configmap.yaml
```yaml
apiVersion: v1                   # Uses the core v1 API
kind: ConfigMap                  # This resource is a ConfigMap
metadata:
  name: frontend-config          # The name of the ConfigMap
data:
  REACT_APP_API_URL: "http://backend-service:3000" # URL for frontend to reach backend
```

---

### backend-service.yaml
```yaml
apiVersion: v1                   # Uses the core v1 API
kind: Service                    # This resource is a Service
metadata:
  name: backend-service          # The name of the Service
spec:
  selector:
    app: backend                 # Targets pods with label app=backend
  ports:
    - protocol: TCP
      port: 3000                 # Expose port 3000 on the service
      targetPort: 3000           # Forward to port 3000 on the pod
```

---

### frontend-service.yaml
```yaml
apiVersion: v1                   # Uses the core v1 API
kind: Service                    # This resource is a Service
metadata:
  name: frontend-service         # The name of the Service
spec:
  selector:
    app: frontend                # Targets pods with label app=frontend
  ports:
    - protocol: TCP
      port: 80                   # Expose port 80 on the service
      targetPort: 80             # Forward to port 80 on the pod
  type: NodePort                 # Expose this service on a port on each node
```
- **NodePort** allows access to the frontend from outside the cluster (e.g., your browser).

---



---

## 5. Security & Best Practices
- **Secrets** are never hardcoded; always injected via Kubernetes Secrets.
- **ConfigMaps** are used for environment-specific, non-sensitive configuration.
- **Automated CI/CD** ensures images are always up-to-date and deployments reproducible.

---

## 6. Summary
- The deployment leverages Kubernetes for scalability, security, and automation.
- All configuration and secrets are managed declaratively.
- CI/CD pipeline ensures a smooth, automated deployment process.

---

## 7. Key Commands for Deployment and Management

### Build and Push Docker Images
```bash
# Backend
cd /path/to/project
# (If using buildx and GHCR)
docker buildx build -t ghcr.io/<your-gh-username>/<repo>-backend:latest .
docker push ghcr.io/<your-gh-username>/<repo>-backend:latest

# Frontend
cd front-end
# (If using buildx and GHCR)
docker buildx build -t ghcr.io/<your-gh-username>/<repo>-frontend:latest -f Dockerfile .
docker push ghcr.io/<your-gh-username>/<repo>-frontend:latest
```

### Deploy to Kubernetes
```bash
# Apply all manifests in the k8s folder
kubectl apply -f k8s/
```

### Get Info About Deployments, Pods, and Services
```bash
# List all deployments
kubectl get deployments

# List all pods
kubectl get pods

# List all services
kubectl get services

# Get detailed info about a deployment
kubectl describe deployment <deployment-name>

# Get logs from a pod
kubectl logs <pod-name>

# Get events in the cluster
kubectl get events
```

### Rollout and Restart
```bash
# Restart a deployment (e.g., after pushing a new image)
kubectl rollout restart deployment <deployment-name>

# Check rollout status
kubectl rollout status deployment <deployment-name>
```

### Using k9s (Terminal UI for Kubernetes)
```bash
# Start k9s (must be installed)
k9s

# In k9s:
# - Use arrow keys to navigate resources (pods, deployments, services, etc.)
# - Press 'd' to describe, 'l' to view logs, 'r' to restart, etc.
# - Use ':' to enter commands (e.g., :deployments, :services)
# - Press '?' for help inside k9s
``` 