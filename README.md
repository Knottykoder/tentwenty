# tentwenty - Margin Dashboard Exercise

An executive margin & profitability dashboard built for agency leadership. It turns messy timesheet, salary, and project pricing spreadsheets into actionable financial clarity with zero setup friction.

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

### 3. Run Self-Check & Pipeline Tests
```bash
npm run test
```
This runs automated verification suites:
1. **Domain Math Verification:** Verifies to the dirham that with overhead set to zero, total project costs equal total salaries:
   `Total Salaries (2,400,000.00 AED) == Total Project Cost (2,400,000.00 AED) -> Difference: 0.00 AED`.
2. **Two-Phase Upload & Transaction Pipeline:** Verifies that files parse in memory, validate against business rules, and commit atomically inside a single Prisma transaction with zero partial state on errors.

---

## Architecture: Two-Phase Atomic Upload Pipeline

To prevent partial database states or orphaned data across multiple spreadsheets, the application uses an atomic two-phase ingestion workflow:

```text
Parse ALL files (In-Memory)
      ↓
Validate ALL files (Schema, Types, Business Rules)
      ↓
If Valid
      ↓
ONE Prisma Transaction (ACID Guarantee)
      ↓
Commit Everything
```

### 1. Parse ALL Files (In-Memory)
- Spreadsheets are uploaded via multipart form streams and parsed into memory buffers using SheetJS.
- Zero database writes occur while files are streaming or parsing.
- Handles edge cases such as messy headers, missing columns, blank cells (`-`), and flexible date patterns.

### 2. Validate ALL Files
- All parsed entries are evaluated through the pre-commit validator (`backend/src/services/validator.ts`).
- **Timesheets:** Checks for required employee IDs, valid `YYYY-MM` month strings, and non-negative logged hours.
- **Salaries:** Enforces required employee IDs, valid month formats, positive salaries, and duplicate detection.
- **Project Prices:** Ensures unique project reference codes and non-negative contract amounts.
- If **any** file fails validation, the entire process terminates immediately. An HTTP 400 response is returned with the list of errors, and the database remains completely untouched.

### 3. ONE Prisma Transaction
- Only when all files pass 100% of validation checks, the batch is passed to `store.commitBatchTransaction`.
- Executed inside a single `prisma.$transaction(async (tx) => { ... })` block with configurable timeout safeguards.

### 4. Commit Everything
- Old records for the uploaded months are replaced cleanly while preserving previous months.
- Project prices are upserted atomically.
- If any database constraint or statement fails, Prisma automatically rolls back all changes, guaranteeing zero partial writes.

---

## Core Features Delivered

### Must Have
- **Atomic Spreadsheet Ingestion:** Ingests the 3 `.xlsx` files (`timesheet`, `salaries`, `project-prices`) with full ACID guarantees. Corrected months can be uploaded without wiping or duplicating other periods.
- **Executive Dashboard:** Clean leadership overview displaying high-level KPI cards and interactive Chart.js visualizations:
  - Monthly Revenue vs. Cost Trend Line Chart.
  - Department Cost Distribution Donut Chart.
  - Category Hours Breakdown Bar Chart.
- **Dedicated Project Details Page (`/projects/[refCode]`):** Full-page project breakdown with contract value, burned cost, profit, margin %, monthly cost burn chart, and employee contribution tables.
- **Productivity Page:** Per-employee billable ÷ total logged hours ratio with visual performance badges.
- **Category Time Allocation:** Clear breakdown of billable client work vs. absorbed agency overhead (leaves, meetings, learning, bug fixes, etc.).

### Should Have
- **Department Drill-Down:** Dedicated views for departments (Design, Frontend, Backend, App, QA, Management) showing hours and costs per employee.
- **Per-Employee Project Profitability:** Calculates employee revenue share (`Project Price * (Employee Hours / Total Project Hours)`) and employee profitability (`(Revenue Share - Cost) / Revenue Share`).
- **Configurable Assumptions:** Live adjustment of monthly agency overhead (AED) and billable category toggles through the UI modal without modifying code.
- **Honest Empty & Error States:** Clear alerts for invalid files, network issues, and validation errors.

### Stretch Goals
- **CSV Export:** 1-click export for any table on screen (Projects, Contributions, Productivity, Categories, Departments, and Audit tables).
- **Employee x Category Matrix:** Automated pivot matrix replacing manual finance tracking spreadsheets.
- **Cost Rate Audit View:** Modal displaying exact derivations of direct rates, indirect cost pools, and zero-overhead reconciliation proofs.

---

## Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Chart.js, Lucide Icons |
| **Backend** | Fastify 4, TypeScript, Prisma ORM 6, SQLite, SheetJS (xlsx) |
| **Testing** | Node.js native test runner (`tsx --test`) |
| **Data Storage** | SQLite (`backend/prisma/dev.db`) managed via Prisma migrations and client |

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
   - For the full-year view, revenue represents total sold project contract values.
   - For individual filtered months, if a project has hours logged across multiple months, revenue is attributed proportionally to the billable hours delivered in that month (percentage-of-completion method), ensuring monthly margins reflect true delivery performance.

2. **Support Staff Handling:**
   If a team member has an active monthly salary but logs 0 hours in timesheets, their direct hourly rate cannot be computed by division by zero. Their entire salary is automatically routed into the indirect cost pool to be absorbed across billable projects.

3. **Re-upload Idempotency:**
   When uploading a corrected timesheet or salary file, the parser detects the months present in the upload and replaces records matching those specific months, preserving all previously uploaded months untouched.

---

## What We'd Build Next & Trade-offs

### What We'd Build Next
- **Risk & Budget Burn Alert System (Early Warnings):**
  - **Budget Overrun Flags:** Automatic warning badges when actual burned project cost crosses 80% or 100% of contract value before delivery completion.
  - **Loss-Making Project Detection:** Proactive detection for negative-margin or low-margin projects (<15%) so leadership can intervene before completion.
- **"What-If" Scenario Planner (Executive Modeling Tool):**
  - **Salary Increment Impact:** Simulate department salary hikes (e.g. +10%) to preview agency-wide gross margin impact before approvals.
  - **Target Margin Pricing Calculator:** Reverse-calculate recommended project quotes required to achieve a desired target margin (e.g. 40%).
  - **Overhead Sensitivity Analysis:** Model how shifts in fixed agency overhead alter monthly indirect cost absorption rates.
- **Client-Level Profitability Roll-Up:** Aggregate multi-project accounts by client (`companyName`) to evaluate which clients deliver the highest net margins vs. disproportionate team hours.
- **Role-Based Privacy Mode (RBAC):** Restrict raw salary details to executive leadership while keeping billability ratios and project health indicators accessible to project managers.

### Trade-offs Made
- Chose embedded SQLite with Prisma ORM over external Dockerized PostgreSQL to ensure seamless, zero-friction setup on any machine while retaining full ACID transaction safety.
- Kept calculations computed in real-time in the backend service to guarantee consistency whenever overhead or billable assumptions are adjusted.
