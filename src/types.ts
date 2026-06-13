/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum InterviewCategory {
  FRONTEND = "Frontend Developer",
  BACKEND = "Backend Developer",
  FULLSTACK = "Full Stack Developer",
  SOFTWARE_ENGINEER = "Software Engineer",
  JAVA = "Java Developer",
  PYTHON = "Python Developer",
  REACT = "React Developer",
  ANDROID = "Android Developer",
}

export enum InterviewType {
  TECHNICAL = "Technical Interview",
  HR = "HR Interview",
  BEHAVIORAL = "Behavioral Interview",
  DSA = "DSA Interview",
  SYSTEM_DESIGN = "System Design Interview",
}

export enum InterviewDifficulty {
  ENTRY = "Entry Level",
  MID = "Mid-Level",
  SENIOR = "Senior",
  STAFF = "Staff",
}

export interface InterviewQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  contextHint?: string;
}

export interface DetailedScores {
  technicalAccuracy: number; // 0-100
  communication: number; // 0-100
  problemSolving: number; // 0-100
  confidence: number; // 0-100
  clarity: number; // 0-100
}

export interface RoadmapPhase {
  phase: string;
  topics: string[];
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  evaluation: string; // e.g. "Correct", "Partially Correct", "Incorrect/Weak"
  whatWasMissing: string;
  correctAnswer: string;
  betterInterviewAnswer: string;
  keyConcepts: string[];
}

export interface EvaluationReport {
  overallScore: number;
  scores: DetailedScores;
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  personalizedRoadmap: RoadmapPhase[];
  questionEvaluations?: QuestionFeedback[];
}

export interface SavedSession {
  id: string;
  date: string;
  role: InterviewCategory;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  score: number;
  questionsCount: number;
  report: EvaluationReport;
  rawQuestions: InterviewQuestion[];
  userAnswers: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  joinedDate: string;
  targetRole: InterviewCategory;
  experienceLevel: InterviewDifficulty;
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  strongestSkill: string;
  weakestSkill: string;
  resumeName?: string;
  resumeText?: string;
  unlockedAchievements: string[]; // List of Badge IDs
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatarUrl: string;
  category: string;
  badge?: string;
}
