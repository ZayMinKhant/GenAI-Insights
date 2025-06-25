# GenAI Insights App

A modern RAG (Retrieval-Augmented Generation) application that provides intelligent insights from document collections using AI-powered search and analysis.

## Features

- Smart Document Search: Vector-based retrieval using FAISS
- AI-Powered Analysis: GPT-4 integration for contextual insights
- Query History: Persistent storage of all queries and responses
- Response Regeneration: Re-run queries with updated AI responses
- Responsive Design: Mobile-first interface with full-screen sidebar
- Document Preview: Clickable source citations with full document view
- Modern UI: Clean, dark-mode compatible interface

## Architecture

```
genai-insights-app/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store.ts         # Redux store
│   │   └── App.tsx          # Main application
├── backend/                  # Flask + SQLAlchemy
│   ├── app.py              # Main Flask application
│   ├── llm.py              # OpenAI integration
│   ├── vector_search_demo.py # FAISS vector search
│   └── genai_insights_dev.db # SQLite database
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 15+
- OpenAI API key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://genai_user:genai_password@localhost:5432/genai_insights
```

## API Endpoints

### POST /query
Submit a new query for analysis
```json
{
  "query": "What are the latest developments in AI?"
}
```

### GET /history
Retrieve all previous queries and responses

### POST /revalidate
Regenerate response for a specific query
```json
{
  "query_id": "uuid-of-previous-query"
}
```

## Usage

1. Ask Questions: Enter your query in the input field
2. View Insights: Get AI-generated summary and supporting facts
3. Explore Sources: Click on source citations to view full documents
4. Browse History: Use the sidebar to revisit previous queries
5. Regenerate: Refresh any previous response with updated AI analysis

## Tech Stack

### Frontend
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Redux Toolkit - State management

### Backend
- Flask - Web framework
- SQLAlchemy - ORM
- FAISS - Vector search
- OpenAI API - LLM integration
- SQLite - Database (can be upgraded to PostgreSQL)

## How It Works

1. Document Indexing: 20 mock documents are indexed using FAISS
2. Query Processing: User queries are embedded and matched against documents
3. Context Retrieval: Top-k most relevant documents are retrieved
4. AI Analysis: GPT-4 analyzes the context and generates insights
5. Response Formatting: Results are formatted as summary + supporting facts
6. Persistence: All queries and responses are stored in the database

## Database

- Required: PostgreSQL (for all environments: dev, Docker, production)

### Example DATABASE_URL
```
DATABASE_URL=postgresql://genai_user:genai_password@localhost:5432/genai_insights
```

## CI/CD & GitHub Actions

This project uses GitHub Actions for continuous integration and deployment (CI/CD) to Azure Web Apps using Docker containers.

### Workflow Overview
- Frontend Workflow: Builds and deploys the frontend React app as a Docker container to Azure Web App (`genai-insights-frontend`).
- Backend Workflow: Builds and deploys the backend Flask app as a Docker container to Azure Web App (`genai-insights-backend`).
- CI Workflow: Installs dependencies, runs tests, and builds Docker images for both frontend and backend. Pushes images to GitHub Container Registry.

### Workflow Files
- `.github/workflows/main_genai-insights-frontend.yml`
- `.github/workflows/main_genai-insights-backend.yml`
- `.github/workflows/ci.yml`

### How It Works
- On every push to the `main` branch (or manual trigger), the workflows:
  1. Checkout code
  2. Set up Docker Buildx
  3. Log in to Azure Container Registry using GitHub secrets
  4. Build and push Docker images for frontend (`./frontend/Dockerfile`) and backend (`./backend/Dockerfile`)
  5. Deploy images to Azure Web Apps using the Azure Web Apps Deploy action

### Required GitHub Secrets
- `AzureAppService_ContainerUsername_*` and `AzureAppService_ContainerPassword_*`: Credentials for Azure Container Registry
- `AzureAppService_PublishProfile_*`: Publish profile for Azure Web App deployment
- (Optional) `VITE_API_URL`, `DATABASE_URL`, `OPENAI_API_KEY` for environment variables

### Triggering Deployments
- Automatic: On push to `main` branch
- Manual: Via GitHub Actions > Workflow > Run workflow

## GitHub & Azure Deployment Center Integration

