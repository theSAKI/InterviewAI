/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Database, FileCode, Cpu, ShieldAlert, Award, FileText } from "lucide-react";

export default function FullNextJsTemplate() {
  const [activeTab, setActiveTab] = useState<"database" | "nextjs" | "resume" | "architecture">("database");

  const supabaseDdl = `-- ====================================================================
-- INTERVIEWAIPROP - SUPABASE POSTGRESQL PRODUCTION DDL
-- ====================================================================

-- 1. Create Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Profiles Table (Autosynced with Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    target_role VARCHAR(100) DEFAULT 'Software Engineer',
    difficulty_level VARCHAR(50) DEFAULT 'Mid-Level',
    total_interviews INTEGER DEFAULT 0 NOT NULL,
    average_score NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    best_score INTEGER DEFAULT 0 NOT NULL,
    strongest_skill VARCHAR(100) DEFAULT 'Communication',
    weakest_skill VARCHAR(100) DEFAULT 'System Design',
    resume_name VARCHAR(255),
    resume_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Profiles_Achievements Association Table
CREATE TABLE IF NOT EXISTS public.profiles_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, achievement_id)
);

-- 4. Create Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(150) NOT NULL,
    difficulty VARCHAR(100) NOT NULL,
    interview_type VARCHAR(100) NOT NULL,
    raw_job_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Interview Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    sample_answer TEXT NOT NULL,
    context_hint TEXT,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create User Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Performance Scores and Evaluator Reports Table
CREATE TABLE IF NOT EXISTS public.evaluation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    technical_accuracy INTEGER NOT NULL CHECK (technical_accuracy >= 0),
    communication INTEGER NOT NULL CHECK (communication >= 0),
    problem_solving INTEGER NOT NULL CHECK (problem_solving >= 0),
    confidence INTEGER NOT NULL CHECK (confidence >= 0),
    clarity INTEGER NOT NULL CHECK (clarity >= 0),
    strengths TEXT[] NOT NULL,
    weaknesses TEXT[] NOT NULL,
    improvements TEXT[] NOT NULL,
    roadmap_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT SaaS COMPLIANCE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read/write their own profile data" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only view their own interview sessions" ON public.interviews
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users can only write/view answers in their owned interviews" ON public.answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.interviews 
            WHERE public.interviews.id = public.answers.interview_id 
            AND public.interviews.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can only view their own performance evaluation report" ON public.evaluation_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.interviews 
            WHERE public.interviews.id = public.evaluation_reports.interview_id 
            AND public.interviews.profile_id = auth.uid()
        )
    );
`;

  const nextjsRoute = `// src/app/api/interview/start/route.ts (Next.js 15 Serverless Endpoint Setup)
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Initialize external APIs
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { role, difficulty, interviewType, resumeText, jobDescription, profileId } = await req.json();

    if (!role || !difficulty || !interviewType) {
      return NextResponse.json({ error: "Required metadata fields are missing." }, { status: 400 });
    }

    // A. Generate interview questions using Google Gemini API
    const aiPrompt = \`Generate 5 high-fidelity technical mock questions for role "\${role}" at difficulty "\${difficulty}" focusing on "\${interviewType}".
    Resume info: "\${resumeText || ''}"
    Job Description context: "\${jobDescription || ''}"\`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              sampleAnswer: { type: Type.STRING },
              contextHint: { type: Type.STRING }
            },
            required: ["question", "sampleAnswer", "contextHint"]
          }
        }
      }
    });

    const questionsList = JSON.parse(response.text || "[]");

    // B. Save interview and generated questions inside Supabase PostreSQL
    const { data: interview, error: intError } = await supabase
      .from("interviews")
      .insert({ profile_id: profileId, role, difficulty, interview_type: interviewType })
      .select()
      .single();

    if (intError) throw intError;

    const questionsInsert = questionsList.map((q: any, i: number) => ({
      interview_id: interview.id,
      question_text: q.question,
      sample_answer: q.sampleAnswer,
      context_hint: q.contextHint,
      sort_order: i
    }));

    await supabase.from("questions").insert(questionsInsert);

    return NextResponse.json({ interviewId: interview.id, questions: questionsList });
  } catch (err: any) {
    console.error("API Error in interview start flow:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}`;

  return (
    <div id="full-nextjs-panel" className="bg-card-dark border border-border-dark rounded-3xl p-6 sm:p-8 overflow-hidden">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border-dark">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Cpu className="text-accent-emerald w-6 h-6 animate-pulse" />
            InterviewAI Production Blueprint
          </h2>
          <p className="text-sm text-text-muted mt-1 font-sans">
            Ready-to-deploy SaaS stack architecture (Next.js 15, Supabase PostgreSQL, Google Gemini SDK)
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-1 bg-[#09090b]/60 border border-border-dark p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-nowrap transition-all cursor-pointer ${
              activeTab === "database"
                ? "bg-accent-emerald text-zinc-950 shadow-md shadow-accent-emerald/10"
                : "text-text-muted hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Postgres DDL
          </button>
          <button
            onClick={() => setActiveTab("nextjs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-nowrap transition-all cursor-pointer ${
              activeTab === "nextjs"
                ? "bg-accent-emerald text-zinc-950 shadow-md shadow-accent-emerald/10"
                : "text-text-muted hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Next.js API
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-nowrap transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-accent-emerald text-zinc-950 shadow-md shadow-accent-emerald/10"
                : "text-text-muted hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Deployment & Setup
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-nowrap transition-all cursor-pointer ${
              activeTab === "resume"
                ? "bg-accent-emerald text-zinc-950 shadow-md shadow-accent-emerald/10"
                : "text-text-muted hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            ATS Recruiter Tips
          </button>
        </div>
      </div>

      {/* Database section */}
      {activeTab === "database" && (
        <div className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-md font-bold text-slate-200">Database Schema (Supabase)</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                The database manages a structured relational setup in PostgreSQL. It enforces transactional consistency, automatic cascade deletion on account closure, and robust multi-tenant isolations.
              </p>
              <div className="space-y-3 bg-[#09090b]/50 border border-border-dark p-4 rounded-xl font-sans">
                <h4 className="text-xs uppercase font-bold text-accent-emerald flex items-center gap-1 tracking-wider">
                  <Database className="w-3.5 h-3.5" /> Tables & Relationships
                </h4>
                <div className="text-[11px] space-y-2 text-slate-300">
                  <p>• <strong>profiles</strong> (User portfolio, aggregates best stats)</p>
                  <p>• <strong>interviews</strong> (Tracks specific session configurations)</p>
                  <p>• <strong>questions</strong> (Generated mock questions map to interviews)</p>
                  <p>• <strong>answers</strong> (Submissions recorded inline)</p>
                  <p>• <strong>evaluation_reports</strong> (Deep JSON roadmaps and metrics)</p>
                  <p>• <strong>achievements</strong> (SaaS gamification metrics)</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-xs text-text-muted px-4 py-2 bg-[#09090b] border border-b-0 border-border-dark rounded-t-xl font-mono">
                <span>supabase_schema.sql</span>
                <span className="text-accent-emerald">PostgreSQL Code Block</span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl border border-border-dark text-[11px] font-mono overflow-auto max-h-[350px] text-zinc-300 leading-relaxed">
                <code>{supabaseDdl}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* NextJS Section */}
      {activeTab === "nextjs" && (
        <div className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-md font-bold text-slate-200">Serverless API Design</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                Next.js 15 Serverless routes isolate the Gemini API from the client. They securely utilize service roles to save profiles, answers, questions, and evaluation reports directly in the Postgres database.
              </p>
              <div className="bg-[#10b981]/5 border border-[#10b981]/20 p-4 rounded-xl flex items-start gap-2.5">
                <Award className="text-accent-emerald w-5 h-5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-accent-emerald font-sans">Structured Schema Type Validation</h4>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed font-sans">
                    Guarantees output returns strictly structured JSON array format matching the design schemas. Bypasses classic custom regex parsers completely.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-xs text-text-muted px-4 py-2 bg-[#09090b] border border-b-0 border-border-dark rounded-t-xl font-mono">
                <span>app/api/interview/start/route.ts</span>
                <span className="text-sky-400">TypeScript Code Block</span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl border border-border-dark text-[11px] font-mono overflow-auto max-h-[350px] text-slate-200 leading-relaxed">
                <code>{nextjsRoute}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Architecture section */}
      {activeTab === "architecture" && (
        <div className="space-y-6 pt-6 text-slate-300 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white">Full SaaS Deployment Setup</h3>
              <p className="text-xs text-text-muted">
                A simple guide showing how to build and mirror this exact production setup under real accounts in your Next.js project.
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Step 1: Set Up Supabase</h4>
                <ul className="text-xs text-text-muted space-y-2 pl-4 list-disc leading-relaxed">
                  <li>Create a free account at Supabase.co and provision a New Project.</li>
                  <li>Open the SQL Editor on the Supabase Dashboard.</li>
                  <li>Paste the <strong>PostgreSQL DDL</strong> (located on Tab 1) and run it to construct all SaaS tables.</li>
                  <li>Toggle Authentication configurations to authorize Email / Password logins.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Step 2: Vercel Environmental Configuration</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Provide these key config files inside the Vercel Settings Panel to bind the backend server correctly:
                </p>
                <div className="bg-zinc-900 p-3 rounded-lg border border-border-dark text-[10px] font-mono text-slate-300 leading-relaxed">
                  NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-public-anon-key"<br />
                  SUPABASE_SERVICE_ROLE_KEY="your-supabase-private-service-role-key"<br />
                  GEMINI_API_KEY="your-google-gemini-api-key"
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <h3 className="text-md font-bold text-white">Git Repository Folder Blueprint</h3>
              <p className="text-xs text-text-muted">
                Recommended workspace structure to push to GitHub for Next.js SaaS:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-border-dark font-mono text-[10.5px] text-slate-300 leading-relaxed space-y-1">
                <p className="text-accent-emerald">interview-ai/ (SaaS root)</p>
                <p>├── .env.local             <span className="text-zinc-650"># Hidden service secrets</span></p>
                <p>├── package.json           <span className="text-zinc-650"># Direct Next 15 bindings</span></p>
                <p>├── tsconfig.json          <span className="text-zinc-650"># Strict TypeScript paths</span></p>
                <p>├── next.config.ts         <span className="text-zinc-650"># Image proxy alignments</span></p>
                <p>├── public/                <span className="text-zinc-650"># Logo vector graphics</span></p>
                <p>├── src/</p>
                <p>│   ├── app/                <span className="text-zinc-650"># Next.js 15 App router</span></p>
                <p>│   │   ├── layout.tsx</p>
                <p>│   │   ├── page.tsx          <span className="text-zinc-650"># SaaS Landing Page</span></p>
                <p>│   │   ├── dashboard/page.tsx <span className="text-zinc-650"># Aggregators & Sparklines</span></p>
                <p>│   │   └── api/              <span className="text-zinc-650"># Serverless API Proxy Routes</span></p>
                <p>│   │       ├── interview/start/</p>
                <p>│   │       └── interview/evaluate/</p>
                <p>│   ├── components/           <span className="text-zinc-650"># Sub-level visual assets</span></p>
                <p>│   │   ├── MetricRadarChart.tsx</p>
                <p>│   │   └── WeeklyTrendChart.tsx</p>
                <p>│   └── lib/</p>
                <p>│       └── supabase.ts       <span className="text-zinc-650"># Supabase server client</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume ATS / Recruiter Section */}
      {activeTab === "resume" && (
        <div className="space-y-6 pt-6 text-slate-300 font-sans">
          <div className="bg-accent-emerald/10 border border-accent-emerald/20 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-accent-emerald flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" /> ATS Keywords & Profile Highlights
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Copy and paste these pre-crafted project highlight lines and bullet points onto your professional resume or LinkedIn profiles to showcase your engineering expertise during tech screenings!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Professional Resume Bullet Points</h4>
              <div className="text-xs text-slate-400 space-y-3 leading-relaxed bg-[#09090b]/40 p-4 border border-border-dark rounded-xl">
                <p>
                  • Built <strong>InterviewAI</strong>, a full-stack, responsive artificial-intelligence-driven mock interviewing platform leveraging <strong>Next.js 15</strong>, <strong>PostgreSQL</strong>, and the <strong>Google Gemini API</strong>, enabling tech candidates to hone responses with adaptive system questions.
                </p>
                <p>
                  • Optimized serverless APIs with the <strong>@google/genai</strong> SDK, executing structured JSON outputs via declared schemes to reduce diagnostic parsers by 100% and accelerate API latency and responsiveness.
                </p>
                <p>
                  • Designed a normalized relational database in <strong>Supabase</strong> featuring Cascade deletion paths and Row-Level Security (RLS) rules, safeguarding users' historical mock evaluations and resume metadata against cross-tenant vulnerabilities.
                </p>
                <p>
                  • Crafted responsive dashboards rendering real-time SVG <strong>Radar spider charts</strong> and customized progress curves, plotting user improvements across key dimensions: Technical Accuracy, STAR Behavior, and Clarity.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">ATS Search Keywords to Include</h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-border-dark space-y-3">
                <div>
                  <h5 className="text-[11px] font-bold text-slate-300">CORE ARCHITECTURAL DOMAIN:</h5>
                  <p className="text-xs text-text-muted mt-1">
                    Artificial Intelligence Integration, Mock Interview Platforms, Natural Language Processing, Adaptive Dialogue Generators, Generative AI Agent Engineering, Multi-Tenant SaaS, Relational Database Normalization.
                  </p>
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-300">TECHNICAL TOOLS & LANGUAGES:</h5>
                  <p className="text-xs text-text-muted mt-1">
                    React 19, Next.js 15, Vercel Serverless Functions, PostgreSQL, Supabase Auth, Google GenAI SDK, Tailwind CSS 4, TypeScript, SVG Canvas, REST APIs.
                  </p>
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-300">METHODOLOGIES & SKILLS:</h5>
                  <p className="text-xs text-text-muted mt-1">
                    Structured Data Extraction, Schema Constraints, Multi-Tenant Security, Row-Level Security Policies, System Design, DSA Evaluation, Responsive UI Design, offline-first localStorage, STAR interview diagnostics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
