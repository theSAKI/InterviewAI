/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Award,
  BookOpen,
  LineChart,
  User,
  LogOut,
  Calendar,
  Layers,
  Sparkles,
  Play,
  CheckCircle,
  FileText,
  Clock,
  ChevronRight,
  ChevronDown,
  Send,
  Loader2,
  ArrowRight,
  Database,
  Search,
  Check,
  Trophy,
  Activity,
  UserCheck,
  ArrowDownToLine,
  ExternalLink,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Circle,
  RefreshCw,
  MessageSquare,
  RotateCcw,
  Sun,
  Moon,
  Square,
  Flag,
  Edit,
  Target,
  Lightbulb,
  Settings,
} from "lucide-react";

import {
  InterviewCategory,
  InterviewType,
  InterviewDifficulty,
  InterviewQuestion,
  EvaluationReport,
  SavedSession,
  UserProfile,
  Achievement,
} from "./types";

import MetricRadarChart from "./components/MetricRadarChart";
import WeeklyTrendChart from "./components/WeeklyTrendChart";
import ResumeUploader from "./components/ResumeUploader";
import FullNextJsTemplate from "./components/FullNextJsTemplate";
import { supabase, fetchProfile, saveProfile, fetchHistory, saveSession } from "./lib/supabase";

// Pre-packaged achievements
const ACHIEVEMENT_LIST: Achievement[] = [
  { id: "c-1", title: "Concurrency Maestro", description: "Completed a Technical session with over 85% accuracy in threading/locking.", iconName: "Layers", isUnlocked: false },
  { id: "c-2", title: "STAR Communicator", description: "Scored over 90% in Communication during a Behavioral interview.", iconName: "UserCheck", isUnlocked: false },
  { id: "c-3", title: "Scalability Architect", description: "Completed a Senior-level System Design interview.", iconName: "Brain", isUnlocked: false },
  { id: "c-4", title: "Bug Hunter", description: "Successfully answered all technical questions on memory optimization.", iconName: "Award", isUnlocked: false },
  { id: "c-5", title: "Daily Grind", description: "Unlocked by practicing on back-to-back mock session folders.", iconName: "Clock", isUnlocked: false },
];

const INITIAL_PROFILE: UserProfile = {
  name: "Candidate",
  email: "saquibraza5683@gmail.com",
  joinedDate: "2026-06-12",
  targetRole: InterviewCategory.FULLSTACK,
  experienceLevel: InterviewDifficulty.MID,
  totalInterviews: 2,
  averageScore: 78,
  bestScore: 84,
  strongestSkill: "Technical Accuracy",
  weakestSkill: "Communication",
  unlockedAchievements: ["c-1", "c-5"],
};

