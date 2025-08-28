// Data synchronization utilities for maintaining consistency across the app

import type { 
  ChapterAssignment, 
  ActivitySession, 
  PlannerDay,
  StudyPlan 
} from '../types';

/**
 * Clean up all related data when a study plan is deleted
 * This ensures no orphaned data remains in the system
 */
export const cleanupStudyPlanData = (
  planId: string,
  assignments: ChapterAssignment[],
  sessions: ActivitySession[],
  plannerDays: PlannerDay[]
) => {
  // For now, we don't have direct plan-to-assignment relationship
  // But we can clean up based on dates if needed
  
  // Clean up any orphaned assignments without valid chapters
  const cleanedAssignments = assignments.filter(a => {
    // Keep assignments that have valid references
    return a.chapterId && a.date;
  });
  
  // Clean up sessions for deleted assignments
  const assignmentIds = cleanedAssignments.map(a => a.id);
  const cleanedSessions = sessions.filter(s => 
    assignmentIds.includes(s.assignmentId)
  );
  
  return {
    assignments: cleanedAssignments,
    sessions: cleanedSessions,
    plannerDays // Keep planner days as they might be used by other plans
  };
};

/**
 * Clean up all related data when a chapter is deleted
 */
export const cleanupChapterData = (
  chapterId: string,
  assignments: ChapterAssignment[],
  sessions: ActivitySession[],
  plannerDays: PlannerDay[]
) => {
  // Remove all assignments for this chapter
  const cleanedAssignments = assignments.filter(a => a.chapterId !== chapterId);
  
  // Remove all sessions for deleted assignments
  const deletedAssignmentIds = assignments
    .filter(a => a.chapterId === chapterId)
    .map(a => a.id);
  
  const cleanedSessions = sessions.filter(s => 
    !deletedAssignmentIds.includes(s.assignmentId)
  );
  
  // Remove chapter from planner days
  const cleanedPlannerDays = plannerDays.map(day => ({
    ...day,
    plannedTasks: day.plannedTasks.filter(task => task.chapterId !== chapterId)
  }));
  
  return {
    assignments: cleanedAssignments,
    sessions: cleanedSessions,
    plannerDays: cleanedPlannerDays
  };
};

/**
 * Validate data integrity across all related entities
 */
export const validateDataIntegrity = (state: any) => {
  const issues: string[] = [];
  
  // Check for orphaned assignments
  const validChapterIds = state.chapters.map((c: any) => c.id);
  const orphanedAssignments = state.chapterAssignments.filter((a: ChapterAssignment) => 
    !validChapterIds.includes(a.chapterId)
  );
  
  if (orphanedAssignments.length > 0) {
    issues.push(`Found ${orphanedAssignments.length} orphaned assignments`);
  }
  
  // Check for orphaned sessions
  const validAssignmentIds = state.chapterAssignments.map((a: any) => a.id);
  const orphanedSessions = state.activitySessions.filter((s: ActivitySession) =>
    !validAssignmentIds.includes(s.assignmentId)
  );
  
  if (orphanedSessions.length > 0) {
    issues.push(`Found ${orphanedSessions.length} orphaned activity sessions`);
  }
  
  // Check for invalid planner tasks
  state.plannerDays.forEach((day: PlannerDay) => {
    const invalidTasks = day.plannedTasks.filter(task => 
      !validChapterIds.includes(task.chapterId)
    );
    if (invalidTasks.length > 0) {
      issues.push(`Day ${day.date} has ${invalidTasks.length} invalid tasks`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Prepare complete export data with all relationships
 */
export const prepareExportData = (state: any) => {
  const currentUser = state.getCurrentUser();
  const userData = state.userData[state.currentUserId];
  
  return {
    // Metadata
    exportDate: new Date().toISOString(),
    version: '2.1', // Updated version for new data structure
    user: currentUser ? {
      name: currentUser.name,
      grade: currentUser.grade,
      level: currentUser.level,
      streak: currentUser.streak
    } : null,
    
    // Core data
    chapters: state.chapters,
    exams: state.exams,
    examGroups: state.examGroups,
    offDays: state.offDays,
    dailyLogs: state.dailyLogs,
    studyPlans: state.studyPlans,
    activeStudyPlanId: state.activeStudyPlanId,
    
    // New data types that were missing
    plannerDays: state.plannerDays,
    chapterAssignments: state.chapterAssignments,
    activitySessions: state.activitySessions,
    
    // Settings
    settings: state.settings,
    
    // Statistics
    stats: {
      totalChapters: state.chapters.length,
      completedChapters: state.chapters.filter((c: any) => 
        c.studyStatus === 'done' && c.revisionStatus === 'done'
      ).length,
      totalAssignments: state.chapterAssignments.length,
      completedAssignments: state.chapterAssignments.filter((a: any) => 
        a.status === 'completed'
      ).length,
      totalStudyTime: state.activitySessions.reduce((sum: number, s: any) => {
        if (s.endTime) {
          const duration = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
          return sum + duration / (1000 * 60); // Convert to minutes
        }
        return sum;
      }, 0)
    }
  };
};

/**
 * Validate and sanitize import data
 */
export const validateImportData = (data: any) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid data format' };
  }
  
  // Check version compatibility
  const version = parseFloat(data.version || '1.0');
  if (version < 2.0) {
    console.warn('Importing from older version, some data may be missing');
  }
  
  // Validate required fields
  const requiredFields = ['chapters'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }
  
  // Ensure arrays
  const arrayFields = [
    'chapters', 'exams', 'examGroups', 'offDays', 'dailyLogs', 
    'studyPlans', 'plannerDays', 'chapterAssignments', 'activitySessions'
  ];
  
  const sanitizedData = { ...data };
  arrayFields.forEach(field => {
    if (!Array.isArray(sanitizedData[field])) {
      sanitizedData[field] = [];
    }
  });
  
  return { isValid: true, data: sanitizedData };
};