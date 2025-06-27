# 🔍 Full Explanation of the Kubernetes Manifest Files

The YAML file you provided includes **two distinct Kubernetes Deployments**: one for a frontend application and another for a backend application. Each Deployment tells Kubernetes how to run and manage a set of replicated containers (Pods) that are grouped together under a specific name.


---

## 🧱 SECTION BY SECTION BREAKDOWN

---

### 1. `apiVersion: apps/v1`

* **This field defines which version of the Kubernetes API you are using to create this object.**
* `apps/v1` is the **standard and stable API version** used for `Deployment` resources in modern Kubernetes clusters.
* It ensures your manifest will work with all supported Kubernetes features for Deployments like rolling updates, scaling, and revision history.

✅ This is a **required** field and must be compatible with the object `kind` you are defining.

---

### 2. `kind: Deployment`

* This field specifies the **type of Kubernetes object** you're creating.
* In this case, you're defining a **Deployment**, which is a controller that manages a set of Pods.
* Deployments handle:

  * Creating the right number of pods.
  * Replacing pods when the configuration changes.
  * Rolling out updates in a controlled way.

Other possible `kind` values include:
`Pod`, `Service`, `ConfigMap`, `Secret`, `StatefulSet`, `DaemonSet`, etc.

But here, you are specifically using a **Deployment**, which is appropriate for stateless applications like web frontends and APIs.

---

### 3. `metadata`

```yaml
metadata:
  name: frontend
```

* This block contains metadata for identifying and organizing your Kubernetes object.
* The `name` field is the **unique name** of the deployment within the Kubernetes namespace.
* Kubernetes uses this name to refer to and manage the Deployment object.

For example:

* You can update the deployment using:
  `kubectl apply -f <file.yaml>`
* You can delete it using:
  `kubectl delete deployment frontend`

✅ The name must be DNS-compliant (lowercase, no spaces, dashes allowed).

---

### 4. `spec.replicas: 1`

* The `replicas` field tells Kubernetes how many **Pods** to create and maintain at all times.
* A **Pod** is the smallest deployable unit in Kubernetes that contains one or more containers.
* In this case, `replicas: 1` means you want **exactly one running instance** of this application.

📌 You can increase this number to scale horizontally:

```yaml
replicas: 3
```

This will run 3 identical Pods across your cluster for load balancing and high availability.

---

### 5. `selector.matchLabels`

```yaml
selector:
  matchLabels:
    app: frontend
```

* This field is very important: it tells Kubernetes **how to find and manage the Pods** that belong to this Deployment.
* `matchLabels` looks for Pods with a specific set of labels (in this case, `app: frontend`).
* Only Pods that match these labels will be managed by this Deployment controller.

🔁 This mechanism ensures the Deployment can track which Pods it created, and whether any of them need to be replaced.

---

### 6. `template.metadata.labels`

```yaml
template:
  metadata:
    labels:
      app: frontend
```

* This is the label configuration for Pods that the Deployment will create.
* Every Pod created by this Deployment will have the label `app=frontend`.
* This must **match the `selector.matchLabels` above**, otherwise the Deployment won’t be able to manage its Pods correctly.

🔖 Labels are key-value pairs that help identify and select Kubernetes resources.
They are used in:

* Selectors
* Services
* Monitoring tools
* Auto-scaling groups

---

### 7. `template.spec.containers`

This is where you define the **actual application containers** that will run in each Pod. Let’s break it down.

#### a. `name: frontend`

* A logical name for the container.
* This can be different from the Deployment or Pod name.
* It's used inside logs, monitoring, and by Kubernetes to refer to this specific container (especially if there are multiple containers in a pod).

---

#### b. `image: ghcr.io/micheal-ndoh/auth-kubernetees-frontend:latest`

* This is the **Docker container image** that will be pulled and run inside each Pod.
* `ghcr.io` means the image is hosted on **GitHub Container Registry**.
* The rest of the path is the repository and image name.
* The `:latest` tag means Kubernetes will use the **latest published version** of the image.

You can use other tags like `:v1.0.0`, `:stable`, etc., to pin to specific versions.

---

#### c. `imagePullPolicy: IfNotPresent` (Frontend only)

* This tells Kubernetes **when to pull the image** from the container registry.
* `IfNotPresent` means:

  * Kubernetes will only pull the image if it **doesn’t already exist locally** on the node.
  * If the image exists already (even an older one), it won’t fetch it again.

✅ Other options include:

* `Always`: Pull the image every time the Pod is started (useful for development).
* `Never`: Never pull; use only local images (for air-gapped environments or manual installs).

---

#### d. `ports`

```yaml
ports:
  - containerPort: 80  # or 3000 in backend
```

* This exposes a **port inside the container** so it can receive traffic.
* It’s **internal to the Pod**, and not automatically exposed outside the cluster.
* You typically define a **Service** to expose it externally or cluster-wide.

In your case:

* Frontend app runs on port 80 (standard HTTP)
* Backend API runs on port 3000 (commonly used for APIs or Node.js apps)

---

### 8. `envFrom` (Frontend Only)

```yaml
envFrom:
  - configMapRef:
      name: frontend-config
```

* This tells Kubernetes to **load all environment variables from a ConfigMap** named `frontend-config`.
* The ConfigMap should contain key-value pairs like:

```yaml
APP_ENV=production
API_URL=http://backend-service:3000
```

✅ This is a convenient way to manage non-sensitive config values without hardcoding them in the manifest.

---

### 9. `env` (Backend Only)

```yaml
env:
  - name: JWT_SALT
    valueFrom:
      secretKeyRef:
        name: backend-secret
        key: JWT_SALT
```

This is a more **granular way** of injecting environment variables.

You're injecting 3 values into the backend container:

---

#### a. `JWT_SALT` and `JWT_SECRET` from Secret

* These are pulled from a Secret named `backend-secret`.
* The `key` specifies which value from the Secret to use.
* These are typically base64-encoded and contain sensitive info like cryptographic salts or private keys.

---

#### b. `JWT_EXPIRATION` from ConfigMap

```yaml
- name: JWT_EXPIRATION
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: JWT_EXPIRATION
```

* This is similar to the above but pulls a **non-sensitive value** from a ConfigMap instead of a Secret.

---

## 🧾 Summary of Resource Functions (without condensing)

* **Deployment**: Creates and manages Pods automatically. Handles updates, restarts, scaling, and rollback.
* **Pod**: A group of one or more containers. Smallest deployable unit in Kubernetes.
* **Container**: Runs the application defined in a Docker image.
* **ConfigMap**: Stores non-sensitive configuration data (used in `env` and `envFrom`).
* **Secret**: Stores sensitive information (passwords, keys, etc.). Used via `secretKeyRef`.
* **Labels**: Key-value pairs attached to objects for identification and selection.
* **Selector**: A query to find matching labels on Pods.

