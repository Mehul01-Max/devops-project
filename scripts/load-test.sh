#!/usr/bin/env bash
# ClinicQ HPA load test: hammers the backend API so CPU rises and the
# HorizontalPodAutoscaler scales 2 -> 4 replicas. Watch with:
#   kubectl get hpa -n clinicq -w
set -euo pipefail

BASE_URL="${BASE_URL:-http://clinicq.local}"
DURATION="${DURATION:-180}"
CONCURRENCY="${CONCURRENCY:-8}"

echo "Loading ClinicQ backend at ${BASE_URL} for ${DURATION}s (${CONCURRENCY} workers)..."

end=$((SECONDS + DURATION))

worker() {
  while [ $SECONDS -lt $end ]; do
    curl -s -o /dev/null "${BASE_URL}/api/appointments" || true
    curl -s -o /dev/null "${BASE_URL}/api/appointments/stats" || true
    curl -s -o /dev/null "${BASE_URL}/health" || true
  done
}

for _ in $(seq 1 "$CONCURRENCY"); do
  worker &
done
wait

echo "Load test finished. Check: kubectl get hpa -n clinicq && kubectl get pods -n clinicq"
