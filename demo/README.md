# ClinicQ — Capstone Project Demo & Presentation

**Author**: Mehul Agarwal  
**Student ID**: 24BCS10128  
**Project**: ClinicQ — Clinic Appointment Management System  
**Repository**: [https://github.com/Mehul01-Max/devops-project](https://github.com/Mehul01-Max/devops-project)  

---

## 1. Presentation Deck (PPT)

The final presentation slide deck is committed and available directly inside this `demo/` folder:

- **Presentation Slide Deck**: [`ClinicQ DevOps Capstone.pptx`](./ClinicQ%20DevOps%20Capstone.pptx)

The slide deck covers:
- Problem statement & application architecture (FastAPI, React, PostgreSQL)
- DevOps workflow (Automated Pytest testing, Docker containerization, GitHub Actions CI/CD)
- DevSecOps vulnerability scanning with Trivy (0 HIGH / CRITICAL)
- AWS Infrastructure as Code with Terraform (VPC, EKS cluster, managed worker nodes, EBS CSI)
- Kubernetes orchestration & Helm chart deployment
- Observability & Monitoring with Prometheus metrics and Grafana dashboard

---

## 2. Walkthrough Demo Video

As requested for evaluation, the recorded project walkthrough demo video is accessible at the link below:

- **Demo Video Walkthrough (Loom)**: [https://www.loom.com/share/c31bc8e62f8e462da261286bfc7faf57](https://www.loom.com/share/c31bc8e62f8e462da261286bfc7faf57)

### Video Demonstration Breakdown

The walkthrough video covers live demonstration of all 10 modules:
1. **Application (M1)**: Interactive React frontend, FastAPI backend endpoints, and PostgreSQL database.
2. **Testing (M2)**: 12 passing unit & integration tests on isolated SQLite engine.
3. **Git & GitHub (M3)**: Clean repository structure and meaningful commit history.
4. **Docker & Compose (M4)**: Multi-stage, non-root Docker builds and `docker compose up` stack verification.
5. **CI/CD Pipeline (M5)**: Successful GitHub Actions pipeline run with SHA-tagged image publication to GHCR.
6. **DevSecOps (M6)**: Trivy security scan gate passing with 0 HIGH/CRITICAL CVEs.
7. **Terraform AWS IaC (M7)**: AWS VPC and EKS cluster provisioning, idempotency check, and clean teardown.
8. **Kubernetes & Helm (M8)**: Helm chart deployment, 2 replicas per service, and ingress routing.
9. **Observability (M9)**: Prometheus `/metrics` scraping (`UP`) and live Grafana dashboard.
10. **Presentation (M10)**: Comprehensive documentation, slide deck, and architecture overview.

---

## 3. Directory Contents

```text
demo/
├── ClinicQ DevOps Capstone.pptx   # Presentation slide deck
├── README.md                      # Demo folder overview & video walkthrough links
└── VIDEO_LINK.md                  # Quick-access video link reference
```
