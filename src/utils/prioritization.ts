import { Chapter, Exam, OffDay, DailyTask } from '../types';
import { differenceInDays, parseISO, isSameDay, addDays, isAfter, isBefore } from 'date-fns';

export interface ChapterWithPriority extends Chapter {
  priority: number;
  urgency: number;
  scarcity: number;
  examDate?: string;
  daysUntilExam?: number;
}

const TYPE_WEIGHTS = {
  'final': 1.5,
  'mid-term': 1.3,
  'quarterly': 1.2,
  'monthly': 1.1,
  'weekly': 1.0,
};

export function calculateChapterPriority(
  chapter: Chapter,
  exams: Exam[],
  offDays: OffDay[],
  currentDate: string
): ChapterWithPriority {
  const relevantExam = exams
    .filter((exam) => exam.subjects.includes(chapter.subject))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  if (!relevantExam) {
    return {
      ...chapter,
      priority: 0,
      urgency: 0,
      scarcity: 0,
    };
  }
  
  const examDate = parseISO(relevantExam.date);
  const today = parseISO(currentDate);
  const daysUntilExam = differenceInDays(examDate, today);
  
  // Calculate available study days (excluding off days)
  const availableDays = calculateAvailableDays(currentDate, relevantExam.date, offDays);
  
  // Calculate remaining hours
  const leftHours = Math.max(0, chapter.estimatedHours - chapter.completedHours);
  
  // Calculate urgency (0 to 1, higher means more urgent)
  const urgency = daysUntilExam > 0 ? Math.max(0, 1 - (daysUntilExam / 30)) : 1;
  
  // Calculate scarcity (0 to 1, higher means less time available)
  const scarcity = availableDays > 0 ? Math.max(0, 1 - (availableDays / 30)) : 1;
  
  // Get exam type weight
  const typeWeight = TYPE_WEIGHTS[relevantExam.type] || 1;
  
  // Calculate priority using the formula
  const priority = leftHours * typeWeight * (2 * urgency + scarcity);
  
  return {
    ...chapter,
    priority,
    urgency,
    scarcity,
    examDate: relevantExam.date,
    daysUntilExam,
  };
}

export function calculateAvailableDays(
  startDate: string,
  endDate: string,
  offDays: OffDay[]
): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let availableDays = 0;
  
  for (let date = start; !isAfter(date, end); date = addDays(date, 1)) {
    const isOffDay = offDays.some((offDay) =>
      isSameDay(parseISO(offDay.date), date)
    );
    if (!isOffDay) {
      availableDays++;
    }
  }
  
  return availableDays;
}

export function generateDailyPlan(
  chapters: Chapter[],
  exams: Exam[],
  offDays: OffDay[],
  currentDate: string,
  dailyHours: number,
  sessionMinutes: number
): DailyTask[] {
  // Check if today is an off day
  const isOffDay = offDays.some((offDay) =>
    isSameDay(parseISO(offDay.date), parseISO(currentDate))
  );
  
  if (isOffDay) {
    return [];
  }
  
  // Calculate priorities for all chapters
  const chaptersWithPriority = chapters
    .filter((chapter) => chapter.status !== 'completed')
    .map((chapter) => calculateChapterPriority(chapter, exams, offDays, currentDate))
    .sort((a, b) => b.priority - a.priority);
  
  const dailyMinutes = dailyHours * 60;
  const tasks: DailyTask[] = [];
  let remainingMinutes = dailyMinutes;
  
  for (const chapter of chaptersWithPriority) {
    if (remainingMinutes <= 0) break;
    
    const remainingChapterHours = chapter.estimatedHours - chapter.completedHours;
    const remainingChapterMinutes = remainingChapterHours * 60;
    
    if (remainingChapterMinutes <= 0) continue;
    
    // Allocate time in session chunks
    const allocatedMinutes = Math.min(
      remainingMinutes,
      remainingChapterMinutes,
      sessionMinutes * 2 // Maximum 2 sessions per subject per day
    );
    
    if (allocatedMinutes >= sessionMinutes / 2) { // Only add if at least half a session
      tasks.push({
        id: generateTaskId(),
        chapterId: chapter.id,
        subject: chapter.subject,
        chapterName: chapter.name,
        allocatedMinutes,
        status: 'pending',
        priority: chapter.priority,
        date: currentDate,
      });
      
      remainingMinutes -= allocatedMinutes;
    }
  }
  
  return tasks;
}

function generateTaskId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getSubjectStats(chapters: Chapter[]): Map<string, {
  total: number;
  completed: number;
  inProgress: number;
  totalHours: number;
  completedHours: number;
}> {
  const stats = new Map();
  
  chapters.forEach((chapter) => {
    const current = stats.get(chapter.subject) || {
      total: 0,
      completed: 0,
      inProgress: 0,
      totalHours: 0,
      completedHours: 0,
    };
    
    current.total++;
    current.totalHours += chapter.estimatedHours;
    current.completedHours += chapter.completedHours;
    
    if (chapter.status === 'completed') {
      current.completed++;
    } else if (chapter.status === 'in-progress') {
      current.inProgress++;
    }
    
    stats.set(chapter.subject, current);
  });
  
  return stats;
}