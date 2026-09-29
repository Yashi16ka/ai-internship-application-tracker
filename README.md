# AI Internship Application Tracker

A full-stack recruiting dashboard for managing internship applications, tracking recruiting activity, surfacing upcoming actions, and using AI to turn unstructured recruiting information into actionable workflows.

Built with **Next.js, TypeScript, PostgreSQL, and Google Gemini**.

## Overview

Internship recruiting information is often scattered across job portals, emails, spreadsheets, and reminders. This project brings that workflow into one dashboard where applications can be tracked from initial submission through assessments, interviews, offers, and follow-ups.

Beyond basic application tracking, the platform combines structured recruiting data with AI-assisted workflows and data-driven insights to help users understand what requires attention next.

## Features

### Recruiting Dashboard

- Track applications across Applied, Assessment, Interview, Offer, and Rejected stages
- View pipeline metrics and stage distribution
- Search and filter applications
- Track recruiters, job postings, locations, notes, and next actions
- Surface upcoming recruiting deadlines and follow-ups
- Maintain an activity timeline for assessments, interviews, and other recruiting events

### AI Application Importer

Paste an unstructured recruiting email or message and Gemini extracts relevant information into structured application fields.

The extracted data is presented for review before anything is saved, keeping the workflow human-in-the-loop.

Extracted fields can include:

- Company and role
- Application status and date
- Location
- Next action and deadline
- Recruiter information
- Notes

### AI Application Advisor

Each application can be analyzed using its current recruiting context and activity history.

The advisor returns three structured sections:

- **Recommended Next Step**
- **Why**
- **Suggested Action**

Application and timeline data are assembled server-side before being sent to Gemini, allowing recommendations to use the application's recruiting context rather than an isolated prompt.

### Smart Recruiting Insights

The dashboard calculates actionable signals directly from the current recruiting pipeline:

- **Next Priority** — identifies the nearest upcoming recruiting action
- **Pipeline Momentum** — surfaces the application furthest through the recruiting process
- **Follow-up Coverage** — measures how many active applications have scheduled next actions

Insights connect directly to application records so users can move from a dashboard signal to the relevant workflow.

## Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js UI      │
                    │ Recruiting Dashboard │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Next.js API Routes  │
                    │ CRUD / Events / AI   │
                    └───────┬──────┬───────┘
                            │      │
                ┌───────────┘      └───────────┐
                ▼                              ▼
       ┌───────────────────┐          ┌───────────────────┐
       │    PostgreSQL     │          │   Google Gemini   │
       │ Apps + Activities │          │ Import + Advisor  │
       └───────────────────┘          └───────────────────┘
```

### Core Workflows

```text
Application Management
Next.js UI → API Routes → PostgreSQL

AI Importer
Recruiting Email/Text → Gemini → Structured Preview
→ User Review → PostgreSQL

AI Advisor
Application + Activity History → Server Context
→ Gemini → Structured Recommendation

Smart Insights
Application Data → Deterministic Calculations
→ Actionable Dashboard UI
```

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| AI | Google Gemini API (`@google/genai`) |
| Data Access | `pg` |
| Tooling | npm, Git |

## Data Model

The application separates the current state of an application from its recruiting history.

```text
Application
    │
    └── 1 : many ── Application Events
```

### Applications

Stores information such as company, role, status, application date, job posting, location, recruiter details, notes, and next actions.

### Application Events

Stores historical recruiting activity associated with an application, including assessments and interviews.

Events reference their parent application through a foreign key and are removed when the associated application is deleted.

## API

```text
GET    /api/applications
POST   /api/applications

GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id

GET    /api/applications/:id/events
POST   /api/applications/:id/events

POST   /api/applications/:id/analyze
POST   /api/applications/import
```

## AI Design

The AI functionality is intentionally separated into two workflows.

**Importer:** transforms unstructured recruiting communication into structured application data. Gemini does not directly write extracted information to PostgreSQL; the user reviews the generated fields before saving.

**Advisor:** combines structured application information with recruiting activity to generate context-aware guidance about what to do next.

The rest of the application—including pipeline metrics, upcoming actions, and Smart Insights—uses deterministic application data rather than presenting generated AI output as factual state.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Environment files are excluded from Git.

### 3. Configure PostgreSQL

Create the PostgreSQL database and the `applications` and `application_events` tables required by the application.

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm start
```

The project has been verified with an optimized Next.js production build and successful TypeScript type checking.

## Project Focus

This project explores how generative AI can support an existing product workflow rather than functioning as a standalone chatbot.

The core recruiting data remains structured and deterministic, while Gemini is used where language understanding adds value: extracting information from unstructured recruiting messages and generating context-aware next-step guidance.

The result combines **full-stack application development, relational data modeling, AI integration, and human-in-the-loop product design**.