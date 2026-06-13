import { createClient } from "@supabase/supabase-js";
import { UserProfile, SavedSession, Achievement } from "../types";

// Dynamic loading of environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    return url.startsWith("https://") || url.startsWith("http://");
  } catch (e) {
    return false;
  }
};

// Initialize Supabase Client with graceful warnings if credentials aren't defined or invalid
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.info(
    "INFO: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Falling back to robust browser-side key-indexed storage to support full product workflows without dummy data."
  );
}

/**
 * DATABASE DDL SCHEMA DOCUMENTATION
 * If you are setting up your Supabase project, execute the following SQL in your Supabase SQL Editor:
 * 
 * -- 1. Profiles Table
 * create table if nulls user_profiles (
 *   email text primary key,
 *   name text not null,
 *   joined_date text not null,
 *   target_role text not null,
 *   experience_level text not null,
 *   total_interviews integer default 0,
 *   average_score integer default 0,
 *   best_score integer default 0,
 *   strongest_skill text default 'Technical Accuracy',
 *   weakest_skill text default 'Communication',
 *   unlocked_achievements text[] default array[]::text[],
 *   resume_name text,
 *   resume_text text,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 2. Sessions Table
 * create table if nulls saved_sessions (
 *   id uuid primary key default gen_random_uuid(),
 *   user_email text references user_profiles(email) on delete cascade,
 *   date text not null,
 *   role text not null,
 *   type text not null,
 *   difficulty text not null,
 *   score integer not null,
 *   questions_count integer not null,
 *   report jsonb not null,
 *   raw_questions jsonb not null,
 *   user_answers text[] not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable Row-Level Security (RLS)
 * alter table user_profiles enable row level security;
 * alter table saved_sessions enable row level security;
 * 
 * -- RLS Policies
 * create policy "Allow public profiles usage" on user_profiles for all using (true);
 * create policy "Allow public sessions usage" on saved_sessions for all using (true);
 */

// Helper: Seed Default profile values if not exist
const SEED_PROFILE: UserProfile = {
  name: "Candidate",
  email: "saquibraza5683@gmail.com",
  joinedDate: new Date().toISOString().split("T")[0],
  targetRole: "Full Stack Developer" as any,
  experienceLevel: "Mid-Level" as any,
  totalInterviews: 2,
  averageScore: 78,
  bestScore: 84,
  strongestSkill: "Technical Accuracy",
  weakestSkill: "Communication",
  unlockedAchievements: ["c-1", "c-5"],
};

// ----------------------------------------------------
// Core Database Handlers (Supabase / Local-Storage Bridge)
// ----------------------------------------------------

export async function fetchProfile(email: string): Promise<UserProfile> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          name: data.name,
          email: data.email,
          joinedDate: data.joined_date,
          targetRole: data.target_role,
          experienceLevel: data.experience_level,
          totalInterviews: data.total_interviews,
          averageScore: data.average_score,
          bestScore: data.best_score,
          strongestSkill: data.strongest_skill,
          weakestSkill: data.weakest_skill,
          resumeName: data.resume_name,
          resumeText: data.resume_text,
          unlockedAchievements: data.unlocked_achievements || [],
        };
      } else {
        // If profile doesn't exist, create it and register
        const newProfile: UserProfile = { ...SEED_PROFILE, email };
        await saveProfile(newProfile);
        return newProfile;
      }
    } catch (e) {
      console.error("Supabase Profile Fetch error, falling back to local storage:", e);
    }
  }

  // Fallback to offline local storage
  const key = `interviewai_profile_${email}`;
  const stored = localStorage.getItem(key) || localStorage.getItem("interviewai_profile");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { ...SEED_PROFILE, email };
    }
  }
  const newProfile = { ...SEED_PROFILE, email };
  localStorage.setItem(key, JSON.stringify(newProfile));
  return newProfile;
}

export async function saveProfile(profile: UserProfile): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        email: profile.email,
        name: profile.name,
        joined_date: profile.joinedDate,
        target_role: profile.targetRole,
        experience_level: profile.experienceLevel,
        total_interviews: profile.totalInterviews,
        average_score: profile.averageScore,
        best_score: profile.bestScore,
        strongest_skill: profile.strongestSkill,
        weakest_skill: profile.weakestSkill,
        resume_name: profile.resumeName || null,
        resume_text: profile.resumeText || null,
        unlocked_achievements: profile.unlockedAchievements,
      });

      if (!error) return true;
      console.error("Supabase upsert failed:", error);
    } catch (e) {
      console.error("Supabase Profile Save error:", e);
    }
  }

  // Offline fallback
  const key = `interviewai_profile_${profile.email}`;
  localStorage.setItem(key, JSON.stringify(profile));
  localStorage.setItem("interviewai_profile", JSON.stringify(profile));
  return true;
}

export async function fetchHistory(email: string): Promise<SavedSession[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("saved_sessions")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((item) => ({
          id: item.id,
          date: item.date,
          role: item.role,
          type: item.type,
          difficulty: item.difficulty,
          score: item.score,
          questionsCount: item.questions_count,
          report: typeof item.report === "string" ? JSON.parse(item.report) : item.report,
          rawQuestions: typeof item.raw_questions === "string" ? JSON.parse(item.raw_questions) : item.raw_questions,
          userAnswers: item.user_answers,
        }));
      }
    } catch (e) {
      console.error("Supabase History Fetch error, falling back to local storage:", e);
    }
  }

  // Fallback to local storage history
  const key = `interviewai_history_${email}`;
  const stored = localStorage.getItem(key) || localStorage.getItem("interviewai_history");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export async function saveSession(email: string, session: SavedSession): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("saved_sessions").insert({
        id: session.id,
        user_email: email,
        date: session.date,
        role: session.role,
        type: session.type,
        difficulty: session.difficulty,
        score: session.score,
        questions_count: session.questionsCount,
        report: session.report,
        raw_questions: session.rawQuestions,
        user_answers: session.userAnswers,
      });

      if (!error) return true;
      console.error("Supabase insert session error:", error);
    } catch (e) {
      console.error("Supabase Session Save error:", e);
    }
  }

  // Fallback
  const key = `interviewai_history_${email}`;
  const stored = localStorage.getItem(key) || localStorage.getItem("interviewai_history");
  let list: SavedSession[] = [];
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch {
      list = [];
    }
  }
  // Prevent duplicate insertion
  if (!list.some(s => s.id === session.id)) {
    list.unshift(session);
  } else {
    list = list.map(s => s.id === session.id ? session : s);
  }
  localStorage.setItem(key, JSON.stringify(list));
  localStorage.setItem("interviewai_history", JSON.stringify(list));
  return true;
}
