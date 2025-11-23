import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Exam, ExamGroup, OffDay, Chapter, DailyLog, AppSettings, DailyTask, UserProfile, StudyPlan, ChapterStatus, SubjectConfig, PerformanceMetric, HistoricalPerformance, PlannerDay, PlannerTask, ChapterAssignment, ActivitySession, TimerState } from '../types';
import { cleanupChapterData, cleanupStudyPlanData, prepareExportData, validateImportData, validateDataIntegrity } from './dataSync';

interface StoreActions {
  // User actions
  addUser: (name: string, avatar: string, grade: string) => void;
  switchUser: (userId: string) => void;
  logoutUser: () => void;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  getCurrentUser: () => UserProfile | null;
  markOnboardingComplete: () => void;
  
  // Exam actions
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  
  // Exam Group actions
  addExamGroup: (examGroup: Omit<ExamGroup, 'id' | 'createdAt'>) => void;
  updateExamGroup: (id: string, examGroup: Partial<ExamGroup>) => void;
  deleteExamGroup: (id: string) => void;
  applyExamGroup: (examGroupId: string) => void; // Apply exam group to calendar
  
  // Off day actions
  addOffDay: (offDay: Omit<OffDay, 'id' | 'createdAt'>) => void;
  deleteOffDay: (id: string) => void;
  
