export type ExamType = 'weekly' | 'monthly' | 'quarterly' | 'mid-term' | 'final';

export interface Exam {
  id: string;
  name: string;
  date: string;
  type: ExamType;
  subjects: string[];
  createdAt: string;
}

// New structure for exam groups
export interface SubjectExam {
  subject: string;
  date: string;
  duration?: number; // in minutes
  maxMarks?: number;
}

export interface ExamGroup {
  id: string;
  name: string; // e.g., "Mid-Term Grade 9"
  type: ExamType;
  startDate: string;
  endDate: string;
  subjectExams: SubjectExam[];
  offDays: string[]; // dates that should be marked as off days
  description?: string;
  status: 'draft' | 'published' | 'applied'; // draft can be edited, published is ready, applied means added to calendar
  isTemplate?: boolean; // can be used as template for future groups
  templateName?: string; // if this is a template
  lastModified: string;
  appliedDate?: string; // when it was applied to calendar
  createdAt: string;
  isActive?: boolean;
  version: number; // for tracking edits
}

export interface OffDay {
  id: string;
  date: string;
  reason: string;
  createdAt: string;
}

export type ChapterStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'complete' 
  | 'study-in-progress' 
  | 'study-completed' 
  | 'revision-in-progress' 
  | 'revision-completed' 
  | 'mastered';

export interface Chapter {
  id: string;
  subject: string;
  name: string;
  estimatedHours: number; // For backward compatibility
  studyHours: number; // Planned: Time to study the chapter first time
  revisionHours: number; // Planned: Time to revise the chapter
  completedStudyHours: number; // Progress: Hours marked as completed
  completedRevisionHours: number; // Progress: Hours marked as completed
  actualStudyHours?: number; // Actual: Real time spent studying (from timer or manual input)
  actualRevisionHours?: number; // Actual: Real time spent revising (from timer or manual input)
  studyProgress?: number; // Progress tracking for compatibility
  status: ChapterStatus;
  studyStatus: 'not-done' | 'in-progress' | 'done';
  revisionStatus: 'not-done' | 'in-progress' | 'done';
  plannedStatus?: 'not-planned' | 'planned' | 'scheduled'; // New: Track if added to calendar
  priority?: number;
  confidence?: 'low' | 'medium' | 'high';
  lastStudiedAt?: string;
  lastRevisedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTask {
  id: string;
  chapterId: string;
  subject: string;
  chapterName: string;
  allocatedMinutes: number;
  actualMinutes?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  priority: number;
  date: string;
}

export interface DailyLog {
  id: string;
  date: string;
  tasks: DailyTask[];
  totalAllocatedMinutes: number;
  totalActualMinutes: number;
  createdAt: string;
}

export interface Subject {
  name: string;
  totalChapters: number;
  completedChapters: number;
  totalHours: number;
  completedHours: number;
  color: string;
}

export interface AppSettings {
  dailyStudyHours: number;
  breakMinutes: number;
  studySessionMinutes: number;
  theme: 'light' | 'dark' | 'system';
  colorTheme: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  streak: number;
  level: number;
  totalStudyMinutes: number;
  achievements: string[];
  favoriteSubject?: string;
  motivationalQuote?: string;
  hasCompletedOnboarding?: boolean;
  createdAt: string;
  lastActive: string;
  friends?: string[];
  status?: 'online' | 'studying' | 'break' | 'offline';
}

export interface StudyRoom {
  id: string;
  name: string;
  hostId: string;
  participants: string[];
  subject?: string;
  isActive: boolean;
  createdAt: string;
  messages: ChatMessage[];
  sharedNotes: SharedNote[];
  whiteboard?: WhiteboardData;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  type: 'text' | 'screenshot' | 'note' | 'celebration';
  attachmentUrl?: string;
}

export interface SharedNote {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  subject: string;
  timestamp: string;
  likes: string[];
}

export interface WhiteboardData {
  drawings: any[];
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  userId: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

// Smart Planner Types
export interface PlannerDay {
  id: string;
  date: string;
  dayType: 'study' | 'exam' | 'revision' | 'holiday' | 'weekend' | 'off';
  availableHours: number;
  plannedTasks: PlannerTask[];
  actualTimeSpent: number;
  notes?: string;
}

export interface PlannerTask {
  id: string;
  chapterId: string;
  subject: string;
  chapterName: string;
  taskType: 'study' | 'revision';
  plannedMinutes: number;
  actualMinutes?: number;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'postponed';
  confidence?: 'low' | 'medium' | 'high';
}

export interface StudyPlan {
  id: string;
  name: string; // e.g., "Mid-Term Preparation Plan"
  examGroupId?: string; // linked to ExamGroup
  examId?: string; // backward compatibility
  startDate: string;
  endDate: string;
  days: PlannerDay[];
  chapterIds: string[]; // Reference to chapter IDs (live data)
  totalStudyHours: number;
  totalRevisionHours: number;
  completedStudyHours: number;
  completedRevisionHours: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SubjectConfig {
  name: string;
  defaultStudyHours: number;
  defaultRevisionHours: number;
  color: string;
  icon?: string;
}

export interface AppState {
  currentUserId: string | null;
  users: UserProfile[];
  userData: {
    [userId: string]: {
      exams: Exam[];
      examGroups: ExamGroup[]; // New
      offDays: OffDay[];
      chapters: Chapter[];
      dailyLogs: DailyLog[];
      settings: AppSettings;
      studyPlans: StudyPlan[]; // Multiple study plans
      activeStudyPlanId?: string; // Currently active plan
      subjectConfigs?: SubjectConfig[]; // New
    };
  };
  currentDate: string;
}