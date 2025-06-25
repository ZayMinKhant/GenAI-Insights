# GitHub Secrets Setup Guide

## Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### 1. Azure Credentials
Run this command to get the service principal credentials:
```bash
az ad sp create-for-rbac --name "genai-insights-sp" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/genai-insights_group --sdk-auth
```

**Secret Name:** `AZURE_CREDENTIALS`
**Value:** The entire JSON output from the command above

### 2. Container Registry Credentials
Since you're using GitHub Container Registry (ghcr.io), use these values:

**Secret Name:** `ACR_LOGIN_SERVER`
**Value:** `ghcr.io`

**Secret Name:** `ACR_USERNAME`
**Value:** Your GitHub username

**Secret Name:** `ACR_PASSWORD`
**Value:** `GITHUB_TOKEN` (use the built-in GitHub token)

### 3. Web App Names
**Secret Name:** `FRONTEND_APP_NAME`
**Value:** `genai-insights`

**Secret Name:** `BACKEND_APP_NAME`
**Value:** `genai-insights-backend`

### 4. CI Database Credentials
**Secret Name:** `CI_POSTGRES_USER`
**Value:** `neondb_owner`

**Secret Name:** `CI_POSTGRES_PASSWORD`
**Value:** `npg_yhUC5mQRgl1f`

## How to Add Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the name and value above

## Test the Setup

After adding all secrets, push your code to trigger the deployment:

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
``` 