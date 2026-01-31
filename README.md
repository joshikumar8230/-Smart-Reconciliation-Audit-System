Reconciliation & Audit System
Overview

This project is a full-stack web application for data reconciliation and audit tracking. Users can upload CSV files, reconcile data against existing records, and monitor reconciliation status via dashboards. The system is designed with role-based access control to support Admins, Analysts, and Viewers.

Features

Authentication & Authorization:

JWT-based login system

Role-based access control:

Admin: Full access

Analyst: Can upload and reconcile

Viewer: Read-only

CSV Upload & Reconciliation:

Upload large CSV files for reconciliation

Detect matches, partial matches, and duplicates

Display first 20 rows before confirming upload

Handle partial failures gracefully

Dashboard & Visualizations:

Summary cards for total, matched, unmatched, partial match, and duplicate counts

Responsive bar charts showing reconciliation results

Status-based filtering

Audit Trail:

Track edits to reconciliation records

Record who edited, when, and what changed

Role Enforcement:

Frontend and backend checks to prevent unauthorized access

Test Data & Sample Records

For testing and validation purposes, the database is pre-populated with 30 sample reconciliation records. These records are used to verify matching logic, partial matches, duplicate detection, dashboard statistics, and audit trail behavior.

A sample CSV file named transactions.csv is attached and can be used to:

Test CSV upload functionality

Preview the first 20 rows before submission

Validate reconciliation outcomes (matched, unmatched, partial, duplicate)

Verify dashboard counts and visualizations

This allows evaluators and developers to quickly test the system end-to-end without manually creating initial data.

Achievements

Implemented JWT-based authentication with role-based access control (Admin, Analyst, Viewer) for secure operations.

Developed dynamic dashboards using React and Recharts to visualize matched, unmatched, partial, and duplicate records.

Designed summary cards and bar charts to clearly display reconciliation statistics.

Enabled CSV file uploads with support for large datasets while keeping the frontend responsive.

Built audit trails to track edits to reconciliation records, including who edited, when, and what changed.

Ensured data reconciliation accuracy with support for partial matches and duplicate detection.

Enforced frontend and backend validation to maintain security and proper role enforcement.

Created modular, maintainable code structure for both frontend and backend.

Architecture

Frontend: React.js, Material UI, Recharts

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT

File Handling: Multer for CSV uploads

Charts: Recharts (bar chart for reconciliation data)

Flow:

User logs in → JWT token issued

User uploads CSV → processed asynchronously

Reconciliation results stored in MongoDB

Dashboard summarizes totals and statuses

Edits tracked via audit log

Non-Functional Requirements

Handles large CSV files efficiently

Frontend remains responsive during uploads

Partial failures do not break the process

Provides clear and actionable error messages

Project Structure

The project follows a clear separation of concerns between frontend and backend:

Backend: Located in the backend/ directory
Contains Express server, API routes, authentication, reconciliation logic, audit logging, and database models.

Frontend: Located in the src/ directory
Contains React components, dashboards, charts, role-based UI logic, and API integrations.

This structure keeps the codebase modular, maintainable, and easy to scale.

API Documentation

Authentication:

POST /api/login → Returns JWT token and user info

POST /api/signup → Create user account

Reconciliation:

POST /api/upload → Upload CSV and reconcile data

PUT /api/reconciliation/:id → Edit reconciliation record (Admin/Analyst)

Dashboard & Reports:

GET /api/dashboard → Fetch summary statistics

GET /api/reports/:uploadJobId → Fetch reconciliation records by upload

Audit Logs:

GET /api/audits → Retrieve all edits with user and timestamp

Setup Instructions

Install backend dependencies:

cd backend
npm install

Install frontend dependencies:

cd ../frontend
npm install

Run backend:

cd ../backend
node app.cjs


Run frontend:

cd ../frontend
npm start

Sample Input Files

CSV files with columns: TransactionID, Amount, ReferenceNumber, Date

Supports partial matches and duplicates

Assumptions

CSV files are well-formatted with required headers

Users are responsible for correct role assignment

Audit logs only track edits, not initial upload

Trade-offs & Limitations

Backend processes CSV sequentially; could be parallelized for very large datasets

Frontend relies on browser memory for CSV preview (first 20 rows only)
