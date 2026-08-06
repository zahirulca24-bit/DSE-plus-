# DSE Pulse Frontend — Google Cloud Run Deployment

## Target

- Project: `dse-trading-signal`
- Region: `asia-south1`
- Service: `dse-pulse-frontend`
- Backend: `https://dse-pulse-backend-621003740320.asia-south1.run.app`
- Frontend build variable: `VITE_DSE_API_BASE_URL`

## One-time prerequisites

```bash
gcloud config set project dse-trading-signal
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud artifacts repositories describe cloud-run-source-deploy \
  --location=asia-south1 >/dev/null 2>&1 || \
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=asia-south1
```

Grant the Cloud Build service account permission to deploy Cloud Run and push images:

```bash
PROJECT_NUMBER=$(gcloud projects describe dse-trading-signal --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding dse-trading-signal \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding dse-trading-signal \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding \
  "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

## Deploy

Run from the repository root:

```bash
gcloud builds submit \
  --config=cloudbuild.frontend.yaml \
  --substitutions=_VITE_DSE_API_BASE_URL=https://dse-pulse-backend-621003740320.asia-south1.run.app
```

## Verify

```bash
FRONTEND_URL=$(gcloud run services describe dse-pulse-frontend \
  --region=asia-south1 \
  --format='value(status.url)')

echo "$FRONTEND_URL"
curl -i "$FRONTEND_URL/health"
```

Expected health response: HTTP 200 with body `ok`.

After deployment, update the backend `FRONTEND_ORIGIN` to the returned frontend URL and deploy a new backend revision.