Deployment for both the frontend and backend is managed through the Azure Web App 'Deployment Center', which is directly linked to this GitHub repository. This enables automated deployments on every push to the `main` branch.

### How the Integration Works
- Each Azure Web App (frontend and backend) is connected to the corresponding GitHub repository via the Azure Portal's Deployment Center.
- The Deployment Center monitors the `main` branch for changes and triggers the GitHub Actions workflows defined in `.github/workflows/`.
- On a successful build and push of the Docker image, the workflow deploys the new image to the Azure Web App using the Azure Web Apps Deploy GitHub Action.

### Setting Up the Link (One-Time Setup)
1. Go to the Azure Portal and select your Web App (e.g., `genai-insights-frontend` or `genai-insights-backend`).
2. In the left sidebar, click on Deployment Center.
3. Choose GitHub as the source and authenticate if prompted.
4. Select the correct organization, repository, and branch (`main`).
5. Choose GitHub Actions as the build provider.
6. Review and finish the setup. Azure will automatically detect the workflow YAML files in `.github/workflows/`.
7. Once linked, every push to `main` will trigger the corresponding workflow and deploy the latest Docker image to your Web App.

### Benefits
- Automated Deployments: No manual steps required after setup—just push to `main`.
- Full Traceability: View build and deployment logs in both GitHub Actions and Azure Portal.
- Rollback Support: Easily redeploy previous commits from the Azure Portal or GitHub.

For more information, see the [Azure Deployment Center documentation](https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github) or open an issue for help.

## Azure Deployment

### Docker Images
- Both frontend and backend are containerized using Docker.
- Images are built and pushed to Azure Container Registry (`genaiacr1281.azurecr.io`).

### Azure Web Apps
- Frontend: Deployed to `genai-insights-frontend` Azure Web App
- Backend: Deployed to `genai-insights-backend` Azure Web App
- Each deployment uses the latest image tagged with the commit SHA.

### Environment Variables
- Set via Azure Portal or in the workflow using the Azure CLI (see commented `deploy.yml` for examples).
- Common variables:
  - `DATABASE_URL`
  - `OPENAI_API_KEY`
  - `VITE_API_URL` (for frontend)

### Notes
- Ensure all required secrets are set in your GitHub repository settings.
- The Dockerfiles for frontend and backend must be in their respective folders (`frontend/Dockerfile`, `backend/Dockerfile`).
- The workflows expect the default branch to be `main`.

## Docker Deployment (Manual)

You can also build and run the containers locally:

```bash
# Backend
cd backend
docker build -t genai-backend .
docker run -p 8000:8000 --env-file .env genai-backend

# Frontend
cd frontend
docker build -t genai-frontend .
docker run -p 5173:80 genai-frontend
```

## CI/CD Troubleshooting: GitHub Container Registry (GHCR) Authentication

For public repositories, GitHub Actions cannot push Docker images to GHCR using the default GITHUB_TOKEN due to permission restrictions. You must create and use a Personal Access Token (PAT) as a secret named `CR_PAT`.

### How to Create and Use a CR_PAT Secret
1. **Generate a Personal Access Token (PAT):**
   - Go to your GitHub account > Settings > Developer settings > Personal access tokens.
   - Click **Generate new token** (classic or fine-grained).
   - Select the following scopes:
     - `write:packages`
     - `read:packages`
     - `repo` (if needed for private repos)
   - Copy the generated token (you will not be able to see it again).

2. **Add the PAT as a Secret:**
   - Go to your repository > Settings > Secrets and variables > Actions.
   - Click **New repository secret**.
   - Name it `CR_PAT` and paste your token as the value.

3. **Workflow Reference:**
   - The workflow uses this secret to log in to GHCR:
     ```yaml
     - name: Log in to the GitHub Container Registry
       uses: docker/login-action@v3
       with:
         registry: ghcr.io
         username: ${{ github.actor }}
         password: ${{ secrets.CR_PAT }}
     ```

### Common Errors
- **Error: Password required**
  - The `CR_PAT` secret is missing, empty, or not referenced correctly in the workflow.
- **denied: permission_denied: write_package**
  - The PAT does not have the correct scopes, or you are using the default `GITHUB_TOKEN` in a public repo.

**Always re-run your workflow after adding or updating secrets.**

For more details, see the workflow files in `.github/workflows/` or open an issue for help.