# Auth API (Rust + React) with Kubernetes Deployment

This project is a full-stack authentication application featuring a Rust (Axum) backend and a React frontend. It is designed to be deployed and managed locally using Docker and Kubernetes.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Docker:** To build and manage container images.
- **`kubectl`:** The Kubernetes command-line tool.
- **A local Kubernetes cluster:** [Minikube](https://minikube.sigs.k8s.io/docs/start/) or [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) are recommended for local development.

---

## Deployment Guide

Follow these steps to deploy the application to your local Kubernetes cluster.

### 1. Configure Backend Secrets

The backend requires a `JWT_SALT` and `JWT_SECRET` for signing authentication tokens. These are managed in `k8s/backend-secret.yaml` and must be base64-encoded.

**A. Generate Secret Values:**
You can use the following commands to generate secure random strings:
```bash
# For JWT_SECRET (a long, random string)
openssl rand -hex 32

# For JWT_SALT (must be 16 bytes)
openssl rand -hex 16
```

**B. Base64 Encode the Values:**
Replace `<your-value>` with the strings you generated above.
```bash
# Encode JWT_SECRET
echo -n '<your-jwt-secret>' | base64

# Encode JWT_SALT
# Note: The salt from `openssl rand -hex 16` is 32 hex characters, which is 16 bytes.
# We need to decode it from hex and then encode to base64.
echo -n '<your-16-byte-hex-salt>' | xxd -r -p | base64
```
*Example for salt:* `echo -n 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6' | xxd -r -p | base64` should produce `obLDTuX2p7jJ0OHyozrF1g==`.

**C. Update `k8s/backend-secret.yaml`:**
Open `k8s/backend-secret.yaml` and replace the placeholder data with your new base64-encoded values.

### 2. Build Docker Images

Build the Docker images for both the backend and frontend.

**A. Build Backend Image:**
From the project root (`auth_api2/`):
```bash
docker buildx build -t auth-api-backend:latest .
```

**B. Build Frontend Image:**
```bash
docker buildx build -t auth-api-frontend:latest -f front-end/Dockerfile ./front-end
```

**C. Load Images into Your Cluster (Minikube Example):**
If you are using Minikube, you need to load the local Docker images into the cluster's context so they can be pulled.
```bash
minikube image load auth-api-backend:latest
minikube image load auth-api-frontend:latest
```

### 3. Update Deployment Configuration

The Kubernetes deployment files (`k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`) are configured to use `your-backend-image:latest` and `your-frontend-image:latest`.

Update these files to use the image names you built in the previous step (e.g., `auth-api-backend:latest`). Also, set `imagePullPolicy: IfNotPresent` to ensure the cluster uses the local images you loaded.

**Example `k8s/backend-deployment.yaml` change:**
```yaml
# ...
spec:
  containers:
  - name: backend
    image: auth-api-backend:latest  # Or your image name
    imagePullPolicy: IfNotPresent # Add this line
# ...
```
Do the same for `k8s/frontend-deployment.yaml`.

### 4. Deploy to Kubernetes

Apply all the Kubernetes configurations from the `k8s/` directory.
```bash
kubectl apply -f k8s/
```
This will create all the necessary Deployments, Services, ConfigMaps, and Secrets in your cluster.

### 5. Access the Application

The frontend service is exposed via a `NodePort`.

**A. Find the Service URL (Minikube Example):**
If using Minikube, you can get the URL to access the application with this command:
```bash
minikube service frontend-service
```
This will automatically open the application in your web browser.

**B. Manual Access:**
Alternatively, you can get the IP and port with `kubectl get service frontend-service` and construct the URL manually.

---

## Local Development (Without Kubernetes)

### Backend
1.  Navigate to the project root.
2.  Set the required environment variables:
    ```bash
    export JWT_SECRET='your_secret'
    export JWT_SALT='your_base64_encoded_16_byte_salt'
    export JWT_EXPIRATION='86400'
    ```
3.  Run the application:
    ```bash
    cargo run
    ```

### Frontend
1.  Navigate to the `front-end/` directory.
2.  Create a `.env` file for the API URL:
    ```
    echo "REACT_APP_API_URL=http://localhost:3000" > .env
    ```
3.  Install dependencies and start the development server:
    ```bash
    npm install
    npm start
    ```
The React app will be available at `http://localhost:3001` (or another port if 3001 is busy).

---

## 🚀 Project Overview
This project provides a secure, scalable authentication API with a beautiful, modern frontend. It is designed for learning, rapid prototyping, and as a foundation for production-ready auth systems.

- **Backend:** Rust + Axum (JWT, bcrypt, RESTful API)
- **Frontend:** React + TypeScript (responsive, glassmorphism UI)

---

## ✨ Features
- User registration & login
- JWT-based authentication
- Protected routes (admin, profile, etc.)
- Password hashing (bcrypt)
- Environment-based configuration
- Swagger/OpenAPI documentation
- Modern, professional UI (green & soft black theme)

---

## 🛠️ Tech Stack
- **Backend:** Rust, Axum, Tokio, bcrypt, jsonwebtoken, utoipa (OpenAPI)
- **Frontend:** React, TypeScript, Axios, React Router

---

## 📦 Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js & npm](https://nodejs.org/)

### 1. Clone the repository
```sh
git clone https://github.**com**/eva672/auth_api2.git
cd auth_api2
```

### 2. Setup Environment Variables
Create a `.env` file in the root with:
```env
JWT_SALT=your_base64_16byte_salt
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400
```
- Generate a 16-byte salt and encode it in base64 (e.g., `openssl rand -base64 16`)

### 3. Run the Backend
```sh
cargo run
```
- The backend will start on `authapi2-production.up.railway.app`

### 4. Run the Frontend
```sh
cd front-end
npm install
npm start
```
- The frontend will start on `authapi2-production.up.railway.app` or `http://localhost:3001`

---

## 📖 API Documentation
- Swagger UI available at `/swagger-ui` when backend is running.

---

## 🖥️ Screenshots
> ![Login UI](./screenshots/login.png)
> ![Profile UI](./screenshots/profile.png)

---

## 🤝 Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License.

---

## 🙏 Acknowledgements
- [Rust](https://www.rust-lang.org/)
- [Axum](https://github.com/tokio-rs/axum)
- [React](https://react.dev/)
- [Utoipa](https://github.com/juhaku/utoipa)

---

> Made with ❤️ by eva672
# auth-kubernetees
# auth-kubernetees
