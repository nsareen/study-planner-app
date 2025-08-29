import type { Chapter, ChapterAssignment } from '../types';

/**
 * Calculate overall progress for chapters
 * A chapter is considered "in progress" if either study or revision is done
 * Full completion requires both study and revision to be done
 */
export const calculateChapterProgress = (chapters: Chapter[]) => {
  const totalChapters = chapters.length;
  
  if (totalChapters === 0) {
    return {
      totalChapters: 0,
      completedChapters: 0,
      inProgressChapters: 0,
      progressPercentage: 0,
      detailedProgressPercentage: 0,
    };
  }
  
  // Count chapters with at least one activity done (study OR revision)
  const inProgressChapters = chapters.filter(c => 
    c.studyStatus === 'done' || c.revisionStatus === 'done'
  ).length;
  
  // Count fully completed chapters (both study AND revision done)
  const completedChapters = chapters.filter(c => 
    c.studyStatus === 'done' && c.revisionStatus === 'done'
  ).length;
  
  // Simple progress: counts any chapter with at least one activity done
  const progressPercentage = Math.round((inProgressChapters / totalChapters) * 100);
  
  // Detailed progress: each chapter can contribute up to 2 points (1 for study, 1 for revision)
  const totalPoints = totalChapters * 2; // Each chapter has 2 activities
  const earnedPoints = chapters.reduce((sum, chapter) => {
    let points = 0;
    if (chapter.studyStatus === 'done') points += 1;
    if (chapter.revisionStatus === 'done') points += 1;
    return sum + points;
  }, 0);
  const detailedProgressPercentage = Math.round((earnedPoints / totalPoints) * 100);
  
  return {
    totalChapters,
    completedChapters, // Fully completed (both activities)
    inProgressChapters, // At least one activity done
    progressPercentage, // Based on chapters with any progress
    detailedProgressPercentage, // Based on individual activities
  };
};

/**
 * Calculate progress based on assignments
 * Useful for daily or plan-specific progress
 */
export const calculateAssignmentProgress = (assignments: ChapterAssignment[]) => {
  const totalAssignments = assignments.length;
  
  if (totalAssignments === 0) {
    return {
      totalAssignments: 0,
      completedAssignments: 0,
      inProgressAssignments: 0,
      progressPercentage: 0,
    };
  }
  
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in-progress').length;
  
  const progressPercentage = Math.round((completedAssignments / totalAssignments) * 100);
  
  return {
    totalAssignments,
    completedAssignments,
    inProgressAssignments,
    progressPercentage,
  };
};

/**
 * Get motivational message based on progress
 */
export const getProgressMessage = (progressPercentage: number): string => {
  if (progressPercentage === 0) return "Let's get started! 🚀";
  if (progressPercentage < 25) return "Great beginning! Keep going! 💪";
  if (progressPercentage < 50) return "You're making progress! 📈";
  if (progressPercentage < 75) return "Halfway there! You're doing amazing! 🌟";
  if (progressPercentage < 100) return "Almost there! Final push! 🎯";
  return "Mission accomplished! You're a star! 🎉";
};