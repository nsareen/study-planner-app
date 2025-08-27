import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Exam, ExamGroup, OffDay, Chapter, DailyLog, AppSettings, DailyTask, UserProfile, StudyPlan, ChapterStatus, SubjectConfig } from '../types';

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
  
  // Study Plan actions
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudyPlan: (id: string, plan: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  setActiveStudyPlan: (id: string) => void;
  duplicateStudyPlan: (id: string, newName: string) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Utility actions
  setCurrentDate: (date: string) => void;
  clearAllData: () => void;
  clearAllChapters: () => void;
  
  // Helper getters for current user data
  exams: Exam[];
  examGroups: ExamGroup[];
  offDays: OffDay[];
  chapters: Chapter[];
  dailyLogs: DailyLog[];
  settings: AppSettings;
  studyPlans: StudyPlan[];
  activeStudyPlanId?: string;
}

type Store = AppState & StoreActions;

const initialSettings: AppSettings = {
  dailyStudyHours: 4,
  breakMinutes: 15,
  studySessionMinutes: 45,
  theme: 'light',
  colorTheme: 'default',
};

// Pre-configured users for the students
const preconfiguredUsers: UserProfile[] = [
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
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
];

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUserId: null,
      users: preconfiguredUsers,
      userData: preconfiguredUsers.reduce((acc, user) => ({
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
        }
      }), {}),
      currentDate: new Date().toISOString().split('T')[0],
      
      // Computed properties
      exams: [],
      examGroups: [],
      offDays: [],
      chapters: [],
      dailyLogs: [],
      settings: initialSettings,
      studyPlans: [],
      activeStudyPlanId: undefined,
      
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
            }
          }
        }));
      },
      
      switchUser: (userId) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) return;
        
        const userData = state.userData[userId] || {
          exams: [],
          examGroups: [],
          offDays: [],
          chapters: [],
          dailyLogs: [],
          settings: initialSettings,
          studyPlans: [],
          activeStudyPlanId: undefined,
        };
        
        set({
          currentUserId: userId,
          exams: userData.exams,
          examGroups: userData.examGroups,
          offDays: userData.offDays,
          chapters: userData.chapters,
          dailyLogs: userData.dailyLogs,
          settings: userData.settings,
          studyPlans: userData.studyPlans,
          activeStudyPlanId: userData.activeStudyPlanId,
        });
        
        // Update last active
        get().updateUserProfile(userId, { lastActive: new Date().toISOString() });
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
        set({
          currentUserId: null,
          exams: [],
          offDays: [],
          chapters: [],
          dailyLogs: [],
          settings: initialSettings,
        });
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
          
          const updatedExams = state.exams.map((e) => 
            e.id === id ? { ...e, ...exam } : e
          );
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                exams: updatedExams,
              }
            },
            exams: updatedExams,
          };
        }),
        
      deleteExam: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedExams = state.exams.filter((e) => e.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                exams: updatedExams,
              }
            },
            exams: updatedExams,
          };
        }),
      
      // Exam Group actions
      addExamGroup: (examGroup) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const newExamGroup = {
            ...examGroup,
            id: examGroup.id || generateId(),
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
            userData: updatedUserData,
            examGroups: updatedUserData[state.currentUserId].examGroups,
          };
        }),
        
      updateExamGroup: (id, examGroup) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedExamGroups = (state.examGroups || []).map((eg) => 
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
            },
            examGroups: updatedExamGroups,
          };
        }),
        
      deleteExamGroup: (id) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedExamGroups = (state.examGroups || []).filter((eg) => eg.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                examGroups: updatedExamGroups,
              }
            },
            examGroups: updatedExamGroups,
          };
        }),
        
      applyExamGroup: (examGroupId) => {
        const state = get();
        if (!state.currentUserId) return;
        
        const examGroup = state.examGroups?.find(eg => eg.id === examGroupId);
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
          
          const updatedOffDays = state.offDays.filter((d) => d.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                offDays: updatedOffDays,
              }
            },
            offDays: updatedOffDays,
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
            status: 'not-started' as const,
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
          
          const updatedChapters = state.chapters.map((c) =>
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
          
          const updatedChapters = state.chapters.filter((c) => c.id !== id);
          
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
        
      updateChapterProgress: (id, hours) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedChapters = state.chapters.map((c) => {
            if (c.id === id) {
              const newStudyProgress = Math.min((c.studyProgress || 0) + hours, c.estimatedHours);
              const status = newStudyProgress === 0 
                ? 'not_started' 
                : newStudyProgress >= c.estimatedHours 
                ? 'complete' 
                : 'in_progress';
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
          
          const updatedLogs = state.dailyLogs.map((log) => {
            if (log.id === logId) {
              const updatedTasks = log.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              );
              const totalActualMinutes = updatedTasks.reduce(
                (acc, task) => acc + (task.actualMinutes || 0),
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
          
          const updatedPlans = (state.studyPlans || []).map((p) =>
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
          
          const updatedPlans = (state.studyPlans || []).filter((p) => p.id !== id);
          
          return {
            userData: {
              ...state.userData,
              [state.currentUserId]: {
                ...state.userData[state.currentUserId],
                studyPlans: updatedPlans,
                // Clear active plan if it was deleted
                activeStudyPlanId: state.activeStudyPlanId === id ? undefined : state.activeStudyPlanId,
              }
            },
            studyPlans: updatedPlans,
            activeStudyPlanId: state.activeStudyPlanId === id ? undefined : state.activeStudyPlanId,
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
        
        const planToDuplicate = state.studyPlans?.find(p => p.id === id);
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
      
      // Settings actions
      updateSettings: (settings) =>
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedSettings = { ...state.settings, ...settings };
          
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
    }),
    {
      name: 'study-planner-storage',
    }
  )
);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}