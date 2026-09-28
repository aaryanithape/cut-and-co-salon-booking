# Cut & Co. — Salon Appointment Booking

A small, server-rendered booking app for a neighbourhood salon. Customers can request a haircut or beard service and see the appointments already in memory.

## Problem and features

Small salons need a simple way to collect appointment requests without setting up a customer account or payment system. Cut & Co. provides:

- A responsive salon booking page with name, phone, service, date, and time fields.
- Server-side validation for every submitted value and browser-side required fields.
- In-memory appointment storage, with one booking allowed per date and time.
- A home page rendered by Express from the current appointment data.
- Escaped customer content in server-rendered HTML.
- A JSON appointments API, a health check, and the running commit ID in the footer.

Appointments live only in the running Node process. They are lost when the process restarts; this is intentional for this small assignment.

## Technology

Node.js, Express, HTML/CSS, Jest, Supertest, ESLint, Docker, GitHub Actions, and Render.

## Run locally

Requirements: Node.js 22 or later and npm.

```bash
npm ci
npm start
```

Open <http://localhost:3000>. The server uses `process.env.PORT` when provided and otherwise listens on port `3000`.

## Tests and lint

```bash
npm test
npm run lint
```

The Supertest tests import the Express app directly, so they do not need a separately running server.

## Docker

```bash
docker build -t cut-and-co .
docker run --rm -p 3000:3000 cut-and-co
```

The container installs production dependencies and starts `server.js`. It listens on Render's supplied `PORT` when deployed.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Server-rendered booking form and current appointments |
| POST | `/appointments` | Validate and add a booking; rejects a duplicate slot |
| GET | `/api/appointments` | Return the in-memory appointment list as JSON |
| GET | `/health` | Return `{"status":"ok"}` for health checks |
| GET | `/api/version` | Return the commit identifier reported by Render, or `local` |

## CI/CD pipeline

Push or open a pull request against `main` to run the quality checks. A Docker image build follows successful lint and tests. Only a successful push to `main` reaches the Render deploy job; the live health check then waits for the service to become ready.

```text
Git push / pull request
        ↓
      Lint
        ↓
      Tests
        ↓
   Docker build
        ↓ (push to main only)
 Render deploy hook
        ↓
 Live /health verification
```

The deployment job reads `RENDER_DEPLOY_HOOK` from GitHub Actions secrets. The verification job reads the public service address from the Actions variable `RENDER_SERVICE_URL` and confirms the running commit matches the commit that passed checks. Neither value belongs in source code. Lint, test, or image-build failure skips deployment because each later job depends on the previous one.

### Safe failure demonstration

On a temporary feature branch, make one test fail deliberately, for example change the expected health status in `tests/app.test.js` from `"ok"` to `"broken"`. Push the branch and open a pull request. The test job should fail and the dependent Docker build and deploy jobs should be skipped. Restore the expectation to `"ok"`, rerun the checks, and merge only after they pass. Do not merge the deliberately failing version. GitHub Actions screenshots and run links should be captured from the real workflow for the report.

## Render deployment

Create a Render **Web Service** connected to this GitHub repository. Use the Docker runtime so Render builds the included `Dockerfile`; keep Auto-Deploy **off** because GitHub Actions is the deployment controller. Create a Render Deploy Hook and add its URL in the repository's GitHub **Settings → Secrets and variables → Actions** as the secret `RENDER_DEPLOY_HOOK`. Add the service's public base URL as the Actions variable `RENDER_SERVICE_URL`. Render sets `RENDER_GIT_COMMIT`; the footer displays it, with `local` as the development fallback.

Repository: **[add your public GitHub repository URL]**  
Live service: **[add your Render service URL after deployment]**

## Repository structure

```text
.
├── .github/workflows/ci-cd.yml  # Lint, test, Docker build, deploy, health check
├── public/index.html             # Page template and styles
├── tests/app.test.js             # Automated route and validation tests
├── Dockerfile
├── .dockerignore
├── .gitignore
├── eslint.config.js
├── package.json
├── server.js                     # Express routes, validation, in-memory data
├── README.md
└── REPORT_DRAFT.md               # Report outline and screenshot checklist
```

## Commit ID in the footer

On Render, the footer and `/api/version` endpoint show the value of `RENDER_GIT_COMMIT`. When running locally without that environment variable, they show `local`.
