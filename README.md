# TailorCV

An AI-powered full-stack web application designed to help job seekers tailor ATS-optimized resumes and cover letters for specific job opportunities through conversational AI coaching.

---

## Overview

**TailorCV** is an end-to-end AI career copilot designed to maximize interview callback rates. Rather than generating generic AI resumes, TailorCV acts as a sharp recruitment coach that analyzes the exact match between a candidate's background and a target job description. It conducts interactive, focused interview sessions to uncover unlisted metrics, tools, and achievements, storing them in an encrypted candidate knowledge dossier to produce authentic, highly targeted, ATS-optimized CVs and cover letters.

---

## Key Features

- **🎯 Master Profile & CV Management:** Maintain a centralized master resume with work history, education, skills, and projects in multiple languages.
- **🔍 Smart Job Offer Parsing:** Import job postings via URL scraping or raw text to automatically extract key requirements, company culture, salary expectations, and required competencies.
- **💬 Interactive AI Recruitment Coach:** A conversational coaching session identifies qualifications gaps, prompting you with targeted questions to surface impactful metrics and relevant experience.
- **🔒 Encrypted Candidate Knowledge Dossier:** Stores candidate context, past answers, and project details with AES-256-GCM envelope encryption at rest, dynamically enriching future applications.
- **📄 ATS-Optimized CV Tailoring:** Re-orders, emphasizes, and formats bullet points to align directly with job requirements while preserving authenticity and avoiding AI hallucination.
- **✍️ Targeted Cover Letter & Interview Prep:** Generates personalized cover letters and custom interview talking points with anticipated questions tailored to the specific role.
- **🌍 Multilingual Translation:** Translate profiles and tailored applications across supported languages without losing formatting or technical context.
- **📊 Application Pipeline Tracking:** Manage the status of each job application from draft and tailored through interview and offer stages.

---

## Tech Stack & Architecture

- **Full-Stack & Routing:** [TanStack Start](https://tanstack.com/start) (SSR on Vite) & [TanStack Router](https://tanstack.com/router)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Auth, Storage)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) & OpenAI API (`gpt-5.6-luna`)
- **State Management & Caching:** [TanStack Query](https://tanstack.com/query)
- **Security:** AES-256-GCM Envelope Encryption, CSRF Protection, Pre-flight Regex Guardrails

---

## Languages Used

- **TypeScript** (Core application, routes, and server functions)
- **SQL / PLpgSQL** (Database schema migrations, functions, and RLS policies)
- **CSS / HTML**

---

## Test Suite & Quality Assurance

- **Test Runner:** [Vitest](https://vitest.dev/)
- **Total Tests:** **101 unit tests** across **14 test suites** (100% passing)
- **Run Tests:**
  ```sh
  npm run test
  ```
- **Test Coverage:** Core libraries, AI prompt formatting & parsing, CV normalization, security guards, and server-side data loaders.

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS) & **npm** `v10+`
- **Supabase Account**: With a database project, Google/Apple OAuth configured, and an `issue-screenshots` storage bucket.
- **OpenAI API Key**: Active key with access to chat completion models.

### 2. Installation & Environment Setup

1. **Clone & Install:**

   ```sh
   git clone <repository-url>
   cd TailorCV
   npm install
   ```

2. **Configure Environment Variables (`.env.local`):**

   ```env
   # Client-Side (Vite)
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

   # Server-Side (SSR / Nitro)
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # AI Provider
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Database Migrations:**
   Apply migrations located in `supabase/migrations/` to your Supabase project.

### 3. Running the App

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Commands

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Starts local development server on port 3000     |
| `npm run test`          | Runs all 101 unit tests via Vitest               |
| `npm run test:watch`    | Runs test runner in interactive watch mode       |
| `npm run test:coverage` | Generates detailed test coverage report          |
| `npx tsc --noEmit`      | Runs full TypeScript static type check           |
| `npm run lint`          | Runs ESLint analysis                             |
| `npm run build`         | Builds client & server SSR bundle for production |
| `npm run preview`       | Previews production build locally                |
