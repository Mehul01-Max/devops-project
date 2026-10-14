# ClinicQ — Clinic Appointment Booking Dashboard

ClinicQ is a SaaS-style clinic appointment dashboard used as a DevOps capstone:
a **React + Vite** frontend, a **FastAPI** backend, **PostgreSQL**, and a full
path to production — Docker, GitHub Actions + Trivy + GHCR, Terraform (VPC + EKS),
Helm, ingress-nginx, HPA, and Prometheus + Grafana.

## Architecture

```
                    +---------------- GitHub Actions ----------------+
                    | test -> build -> Trivy scan -> push to GHCR    |
                    +----------- SHA-tagged images ------------------+
                                     |      |
 Developer -> Docker Compose (local) |      | Helm upgrade --install (EKS)
                                     v      v
                          +-------------------------+
                          |  ingress-nginx          |
                          |  clinicq.local          |
                          +---+-------------+-------+
                              | /           | /api
                              v             v
                        +-----------+  +-----------+
                        | frontend  |  | backend   |---+
                        | nginx:8080|  | FastAPI   |   |
                        +-----------+  +-----+-----+   |
                                             |         v
                                        +----+----+ +----------+
                                        | Postgres| | /metrics |
                                        | PVC     | | Prom+Graf|
                                        +---------+ +----------+
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite 6, plain CSS clinic theme (teal/blue) |
| Backend | FastAPI 0.115, SQLAlchemy 2.0, Alembic, pydantic |
| DB | PostgreSQL 16 (Compose locally, in-chart StatefulSet on K8s) |
| Tests | pytest + httpx TestClient on isolated SQLite |
| Containers | Multi-stage builds, non-root users, GHCR `clinicq-backend/frontend` |
| CI/CD | GitHub Actions: test -> build-scan-push (Trivy HIGH,CRITICAL) -> gated deploy |
| IaC | Terraform: VPC (2+2 subnets, 1 NAT) + EKS 1.33 + EBS CSI IRSA, ap-south-1 |
| K8s | Helm chart `clinicq`, namespace `clinicq`, Ingress `clinicq.local`, HPA 2-4 |
| Monitoring | kube-prometheus-stack, ServiceMonitor on `/metrics`, Grafana dashboard |

## Run locally

```bash
# Tests (needs Python 3.12)
cd backend && python3.12 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt && pytest -v

# Full stack
docker compose up --build
# Frontend: http://localhost:3000  API docs: http://localhost:8000/docs
curl localhost:8000/health && curl localhost:8000/ready
curl localhost:8000/api/appointments/stats
```

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/` | Service info |
| GET | `/health` | Liveness, no DB |
| GET | `/ready` | DB check, 503 when down |
| GET | `/metrics` | Prometheus exposition |
| GET | `/api/appointments?status=` | List / filter |
| GET | `/api/appointments/stats` | total + by status + today |
| GET | `/api/appointments/{id}` | 404 when missing |
| POST | `/api/appointments` | Create (201) |
| PUT | `/api/appointments/{id}` | Partial update |
| DELETE | `/api/appointments/{id}` | 204 |

## CI/CD overview

1. `test`: Python 3.12 `pytest -v` + Node 22 `npm ci && npm run build`.
2. `build-scan-push`: builds both images tagged `${{ github.sha }}`, Trivy scans
   both (HIGH,CRITICAL, `ignore-unfixed: true`, fail on findings), pushes only on pass.
3. `deploy`: `helm upgrade --install` to EKS; runs only when repo variable
   `DEPLOY_ENABLED == 'true'` so the pipeline stays green without a cluster.

- **Verified Pipeline Run**: [GitHub Actions Run #8](https://github.com/Mehul01-Max/devops-project/actions/runs/38562736015)

## Repo structure

```
frontend/            React + Vite SPA (relative /api/... calls only)
backend/             FastAPI app, Alembic migration, pytest suite
docker-compose.yml   frontend:3000 backend:8000 postgres with healthcheck
terraform/           VPC + EKS + EBS CSI IRSA (ap-south-1)
helm/clinicq/        chart: backend/frontend/postgres/ingress/HPA/ServiceMonitor
k8s/                 namespace + kind-config (host 80/443 for ingress)
monitoring/          kube-prometheus-stack values + Grafana dashboard ConfigMap
troubleshooting/     ImagePullBackOff + selector-mismatch demos
scripts/             HPA load-test script
.github/workflows/   ci-cd.yml pipeline
```

## Deploy rehearsal (kind)

```bash
kind create cluster --config k8s/kind-config.yaml --name clinicq
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kind load docker-image clinicq-backend:local clinicq-frontend:local --name clinicq  # after docker build -t ...:local
helm upgrade --install clinicq ./helm/clinicq -n clinicq --create-namespace -f helm/clinicq/values-dev.yaml
echo "127.0.0.1 clinicq.local" | sudo tee -a /etc/hosts
curl http://clinicq.local/api/appointments/stats
```

## Demo & Presentation

- **Recorded Walkthrough Video**: [Watch on Loom](https://www.loom.com/share/c31bc8e62f8e462da261286bfc7faf57)
- **Slide Deck**: [`ClinicQ DevOps Capstone.pptx`](ClinicQ%20DevOps%20Capstone.pptx)
