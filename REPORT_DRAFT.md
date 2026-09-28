# CCA 2 report draft — Cut & Co.

Replace each bracketed field with your own details and genuine screenshots. Do not claim a deployment or workflow result until you have observed it.

**Suggested filename:** `CCA2_<PRN>_<StudentName>.pdf`  
**Student:** [Student name]  
**PRN:** [PRN]  
**Course / division:** [Course and division]  
**Submission date:** [Date]

## 1. Title page

**Cut & Co. — Salon Appointment Booking**  
[College / department]  
[Student name and PRN]  
[Teacher name] · [Submission date]

## 2. Problem statement and features

Small salons need a simple way to collect appointment requests. This project provides a responsive booking form for a customer's name, phone number, service, date, and time. Express validates each request, keeps bookings in memory, and rejects a second booking for the same date and time. The home page renders current bookings from the server. The app has no database, customer accounts, payment processing, or messaging integrations.

**Features to describe:** salon booking page; server-side form validation; duplicate-slot prevention; in-memory appointment list; JSON API; health route; commit identifier in the footer.

**Screenshot:** [Add a genuine screenshot of the running home page with sample data.]

## 3. Architecture and pipeline

The browser submits the form to Express with HTTP POST. Express validates and appends the booking to its in-memory array. A subsequent GET `/` renders that array into the HTML template after escaping customer-provided text. GET `/api/appointments` returns JSON. Tests send requests directly to the exported Express app using Supertest.

```text
Browser ── GET / ──> Express ── render ──> booking page + current appointments
Browser ── POST /appointments ──> validate ──> in-memory array
Tests ── Supertest ──> exported Express app
Git push / PR ──> Lint ──> Test ──> Docker build ──> Deploy (main only) ──> /health check
```

**Screenshot:** [Add a genuine screenshot of the Actions workflow diagram or successful run.]

## 4. Pipeline stages

1. **Lint:** `npm run lint` checks JavaScript style and basic errors.
2. **Test:** `npm test` runs the health, booking, validation, JSON API, duplicate-slot, and HTML escaping tests. Supertest uses the app in-process, so no separate server is required.
3. **Docker build:** builds the production image only after lint and tests pass.
4. **Deploy:** on a push to `main` only, posts to the Render Deploy Hook saved as the GitHub Actions secret `RENDER_DEPLOY_HOOK`.
5. **Live verification:** checks the configured `RENDER_SERVICE_URL/health` endpoint after Render deploys.

**Screenshots:** [Add genuine Actions screenshots showing lint, test, build, deploy, and verification.]

## 5. Failure demonstration

On a temporary feature branch, deliberately change the expected health response in `tests/app.test.js` so the test fails. Push the branch and observe the actual Actions result. Because the test job fails, the dependent Docker build and deploy jobs should be skipped. Restore the test expectation, push the correction, and confirm passing checks before merging.

**Evidence:** [Add a genuine screenshot/link to the failed test run and skipped downstream job. Restore the code before taking final project screenshots.]

## 6. Challenges and learning

- [Describe a real implementation or debugging challenge and how you resolved it.]
- [Explain what you learned about HTTP routes, validation, or in-memory state.]
- [Explain how job dependencies prevent a failed check from reaching deployment.]
- [Explain the limitation that in-memory data is lost when the server restarts.]

## 7. Project links

- Public GitHub repository: [Add repository URL]
- Live Render service: [Add URL after deployment]
- GitHub Actions page: [Add repository Actions URL]

