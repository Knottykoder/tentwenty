# tentwenty - Margin Dashboard Exercise

An executive margin & profitability dashboard built for agency leadership. It turns messy timesheet, salary, and project pricing spreadsheets into actionable financial clarity.

---

## Quick Start (Runs in Under 5 Minutes)

### Prerequisites
- Node.js >= 20
- npm >= 10

### 1. Install Dependencies
Run from the repository root:
```bash
npm run install:all
```
*(Or run `npm install` at root, in `backend/`, and in `frontend/`)*

### 2. Run Locally
Run both the Fastify backend and the Next.js frontend with a single command:
```bash
npm run dev
```

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### 3. Run Self-Check & Domain Math Tests
```bash
npm run test
```
Verifies to the dirham that with overhead set to zero, total project costs equal total salaries:
`Total Salaries (2,400,000.00 AED) == Total Project Cost (2,400,000.00 AED) -> Difference: 0.00 AED`.

---

## Core Features Delivered

### Must Have
- **Spreadsheet Upload & Ingestion:** Ingests the 3 `.xlsx` files (`timesheet`, `salaries`, `project-prices`) through the UI with robust error handling for messy headers, blank cells (`-`), and inconsistent date formats. Re-uploading a month updates records without wiping or duplicating other months.
- **Executive Dashboard:** Total hours, billable hours (%), total cost, revenue, net profit, and gross margin with full-year and individual month filtering.
- **Project Deep-Dive:** Click any project to inspect price, hours by department, total cost, profit, margin %, and a per-employee contribution table.
- **Productivity Page:** Per-employee billable ÷ total logged hours ratio with visual progress indicators.
- **Category Time Allocation:** Clear breakdown of billable client work vs absorbed agency overhead (meetings, leaves, learning, bug fixes, etc.).

### Should Have
- **Department Drill-Down:** Accordion and modal views for departments (Design, Frontend, Backend, App, QA, Management) showing hours and costs per employee.
- **Per-Employee Project Profitability:** Calculates employee revenue share (`Project Price * (Employee Hours / Total Project Hours)`) and employee profitability (`(Revenue Share - Cost) / Revenue Share`).
- **Configurable Assumptions:** Adjust monthly agency overhead (AED) and toggle billable categories live through the UI without touching code.
- **Honest Empty & Error States:** Clear warnings for missing records, connection issues, or unrecognized files.

### Stretch Goals
- **CSV Export:** 1-click export for any table on screen (Projects, Contributions, Productivity, Categories, Departments, and Audit tables).
- **Employee x Category Matrix:** Automated pivot matrix replacing the manual finance spreadsheet.
- **Cost Rate Audit View:** Dedicated modal showing exact derivations of direct rates, indirect cost pools, and zero-overhead reconciliation.

---

## Domain Math & Calculation Logic

1. **Direct Cost Rate / Hour (per person, per month):**
   $$\text{Direct Rate} = \frac{\text{Month's Salary}}{\text{Month's Total Logged Hours}}$$
   *(If an employee logs 0 hours, they are treated as support staff and 100% of their salary enters the indirect cost pool).*

2. **Indirect Cost Pool (per month):**
   $$\text{Indirect Pool} = \text{Support Staff Salaries} + \sum (\text{Non-Billable Hours} \times \text{Direct Rate}) + \text{Monthly Overhead}$$

3. **Indirect Cost Rate / Hour (per month):**
   $$\text{Indirect Rate} = \frac{\text{Indirect Cost Pool}}{\text{Month's Total Billable Hours}}$$

4. **Employee Cost on Project:**
   $$\text{Cost} = \text{Hours} \times (\text{Direct Rate} + \text{Indirect Rate})$$

5. **Employee Revenue Share:**
   $$\text{Revenue Share} = \text{Project Price} \times \frac{\text{Employee Project Hours}}{\text{Total Project Hours}}$$

6. **Self-Check Proof:**
   When overhead is 0:
   $$\sum \text{Billable Project Costs} = \sum \text{Salaries} = 2,400,000.00\text{ AED}$$
   Variance = **0.00 AED**.

---

## Assumptions Made Where the Brief Was Ambiguous

1. **Monthly Revenue Attribution in Filtered Views:**
   Project contracts are sold once (e.g. `Meridian` in January) but work is delivered over several months.
   - For the full-year view, revenue is the total sold project contract values.
   - For individual filtered months, if a project has hours logged across multiple months, revenue is attributed proportionally to the billable hours delivered in that month (percentage-of-completion method), ensuring monthly margins reflect true delivery performance.

2. **Support Staff Handling:**
   If a team member has an active monthly salary but logs 0 hours in timesheets, their direct hourly rate cannot be computed by division by zero. Their entire salary is automatically routed into the indirect cost pool to be absorbed across billable projects.

3. **Re-upload Idempotency:**
   When uploading a corrected timesheet file, the parser detects the months present in the upload and replaces records matching those months, preserving all previously uploaded months untouched.

---

## Architecture & Code Quality

- **Separation of Concerns:** The calculation engine (`backend/src/services/calculations.ts`) is completely decoupled from Fastify and React, written in pure TypeScript with zero UI dependencies, and thoroughly unit tested.
- **Persistence:** Local JSON file storage (`backend/data/store.json`) requires no external databases or cloud services, guaranteeing 1-command startup on any machine.
- **Sample Data Pre-loaded:** On first launch, the 2025 agency sample spreadsheets are automatically ingested, so the leadership dashboard is instantly populated upon opening.

---

## Short Note: What We'd Build Next & Trade-offs

### What We'd Build Next
- **Multi-Year Comparative Trends:** Side-by-side year-over-year comparison (2023, 2024, 2025) comparing margin changes as headcount scaled.
- **Role-Based Access Control (RBAC):** Restricting salary details while keeping billability and margin percentages accessible to project managers.
- **Predictive Burn-Down Forecasts:** Early warnings when a project's cost burn rate exceeds 80% of contract price before delivery is complete.

### Trade-offs Made
- Chose an embedded, atomic JSON file store over a Dockerized database to guarantee zero setup friction on Mac/Windows clean checkouts.
- Kept calculations computed in real-time in the backend service to guarantee consistency whenever overhead or billable assumptions are toggled.