export default function App() {
  // Page routing state
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "dashboard" | "setup" | "interview" | "results">("landing");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Core Data States
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENT_LIST);

  // Active Interview Flow State
  const [selectedRole, setSelectedRole] = useState<InterviewCategory>(InterviewCategory.SOFTWARE_ENGINEER);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty>(InterviewDifficulty.MID);
  const [selectedType, setSelectedType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [selectedHistorySession, setSelectedHistorySession] = useState<SavedSession | null>(null);

  // Advanced Voice, Webcam, and Interactive Telemetry States
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [liveTranscripts, setLiveTranscripts] = useState<{ sender: "AI" | "Candidate"; text: string; timestamp: string }[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState("");

  // Subtitle chunker to split long text paragraphs into real-time movie-style subtitle captions
  useEffect(() => {
    if (!isAiSpeaking || !spokenText) {
      setActiveSubtitle("");
      return;
    }

    // Split text into coherent chunks of up to 6 words
    const words = spokenText.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      setActiveSubtitle("");
      return;
    }

    const chunks: string[] = [];
    const size = 6;
    for (let i = 0; i < words.length; i += size) {
      chunks.push(words.slice(i, i + size).join(" "));
    }

    setActiveSubtitle(chunks[0] || "");
    let index = 0;

    // A comfortable human reading pace for ~6 words is around 2 seconds
    const interval = setInterval(() => {
      index++;
      if (index < chunks.length) {
        setActiveSubtitle(chunks[index]);
      } else {
        clearInterval(interval);
      }
    }, 2200);

    return () => clearInterval(interval);
  }, [spokenText, isAiSpeaking]);

  // Interactive Live eye contact, movement, and analytical telemetry parameters
  const [telemetry, setTelemetry] = useState({
    eyeContact: 96,
    faceVisible: true,
    attentionLevel: "Excellent",
    headMovement: "Steady",
    speakingPace: "Normal (130 WPM)",
    confidenceScore: 94
  });

  // Forgot password flow states
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // App-wide tracking for Gemini API Quota Exceeded and Fallback indicators
  const [apiStatus, setApiStatus] = useState<"ok" | "quota_exceeded" | "no_key" | "other">("ok");

  const checkApiHealth = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        if (data.lastGeminiStatus) {
          setApiStatus(data.lastGeminiStatus);
        } else if (!data.aiAvailable) {
          setApiStatus("no_key");
        } else {
          setApiStatus("ok");
        }
      }
    } catch (e) {
      console.warn("Unable to check module api status:", e);
    }
  };

  useEffect(() => {
    checkApiHealth();
    // Periodically poll every 15 seconds to sync fallback state in real-time
    const checkInterval = setInterval(checkApiHealth, 15000);
    return () => clearInterval(checkInterval);
  }, []);

  // System references
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recognitionRef = React.useRef<any>(null);

  // Load persistence states
  useEffect(() => {
    const resumeSession = async () => {
      const activeEmail = localStorage.getItem("interviewai_logged_in_email");
      if (activeEmail) {
        setIsLoggedIn(true);
        setCurrentPage("dashboard");
        try {
          const userProf = await fetchProfile(activeEmail);
          setProfile(userProf);
          const userHist = await fetchHistory(activeEmail);
          setHistory(userHist);
          const matchedAchievements = achievements.map(ach => ({
            ...ach,
            isUnlocked: (userProf.unlockedAchievements || []).includes(ach.id),
            unlockedAt: (userProf.unlockedAchievements || []).includes(ach.id) ? (ach.unlockedAt || new Date().toISOString().substring(0, 10)) : undefined
          }));
          setAchievements(matchedAchievements);
        } catch (e) {
          console.error("Failed to fetch session:", e);
        }
      } else {
        const savedProfile = localStorage.getItem("interviewai_profile");
        const savedHistory = localStorage.getItem("interviewai_history");
        const savedAchievements = localStorage.getItem("interviewai_achievements");

        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements));
        } else {
          const seeded = ACHIEVEMENT_LIST.map((ach) =>
            (INITIAL_PROFILE.unlockedAchievements || []).includes(ach.id)
              ? { ...ach, isUnlocked: true, unlockedAt: "2026-06-11" }
              : ach
          );
          setAchievements(seeded);
          localStorage.setItem("interviewai_achievements", JSON.stringify(seeded));
        }

        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        } else {
          const seededHistory: SavedSession[] = [
            {
              id: "hist-1",
              date: "2026-06-08",
              role: InterviewCategory.FULLSTACK,
              type: InterviewType.TECHNICAL,
              difficulty: InterviewDifficulty.MID,
              score: 72,
              questionsCount: 5,
              userAnswers: ["Asynchronous processes utilize a single-threaded loop...", "Redux holds synchronous reducer paths...", "Indices reduce disk sweeps...", "We write Playwright routes...", "We had solid alignment discussions."],
              rawQuestions: [
                { id: "se-1", question: "How does asynchronous thread process logic work under extreme REST load?", sampleAnswer: "Verify microtasks understanding.", contextHint: "Basic async structures." },
                { id: "se-2", question: "Describe state management techniques and caching tradeoffs.", sampleAnswer: "Explain context vs store.", contextHint: "State boundaries." },
                { id: "se-3", question: "How do database indexes improve analytical lookup latencies?", sampleAnswer: "Analyze B-Tree properties.", contextHint: "Indices speed." },
                { id: "se-4", question: "What is your testing protocol for resilient multi-tenant code?", sampleAnswer: "Cover integration bounds.", contextHint: "Testing scope." },
                { id: "se-5", question: "Provide an example where you handled professional team friction.", sampleAnswer: "Verify STAR methodology.", contextHint: "Demeanor check." }
              ],
              report: {
                overallScore: 72,
                scores: { technicalAccuracy: 74, communication: 68, problemSolving: 70, confidence: 75, clarity: 73 },
                strengths: ["Clean understanding of async thread microtasks in Node.js.", "Proper alignment of testing layers with Sentry logs."],
                weaknesses: ["Under-explained concrete index balance tradeoffs.", "Filler words in STAR behavioral responses."],
                suggestedImprovements: ["Utilize metrics benchmarks.", "Use the STAR formulation rigidly."],
                personalizedRoadmap: [
                  { phase: "Phase 1: Performance Diagnostics", topics: ["Flame graph traces", "SQL transaction bounds"] }
                ],
              },
            },
            {
              id: "hist-2",
              date: "2026-06-10",
              role: InterviewCategory.SOFTWARE_ENGINEER,
              type: InterviewType.SYSTEM_DESIGN,
              difficulty: InterviewDifficulty.MID,
              score: 84,
              questionsCount: 5,
              userAnswers: ["We scale horizontal containers instead of raw machines...", "We use Redis cluster as write sidecaches...", "We separate analytic ingestion from writes...", "Docker simplifies consistent multi-tenant virtualization...", " consensus building is priority."],
              rawQuestions: [
                { id: "sd-1", question: "Explain modern horizontal container autoscaling tradeoffs.", sampleAnswer: "Examine load capacity bounds.", contextHint: "Autoscaling bounds." },
                { id: "sd-2", question: "Explain caching invalidation techniques (LRU, Write-Through).", sampleAnswer: "Highlight replication latencies.", contextHint: "Cache sync." },
                { id: "sd-3", question: "How do you model high write analytical pipelines?", sampleAnswer: "Suggest event streams (Kafka).", contextHint: "Data ingestion." },
                { id: "sd-4", question: "What virtualization patterns prevent dependency collision?", sampleAnswer: "Isolate containers.", contextHint: "Docker usage." },
                { id: "sd-5", question: "Describe managing active technical disagreement.", sampleAnswer: "Emphasize objective metrics.", contextHint: "Consensus." }
              ],
              report: {
                overallScore: 84,
                scores: { technicalAccuracy: 86, communication: 82, problemSolving: 88, confidence: 80, clarity: 84 },
                strengths: ["Strong description of event streaming pipelines.", "Excellent caching invalidation awareness."],
                weaknesses: ["Underdefined write-through database synchronization tradeoffs.", "High-level abstractions prior to code specifics."],
                suggestedImprovements: ["Include actual throughput formulas.", "Document Docker multi-stage configurations."],
                personalizedRoadmap: [
                  { phase: "Phase 1: High Latency Reductions", topics: ["Clustered index maps", "Horizontal sharding specs"] }
                ],
              },
            },
          ];
          setHistory(seededHistory);
          localStorage.setItem("interviewai_history", JSON.stringify(seededHistory));
        }
      }
    };
    resumeSession();
  }, []);

  // Sync profile update
  const saveProfileData = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);
  };

  // Auth mock handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.email) {
      setAuthError("Please provide a valid email account.");
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const userProf = await fetchProfile(profile.email);
      if (authMode === "signup") {
        userProf.name = profile.name || userProf.name;
        userProf.joinedDate = new Date().toISOString().split("T")[0];
        await saveProfile(userProf);
      }
      setProfile(userProf);

      const userHist = await fetchHistory(profile.email);
      setHistory(userHist);

      const matchedAchievements = achievements.map(ach => ({
        ...ach,
        isUnlocked: (userProf.unlockedAchievements || []).includes(ach.id),
        unlockedAt: (userProf.unlockedAchievements || []).includes(ach.id) ? (ach.unlockedAt || new Date().toISOString().substring(0, 10)) : undefined
      }));
      setAchievements(matchedAchievements);

      localStorage.setItem("interviewai_logged_in_email", profile.email);
      setIsLoggedIn(true);
      setCurrentPage("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Credential service timed out. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("interviewai_logged_in_email");
    setCurrentPage("landing");
  };

  // Unlocks browser SpeechSynthesis in response to initial user gesture (critical for bypass of Chrome iframe autoplay restrictions)
  const unlockAudioContext = () => {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const silentUtterance = new SpeechSynthesisUtterance(" ");
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn("Speech Synthesis pre-gesture unlock skipped:", e);
      }
    }
  };

  // Text-to-Speech (AI Recruiter Voice synthesizer)
  const speakQuestionText = (text: string) => {
    if (isMuted) return;
    if ("speechSynthesis" in window) {
      try {
        // Vital Chrome/Safari unfreeze patch: cancel and resume synchronously to trigger the engine thread
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        
        setIsAiSpeaking(true);
        setSpokenText(text);
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Attempt to load standard natural English voice
        const voices = window.speechSynthesis.getVoices();
        const standardVoice = voices.find(
          (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Microsoft"))
        ) || voices.find((v) => v.lang.startsWith("en"));
        
        if (standardVoice) {
          utterance.voice = standardVoice;
        }
        utterance.pitch = 1.05;
        utterance.rate = 0.95; // Slightly slower, highly realistic pacing
        
        utterance.onend = () => {
          setIsAiSpeaking(false);
        };
        utterance.onerror = (e) => {
          console.warn("Speech Synthesis speak error:", e);
          setIsAiSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech Synthesis speak routine failed:", err);
        setIsAiSpeaking(false);
      }
    }
  };

  // Helper to read feedback speech followed by next question with precise captions tracking
  const speakFeedbackThenQuestion = (feedbackText: string, nextQuestionText: string) => {
    if (isMuted) return;
    if ("speechSynthesis" in window) {
      try {
        // Vital Chrome unfreeze patch: cancel and resume synchronously
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        
        setIsAiSpeaking(true);
        setSpokenText(feedbackText);

        const voices = window.speechSynthesis.getVoices();
        const standardVoice = voices.find(
          (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Microsoft"))
        ) || voices.find((v) => v.lang.startsWith("en"));

        const feedbackUtterance = new SpeechSynthesisUtterance(feedbackText);
        if (standardVoice) feedbackUtterance.voice = standardVoice;
        feedbackUtterance.pitch = 1.05;
        feedbackUtterance.rate = 0.95;

        feedbackUtterance.onend = () => {
          // Unfreeze queue for next question speak
          if ("speechSynthesis" in window) {
            window.speechSynthesis.resume();
          }
          setSpokenText(nextQuestionText);
          const nextUtterance = new SpeechSynthesisUtterance(nextQuestionText);
          if (standardVoice) nextUtterance.voice = standardVoice;
          nextUtterance.pitch = 1.05;
          nextUtterance.rate = 0.95;

          nextUtterance.onend = () => {
            setIsAiSpeaking(false);
          };
          nextUtterance.onerror = (e) => {
            console.warn("Next question synthesize error:", e);
            setIsAiSpeaking(false);
          };
          window.speechSynthesis.speak(nextUtterance);
        };

        feedbackUtterance.onerror = (e) => {
          console.warn("Feedback synthesize error:", e);
          setIsAiSpeaking(false);
        };

        window.speechSynthesis.speak(feedbackUtterance);
      } catch (err) {
        console.error("Speak feedback process failed:", err);
        setIsAiSpeaking(false);
      }
    }
  };

  // Enable/Disable webcam tracks
  const enableWebcamStream = async () => {
    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false // We use the high level audio for STT separately
      });
      streamRef.current = stream;
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Webcam access declined or unavailable:", err);
      setWebcamError("Webcam not detected. Simulating beautiful virtual feed overlay.");
      setIsWebcamActive(false);
    }
  };

  const disableWebcamStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  // Toggle speech-to-text recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognitionObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionObj) {
      alert("Speech-to-Text Speech Recognition is not natively supported in this browser. Please type your responses or use Google Chrome.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setSpeechError(null);
      setIsListening(true);
      const recognition = new SpeechRecognitionObj();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalSegment = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript;
          }
        }
        if (finalSegment) {
          setCurrentAnswer((prev) => {
            const separator = prev.trim() ? " " : "";
            return prev + separator + finalSegment;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error Event:", event.error);
        if (event.error !== "no-speech") {
          setSpeechError("Speech recognition issue: " + event.error);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  const cleanUpInterviewSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsRecording(false);
    setRecordedSeconds(0);
  };

  // Cleanup effect
  useEffect(() => {
    if (currentPage !== "interview") {
      cleanUpInterviewSession();
    }
  }, [currentPage]);

  // Video feed bindings when webcam state flips
  useEffect(() => {
    if (currentPage === "interview" && isWebcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isWebcamActive, currentPage]);

  // Handle telemetry fluctuations during interview to mimic real biometric assessment
  useEffect(() => {
    let telemetryInterval: any = null;
    let recordingInterval: any = null;

    if (currentPage === "interview") {
      // Fluctuates metrics in normal high professional ranges for the telemetry dashboard
      telemetryInterval = setInterval(() => {
        setTelemetry((prev) => {
          const eyeContactDiff = Math.random() > 0.5 ? 1 : -1;
          const eyeContactNew = Math.min(100, Math.max(88, prev.eyeContact + eyeContactDiff));
          const confidenceDiff = Math.random() > 0.6 ? 1 : -1;
          const confidenceNew = Math.min(99, Math.max(85, prev.confidenceScore + confidenceDiff));
          
          return {
            ...prev,
            eyeContact: eyeContactNew,
            attentionLevel: eyeContactNew > 93 ? "Excellent" : "Focused",
            headMovement: Math.random() > 0.85 ? "Slight adjustment" : "Steady",
            speakingPace: currentAnswer.trim().length > 0 ? "Steady (145 WPM)" : "Waiting for mic...",
            confidenceScore: confidenceNew
          };
        });
      }, 2000);
    }

    if (currentPage === "interview" && isRecording) {
      recordingInterval = setInterval(() => {
        setRecordedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (telemetryInterval) clearInterval(telemetryInterval);
      if (recordingInterval) clearInterval(recordingInterval);
    };
  }, [currentPage, isRecording, currentAnswer]);

  // Step 1: Initialize Interview Questions based on custom parameter keys
  const startMockInterview = async () => {
    unlockAudioContext();
    setLoading(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setEvaluation(null);
    setSelectedHistorySession(null);

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          difficulty: selectedDifficulty,
          interviewType: selectedType,
          resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize session. Check server logs.");
      }

      const questionsList = await response.json();
      setQuestions(questionsList);
      checkApiHealth();

      const welcomeMsg = `Hello ${profile.name || "Engine Candidate"}. Welcome to your Zoom-style mock interview. I am your generative AI recruiter. Let's begin our ${selectedType} validation of ${selectedDifficulty} level skills. The first question is: ${questionsList[0]?.question || "Can you summarize your engineering background and core achievements?"}`;
      
      setLiveTranscripts([
        {
          sender: "AI",
          text: welcomeMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      setCurrentPage("interview");
      enableWebcamStream();

      // Trigger TTS greeting
      setTimeout(() => {
        speakQuestionText(welcomeMsg);
      }, 500);
    } catch (error) {
      console.error("Failed to start mockup:", error);
      alert("Unable to contact the generative assessment engine. Please check system pipelines.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer & Route Next / Evaluate
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert("Please offer a response to proceed.");
      return;
    }
    unlockAudioContext();

    // Cancel any active Speech synthesis and stop STT recognition while loading or moving
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userTranscriptEntry = {
      sender: "Candidate" as const,
      text: currentAnswer,
      timestamp: userTime
    };

    const midTranscripts = [...liveTranscripts, userTranscriptEntry];
    setLiveTranscripts(midTranscripts);
    
    // Backup actual user response then reset field
    const candidateResponse = currentAnswer;
    setCurrentAnswer("");

    // Real-Time Answer Analysis to dynamically evaluate and explain concepts!
    setLoading(true);
    let feedbackSpeech = "";
    try {
      const response = await fetch("/api/interview/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentQuestionIndex]?.question,
          answer: candidateResponse,
          role: selectedRole,
          difficulty: selectedDifficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        feedbackSpeech = data.feedbackSpeech;
      }
      checkApiHealth();
    } catch (err) {
      console.error("Single response analysis failed:", err);
    }
    setLoading(false);

    if (!feedbackSpeech) {
      feedbackSpeech = "Thank you for sharing that approach.";
    }

    // Append AI mentor's speech feedback to Live transcripts
    const aiFeedbackTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const feedbackTranscriptEntry = {
      sender: "AI" as const,
      text: feedbackSpeech,
      timestamp: aiFeedbackTime
    };

    const transcriptWithFeedback = [...midTranscripts, feedbackTranscriptEntry];
    setLiveTranscripts(transcriptWithFeedback);

    if (currentQuestionIndex < 4) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQ = questions[nextIndex]?.question || "Please take your position to describe analytical tradeoffs.";
      
      const nextQTranscriptEntry = {
        sender: "AI" as const,
        text: nextQ,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setLiveTranscripts([...transcriptWithFeedback, nextQTranscriptEntry]);
      setCurrentQuestionIndex(nextIndex);
      
      // Speak feedback, and then follow up with the next question!
      speakFeedbackThenQuestion(feedbackSpeech, nextQ);
    } else {
      // Evaluate Entire Suite
      cleanUpInterviewSession();
      setLoading(true);
      
      // Speak final feedback explanation
      speakQuestionText(feedbackSpeech + " Excellent. We have completed all of our questions today. Let me compile and deliver your final evaluation diagnostics report.");

      try {
        const response = await fetch("/api/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: selectedRole,
            difficulty: selectedDifficulty,
            interviewType: selectedType,
            questions,
            answers: updatedAnswers,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to evaluate. Try re-triggering request.");
        }

        const report: EvaluationReport = await response.json();
        setEvaluation(report);
        checkApiHealth();

        // A. Create final saved session
        const newSession: SavedSession = {
          id: `sess-${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          role: selectedRole,
          difficulty: selectedDifficulty,
          type: selectedType,
          score: report.overallScore,
          questionsCount: 5,
          userAnswers: updatedAnswers,
          rawQuestions: questions,
          report,
        };

        const updatedHistory = [newSession, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("interviewai_history", JSON.stringify(updatedHistory));
        await saveSession(profile.email, newSession);

        // B. Re-calculate metrics on profile
        const scoreSum = updatedHistory.reduce((acc, curr) => acc + curr.score, 0);
        const avgScore = Math.round(scoreSum / updatedHistory.length);
        const maxScore = Math.max(...updatedHistory.map((s) => s.score));

        // C. Check unlocked Achievements
        const newlyUnlocked: string[] = [...(profile?.unlockedAchievements || [])];
        const achievementsCopy = achievements.map((ach) => {
          if (ach.id === "c-1" && report.scores.technicalAccuracy > 85 && !achlyUnlocked(ach.id)) {
            newlyUnlocked.push(ach.id);
            return { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString().substring(0, 10) };
          }
          if (ach.id === "c-2" && report.scores.communication > 90 && !achlyUnlocked(ach.id)) {
            newlyUnlocked.push(ach.id);
            return { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString().substring(0, 10) };
          }
          if (ach.id === "c-3" && selectedDifficulty === InterviewDifficulty.SENIOR && !achlyUnlocked(ach.id)) {
            newlyUnlocked.push(ach.id);
            return { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString().substring(0, 10) };
          }
          return ach;
        });

        function achlyUnlocked(id: string) {
          return newlyUnlocked.includes(id);
        }

        setAchievements(achievementsCopy);
        localStorage.setItem("interviewai_achievements", JSON.stringify(achievementsCopy));

        const updatedProfile: UserProfile = {
          ...profile,
          totalInterviews: updatedHistory.length,
          averageScore: avgScore,
          bestScore: maxScore,
          unlockedAchievements: newlyUnlocked,
        };
        saveProfileData(updatedProfile);

        setCurrentPage("results");
      } catch (err: any) {
        console.error("Analytical evaluation error:", err);
        alert("Verification API issue. Presenting detailed mock feedback stats.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Simulated PDF Downloader
  const downloadSimulatedReport = (sess: SavedSession) => {
    const reportTxt = `=========================================
INTERVIEWAIPROP - EXCELLENCE STUDY FEEDBACK REPORT
=========================================
Date: ${sess.date}
Candidate Node: ${profile.email}
Target Role: ${sess.role} (Difficulty: ${sess.difficulty})
Interview Format: ${sess.type}
Overall Evaluation score: ${sess.report.overallScore}%

PERFORMANCE METRIC SCOREBOARD:
- Technical Accuracy: ${sess.report.scores.technicalAccuracy}%
- Communication Flow: ${sess.report.scores.communication}%
- Problem Solving Logic: ${sess.report.scores.problemSolving}%
- Response Assertiveness: ${sess.report.scores.confidence}%
- Articulation Clarity: ${sess.report.scores.clarity}%

KEY CORE STRENGTHS HIGHLIGHTS:
${sess.report.strengths.map((s) => `• ${s}`).join("\n")}

CRITICAL DEVELOPMENT AREAS / WEAKNESSES:
${sess.report.weaknesses.map((w) => `• ${w}`).join("\n")}

PRACTICAL IMPROVEMENTS PATHS:
${sess.report.suggestedImprovements.map((i) => `• ${i}`).join("\n")}

TAILORED ROADMAP STAGES:
${sess.report.personalizedRoadmap
  .map((p) => `\n[${p.phase}]\nTopics to cover:\n${p.topics.map((t) => `  - ${t}`).join("\n")}`)
  .join("\n")}

=========================================
GENERATED SECURELY BY INTERRUPTAI CORE SERVICES.
`;

    const blob = new Blob([reportTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interviewai_report_${sess.role.replace(/\s+/g, "_")}_${sess.date}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper unlocked badge renderer
  const isBadgeUnlocked = (badgeId: string) => {
    return (profile?.unlockedAchievements || []).includes(badgeId);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-12 selection:bg-[#10B981]/30 selection:text-white">
      {/* Universal Top Header */}
      <header className="sticky top-0 z-50 border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setCurrentPage("landing")}>
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-[#0a0a0a]" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              InterviewAI
            </span>
          </div>

          {/* Navigation Items: Dashboard, Interviews, Progress, Profile */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A1A1AA]">
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setCurrentPage("dashboard");
                } else {
                  alert("Please sign in or start a guest session first.");
                }
              }} 
              className={`hover:text-white transition-colors cursor-pointer ${
                currentPage === "dashboard" ? "text-white font-bold" : ""
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setCurrentPage("setup");
                } else {
                  setCurrentPage("landing");
                }
              }} 
              className={`hover:text-white transition-colors cursor-pointer ${
                currentPage === "setup" || currentPage === "interview" ? "text-white font-bold" : ""
              }`}
            >
              Interviews
            </button>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setCurrentPage("dashboard");
                  setTimeout(() => {
                    const el = document.getElementById("analytics-charts-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                } else {
                  alert("Please sign in or start practicing to view progress.");
                }
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Progress
            </button>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Profile
            </button>
          </nav>

          {/* Right Area: Minimal Guest profile */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer select-none group"
              onClick={() => setIsProfileOpen(true)}
            >
              <div className="w-8 h-8 rounded-full bg-[#222222] border border-[#333333] group-hover:border-[#10B981] text-white flex items-center justify-center font-bold text-xs transition-colors">
                {profile.name ? profile.name[0].toUpperCase() : "G"}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#A1A1AA] group-hover:text-white transition-colors">
                {profile.name || "Guest Candidate"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Screen Router layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">

        {apiStatus === "quota_exceeded" && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/35 rounded-xl text-amber-200 text-xs leading-relaxed flex items-start gap-3 shadow-md shadow-amber-500/5 animate-fade-in text-left">
            <span className="text-xs select-none">🚨</span>
            <div className="flex-1">
              <strong className="font-semibold block text-amber-300 mb-0.5">Gemini API Quota Limit Exceeded (Free Tier Daily Cap)</strong>
              The system's shared Gemini API has exceeded its daily free-tier quota. No action is required on your part! We have automatically activated **Resilient Fallback Mode** so you can continue your mock interviews, submit answers, and receive detailed career roadmaps completely uninterrupted.
            </div>
          </div>
        )}

        {apiStatus === "no_key" && (
          <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/35 rounded-xl text-cyan-200 text-xs leading-relaxed flex items-start gap-3 shadow-md shadow-cyan-500/5 animate-fade-in text-left">
            <span className="text-xs select-none">💡</span>
            <div className="flex-1">
              <strong className="font-semibold block text-cyan-300 mb-0.5">Mock Simulation Mode Active</strong>
              No `GEMINI_API_KEY` was detected in the environment config. We have automatically activated the core dynamic **Practice Simulation Mode**, allowing you to fully practice mock sessions, record your transcripts, and view key analytical feedback roadmaps smoothly!
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. SaaS LANDING PAGE VIEW (MINIMIZED GATEWAY CONTROL PANEL) */}
        {/* ========================================================= */}
        {currentPage === "landing" && (
          <div id="landing-page-block" className="max-w-4xl mx-auto py-10 space-y-12 animate-fade-in text-center">
            
            {/* Elegant Minimalist Hero Block */}
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                Your professional interview partner.
              </h1>
              <p className="text-base text-[#A1A1AA] leading-relaxed max-w-xl mx-auto">
                Improve your readiness with structured mock practices and clear, direct, actionable feedback.
              </p>
            </div>

            {/* Clean Authorization and Practice Panels */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch text-left">
              
              {/* Account Authorization Card */}
              <div className="md:col-span-7 bg-[#111111] border border-[#222222] p-8 rounded-2xl flex flex-col justify-between space-y-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {authMode === "login" ? "Sign In" : "Create Account"}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setAuthError(null);
                        }}
                        className={`text-[10.5px] font-bold px-2.5 py-1 rounded transition-all ${
                          authMode === "login"
                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25"
                            : "text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signup");
                          setAuthError(null);
                        }}
                        className={`text-[10.5px] font-bold px-2.5 py-1 rounded transition-all ${
                          authMode === "signup"
                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25"
                            : "text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === "signup" && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#A1A1AA] block">
                          Full Professional Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lead Software Engineer"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full text-xs text-white bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] transition-colors"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] block">
                        Professional Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="engineer@careerhub.com"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full text-xs text-white bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] block">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        defaultValue="temporary-sandbox-mode"
                        className="w-full text-xs text-white bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] transition-colors"
                      />
                    </div>

                    {authError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs text-rose-400 leading-normal font-medium">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#10B981] hover:bg-[#059669] text-[#0a0a0a] font-bold rounded-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Entering Workspace...
                        </>
                      ) : authMode === "login" ? (
                        "Open Assessment Board"
                      ) : (
                        "Create Account & Launch"
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Direct Sandbox Access Card */}
              <div className="md:col-span-5 bg-[#111111]/60 border border-[#222222] p-8 rounded-2xl flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-4">
                  <div className="w-8 h-8 rounded-lg bg-[#222222] flex items-center justify-center">
                    <User className="text-[#10B981] w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Quick Guest Practice
                    </h4>
                    <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                      Begin an instant practice session immediately. Your data and completed evaluations will be stored securely in local browser storage.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const guestEmail = "guest_sandbox@interviewai.io";
                        const userProf = await fetchProfile(guestEmail);
                        userProf.name = "Guest Candidate";
                        setProfile(userProf);
                        const userHist = await fetchHistory(guestEmail);
                        setHistory(userHist);
                        localStorage.setItem("interviewai_logged_in_email", guestEmail);
                        setIsLoggedIn(true);
                        setCurrentPage("dashboard");
                      } catch (err) {
                        console.error("Guest flow failed", err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full border border-[#222222] hover:border-[#333333] bg-[#0a0a0a] text-white font-semibold p-3.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Launch Guest Session
                  </button>
                </div>

                <div className="p-4 bg-[#222222]/30 rounded-xl border border-[#222222] space-y-1">
                  <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">
                    Structured Review
                  </span>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                    Personalized learning maps, detailed scorecards, and grammar insights are calculated instantly upon each completion.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. AUTHENTICATION SCREENS (REDIRECT TO WORKSPACE GATEWAY) */}
        {/* ========================================================= */}
        {currentPage === "auth" && (
          <div className="text-center py-12 max-w-sm mx-auto animate-pulse">
            <p className="text-sm font-sans text-text-muted">Redirecting to Workspace Gateway Access Portal...</p>
            <button
              onClick={() => setCurrentPage("landing")}
              className="mt-4 px-4 py-2 bg-accent-emerald text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer"
            >
              Go to Secure Gateway
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. CORE ANALYTICS PORTFOLIO DASHBOARD */}
        {/* ========================================================= */}
        {currentPage === "dashboard" && (
          <div id="analytics-dashboard-workspace" className="space-y-8">
            {/* Greeting summary widget */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#222222]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Interview Dashboard</h1>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Manage active interview setups, inspect your evaluation history, and track metrics over time.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage("setup")}
                className="flex items-center gap-1.5 px-6 py-3.5 bg-[#10B981] hover:bg-[#059669] text-xs font-bold rounded-lg text-[#0a0a0a] transition-all cursor-pointer font-sans"
              >
                <Play className="w-3.5 h-3.5 fill-[#0a0a0a]" />
                Start Your Interview
              </button>
            </div>

            {/* Microstats aggregators */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Total Mock Sessions</span>
                <span className="text-2xl font-black text-white mt-1 font-mono">{profile.totalInterviews}</span>
              </div>
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Average Score</span>
                <span className="text-2xl font-black text-[#10B981] mt-1 font-mono">{profile.averageScore}%</span>
              </div>
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Top Score</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 font-mono">{profile.bestScore}%</span>
              </div>
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Strongest Area</span>
                <span className="text-xs font-bold text-slate-200 mt-2 truncate text-ellipsis">{profile.strongestSkill}</span>
              </div>
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex flex-col justify-between col-span-2 md:col-span-1">
                <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Weakest Area</span>
                <span className="text-xs font-bold text-slate-200 mt-2 truncate text-ellipsis">{profile.weakestSkill}</span>
              </div>
            </div>

            {/* Double Column Charts: Radar + Sparkline Progression */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 flex flex-col justify-between">
                <div className="bg-[#111111] p-4 rounded-2xl border border-[#222222] flex-1 flex flex-col h-full justify-between gap-2">
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Performance Parameters</h4>
                    <p className="text-[10.5px] text-[#A1A1AA] leading-normal mt-0.5">Interactive index of aggregate mock scorecard measurements.</p>
                  </div>
                  <MetricRadarChart
                    scores={
                      history.length > 0
                        ? history[0].report.scores
                        : { technicalAccuracy: 80, communication: 75, problemSolving: 85, confidence: 70, clarity: 75 }
                    }
                    size={280}
                  />
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col">
                <div className="flex-1">
                  <WeeklyTrendChart history={history} />
                </div>
              </div>
            </div>

            {/* Badges, Milestones achievements grid */}
            <div className="p-6 bg-card-dark/30 border border-border-dark rounded-3xl space-y-6">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-400 w-5.5 h-5.5" />
                <div>
                  <h3 className="text-md font-bold text-white">Unlocked Engineer Badges & Milestones</h3>
                  <p className="text-[10.5px] text-text-muted">Unlock custom achievement titles based on evaluation scores!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {achievements.map((ach) => {
                  const unlocked = isBadgeUnlocked(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                        unlocked
                          ? "bg-accent-emerald/5 border-accent-emerald/20 shadow-md shadow-accent-emerald/5 scale-100"
                          : "bg-bg-dark/40 border-border-dark opacity-40 grayscale"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-2 ${
                        unlocked ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" : "bg-zinc-900 border-border-dark text-text-muted"
                      }`}>
                        {ach.iconName === "Layers" && <Layers className="w-4.5 h-4.5" />}
                        {ach.iconName === "UserCheck" && <UserCheck className="w-4.5 h-4.5" />}
                        {ach.iconName === "Brain" && <Brain className="w-4.5 h-4.5" />}
                        {ach.iconName === "Award" && <Award className="w-4.5 h-4.5" />}
                        {ach.iconName === "Clock" && <Clock className="w-4.5 h-4.5" />}
                      </div>
                      <span className="text-xs font-bold text-white leading-tight">{ach.title}</span>
                      <p className="text-[9px] text-text-muted mt-1 leading-normal">{ach.description}</p>
                      {unlocked && (
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2 border border-emerald-500/20">
                          Unlocked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dual Sections: Session logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Historical logs */}
              <div className="lg:col-span-12 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4.5 h-4.5 text-accent-emerald" />
                    Historic Interview Sessions
                  </h3>
                  <span className="text-xs text-text-muted font-mono">Count: {history.length}</span>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 bg-card-dark/30 border border-border-dark rounded-3xl space-y-2">
                    <p className="text-xs text-text-muted">No past interview sessions recorded.</p>
                    <button onClick={() => setCurrentPage("setup")} className="text-xs text-accent-emerald font-semibold hover:underline cursor-pointer">
                      Initiate questions now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-5 bg-card-dark/40 hover:bg-card-dark/60 border border-border-dark rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5 flex-1 select-none">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sess.role}</span>
                            <span className="text-[9px] font-mono bg-zinc-800 border border-border-dark text-slate-300 px-2 py-0.5 rounded">
                              {sess.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-text-muted font-sans">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-text-muted" /> {sess.type}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-text-muted" /> {sess.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-text-muted font-mono tracking-wider">Evaluation Score</span>
                            <p className="text-lg font-black text-accent-emerald font-mono">{sess.score}%</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedHistorySession(sess);
                              setEvaluation(sess.report);
                              setCurrentPage("results");
                            }}
                            className="bg-zinc-900 hover:bg-zinc-800 text-xs text-white font-semibold px-4 py-2.5 rounded-xl border border-border-dark transition-all cursor-pointer"
                          >
                            Read Full Feedback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. SETUP WORKSPACE SCREEN (STEP 1 INTERRUPT FLOW) */}
        {/* ========================================================= */}
        {currentPage === "setup" && (
          <div id="interview-setup-block" className="space-y-8 py-4">
            <div className="space-y-1 text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-sans">Practice Setup</h2>
              <p className="text-xs text-[#A1A1AA] leading-normal">
                Configure your target role and parameters to begin a realistic practice simulation tailored to your career focus.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Setup Configuration Form */}
              <div className="lg:col-span-7 bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category selections */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white font-sans">Target Position</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as InterviewCategory)}
                      className="w-full text-xs font-sans text-slate-200 bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] transition-colors"
                    >
                      {Object.values(InterviewCategory).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white font-sans">Difficulty Level</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as InterviewDifficulty)}
                      className="w-full text-xs font-sans text-slate-200 bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] transition-colors"
                    >
                      {Object.values(InterviewDifficulty).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Interview Focus Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white font-sans">Interview Format</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as InterviewType)}
                      className="w-full text-xs font-sans text-slate-200 bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 focus:outline-none focus:border-[#10B981] transition-colors"
                    >
                      {Object.values(InterviewType).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quick summary metadata indicator */}
                  <div className="space-y-1.5 select-none">
                    <label className="text-xs font-semibold text-[#A1A1AA] font-sans">Session Scope</label>
                    <div className="bg-[#0a0a0a] p-3 border border-[#222222] rounded-lg space-y-1 font-sans">
                      <p className="text-[10px] text-[#A1A1AA]">Total Rounds: <strong className="text-white">5 Questions</strong></p>
                      <p className="text-[10px] text-[#A1A1AA]">Evaluation: <strong className="text-[#10B981]">Detailed Performance Metrics</strong></p>
                    </div>
                  </div>
                </div>

                {/* Job Description Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white font-sans">Job Description (Optional)</label>
                    <span className="text-[10px] text-[#A1A1AA]">Max 2000 characters</span>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste specific job requirements or responsibilities to customize the questions to that standard..."
                    rows={4}
                    maxLength={2000}
                    className="w-full text-xs font-sans text-white bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>

                {/* Actions submit block */}
                <div className="pt-4 border-t border-[#222222]">
                  <button
                    onClick={startMockInterview}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-[#10B981] hover:bg-[#059669] text-[#0a0a0a] font-bold rounded-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating practice questions...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-[#0a0a0a] text-[#0a0a0a]" />
                        Start Interview
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Resume Parser Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <ResumeUploader
                  onParsed={(text, pData) => {
                    setResumeText(text);
                    setResumeName(pData.detectedRole + "_profile.txt");
                  }}
                  savedResumeText={resumeText}
                  savedResumeName={resumeName}
                  onClear={() => {
                    setResumeText("");
                    setResumeName("");
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. ACTIVE INTERVIEW CHAT BOARDROOM */}
        {/* ========================================================= */}
        {currentPage === "interview" && (
          <div id="interactive-interview-board" className="max-w-7xl mx-auto py-2 space-y-8 animate-fade-in text-left">
            
            {/* Header row: Question Progress indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">Practice Interview</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#A1A1AA]">
                  <span>{selectedRole}</span>
                  <span>•</span>
                  <span>{selectedDifficulty}</span>
                  <span>•</span>
                  <span className="font-mono text-white bg-[#222222] px-2 py-0.5 rounded">
                    Question {currentQuestionIndex + 1} of {questions.length || 5}
                  </span>
                </div>
              </div>

              {/* Minimalist timer */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] bg-[#111111] border border-[#222222] px-4 py-2 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>
                  {Math.floor(recordedSeconds / 60).toString().padStart(2, "0")}:{(recordedSeconds % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT/MAIN COLUMN (8/12 width): Interviewer Panel & Your Response */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Large Clean INTERVIEWER PANEL */}
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                      Interviewer
                    </span>
                    {/* Minimal spoken audio waves when speaking */}
                    <div className="flex items-center gap-1 h-4 select-none">
                      {[1, 2, 3, 2, 1].map((v, i) => (
                        <span
                          key={i}
                          style={{ height: isAiSpeaking ? `${v * 4}px` : "3px" }}
                          className={`w-0.75 rounded-full transition-all duration-300 ${
                            isAiSpeaking ? "bg-[#10B981]" : "bg-[#333333]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Clean display of the actual question */}
                  <div className="min-h-[100px] flex items-center">
                    <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                      {questions[currentQuestionIndex]?.question || "Hello! Ready to begin? Click 'Start Interview' or answer to proceed."}
                    </p>
                  </div>

                  {/* Replay voice trigger */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        unlockAudioContext();
                        speakQuestionText(questions[currentQuestionIndex]?.question || "Please provide your background summary description.");
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isAiSpeaking ? "animate-spin" : ""}`} />
                      Replay Question
                    </button>
                  </div>
                </div>

                {/* 2. YOUR RESPONSE SECTION */}
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                      Your Response
                    </span>
                    {isListening && (
                      <span className="flex items-center gap-1.5 text-[10px] text-[#10B981] font-mono">
                        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping"></span>
                        Transcribing...
                      </span>
                    )}
                  </div>

                  {/* Response Input textarea */}
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Speak your response clearly or type your answer here."
                    rows={5}
                    disabled={loading}
                    className="w-full text-sm text-white bg-[#0a0a0a] border border-[#222222] rounded-xl p-5 focus:outline-none focus:border-[#10B981] transition-colors placeholder:text-[#555] leading-relaxed resize-none"
                  />

                  {/* Quick Demo Assist */}
                  <button
                    onClick={() => {
                      setCurrentAnswer("In my core engineering flow, I prioritize building robust structures. To analyze deep bottlenecks of complex code bases, I configure explicit tracing pipelines, trace performance metrics under dynamic loops, and construct modular interface separations. By establishing clear targets and running decoupled regression checks, I ensure consistent alignments without disturbing existing workflows.");
                    }}
                    disabled={loading}
                    className="text-[10px] text-[#10B981] hover:underline block mt-1"
                  >
                    💡 Demo: Auto-fill response
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN (4/12 width): Webcam, Controls & Active Dialog Tracker */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. MODERN WEBCAM CARD */}
                <div className="relative aspect-video bg-[#0a0a0a] border border-[#222222] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between p-4 min-h-[220px]">
                  {isWebcamActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
                    />
                  )}

                  {!isWebcamActive && (
                    <div className="absolute inset-0 bg-[#111111] flex flex-col items-center justify-center pointer-events-none select-none z-0">
                      <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-[#2d2d2d] flex items-center justify-center">
                        <User className="w-5 h-5 text-[#A1A1AA]" />
                      </div>
                      <p className="text-xs font-semibold text-white mt-2.5">{profile.name || "Guest Candidate"}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5 font-mono">Camera feed is off</p>
                    </div>
                  )}

                  {/* Camera overlays: minimal "Live" dot & transparent Answer Now button */}
                  <div className="z-10 flex items-center justify-between select-none w-full gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white bg-[#0a0a0a]/80 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-md">
                      <span className={`w-1.5 h-1.5 rounded-full ${isWebcamActive ? "bg-red-500 animate-pulse" : "bg-zinc-500"}`}></span>
                      {isWebcamActive ? "Live Preview" : "Camera Off"}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        unlockAudioContext();
                        toggleSpeechRecognition();
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight transition-all border cursor-pointer ${
                        isListening
                          ? "bg-rose-500/20 border-rose-500/45 text-rose-400 animate-pulse"
                          : "bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] border-white/10 hover:border-white/20 text-[#10B981]"
                      }`}
                    >
                      <Mic className={`w-3 h-3 ${isListening ? "text-rose-400 animate-pulse" : "text-[#10B981]"}`} />
                      {isListening ? "Listening..." : "Answer Now"}
                    </button>
                  </div>

                  {/* Control Buttons Overlay */}
                  <div className="z-10 flex items-center justify-center gap-2 w-full pt-12">
                    
                    {/* Microphone Toggle (Mute / Unmute) */}
                    <button
                      type="button"
                      onClick={() => {
                        unlockAudioContext();
                        toggleSpeechRecognition();
                      }}
                      title={isListening ? "Mute" : "Unmute"}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#111111] border border-[#222222] text-white hover:scale-105 active:scale-95 cursor-pointer`}
                    >
                      {isListening ? <MicOff className="w-4 h-4 text-rose-500 animate-pulse" /> : <Mic className="w-4 h-4 text-[#10B981]" />}
                    </button>

                    {/* Camera toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isWebcamActive) {
                          disableWebcamStream();
                        } else {
                          enableWebcamStream();
                        }
                      }}
                      title={isWebcamActive ? "Turn Camera Off" : "Turn Camera On"}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#111111] border border-[#222222] text-white hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {isWebcamActive ? <Video className="w-4 h-4 text-[#10B981]" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Small visible helper button just below the webcam */}
                <div className="flex items-center justify-between bg-[#111111]/80 border border-[#222222] p-2.5 rounded-xl shadow-inner">
                  <span className="text-[10px] text-[#A1A1AA] font-semibold tracking-wide">🎙️ Mic Readiness Mode</span>
                  <button
                    type="button"
                    onClick={() => {
                      unlockAudioContext();
                      toggleSpeechRecognition();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded cursor-pointer border transition-all ${
                      isListening
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse"
                        : "bg-[#0a0a0a] hover:bg-black border-[#222222] hover:border-[#333333] text-[#10B981]"
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                    {isListening ? "Listening..." : "Answer Now"}
                  </button>
                </div>

                {/* 2. LIVE DIALOG PANEL */}
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 flex flex-col h-[280px]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-4 block">
                    Dialogue History
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {liveTranscripts.length === 0 ? (
                      <p className="text-xs text-[#A1A1AA] italic text-center py-10">Starting session... Speak or wait for the interviewer.</p>
                    ) : (
                      liveTranscripts.map((entry, idx) => {
                        const isCandidate = entry.sender === "Candidate";
                        return (
                          <div key={idx} className="text-xs leading-relaxed text-left">
                            <p>
                              <strong className={isCandidate ? "text-[#10B981]" : "text-white"}>
                                {isCandidate ? "You" : "Interviewer"}:
                              </strong>{" "}
                              <span className="text-[#A1A1AA]">{entry.text}</span>
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* LOWER INTERACTION CONTROL BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-8 border-t border-[#222222] w-full">
              
              {/* Left Side: End/Cancel button */}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to end this interview session prematurely? Your partial progress will be evaluated.")) {
                    submitAnswer();
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-semibold text-xs rounded-lg transition-all cursor-pointer bg-transparent"
              >
                <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                End Interview
              </button>

              {/* Right Side: Primary Answer Toggle State & Submission */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Sleek Answer Toggle Button acting as Speech trigger */}
                <button
                  type="button"
                  onClick={() => {
                    unlockAudioContext();
                    toggleSpeechRecognition();
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                    isListening
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse"
                      : "bg-[#111111] border-[#222222] text-white hover:border-[#333333]"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isListening ? "Transcribing Now..." : "Answer with Mic"}
                </button>

                {/* Next Question / Finish Action button */}
                <button
                  onClick={submitAnswer}
                  disabled={loading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/50 text-[#0a0a0a] disabled:text-[#0a0a0a]/80 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Evaluating response...
                    </>
                  ) : (
                    <>
                      {currentQuestionIndex < 4 ? (
                        <>
                          Next Question <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Finish & Submit
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 6. EVALUATION SCORES & RESULTS SHEET */}
        {/* ========================================================= */}
        {currentPage === "results" && (
          <div id="results-analytics-sheet" className="space-y-8 py-4">
            {/* Performance summaries header banner */}
            {(() => {
              const activeSess = selectedHistorySession || {
                role: selectedRole,
                difficulty: selectedDifficulty,
                type: selectedType,
                date: new Date().toISOString().substring(0, 10),
                score: evaluation?.overallScore || 80,
                report: evaluation,
              };

              const r = activeSess.report;
              if (!r) return null;

              return (
                <>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border-dark select-none">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2.5 py-0.5 rounded-md font-mono">
                        Session Scorecard Completed
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white font-sans mt-1">Detailed Evaluation & Learning Roadmap</h2>
                      <p className="text-xs text-text-muted mt-1">
                        Mock results for {activeSess.role} (Difficulty Curve: {activeSess.difficulty}) • Format: {activeSess.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => downloadSimulatedReport(activeSess as SavedSession)}
                        className="flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-border-dark text-xs font-bold rounded-xl text-slate-300 transition-colors cursor-pointer"
                      >
                        <ArrowDownToLine className="w-4 h-4 text-accent-emerald" />
                        Download PDF Report
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHistorySession(null);
                          setEvaluation(null);
                          setCurrentPage("dashboard");
                        }}
                        className="flex items-center gap-1.5 px-4.5 py-2.5 bg-accent-emerald hover:bg-accent-emerald-hover text-zinc-950 text-xs font-black rounded-xl transition-colors cursor-pointer shadow-md shadow-accent-emerald/10"
                      >
                        Return Dashboard Console
                      </button>
                    </div>
                  </div>

                  {/* Score breakdown metrics grids */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Overall score breakdown quadrant */}
                    <div className="md:col-span-4 p-6 bg-card-dark/60 border border-border-dark rounded-3xl space-y-6 flex flex-col items-center justify-center text-center">
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase font-extrabold text-text-muted font-mono tracking-wider">Overall Score</span>
                        <div className="relative flex items-center justify-center pt-2">
                          <svg width="140" height="140" className="rotate-[-90deg]">
                            <circle cx="70" cy="70" r="58" fill="transparent" stroke="rgba(39, 39, 42, 0.5)" strokeWidth="12" />
                            <circle
                              cx="70"
                              cy="70"
                              r="58"
                              fill="transparent"
                              stroke="#10b981"
                              strokeWidth="12"
                              strokeDasharray={`${2 * Math.PI * 58}`}
                              strokeDashoffset={`${2 * Math.PI * 58 * (1 - activeSess.score / 100)}`}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-3xl font-black text-white font-mono">{activeSess.score}%</span>
                        </div>
                      </div>

                      <div className="space-y-3 w-full border-t border-border-dark pt-4 text-xs">
                        <div className="flex justify-between items-center text-text-muted">
                          <span>Technical Accuracy:</span>
                          <strong className="text-white font-mono">{r.scores.technicalAccuracy}%</strong>
                        </div>
                        <div className="flex justify-between items-center text-text-muted">
                          <span>Communication Matrix:</span>
                          <strong className="text-white font-mono">{r.scores.communication}%</strong>
                        </div>
                        <div className="flex justify-between items-center text-text-muted">
                          <span>Problem Solving Tradeoffs:</span>
                          <strong className="text-white font-mono">{r.scores.problemSolving}%</strong>
                        </div>
                        <div className="flex justify-between items-center text-text-muted text-ellipsis truncate">
                          <span>Assertiveness & Confidence:</span>
                          <strong className="text-white font-mono">{r.scores.confidence}%</strong>
                        </div>
                        <div className="flex justify-between items-center text-text-muted">
                          <span>Articulation Clarity:</span>
                          <strong className="text-white font-mono">{r.scores.clarity}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & weaknesses details listings */}
                    <div className="md:col-span-8 space-y-6">
                      {/* Grid listing Strengths vs Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Strengths Card */}
                        <div className="p-6 bg-card-dark/40 border border-border-dark rounded-3xl space-y-4">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 select-none font-mono">
                            <Check className="w-4 h-4 text-emerald-400" /> Key Architectural Strengths
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-3 pl-4 list-disc leading-relaxed font-sans">
                            {r.strengths.map((str, i) => <li key={i}>{str}</li>)}
                          </ul>
                        </div>

                        {/* Development Weaknesses Card */}
                        <div className="p-6 bg-card-dark/40 border border-border-dark rounded-3xl space-y-4">
                          <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5 select-none font-mono">
                            <span className="text-rose-400">●</span> Gaps & Weaknesses Detected
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-3 pl-4 list-disc leading-relaxed font-sans">
                            {r.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* Suggested actionable improvements listings */}
                      <div className="p-6 bg-card-dark/50 border border-border-dark rounded-3xl space-y-4">
                        <h4 className="text-xs font-black uppercase text-text-muted tracking-wider select-none font-mono">
                          Actionable Suggested Improvements Checklist
                        </h4>
                        <div className="space-y-3.5 pt-2 font-sans">
                          {r.suggestedImprovements.map((imp, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="w-5 h-5 rounded-md bg-accent-emerald/10 border border-accent-emerald/25 flex items-center justify-center text-[10px] text-accent-emerald font-mono flex-shrink-0 mt-0.5 font-bold">
                                {i + 1}
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">{imp}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tailored study plans phases */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-accent-emerald tracking-wider font-mono">
                          Personalized Learning Curriculum
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                          {r.personalizedRoadmap.map((p, idx) => (
                            <div key={idx} className="p-5 bg-gradient-to-br from-bg-dark to-card-dark border border-border-dark rounded-2xl space-y-3">
                              <span className="text-[10px] uppercase font-bold text-accent-emerald tracking-wide bg-accent-emerald/10 border border-accent-emerald/25 px-2.5 py-0.5 rounded-full font-mono">
                                Phase {idx + 1}
                              </span>
                              <h5 className="text-xs font-extrabold text-white">{p.phase}</h5>
                              <ul className="text-[11px] text-text-muted space-y-2 pl-4 list-disc leading-relaxed">
                                {p.topics.map((t, index) => <li key={index}>{t}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 📚 Detailed Question-by-Question Learning Board */}
                  {(() => {
                    // Fallback to auto-generated evaluations if questionEvaluations is not present
                    const evaluationsToRender = r.questionEvaluations || (activeSess.rawQuestions || []).map((q, i) => {
                      const ans = (activeSess.userAnswers && activeSess.userAnswers[i]) || "[No response provided or skipped]";
                      const hasDraft = ans.trim().length > 10;
                      return {
                        questionId: q.id || `q-${i}`,
                        questionText: q.question || "Practice question content",
                        userAnswer: ans,
                        evaluation: hasDraft ? "Partially Correct" : "Incorrect/Weak",
                        whatWasMissing: hasDraft 
                          ? "The response provides a standard high-level overview but lacks structured details, exact target outcomes, and explicit trade-off analyses." 
                          : "This response was skipped or too brief. A complete answer requires explaining structured target steps, concrete tradeoffs, and key metrics.",
                        correctAnswer: q.sampleAnswer || "The correct approach involves identifying the key target parameters, outlining systematic logic paths, comparing tradeoffs, and confirming with concrete data/results.",
                        betterInterviewAnswer: "In my training and mock sessions, I approach this directly by partitioning the solution into structured stages. First, I identify core constraints explicitly. Next, I weigh alternative decisions systematically to keep resources balanced. Finally, I confirm achievements with distinct metrics to guarantee consistent performance.",
                        keyConcepts: ["Structured Communication", "Trade-off Assessment", "Decision Matrices", "Result Verification"]
                      };
                    });

                    return (
                      <div className="space-y-6 pt-10 border-t border-border-dark mt-10">
                        <div className="text-left space-y-1 select-none">
                          <h4 className="text-xs font-black uppercase text-accent-emerald tracking-wider font-mono flex items-center gap-2">
                            <span>📚</span> Individual Question Feedback & Educational Tracker
                          </h4>
                          <p className="text-[11px] text-text-muted leading-relaxed font-sans max-w-2xl">
                            Each question from your interview session has been thoroughly parsed. Read the comprehensive critique of your drafts, study the correct target content, and practice the suggested professional phrasings.
                          </p>
                        </div>

                        <div className="space-y-6">
                          {evaluationsToRender.map((evalItem, idx) => {
                            const isCorrect = evalItem.evaluation && evalItem.evaluation.toLowerCase().includes("correct") && !evalItem.evaluation.toLowerCase().includes("partially") && !evalItem.evaluation.toLowerCase().includes("incorrect");
                            const isPartially = evalItem.evaluation && evalItem.evaluation.toLowerCase().includes("partially");
                            
                            return (
                              <div key={idx} className="bg-card-dark/30 border border-border-dark rounded-3xl p-6 md:p-8 space-y-6 text-left transition-all hover:bg-card-dark/45">
                                {/* Header section with Question and Badge status */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border-dark pb-4.5">
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] font-mono text-accent-emerald font-bold uppercase tracking-wider bg-accent-emerald/5 border border-accent-emerald/15 px-2.5 py-0.5 rounded-md inline-block">
                                      Question #{idx + 1}
                                    </span>
                                    <h5 className="text-sm font-extrabold text-white font-sans leading-snug">{evalItem.questionText}</h5>
                                  </div>
                                  <span className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wide border flex-shrink-0 text-center ${
                                    isCorrect 
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                      : isPartially
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  }`}>
                                    {(evalItem.evaluation || "").toUpperCase()}
                                  </span>
                                </div>

                                {/* Answers and Corrective Feedback Grid */}
                                <div className="space-y-5.5 text-xs font-sans">
                                  {/* 1. User Answer */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] uppercase font-mono tracking-wider text-text-muted font-bold block">1. User Answer</span>
                                    <div className="bg-zinc-950 p-4 rounded-2xl text-slate-330 font-mono text-[11px] border border-zinc-900 leading-relaxed italic">
                                      "{evalItem.userAnswer}"
                                    </div>
                                  </div>

                                  {/* 2. Evaluation */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] uppercase font-mono tracking-wider text-text-muted font-bold block">2. Evaluation</span>
                                    <div className="text-slate-200 text-xs font-bold font-sans">
                                      {evalItem.evaluation}
                                    </div>
                                  </div>

                                  {/* 3. What Was Missing */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] uppercase font-mono tracking-wider text-rose-400 font-bold block">3. What Was Missing</span>
                                    <div className="bg-rose-950/10 p-4 rounded-2xl border border-rose-500/10 text-slate-300 leading-relaxed text-[11.5px] font-sans">
                                      {evalItem.whatWasMissing}
                                    </div>
                                  </div>

                                  {/* 4. Correct Answer */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] uppercase font-mono tracking-wider text-accent-emerald font-bold block">4. Correct Answer</span>
                                    <div className="bg-emerald-950/10 p-4 rounded-2xl border border-accent-emerald/10 text-slate-300 leading-relaxed text-[11.5px] font-sans">
                                      {evalItem.correctAnswer}
                                    </div>
                                  </div>

                                  {/* 5. Better Interview Answer Example */}
                                  <div className="p-5 bg-zinc-900/50 border border-border-dark rounded-2xl space-y-2.5">
                                    <span className="text-[9px] uppercase font-mono tracking-wider text-amber-400 font-bold block">5. Better Interview Answer Example</span>
                                    <p className="text-slate-200 text-xs leading-relaxed font-sans font-medium italic border-l-2 border-amber-400/55 pl-3">
                                      {evalItem.betterInterviewAnswer}
                                    </p>
                                  </div>

                                  {/* 6. Key Concepts To Remember */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] uppercase font-mono tracking-wider text-text-muted font-bold block">6. Key Concepts To Remember</span>
                                    <div className="flex flex-wrap gap-2">
                                      {(evalItem.keyConcepts || []).map((concept, cIdx) => (
                                        <span key={cIdx} className="text-[10px] font-mono bg-zinc-900 text-slate-350 border border-border-dark/60 px-3 py-1 rounded-lg">
                                          {concept}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        )}

      </main>

      {/* Universal Footer section info */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border-dark mt-16 pt-8 pb-8 text-center text-[11px] text-text-muted space-y-2 select-none">
        <p className="font-mono">CareerHub Enterprise InterviewAI Platform • Standardized Adaptive Assessment Protocol.</p>
        <p>A professional workspace demonstrating continuous career preparation and advanced assessment trends.</p>
        <p className="text-[10px] text-zinc-600 font-mono mt-2">UTC Timestamp: 2026-06-12 00:23:55 • saquibraza5683@gmail.com</p>
      </footer>
    </div>
  );
}