  // Chapter actions
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'completedHours' | 'status'>) => void;
  updateChapter: (id: string, chapter: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  updateChapterProgress: (id: string, hours: number) => void;
  
  // Daily log actions
  addDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => void;
  updateDailyTask: (logId: string, taskId: string, updates: Partial<DailyTask>) => void;
  
  // Planner Days actions
  addPlannerDay: (day: Omit<PlannerDay, 'id'>) => void;
  updatePlannerDay: (id: string, updates: Partial<PlannerDay>) => void;
  deletePlannerDay: (id: string) => void;
  addTaskToPlannerDay: (dayId: string, task: PlannerTask) => void;
  removeTaskFromPlannerDay: (dayId: string, taskId: string) => void;
  updatePlannerTask: (dayId: string, taskId: string, updates: Partial<PlannerTask>) => void;
  getPlannerDayByDate: (date: string) => PlannerDay | undefined;
  
  // Study Plan actions
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudyPlan: (id: string, plan: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  setActiveStudyPlan: (id: string) => void;
  duplicateStudyPlan: (id: string, newName: string) => void;
  ensureDefaultPlan: () => void;
  getOrCreateActivePlan: () => StudyPlan;
  completePlan: (planId: string, options: { moveIncompleteTo?: string; cancelIncomplete?: boolean }) => void;
  canCompletePlan: (planId: string) => boolean;
  checkAutoCompletion: (planId: string) => void;
  
  // Chapter Assignment actions (NEW)
  scheduleChapter: (chapterId: string, date: string, activityType: 'study' | 'revision', plannedMinutes: number, planId?: string) => void;
  updateAssignment: (id: string, updates: Partial<ChapterAssignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentsForDate: (date: string) => ChapterAssignment[];
  getAssignmentsForChapter: (chapterId: string) => ChapterAssignment[];
  getAssignmentsForPlan: (planId: string) => ChapterAssignment[];
  linkAssignmentToPlan: (assignmentId: string, planId: string) => void;
  moveAssignmentsBetweenPlans: (assignmentIds: string[], targetPlanId: string) => void;
  
  // Activity Session actions (NEW)
  startActivity: (assignmentId: string) => void;
  pauseActivity: (sessionId: string) => void;
  resumeActivity: (sessionId: string) => void;
  completeActivity: (sessionId: string, actualMinutes: number) => void;
  getActiveSession: () => ActivitySession | undefined;
  
  // Timer actions (NEW)
  updateTimerState: (updates: Partial<TimerState>) => void;
  resetTimer: () => void;
  getElapsedTime: (assignmentId?: string) => number; // Returns elapsed time in seconds
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Historical Performance actions
  recordDailyPerformance: (metric: PerformanceMetric) => void;
  getHistoricalPerformance: () => HistoricalPerformance | undefined;
  updatePerformanceAverages: () => void;
  
  // Utility actions
  setCurrentDate: (date: string) => void;
  clearAllData: () => void;
  clearAllChapters: () => void;
  cleanupSessions: () => void;
  resetActiveSessionsAndTimers: () => void;
  importData: (data: any) => boolean;
  cleanupOrphanedData: () => void;
  migrateOrphanedAssignments: () => void;
  validateDataIntegrity: () => { isValid: boolean; issues: string[] };
  validateAndFixSessionState: () => void;
  
  // Computed getters for current user data (replacing dual state tracking)
  getExams: () => Exam[];
  getExamGroups: () => ExamGroup[];
  getOffDays: () => OffDay[];
  getChapters: () => Chapter[];
  getDailyLogs: () => DailyLog[];
  getSettings: () => AppSettings;
  getStudyPlans: () => StudyPlan[];
  getActiveStudyPlanId: () => string | undefined;
  getPlannerDays: () => PlannerDay[];
  getChapterAssignments: () => ChapterAssignment[];
  getActivitySessions: () => ActivitySession[];
  getActiveTimer: () => TimerState | undefined;
}

type Store = AppState & StoreActions;

const initialSettings: AppSettings = {
  dailyStudyHours: 4,
  breakMinutes: 15,
  studySessionMinutes: 45,
  theme: 'light',
  colorTheme: 'default',
  parentModeEnabled: false,
  parentModePIN: '1234',
};

// Pre-configured users for the students
const getInitialUsers = (): UserProfile[] => [
  {
    id: 'ananya',
    name: 'Ananya',
    avatar: '👧',
    grade: '9th',
    streak: 5,
    level: 3,
    totalStudyMinutes: 2400,
    achievements: ['First Week Complete', 'Math Master'],
    favoriteSubject: 'Mathematics',
    motivationalQuote: 'Every expert was once a beginner!',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastActive: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'saanvi',
    name: 'Saanvi',
    avatar: '👩‍🎓',
    grade: '9th',
    streak: 3,
    level: 2,
    totalStudyMinutes: 1800,
    achievements: ['Science Star'],
    favoriteSubject: 'Science',
    motivationalQuote: 'Dream big, study hard!',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastActive: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'sara',
    name: 'Sara',
    avatar: '🧑‍💻',
    grade: '9th',
    streak: 7,
    level: 4,
    totalStudyMinutes: 3200,
    achievements: ['Week Warrior', 'Consistent Learner'],
    favoriteSubject: 'Computer Science',
    motivationalQuote: 'Code your future!',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastActive: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'arshita',
    name: 'Arshita',
    avatar: '👩‍🔬',
    grade: '9th',
    streak: 4,
    level: 3,
    totalStudyMinutes: 2100,
    achievements: ['Chemistry Champion'],
    favoriteSubject: 'Chemistry',
    motivationalQuote: 'Science is magic that works!',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastActive: '2025-01-01T00:00:00.000Z',
  },
];

// Helper function to validate and clean up corrupted sessions
const cleanupCorruptedSessions = (sessions: ActivitySession[]): ActivitySession[] => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return sessions.map((session: any) => {
    // Clean up old sessions that are still marked as active
    const sessionStart = new Date(session.startTime);
    if (sessionStart < oneDayAgo && !session.endTime) {
      // Auto-completing old session
      return {
        ...session,
        isActive: false,
        endTime: new Date(sessionStart.getTime() + 4 * 60 * 60 * 1000).toISOString(), // Auto-complete after 4 hours
      };
    }
    
    // Fix sessions with inconsistent state
    const lastPauseInterval = session.pausedIntervals[session.pausedIntervals.length - 1];
    if (lastPauseInterval && !lastPauseInterval.resumedAt && session.isActive) {
      // Session is marked active but has an unresumed pause - fix it
      // Fixing inconsistent session state
      return {
        ...session,
        isActive: false,
      };
    }
    
    return session;
  }).filter(session => {
    // Remove sessions older than 7 days
    const sessionStart = new Date(session.startTime);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (sessionStart < sevenDaysAgo) {
      // Removing old session
      return false;
    }
    return true;
  });
};

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const initialUsers = getInitialUsers();
      const initialUserData = initialUsers.reduce((acc, user) => ({
        ...acc,
        [user.id]: {
          exams: [],
          examGroups: [],
          offDays: [],
          chapters: [],
          dailyLogs: [],
          settings: initialSettings,
          studyPlans: [],
          activeStudyPlanId: undefined,
          plannerDays: [],
          chapterAssignments: [],
          activitySessions: [],
          activeTimer: undefined,
        }
      }), {});
      
      return {
      // Initial state
      currentUserId: null,
      users: initialUsers,
      userData: initialUserData,
      currentDate: new Date().toISOString().split('T')[0],
      
      // User actions
      addUser: (name, avatar, grade) => {
        const userId = name.toLowerCase().replace(/\s+/g, '');
        const newUser: UserProfile = {
          id: userId,
          name,
          avatar,
          grade,
          streak: 0,
          level: 1,
          totalStudyMinutes: 0,
          achievements: [],
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };
        
        set((state) => ({
          users: [...state.users, newUser],
          userData: {
            ...state.userData,
            [userId]: {
              exams: [],
              examGroups: [],
              offDays: [],
              chapters: [],
              dailyLogs: [],
              settings: initialSettings,
              studyPlans: [],
              activeStudyPlanId: undefined,
              plannerDays: [],
              chapterAssignments: [],
              activitySessions: [],
              activeTimer: undefined,
            }
          }
        }));
      },
      
      switchUser: (userId) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) return;

        // Initialize user data if it doesn't exist
        if (!state.userData[userId]) {
          set((state) => ({
            userData: {
              ...state.userData,
              [userId]: {
                exams: [],
                examGroups: [],
                offDays: [],
                chapters: [],
                dailyLogs: [],
                settings: initialSettings,
                studyPlans: [],
                activeStudyPlanId: undefined,
                plannerDays: [],
                chapterAssignments: [],
                activitySessions: [],
                activeTimer: undefined,
              }
            }
          }));
        }

        // Clean up corrupted sessions before switching
        const userData = get().userData[userId];
        const cleanedSessions = cleanupCorruptedSessions(userData.activitySessions || []);

        // Update sessions in userData if they were cleaned
        if (cleanedSessions.length !== userData.activitySessions?.length) {
          set((state) => ({
            userData: {
              ...state.userData,
              [userId]: {
                ...state.userData[userId],
                activitySessions: cleanedSessions,
              }
            }
          }));
        }

        // Only set currentUserId - data is accessed via getters
        set({ currentUserId: userId });

        // Update last active
        get().updateUserProfile(userId, { lastActive: new Date().toISOString() });

        // Ensure default plan exists and migrate orphaned assignments
        setTimeout(() => {
          get().ensureDefaultPlan();
          get().migrateOrphanedAssignments();
        }, 100);
      },
      
      getCurrentUser: () => {
        const state = get();
        return state.users.find(u => u.id === state.currentUserId) || null;
      },
      
      markOnboardingComplete: () => {
        const state = get();
        if (state.currentUserId) {
          get().updateUserProfile(state.currentUserId, { hasCompletedOnboarding: true });
        }
      },
      
      logoutUser: () => {
        // Only clear currentUserId - user data remains in userData
        set({ currentUserId: null });
      },
      
      updateUserProfile: (userId, updates) =>
        set((state) => ({
          users: state.users.map(u => 
            u.id === userId ? { ...u, ...updates } : u
          ),
        })),
        
      deleteUser: (userId) =>
        set((state) => {
          const newUserData = { ...state.userData };
          delete newUserData[userId];
          return {
            users: state.users.filter(u => u.id !== userId),
            userData: newUserData,
            currentUserId: state.currentUserId === userId ? null : state.currentUserId,
          };
        }),
      
      // Exam actions
      addExam: (exam) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newExam = {
            ...exam,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              exams: [...state.userData[state.currentUserId].exams, newExam],
            }
          };
          
          return {
            userData: updatedUserData,
            exams: updatedUserData[state.currentUserId].exams,
          };
        }),
        
      updateExam: (id, exam) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedExams = state.getExams().map((e: any) =>
            e.id === id ? { ...e, ...exam } : e
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                exams: updatedExams,
              }
            }
          };
        }),

      deleteExam: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedExams = state.getExams().filter((e: any) => e.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                exams: updatedExams,
              }
            }
          };
        }),
      
      // Exam Group actions
      addExamGroup: (examGroup) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newExamGroup = {
            ...examGroup,
            id: (examGroup as any).id || generateId(),
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: examGroup.status || 'draft',
            version: examGroup.version || 1,
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              examGroups: [...(state.userData[state.currentUserId].examGroups || []), newExamGroup],
            }
          };
          
          return {
            userData: updatedUserData
          };
        }),

      updateExamGroup: (id, examGroup) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedExamGroups = (state.getExamGroups() || []).map((eg: any) =>
            eg.id === id
              ? {
                  ...eg,
                  ...examGroup,
                  lastModified: new Date().toISOString(),
                  version: examGroup.version || (eg.version || 0) + 1
                } 
              : eg
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                examGroups: updatedExamGroups,
              }
            }
          };
        }),

      deleteExamGroup: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedExamGroups = (state.getExamGroups() || []).filter((eg: any) => eg.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                examGroups: updatedExamGroups,
              }
            }
          };
        }),

      applyExamGroup: (examGroupId) => {
        const state = get();
        if (!state.currentUserId) return;

        const examGroup = state.getExamGroups()?.find((eg: any) => eg.id === examGroupId);
        if (!examGroup) return;
        
        // Create individual exams from the exam group
        examGroup.subjectExams.forEach(subjectExam => {
          get().addExam({
            name: `${examGroup.name} - ${subjectExam.subject}`,
            date: subjectExam.date,
            type: examGroup.type,
            subjects: [subjectExam.subject],
          });
        });
        
        // Add off days
        examGroup.offDays.forEach(date => {
          get().addOffDay({
            date,
            reason: `${examGroup.name} - Off Day`,
          });
        });
        
        // Mark the exam group as applied
        get().updateExamGroup(examGroupId, {
          status: 'applied',
          appliedDate: new Date().toISOString(),
        });
      },
      
      // Off day actions
      addOffDay: (offDay) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newOffDay = {
            ...offDay,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              offDays: [...state.userData[state.currentUserId].offDays, newOffDay],
            }
          };
          
          return {
            userData: updatedUserData,
            offDays: updatedUserData[state.currentUserId].offDays,
          };
        }),
        
      deleteOffDay: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedOffDays = state.getOffDays().filter((d: any) => d.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                offDays: updatedOffDays,
              }
            }
          };
        }),
      
      // Chapter actions
      addChapter: (chapter) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newChapter = {
            ...chapter,
            id: generateId(),
            completedHours: 0,
            studyHours: chapter.studyHours || chapter.estimatedHours || 2,
            revisionHours: chapter.revisionHours || 1,
            completedStudyHours: 0,
            completedRevisionHours: 0,
            status: 'not_started' as const,
            studyProgress: 0,
            studyStatus: 'not-done' as const,
            revisionStatus: 'not-done' as const,
            confidence: 'medium' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              chapters: [...state.userData[state.currentUserId].chapters, newChapter],
            }
          };
          
          return {
            userData: updatedUserData,
            chapters: updatedUserData[state.currentUserId].chapters,
          };
        }),
        
      updateChapter: (id, chapter) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedChapters = state.getChapters().map((c: any) =>
            c.id === id
              ? { ...c, ...chapter, updatedAt: new Date().toISOString() }
              : c
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapters: updatedChapters,
              }
            },
            chapters: updatedChapters,
          };
        }),
        
      deleteChapter: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedChapters = state.getChapters().filter((c: any) => c.id !== id);
          
          // Clean up related data
          const cleaned = cleanupChapterData(
            id,
            state.getChapterAssignments(),
            state.getActivitySessions(),
            state.getPlannerDays()
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapters: updatedChapters,
                chapterAssignments: cleaned.assignments,
                activitySessions: cleaned.sessions,
                plannerDays: cleaned.plannerDays,
              }
            },
            chapters: updatedChapters,
            chapterAssignments: cleaned.assignments,
            activitySessions: cleaned.sessions,
            plannerDays: cleaned.plannerDays,
          };
        }),
        
      updateChapterProgress: (id, hours) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedChapters = state.getChapters().map((c: any) => {
            if (c.id === id) {
              const newStudyProgress = Math.min((c.studyProgress || 0) + hours, c.estimatedHours);
              const status = (newStudyProgress === 0 
                ? 'not_started' 
                : newStudyProgress >= c.estimatedHours 
                ? 'complete' 
                : 'in_progress') as ChapterStatus;
              return {
                ...c,
                studyProgress: newStudyProgress,
                status,
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          });
          
          // Update user's total study time
          const currentUser = get().getCurrentUser();
          if (currentUser) {
            get().updateUserProfile(currentUser.id, {
              totalStudyMinutes: currentUser.totalStudyMinutes + (hours * 60),
            });
          }
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapters: updatedChapters,
              }
            },
            chapters: updatedChapters,
          };
        }),
      
      // Daily log actions
      addDailyLog: (log) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newLog = {
            ...log,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              dailyLogs: [...state.userData[state.currentUserId].dailyLogs, newLog],
            }
          };
          
          return {
            userData: updatedUserData,
            dailyLogs: updatedUserData[state.currentUserId].dailyLogs,
          };
        }),
        
      updateDailyTask: (logId, taskId, updates) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedLogs = state.getDailyLogs().map((log: any) => {
            if (log.id === logId) {
              const updatedTasks = log.tasks.map((task: any) =>
                task.id === taskId ? { ...task, ...updates } : task
              );
              const totalActualMinutes = updatedTasks.reduce(
                (acc: any, task: any) => acc + (task.actualMinutes || 0),
                0
              );
              return { ...log, tasks: updatedTasks, totalActualMinutes };
            }
            return log;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                dailyLogs: updatedLogs,
              }
            },
            dailyLogs: updatedLogs,
          };
        }),
      
      // Planner Days actions
      addPlannerDay: (day) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newDay = {
            ...day,
            id: generateId(),
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              plannerDays: [...(state.userData[state.currentUserId].plannerDays || []), newDay],
            }
          };
          
          return {
            userData: updatedUserData,
            plannerDays: updatedUserData[state.currentUserId].plannerDays,
          };
        }),
      
      updatePlannerDay: (id, updates) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlannerDays = (state.getPlannerDays() || []).map((day: any) =>
            day.id === id ? { ...day, ...updates } : day
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                plannerDays: updatedPlannerDays,
              }
            },
            plannerDays: updatedPlannerDays,
          };
        }),
      
      deletePlannerDay: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlannerDays = (state.getPlannerDays() || []).filter((day: any) => day.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                plannerDays: updatedPlannerDays,
              }
            },
            plannerDays: updatedPlannerDays,
          };
        }),
      
      addTaskToPlannerDay: (dayId, task) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlannerDays = (state.getPlannerDays() || []).map((day: any) => {
            if (day.id === dayId) {
              return {
                ...day,
                plannedTasks: [...day.plannedTasks, task],
              };
            }
            return day;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                plannerDays: updatedPlannerDays,
              }
            },
            plannerDays: updatedPlannerDays,
          };
        }),
      
      removeTaskFromPlannerDay: (dayId, taskId) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlannerDays = (state.getPlannerDays() || []).map((day: any) => {
            if (day.id === dayId) {
              return {
                ...day,
                plannedTasks: day.plannedTasks.filter((task: any) => task.id !== taskId),
              };
            }
            return day;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                plannerDays: updatedPlannerDays,
              }
            },
            plannerDays: updatedPlannerDays,
          };
        }),
      
      updatePlannerTask: (dayId, taskId, updates) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlannerDays = (state.getPlannerDays() || []).map((day: any) => {
            if (day.id === dayId) {
              return {
                ...day,
                plannedTasks: day.plannedTasks.map((task: any) =>
                  task.id === taskId ? { ...task, ...updates } : task
                ),
              };
            }
            return day;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                plannerDays: updatedPlannerDays,
              }
            },
            plannerDays: updatedPlannerDays,
          };
        }),
      
      getPlannerDayByDate: (date) => {
        const state = get();
        if (!state.currentUserId) return undefined;
        return state.getPlannerDays()?.find((day: any) => day.date === date);
      },
      
      // Study Plan actions
      addStudyPlan: (plan) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newPlan = {
            ...plan,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              studyPlans: [...(state.userData[state.currentUserId].studyPlans || []), newPlan],
            }
          };
          
          return {
            userData: updatedUserData,
            studyPlans: updatedUserData[state.currentUserId].studyPlans,
          };
        }),
        
      updateStudyPlan: (id, plan) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlans = (state.getStudyPlans() || []).map((p: any) =>
            p.id === id ? { ...p, ...plan, updatedAt: new Date().toISOString() } : p
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                studyPlans: updatedPlans,
              }
            },
            studyPlans: updatedPlans,
          };
        }),
        
      deleteStudyPlan: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPlans = (state.getStudyPlans() || []).filter((p: any) => p.id !== id);
          
          // Clean up related data when deleting a plan
          const cleaned = cleanupStudyPlanData(
            id,
            state.getChapterAssignments(),
            state.getActivitySessions(),
            state.getPlannerDays()
          );
          
          // Reset all chapter progress if this was the active plan
          const resetChapters = state.getActiveStudyPlanId() === id
            ? state.getChapters().map((c: any) => ({
                ...c,
                studyStatus: 'not-done' as const,
                revisionStatus: 'not-done' as const,
                completedStudyHours: 0,
                completedRevisionHours: 0,
                actualStudyHours: 0,
                actualRevisionHours: 0,
              }))
            : state.getChapters();
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                studyPlans: updatedPlans,
                activeStudyPlanId: state.getActiveStudyPlanId() === id ? undefined : state.getActiveStudyPlanId(),
                chapters: resetChapters,
                chapterAssignments: cleaned.assignments,
                activitySessions: cleaned.sessions,
                plannerDays: cleaned.plannerDays,
              }
            },
            studyPlans: updatedPlans,
            activeStudyPlanId: state.getActiveStudyPlanId() === id ? undefined : state.getActiveStudyPlanId(),
            chapters: resetChapters,
            chapterAssignments: cleaned.assignments,
            activitySessions: cleaned.sessions,
            plannerDays: cleaned.plannerDays,
          };
        }),
        
      setActiveStudyPlan: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                activeStudyPlanId: id,
              }
            },
            activeStudyPlanId: id,
          };
        }),
        
      duplicateStudyPlan: (id, newName) => {
        const state = get();
        if (!state.currentUserId) return;
        
        const planToDuplicate = state.getStudyPlans()?.find(p => p.id === id);
        if (!planToDuplicate) return;
        
        const duplicatedPlan = {
          ...planToDuplicate,
          id: generateId(),
          name: newName,
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Remove the id to let addStudyPlan generate a new one
        const { id: _, createdAt, updatedAt, ...planWithoutId } = duplicatedPlan;
        get().addStudyPlan({ ...planWithoutId, name: newName });
      },
      
      ensureDefaultPlan: () => {
        const state = get();
        if (!state.currentUserId) return;
        
        const plans = state.getStudyPlans() || [];
        const hasDefaultPlan = plans.some(p => p.isDefault);
        
        if (!hasDefaultPlan) {
          const today = new Date();
          const defaultPlan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'General Study',
            startDate: today.toISOString(),
            endDate: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString(),
            days: [],
            chapterIds: [],
            totalStudyHours: 0,
            totalRevisionHours: 0,
            completedStudyHours: 0,
            completedRevisionHours: 0,
            status: 'active',
            isDefault: true,
            assignmentIds: [],
            notes: 'Default plan for general study activities',
          };
          
          get().addStudyPlan(defaultPlan);
          
          // Set as active if no active plan exists
          if (!state.getActiveStudyPlanId()) {
            const newPlans = get().getStudyPlans() || [];
            const createdPlan = newPlans.find((p: any) => p.isDefault);
            if (createdPlan) {
              get().setActiveStudyPlan(createdPlan.id);
            }
          }
        }
      },
      
      getOrCreateActivePlan: () => {
        const state = get();
        if (!state.currentUserId) {
          throw new Error('No user logged in');
        }
        
        // Ensure default plan exists
        get().ensureDefaultPlan();
        
        // Get active plan
        let activePlan = state.getStudyPlans()?.find((p: any) => p.id === state.getActiveStudyPlanId());
        
        // If no active plan, use default plan
        if (!activePlan) {
          activePlan = state.getStudyPlans()?.find((p: any) => p.isDefault);
          if (activePlan) {
            get().setActiveStudyPlan(activePlan.id);
          }
        }

        // If still no plan (shouldn't happen), create one
        if (!activePlan) {
          get().ensureDefaultPlan();
          const updatedState = get();
          activePlan = updatedState.getStudyPlans()?.find((p: any) => p.isDefault);
        }
        
        if (!activePlan) {
          throw new Error('Failed to create or find active plan');
        }
        
        return activePlan;
      },
      
      completePlan: (planId, options) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const plan = state.getStudyPlans()?.find(p => p.id === planId);
          if (!plan) return state;
          
          // Get assignments for this plan
          const planAssignments = get().getAssignmentsForPlan(planId);
          const completedAssignments = planAssignments.filter((a: any) => a.status === 'completed');
          const incompleteAssignments = planAssignments.filter((a: any) => a.status !== 'completed');
          
          // Handle incomplete assignments
          let updatedAssignments = [...state.getChapterAssignments()];
          if (options.moveIncompleteTo && incompleteAssignments.length > 0) {
            const targetPlanId = options.moveIncompleteTo;
            incompleteAssignments.forEach(assignment => {
              get().linkAssignmentToPlan(assignment.id, targetPlanId);
            });
            updatedAssignments = get().getChapterAssignments();
          } else if (options.cancelIncomplete) {
            updatedAssignments = updatedAssignments.filter(
              a => !incompleteAssignments.some(inc => inc.id === a.id)
            );
          }
          
          // Calculate completion summary
          const completionSummary = {
            completedAt: new Date().toISOString(),
            totalAssignments: planAssignments.length,
            completedAssignments: completedAssignments.length,
            cancelledAssignments: options.cancelIncomplete ? incompleteAssignments.length : 0,
            actualStudyHours: completedAssignments
              .filter((a: any) => a.activityType === 'study')
              .reduce((sum, a) => sum + (a.actualMinutes || a.plannedMinutes) / 60, 0),
            actualRevisionHours: completedAssignments
              .filter((a: any) => a.activityType === 'revision')
              .reduce((sum, a) => sum + (a.actualMinutes || a.plannedMinutes) / 60, 0),
            efficiency: planAssignments.length > 0 
              ? (completedAssignments.length / planAssignments.length) * 100 
              : 0,
            achievements: [] as string[],
          };
          
          // Add achievements based on performance
          if (completionSummary.efficiency === 100) {
            completionSummary.achievements.push('Perfect Completion! 🌟');
          } else if (completionSummary.efficiency >= 90) {
            completionSummary.achievements.push('Excellent Progress! ⭐');
          } else if (completionSummary.efficiency >= 75) {
            completionSummary.achievements.push('Good Effort! 👍');
          }
          
          // Update plan status
          const updatedPlans = (state.getStudyPlans() || []).map(p => {
            if (p.id === planId) {
              return {
                ...p,
                status: 'completed' as const,
                completionSummary,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                studyPlans: updatedPlans,
                chapterAssignments: updatedAssignments,
              }
            },
            studyPlans: updatedPlans,
            chapterAssignments: updatedAssignments,
          };
        }),
      
      canCompletePlan: (planId) => {
        const state = get();
        if (!state.currentUserId) return false;
        
        const plan = state.getStudyPlans()?.find(p => p.id === planId);
        if (!plan) return false;
        
        const assignments = get().getAssignmentsForPlan(planId);
        if (assignments.length === 0) return false;
        
        const completedCount = assignments.filter((a: any) => a.status === 'completed').length;
        const completionRate = (completedCount / assignments.length) * 100;
        
        // Check completion criteria
        if (plan.completionCriteria) {
          switch (plan.completionCriteria.type) {
            case 'all_tasks':
              return completionRate === 100;
            case 'percentage':
              return completionRate >= (plan.completionCriteria.targetPercentage || 90);
            case 'date_based':
              const today = new Date();
              const endDate = new Date(plan.endDate);
              return today >= endDate && completionRate >= 80;
            case 'manual':
            default:
              return completionRate >= 50;
          }
        }
        
        // Default: can complete if > 50% done
        return completionRate >= 50;
      },
      
      checkAutoCompletion: (planId) => {
        const state = get();
        if (!state.currentUserId) return;
        
        const plan = state.getStudyPlans()?.find(p => p.id === planId);
        if (!plan || !plan.completionCriteria?.autoComplete) return;
        
        const assignments = get().getAssignmentsForPlan(planId);
        const completedCount = assignments.filter((a: any) => a.status === 'completed').length;
        const completionRate = (completedCount / assignments.length) * 100;
        
        // Check if meets auto-completion threshold
        if (plan.completionCriteria.type === 'all_tasks' && completionRate === 100) {
          get().completePlan(planId, { cancelIncomplete: false });
        } else if (
          plan.completionCriteria.type === 'percentage' && 
          completionRate >= (plan.completionCriteria.targetPercentage || 90)
        ) {
          // TODO: Show notification to user about auto-completion
          console.log(`Plan "${plan.name}" is ready for completion (${completionRate}% complete)`);
        }
      },
      
      // Chapter Assignment actions
      scheduleChapter: (chapterId, date, activityType, plannedMinutes, planId) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          // If no planId provided, use active plan or create default
          let assignmentPlanId = planId;
          let planName: string | undefined;
          
          if (!assignmentPlanId) {
            const activePlan = get().getOrCreateActivePlan();
            assignmentPlanId = activePlan.id;
            planName = activePlan.name;
          } else {
            const plan = state.getStudyPlans()?.find(p => p.id === assignmentPlanId);
            planName = plan?.name;
          }
          
          const assignment: ChapterAssignment = {
            id: generateId(),
            chapterId,
            date,
            activityType,
            plannedMinutes,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            planId: assignmentPlanId,
            planName,
          };
          
          const updatedAssignments = [...(state.getChapterAssignments() || []), assignment];
          
          // Update plan's assignmentIds if it exists
          const updatedPlans = (state.getStudyPlans() || []).map(plan => {
            if (plan.id === assignmentPlanId) {
              return {
                ...plan,
                assignmentIds: [...(plan.assignmentIds || []), assignment.id],
                updatedAt: new Date().toISOString(),
              };
            }
            return plan;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                studyPlans: updatedPlans,
              }
            },
            chapterAssignments: updatedAssignments,
            studyPlans: updatedPlans,
          };
        }),
        
      updateAssignment: (id, updates) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedAssignments = (state.getChapterAssignments() || []).map((assignment) =>
            assignment.id === id ? { ...assignment, ...updates } : assignment
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
              }
            },
            chapterAssignments: updatedAssignments,
          };
        }),
        
      deleteAssignment: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          // Check if this assignment has an active timer/session
          const activeSession = state.getActivitySessions()?.find(
            s => s.assignmentId === id && s.isActive
          );
          
          const updatedAssignments = (state.getChapterAssignments() || []).filter(
            (assignment) => assignment.id !== id
          );
          
          // Clean up any active sessions for this assignment
          const updatedSessions = state.getActivitySessions()?.filter(
            s => s.assignmentId !== id
          ) || [];
          
          // Stop timer if this assignment was being tracked
          const shouldStopTimer = activeSession !== undefined;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                activitySessions: updatedSessions,
                activeTimer: shouldStopTimer ? undefined : state.userData[state.currentUserId]?.activeTimer
              }
            },
            chapterAssignments: updatedAssignments,
            activitySessions: updatedSessions,
            activeTimer: shouldStopTimer ? undefined : state.getActiveTimer()
          };
        }),
        
      getAssignmentsForDate: (date) => {
        const state = get();
        if (!state.currentUserId) return [];
        return (state.getChapterAssignments() || []).filter(
          (assignment) => assignment.date === date
        );
      },
      
      getAssignmentsForChapter: (chapterId) => {
        const state = get();
        if (!state.currentUserId) return [];
        return (state.getChapterAssignments() || []).filter(
          (assignment) => assignment.chapterId === chapterId
        );
      },
      
      getAssignmentsForPlan: (planId) => {
        const state = get();
        if (!state.currentUserId) return [];
        return (state.getChapterAssignments() || []).filter(
          (assignment) => assignment.planId === planId
        );
      },
      
      linkAssignmentToPlan: (assignmentId, planId) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const plan = state.getStudyPlans()?.find(p => p.id === planId);
          if (!plan) return state;
          
          const updatedAssignments = (state.getChapterAssignments() || []).map((assignment: any) => {
            if (assignment.id === assignmentId) {
              return {
                ...assignment,
                planId,
                planName: plan.name,
                originalPlanId: assignment.originalPlanId || assignment.planId,
              };
            }
            return assignment;
          });
          
          // Update plan's assignmentIds
          const updatedPlans = (state.getStudyPlans() || []).map(p => {
            if (p.id === planId) {
              const newAssignmentIds = [...(p.assignmentIds || [])];
              if (!newAssignmentIds.includes(assignmentId)) {
                newAssignmentIds.push(assignmentId);
              }
              return { ...p, assignmentIds: newAssignmentIds };
            }
            // Remove from old plan if exists
            if (p.assignmentIds?.includes(assignmentId)) {
              return {
                ...p,
                assignmentIds: p.assignmentIds.filter(id => id !== assignmentId),
              };
            }
            return p;
          });
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                studyPlans: updatedPlans,
              }
            },
            chapterAssignments: updatedAssignments,
            studyPlans: updatedPlans,
          };
        }),
      
      moveAssignmentsBetweenPlans: (assignmentIds, targetPlanId) => {
        assignmentIds.forEach(id => {
          get().linkAssignmentToPlan(id, targetPlanId);
        });
      },
      
      // Activity Session actions
      startActivity: (assignmentId) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          // Find the assignment
          const assignment = state.getChapterAssignments().find((a: any) => a.id === assignmentId);
          if (!assignment) return state;
          
          // Create new activity session
          const newSession: ActivitySession = {
            sessionId: generateId(),
            assignmentId,
            chapterId: assignment.chapterId,
            startTime: new Date().toISOString(),
            duration: 0,
            pausedIntervals: [],
            isActive: true,
            date: assignment.date
          };
          
          // Update assignment status to in-progress
          const updatedAssignments = state.getChapterAssignments().map(a =>
            a.id === assignmentId ? { ...a, status: 'in-progress' as const, startTime: newSession.startTime } : a
          );
          
          // Add session to activity sessions
          const updatedSessions = [...(state.getActivitySessions() || []), newSession];

          // Create new timer state
          const newTimer: TimerState = {
            sessionId: newSession.sessionId,
            assignmentId,
            startTime: new Date(newSession.startTime).getTime(),
            totalPausedMs: 0,
            isActive: true,
            plannedMinutes: assignment.plannedMinutes
          };

          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                activitySessions: updatedSessions,
                activeTimer: newTimer
              }
            },
            chapterAssignments: updatedAssignments,
            activitySessions: updatedSessions,
            activeTimer: newTimer
          };
        }),
      
      pauseActivity: (sessionId) =>
        set((state) => {
          // pauseActivity called
          if (!state.currentUserId) return state;
          
          const session = state.getActivitySessions()?.find(s => s.sessionId === sessionId);
          // Found session to pause
          
          // Fixed: Allow pausing even if state shows not active (to fix corrupted state)
          if (!session) {
            // Session not found
            return state;
          }
          
          // Check if already paused (last interval has no resumedAt)
          const lastInterval = session.pausedIntervals[session.pausedIntervals.length - 1];
          if (lastInterval && !lastInterval.resumedAt) {
            // Session is already paused
            // Fix the isActive flag if it's wrong
            if (session.isActive) {
              const fixedSessions = state.getActivitySessions().map(s =>
                s.sessionId === sessionId ? { ...s, isActive: false } : s
              );
              return {
                ...state,
                activitySessions: fixedSessions,
                userData: {
                  ...state.userData,
                  [state.currentUserId]: {
                    ...state.userData[state.currentUserId],
                    activitySessions: fixedSessions
                  }
                }
              };
            }
            return state;
          }
          
          const pausedAt = new Date().toISOString();
          
          // Update session with paused interval and ensure isActive is false
          const updatedSessions = state.getActivitySessions().map(s =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  isActive: false,
                  pausedIntervals: [...s.pausedIntervals, { pausedAt }]
                }
              : s
          );
          
          // Session paused successfully
          
          // Update assignment status to paused
          const updatedAssignments = state.getChapterAssignments().map(a =>
            a.id === session.assignmentId ? { ...a, status: 'paused' as const, pausedAt } : a
          );
          
          // Update timer state for pause
          const updatedTimer = state.getActiveTimer();
          const pausedTimer = updatedTimer ? {
            ...updatedTimer,
            currentPauseStart: new Date(pausedAt).getTime(),
            isActive: false
          } : undefined;

          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                activitySessions: updatedSessions,
                activeTimer: pausedTimer
              }
            },
            chapterAssignments: updatedAssignments,
            activitySessions: updatedSessions,
            activeTimer: pausedTimer
          };
        }),
      
      resumeActivity: (sessionId) =>
        set((state) => {
          // resumeActivity called
          if (!state.currentUserId) {
            // No current user
            return state;
          }
          
          const session = state.getActivitySessions()?.find(s => s.sessionId === sessionId);
          // Found session to resume
          if (!session) {
            // Session not found
            return state;
          }
          
          // Check if already active
          const lastInterval = session.pausedIntervals[session.pausedIntervals.length - 1];
          if (session.isActive && (!lastInterval || lastInterval.resumedAt)) {
            // Session is already active
            return state;
          }
          
          const resumedAt = new Date().toISOString();
          
          // Update the last paused interval with resume time
          const updatedSessions = state.getActivitySessions().map((s: any) => {
            if (s.sessionId === sessionId) {
              const intervals = [...s.pausedIntervals];
              // Only update if there's an unresumed pause interval
              if (intervals.length > 0 && !intervals[intervals.length - 1].resumedAt) {
                intervals[intervals.length - 1] = {
                  ...intervals[intervals.length - 1],
                  resumedAt,
                  duration: Math.floor((new Date(resumedAt).getTime() - new Date(intervals[intervals.length - 1].pausedAt).getTime()) / 60000)
                };
              }
              // Always ensure isActive is true when resuming
              return { ...s, isActive: true, pausedIntervals: intervals };
            }
            return s;
          });
          
          // Update assignment status back to in-progress
          const updatedAssignments = state.getChapterAssignments().map(a =>
            a.id === session.assignmentId ? { ...a, status: 'in-progress' as const, pausedAt: undefined } : a
          );
          
          // Update timer state for resume
          const currentTimer = state.getActiveTimer();
          const resumedTimer = currentTimer && currentTimer.currentPauseStart ? {
            ...currentTimer,
            totalPausedMs: currentTimer.totalPausedMs + (new Date(resumedAt).getTime() - currentTimer.currentPauseStart),
            currentPauseStart: undefined,
            isActive: true
          } : currentTimer ? {
            ...currentTimer,
            isActive: true
          } : undefined;

          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                activitySessions: updatedSessions,
                activeTimer: resumedTimer
              }
            },
            chapterAssignments: updatedAssignments,
            activitySessions: updatedSessions,
            activeTimer: resumedTimer
          };
        }),
      
      completeActivity: (sessionId, actualMinutes) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const session = state.getActivitySessions()?.find(s => s.sessionId === sessionId);
          if (!session) return state;
          
          const endTime = new Date().toISOString();
          
          // Update session with end time and duration
          const updatedSessions = state.getActivitySessions().map(s =>
            s.sessionId === sessionId
              ? { ...s, endTime, duration: actualMinutes, isActive: false }
              : s
          );
          
          // Update assignment status to completed and record actual time
          const updatedAssignments = state.getChapterAssignments().map(a =>
            a.id === session.assignmentId 
              ? { 
                  ...a, 
                  status: 'completed' as const, 
                  actualMinutes, 
                  completedAt: endTime,
                  endTime 
                }
              : a
          );
          
          // Update chapter progress
          const assignment = state.getChapterAssignments().find((a: any) => a.id === session.assignmentId);
          let updatedChapters = state.getChapters();
          if (assignment) {
            updatedChapters = state.getChapters().map((c: any) => {
              if (c.id === assignment.chapterId) {
                if (assignment.activityType === 'study') {
                  return {
                    ...c,
                    studyStatus: 'done' as const,
                    actualStudyHours: (c.actualStudyHours || 0) + actualMinutes / 60,
                    completedStudyHours: (c.completedStudyHours || 0) + actualMinutes / 60,
                    lastStudiedAt: endTime
                  };
                } else {
                  return {
                    ...c,
                    revisionStatus: 'done' as const,
                    actualRevisionHours: (c.actualRevisionHours || 0) + actualMinutes / 60,
                    completedRevisionHours: (c.completedRevisionHours || 0) + actualMinutes / 60,
                    lastRevisedAt: endTime
                  };
                }
              }
              return c;
            });
          }
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: updatedAssignments,
                activitySessions: updatedSessions,
                chapters: updatedChapters,
                activeTimer: undefined
              }
            },
            chapterAssignments: updatedAssignments,
            activitySessions: updatedSessions,
            chapters: updatedChapters,
            activeTimer: undefined
          };
        }),
      
      getActiveSession: () => {
        const state = get();
        if (!state.currentUserId) return undefined;
        
        // Find the current session (active or paused, but not completed)
        const sessions = state.getActivitySessions() || [];
        
        // First try to find an active session
        const activeSession = sessions.find((s: any) => s.isActive);
        if (activeSession) {
          // Check if this session is corrupted (has all paused intervals resumed but still shows as active)
          const allIntervalsResumed = activeSession.pausedIntervals.length > 0 && 
            activeSession.pausedIntervals.every(interval => interval.resumedAt);
          
          if (allIntervalsResumed) {
            // Session should be active if all intervals are resumed
            // Active session found with all intervals resumed
          }
          return activeSession;
        }
        
        // If no active session, find a paused session (has no endTime and is not active)
        const pausedSession = sessions.find((s: any) => !s.endTime && !s.isActive);
        if (pausedSession) {
          // Check if this is actually paused (has an unresumed pause interval)
          const hasUnresumedPause = pausedSession.pausedIntervals.some(interval => !interval.resumedAt);
          if (hasUnresumedPause) {
            // Paused session found
            return pausedSession;
          }
        }
        
        return undefined;
      },
      
      // Timer actions
      updateTimerState: (updates) =>
        set((state) => {
          if (!state.currentUserId) return state;

          const updatedTimer = state.getActiveTimer() ? { ...state.getActiveTimer()!, ...updates } as any : undefined;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                activeTimer: updatedTimer
              }
            },
            activeTimer: updatedTimer
          };
        }),
      
      resetTimer: () =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                activeTimer: undefined
              }
            },
            activeTimer: undefined
          };
        }),
      
      // Settings actions
      updateSettings: (settings) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedSettings = { ...state.getSettings(), ...settings };
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                settings: updatedSettings,
              }
            },
            settings: updatedSettings,
          };
        }),
      
      // Historical Performance actions
      recordDailyPerformance: (metric) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const currentPerformance = state.userData[state.currentUserId].historicalPerformance || {
            id: generateId(),
            userId: state.currentUserId,
            metrics: [],
            weeklyAverages: { efficiency: 0, studyHours: 0, revisionHours: 0, completionRate: 0 },
            monthlyAverages: { efficiency: 0, studyHours: 0, revisionHours: 0, completionRate: 0 },
            lastUpdated: new Date().toISOString(),
          };
          
          // Add or update today's metric
          const todayDate = metric.date;
          const existingIndex = currentPerformance.metrics.findIndex(m => m.date === todayDate);
          
          if (existingIndex >= 0) {
            currentPerformance.metrics[existingIndex] = metric;
          } else {
            currentPerformance.metrics.push(metric);
            // Keep only last 90 days of data
            if (currentPerformance.metrics.length > 90) {
              currentPerformance.metrics = currentPerformance.metrics.slice(-90);
            }
          }
          
          currentPerformance.lastUpdated = new Date().toISOString();
          
          const updatedUserData = {
            ...state.userData,
            [state.currentUserId]: {
              ...state.userData[state.currentUserId],
              historicalPerformance: currentPerformance,
            }
          };
          
          return {
            userData: updatedUserData,
          };
        }),
      
      getHistoricalPerformance: () => {
        const state = get();
        if (!state.currentUserId) return undefined;
        return state.userData[state.currentUserId]?.historicalPerformance;
      },
      
      updatePerformanceAverages: () => {
        const state = get();
        if (!state.currentUserId) return;
        
        const performance = state.userData[state.currentUserId]?.historicalPerformance;
        if (!performance || performance.metrics.length === 0) return;
        
        // Calculate weekly averages (last 7 days)
        const weekMetrics = performance.metrics.slice(-7);
        const weeklyAverages = {
          efficiency: weekMetrics.reduce((sum, m) => sum + m.efficiency, 0) / weekMetrics.length,
          studyHours: weekMetrics.reduce((sum, m) => sum + m.actualStudyMinutes / 60, 0) / weekMetrics.length,
          revisionHours: weekMetrics.reduce((sum, m) => sum + m.actualRevisionMinutes / 60, 0) / weekMetrics.length,
          completionRate: weekMetrics.reduce((sum, m) => sum + (m.tasksTotal > 0 ? (m.tasksCompleted / m.tasksTotal) * 100 : 0), 0) / weekMetrics.length,
        };
        
        // Calculate monthly averages (last 30 days)
        const monthMetrics = performance.metrics.slice(-30);
        const monthlyAverages = {
          efficiency: monthMetrics.reduce((sum, m) => sum + m.efficiency, 0) / monthMetrics.length,
          studyHours: monthMetrics.reduce((sum, m) => sum + m.actualStudyMinutes / 60, 0) / monthMetrics.length,
          revisionHours: monthMetrics.reduce((sum, m) => sum + m.actualRevisionMinutes / 60, 0) / monthMetrics.length,
          completionRate: monthMetrics.reduce((sum, m) => sum + (m.tasksTotal > 0 ? (m.tasksCompleted / m.tasksTotal) * 100 : 0), 0) / monthMetrics.length,
        };
        
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedPerformance = {
            ...performance,
            weeklyAverages,
            monthlyAverages,
            lastUpdated: new Date().toISOString(),
          };
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                historicalPerformance: updatedPerformance,
              }
            },
          };
        });
      },
      
      // Utility actions
      setCurrentDate: (date) => set({ currentDate: date }),
      
      clearAllData: () =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                exams: [],
                examGroups: [],
                offDays: [],
                chapters: [],
                dailyLogs: [],
                settings: initialSettings,
                studyPlans: [],
                activeStudyPlanId: undefined,
                plannerDays: [],
                chapterAssignments: [],
                activitySessions: [],
                activeTimer: undefined,
              }
            },
            exams: [],
            examGroups: [],
            offDays: [],
            chapters: [],
            dailyLogs: [],
            settings: initialSettings,
            studyPlans: [],
            activeStudyPlanId: undefined,
            plannerDays: [],
            chapterAssignments: [],
            activitySessions: [],
            activeTimer: undefined,
          };
        }),

      cleanupSessions: () =>
        set((state) => {
          // Manual cleanup triggered - also resets any orphaned timers
          if (!state.currentUserId) return state;
          
          const cleanedSessions = cleanupCorruptedSessions(state.getActivitySessions() || []);
          
          // Check if we have any active sessions left
          const hasActiveSessions = cleanedSessions.some(s => s.isActive);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                activitySessions: cleanedSessions,
                // Reset timer if no active sessions remain
                activeTimer: hasActiveSessions ? state.userData[state.currentUserId]?.activeTimer : undefined
              }
            },
            activitySessions: cleanedSessions,
            activeTimer: hasActiveSessions ? state.getActiveTimer() : undefined
          };
        }),
      
      clearAllChapters: () =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapters: [],
              }
            },
            chapters: [],
          };
        }),
        
      importData: (data) => {
        try {
          const state = get();
          if (!state.currentUserId) return false;
          
          // Validate data structure
          if (!data || typeof data !== 'object') return false;
          
          // Import each data type if it exists
          const importedData: any = {
            chapters: data.chapters || [],
            exams: data.exams || [],
            examGroups: data.examGroups || [],
            offDays: data.offDays || [],
            dailyLogs: data.dailyLogs || [],
            studyPlans: data.studyPlans || [],
            activeStudyPlanId: data.activeStudyPlanId,
            plannerDays: data.plannerDays || [],
            chapterAssignments: data.chapterAssignments || [],
            activitySessions: data.activitySessions || [],
            settings: data.settings || state.getSettings(),
          };
          
          // Add IDs if missing and validate dates
          importedData.chapters = importedData.chapters.map((ch: any) => ({
            ...ch,
            id: ch.id || generateId(),
            createdAt: ch.createdAt || new Date().toISOString(),
            updatedAt: ch.updatedAt || new Date().toISOString(),
            status: ch.status || 'not_started',
            studyStatus: ch.studyStatus || 'not-done',
            revisionStatus: ch.revisionStatus || 'not-done',
            studyHours: ch.studyHours || ch.estimatedHours || 2,
            revisionHours: ch.revisionHours || 1,
            completedStudyHours: ch.completedStudyHours || 0,
            completedRevisionHours: ch.completedRevisionHours || 0,
          }));
          
          importedData.exams = importedData.exams.map((ex: any) => ({
            ...ex,
            id: ex.id || generateId(),
            createdAt: ex.createdAt || new Date().toISOString(),
          }));
          
          importedData.offDays = importedData.offDays.map((od: any) => ({
            ...od,
            id: od.id || generateId(),
            createdAt: od.createdAt || new Date().toISOString(),
          }));
          
          // Process new data types
          importedData.plannerDays = (importedData.plannerDays || []).map((pd: any) => ({
            ...pd,
            id: pd.id || generateId(),
          }));
          
          importedData.chapterAssignments = (importedData.chapterAssignments || []).map((ca: any) => ({
            ...ca,
            id: ca.id || generateId(),
          }));
          
          importedData.activitySessions = (importedData.activitySessions || []).map((as: any) => ({
            ...as,
            sessionId: as.sessionId || generateId(),
          }));
          
          // Update the store with all data
          set({
            userData: {
              ...state.userData,
              [state.currentUserId]: importedData
            }
          });
          
          return true;
        } catch (error) {
          console.error('Import failed:', error);
          return false;
        }
      },
      
      // Data integrity utilities
      cleanupOrphanedData: () => {
        set((state) => {
          if (!state.currentUserId) return state;
          
          // Get valid IDs
          const validChapterIds = state.getChapters().map((c: any) => c.id);
          const validAssignmentIds = state.getChapterAssignments().map((a: any) => a.id);
          
          // Clean up orphaned assignments
          const cleanedAssignments = state.getChapterAssignments().filter((a: any) => 
            validChapterIds.includes(a.chapterId)
          );
          
          // Clean up orphaned sessions
          const cleanedSessions = state.getActivitySessions().filter(s =>
            cleanedAssignments.some(a => a.id === s.assignmentId)
          );
          
          // Clean up orphaned tasks in planner days
          const cleanedPlannerDays = state.getPlannerDays().map(day => ({
            ...day,
            plannedTasks: day.plannedTasks.filter(task => 
              validChapterIds.includes(task.chapterId)
            )
          }));
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                chapterAssignments: cleanedAssignments,
                activitySessions: cleanedSessions,
                plannerDays: cleanedPlannerDays,
              }
            },
            chapterAssignments: cleanedAssignments,
            activitySessions: cleanedSessions,
            plannerDays: cleanedPlannerDays,
          };
        });
      },
      
      migrateOrphanedAssignments: () => {
        const state = get();
        if (!state.currentUserId) return;
        
        // Ensure default plan exists first
        get().ensureDefaultPlan();
        
        // Find orphaned assignments (those without planId)
        const orphanedAssignments = (state.getChapterAssignments() || []).filter((a: any) => !a.planId);
        
        if (orphanedAssignments.length === 0) {
          console.log('No orphaned assignments to migrate');
          return;
        }
        
        // Find or create migration plan
        let migrationPlan = state.getStudyPlans()?.find(p => p.name === 'Migrated Activities');
        
        if (!migrationPlan) {
          // Calculate date range for migrated activities
          const dates = orphanedAssignments.map((a: any) => new Date(a.date).getTime());
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          
          // Create migration plan
          const newPlan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'Migrated Activities',
            startDate: minDate.toISOString(),
            endDate: maxDate.toISOString(),
            days: [],
            chapterIds: [],
            totalStudyHours: 0,
            totalRevisionHours: 0,
            completedStudyHours: 0,
            completedRevisionHours: 0,
            status: 'active',
            assignmentIds: orphanedAssignments.map((a: any) => a.id),
            notes: 'Auto-created plan for previously scheduled activities',
          };
          
          get().addStudyPlan(newPlan);
          
          // Get the created plan
          const updatedState = get();
          migrationPlan = updatedState.getStudyPlans()?.find((p: any) => p.name === 'Migrated Activities');
        }
        
        if (migrationPlan) {
          // Link all orphaned assignments to the migration plan
          orphanedAssignments.forEach(assignment => {
            get().linkAssignmentToPlan(assignment.id, migrationPlan!.id);
          });
          
          console.log(`Migrated ${orphanedAssignments.length} orphaned assignments to "${migrationPlan.name}" plan`);
        }
      },
      
      validateDataIntegrity: () => {
        const state = get();
        return validateDataIntegrity(state);
      },

      resetActiveSessionsAndTimers: () =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          // End all active sessions and reset timers
          const updatedSessions = (state.getActivitySessions() || []).map((session: any) => ({
            ...session,
            isActive: false,
            endTime: session.isActive && !session.endTime ? new Date().toISOString() : session.endTime
          }));
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                activitySessions: updatedSessions,
                activeTimer: undefined
              }
            },
            activitySessions: updatedSessions,
            activeTimer: undefined
          };
        }),

      validateAndFixSessionState: () =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const today = new Date().toISOString().split('T')[0];
          const assignments = state.getChapterAssignments() || [];
          const todayAssignments = assignments.filter((a: any) => a.date === today);
          const todayAssignmentIds = new Set(todayAssignments.map((a: any) => a.id));
          
          // Clean up sessions that don't have matching assignments for today
          const validSessions = (state.getActivitySessions() || []).filter(session => {
            // Keep only sessions for today's assignments
            if (!todayAssignmentIds.has(session.assignmentId)) {
              // End the session if it was active
              if (session.isActive) {
                return false; // Remove this session
              }
            }
            return true;
          });
          
          // Check if we have any active sessions left
          const hasActiveSessions = validSessions.some(s => s.isActive);

          // If timer is running but no active sessions, stop the timer
          const shouldResetTimer = state.getActiveTimer()?.isActive && !hasActiveSessions;
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                activitySessions: validSessions,
                activeTimer: shouldResetTimer ? undefined : state.userData[state.currentUserId]?.activeTimer
              }
            }
          };
        }),

      // Computed getters for current user data
      getExams: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.exams || [];
      },

      getExamGroups: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.examGroups || [];
      },

      getOffDays: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.offDays || [];
      },

      getChapters: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.chapters || [];
      },

      getDailyLogs: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.dailyLogs || [];
      },

      getSettings: () => {
        const state = get();
        if (!state.currentUserId) return initialSettings;
        return state.userData[state.currentUserId]?.settings || initialSettings;
      },

      getStudyPlans: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.studyPlans || [];
      },

      getActiveStudyPlanId: () => {
        const state = get();
        if (!state.currentUserId) return undefined;
        return state.userData[state.currentUserId]?.activeStudyPlanId;
      },

      getPlannerDays: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.plannerDays || [];
      },

      getChapterAssignments: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.chapterAssignments || [];
      },

      getActivitySessions: () => {
        const state = get();
        if (!state.currentUserId) return [];
        return state.userData[state.currentUserId]?.activitySessions || [];
      },

      getActiveTimer: () => {
        const state = get();
        if (!state.currentUserId) return undefined;
        return state.userData[state.currentUserId]?.activeTimer;
      },

      getElapsedTime: (assignmentId?: string) => {
        const state = get();
        if (!state.currentUserId) return 0;

        const timer = state.getActiveTimer();
        if (!timer) return 0;

        // If assignmentId is provided, check if it matches
        if (assignmentId && timer.assignmentId !== assignmentId) return 0;

        const now = Date.now();
        let elapsed = now - timer.startTime - timer.totalPausedMs;

        // If currently paused, subtract the current pause duration
        if (timer.currentPauseStart) {
          elapsed -= (now - timer.currentPauseStart);
        }

        // Return elapsed time in seconds
        return Math.max(0, Math.floor(elapsed / 1000));
      },
      };
    },
    {
      name: 'study-planner-storage',
      onRehydrateStorage: () => (state) => {
        // Clean up corrupted sessions and validate state on app load
        if (state && state.currentUserId && state.userData[state.currentUserId]) {
          const today = new Date().toISOString().split('T')[0];
          const userId = state.currentUserId;
          const userData = state.userData[userId];

          // Clean up corrupted sessions
          if (userData.activitySessions) {
            const cleanedSessions = cleanupCorruptedSessions(userData.activitySessions);

            // Further validation: remove sessions for non-existent assignments
            const assignments = userData.chapterAssignments || [];
            const assignmentIds = new Set(assignments.map((a: any) => a.id));

            const validSessions = cleanedSessions.filter(session => {
              // Keep session only if its assignment still exists
              return assignmentIds.has(session.assignmentId);
            });

            // Check if there are any active sessions for today's assignments
            const todayAssignments = assignments.filter((a: any) => a.date === today);
            const todayAssignmentIds = new Set(todayAssignments.map((a: any) => a.id));
            const hasValidActiveSession = validSessions.some(
              s => s.isActive && todayAssignmentIds.has(s.assignmentId)
            );

            // Update userData only (no top-level state)
            state.userData[userId].activitySessions = validSessions;
            if (!hasValidActiveSession) {
              state.userData[userId].activeTimer = undefined;
            }

            console.log('Session state validated on app load');
          }
        }
      },
    }
  )
);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}