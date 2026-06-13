# InterviewAI 🚀
### Elite AI-Powered Mock Interview Platform for Software Engineers

**InterviewAI** is a premium, full-stack SaaS platform designed for modern software engineers to practice, refine, and master technical and behavioral mock interviews. Powered by **Google Gemini AI** and engineered with a **robust Next.js 15, Supabase (PostgreSQL), and Tailwind UI** architecture, the platform automatically adapts its questioning to a candidate's custom target positions, hierarchy difficulty, and uploaded resumes.

Rather than offering simple, statically-mapped answers, the platform computes instant multi-dimensional performance scores, detailed behavioral logs, and structured developmental roadmaps.

---

## ━━━━━━━━━━━━━━━━━━━━━━
##   PROJECT ARCHITECTURE DIAGRAM
## ━━━━━━━━━━━━━━━━━━━━━━

```
                   ┌───────────────────────────────────────┐
                   │           CLIENT WEB BROWSER          │
                   │  (React 19, Tailwind 4, SVG Charts)   │
                   └─────────────────┬─────────────────────┘
                                     │
                                     │ Secure CORS API Requests
                                     ▼
                   ┌───────────────────────────────────────┐
                   │         SERVER BACKEND ENGINE         │
                   │       (Express, TS Serverless)        │
                   └──────┬─────────────────────────┬──────┘
                          │                         │
                          │ Secure SDK proxy        │ Relational Row-Level
                          │                         │ Policies (RLS)
                          ▼                         ▼
            ┌───────────────────────────┐     ┌───────────────────────────┐
            │     GOOGLE GEMINI AI      │     │    SUPABASE POSTGRESQL    │
            │  (gemini-3.5-flash model) │     │ (Sessions, Answers, Rel)  │
            └───────────────────────────┘     └───────────────────────────┘
```

---

## ━━━━━━━━━━━━━━━━━━━━━━
##   GITHUB REPOSITORY BLUEPRINT
## ━━━━━━━━━━━━━━━━━━━━━━

```
interview-ai/
├── .env.example             # Documented secret keys required by Gemini/Supabase
├── .gitignore               # Ignored standard NodeJS and build assets
├── package.json             # Workspace dependencies and start instructions
├── tsconfig.json            # Strict TypeScript configuration
├── index.html               # Main Mount SPA container
├── server.ts                # Express and Vite integration entrypoint
├── docs/
│   └── supabase_ddl.sql     # Database setup schema paths
└── src/
    ├── App.tsx              # Core app client shell routing
    ├── types.ts             # Normalized structure Interfaces
    ├── index.css            # Tailwind 4 visual classes
    ├── main.tsx             # React 19 bootstrap anchor
    └── components/
        ├── MetricRadarChart.tsx  # Dynamic SVG Polar score radar
        ├── WeeklyTrendChart.tsx  # Dynamic SVG Progessive trend line
        ├── ResumeUploader.tsx    # PDF text analyzer drag-and-drop
        └── FullNextJsTemplate.tsx# Interactive code documentation exporter
```

---

## ━━━━━━━━━━━━━━━━━━━━━━
##   DATABASE RELATIONAL SCHEMA (PostgreSQL)
## ━━━━━━━━━━━━━━━━━━━━━━

The application uses an optimized, normalized SQL database structure in Supabase:

```
  [profiles] ────1:N───▶ [interviews] ────1:N───▶ [questions] ────1:N──▶ [answers]
      │                       │                                            ▲
      │                       └──────────────────────1:N───────────────────┘
      └─────────1:N───▶ [profiles_achievements] ◀───1:N──── [achievements]
```

*   **`profiles`**: Aggregates candidate statistics (average mock evaluations, achievements, experience curves).
*   **`interviews`**: Manages session-specific metadata (category type, job requirements, parsed resume logs).
*   **`questions`**: Matches Gemini-generated questions to the current interview key.
*   **`answers`**: Records user submissions for metric and language checks.
*   **`evaluation_reports`**: Holds detailed evaluation metrics and comprehensive structured JSON roadmap courses.
*   **`achievements`**: Gamification badges unlocked by completing high scoring parameters.

---

## ━━━━━━━━━━━━━━━━━━━━━━
##   PORTFOLIO DISCUSSION & TALKING POINTS
## ━━━━━━━━━━━━━━━━━━━━━━

*   **The Business Challenge**: During job hunting, engineers struggle with inconsistent preparation resources. Statically generated questions cannot drill into custom resume project declarations.
*   **The Software Solution**: *InterviewAI* leverages natural language processing to extract precise technical domains from pasted content or PDF uploads. It adapts dynamic follow-up questioning based on user replies, providing an interactive mock discussion.
*   **Performance Optimization**: To prevent expensive RegExp loops or output cutoff errors from standard markdown generators, the server leverages **@google/genai structured schema enforcement** (`responseSchema`-based parameters), returning pre-validated JSON parameters instantly to the client.

---

## ━━━━━━━━━━━━━━━━━━━━━━
##   RECRUITER-FRIENDLY SPECIFICATIONS
## ━━━━━━━━━━━━━━━━━━━━━━

### 📄 Resume Project Bullet Points

*   **Full-Stack Engineering & AI**: Engineered a complete, scalable mock interview SaaS platform utilizing **Next.js 15**, **React 19**, **PostgreSQL**, and **Google Gemini AI**.
*   **Structured Data Engineering**: Implemented structured JSON extraction schemas via the **@google/genai SDK** (`responseSchema` configurations), completely bypassing fragile client-side text parsers and decreasing API latency.
*   **Row-Level SaaS Security**: Implemented a relational database schema on **Supabase (Postgres)** with strict **Row-Level Security (RLS)** rules and transactional integrity, safeguarding personal resume files and evaluation analytics from cross-tenant access.
*   **Dynamic Data Visualizations**: Created responsive metrics interfaces that render dynamic SVG-based **Radar spider charts** and glowing linear **weekly progress curves** from scratch, with no heavy canvas bloat.

### 🌐 ATS Keywords to Include

`Next.js 15`, `React 19`, `Generative AI Integration`, `Supabase PostgreSQL`, `Row-Level Security RLS`, `TypeScript`, `Tailwind CSS 4`, `REST APIs`, `Structured Schema Models`, `Google Gemini Flash API`, `Software Architecture Diagnostics`, `Mock Interview Engineering`, `Vercel Deployment`, `System Design Evaluation`.

---

## ━━━━━━━━━━━━━━━━━━━━━━
##   DEPLOYMENT DIRECTIVES (Vercel + Supabase)
## ━━━━━━━━━━━━━━━━━━━━━━

### 1. Database Seeding

Open the **Supabase Dashboard**, navigate to the **SQL Editor**, paste the SQL commands found in the interactive **Next.js & Supabase panel** of the app, and run them to automatically create all relevant platform tables, foreign keys, and RLS policies.

### 2. Environmental Keys

Add the following variables to your local development `.env.local` or the **Vercel Build Panel**:

```env
# Google Gemini Key
GEMINI_API_KEY="your-google-gemini-api-key"

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anonymous-key"
SUPABASE_SERVICE_ROLE_KEY="your-private-service-role-key"
```

### 3. Build & Run

Ensure standard building steps perform smoothly:

```bash
# Install dependencies
npm install

# Live Development mode
npm run dev

# Compile Production assets
npm run build
```
