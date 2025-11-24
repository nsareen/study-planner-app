import { Chapter, ChapterAssignment, ActivitySession, StudyPlan, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          message: data.message || `HTTP ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to connect to server',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';

    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  async getUsers(): Promise<ApiResponse<UserProfile[]>> {
    return this.get<UserProfile[]>('/users');
  }

  async getUser(userId: string): Promise<ApiResponse<UserProfile>> {
    return this.get<UserProfile>(`/users/${userId}`);
  }

  async createUser(user: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.post<UserProfile>('/users', user);
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.patch<UserProfile>(`/users/${userId}`, updates);
  }

  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/users/${userId}/stats`);
  }

  // ============================================================================
  // CHAPTER ENDPOINTS
  // ============================================================================

  async getChapters(userId: string): Promise<ApiResponse<Chapter[]>> {
    return this.get<Chapter[]>('/chapters', { userId });
  }

  async getChapter(chapterId: string): Promise<ApiResponse<Chapter>> {
    return this.get<Chapter>(`/chapters/${chapterId}`);
  }

  async createChapter(userId: string, chapter: Partial<Chapter>): Promise<ApiResponse<Chapter>> {
    return this.post<Chapter>('/chapters', { ...chapter, userId });
  }

  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<ApiResponse<Chapter>> {
    return this.patch<Chapter>(`/chapters/${chapterId}`, updates);
  }

  async deleteChapter(chapterId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chapters/${chapterId}`);
  }

  async getChapterStats(userId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/chapters/stats/${userId}`);
  }

  // ============================================================================
  // ASSIGNMENT ENDPOINTS
  // ============================================================================

  async getAssignments(
    userId: string,
    filters?: { date?: string; planId?: string }
  ): Promise<ApiResponse<ChapterAssignment[]>> {
    const params: Record<string, string> = { userId };
    if (filters?.date) params.date = filters.date;
    if (filters?.planId) params.planId = filters.planId;

    return this.get<ChapterAssignment[]>('/assignments', params);
  }

  async getAssignment(assignmentId: string): Promise<ApiResponse<ChapterAssignment>> {
    return this.get<ChapterAssignment>(`/assignments/${assignmentId}`);
  }

  async createAssignment(
    userId: string,
    assignment: Partial<ChapterAssignment>
  ): Promise<ApiResponse<ChapterAssignment>> {
    return this.post<ChapterAssignment>('/assignments', { ...assignment, userId });
  }

  async updateAssignment(
    assignmentId: string,
    updates: Partial<ChapterAssignment>
  ): Promise<ApiResponse<ChapterAssignment>> {
    return this.patch<ChapterAssignment>(`/assignments/${assignmentId}`, updates);
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/assignments/${assignmentId}`);
  }

  async getAssignmentsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ChapterAssignment[]>> {
    return this.get<ChapterAssignment[]>('/assignments/date-range', {
      userId,
      startDate,
      endDate,
    });
  }

  // ============================================================================
  // SESSION ENDPOINTS
  // ============================================================================

  async getSessions(
    userId: string,
    filters?: { date?: string; assignmentId?: string }
  ): Promise<ApiResponse<ActivitySession[]>> {
    const params: Record<string, string> = { userId };
    if (filters?.date) params.date = filters.date;
    if (filters?.assignmentId) params.assignmentId = filters.assignmentId;

    return this.get<ActivitySession[]>('/sessions', params);
  }

  async getActiveSession(userId: string): Promise<ApiResponse<ActivitySession | null>> {
    return this.get<ActivitySession | null>('/sessions/active', { userId });
  }

  async createSession(
    userId: string,
    session: Partial<ActivitySession>
  ): Promise<ApiResponse<ActivitySession>> {
    return this.post<ActivitySession>('/sessions', { ...session, userId });
  }

  async pauseSession(sessionId: string): Promise<ApiResponse<ActivitySession>> {
    return this.patch<ActivitySession>(`/sessions/${sessionId}/pause`, {});
  }

  async resumeSession(sessionId: string): Promise<ApiResponse<ActivitySession>> {
    return this.patch<ActivitySession>(`/sessions/${sessionId}/resume`, {});
  }

  async completeSession(sessionId: string): Promise<ApiResponse<ActivitySession>> {
    return this.patch<ActivitySession>(`/sessions/${sessionId}/complete`, {});
  }

  // ============================================================================
  // STUDY PLAN ENDPOINTS
  // ============================================================================

  async getStudyPlans(userId: string): Promise<ApiResponse<StudyPlan[]>> {
    return this.get<StudyPlan[]>('/study-plans', { userId });
  }

  async getStudyPlan(planId: string): Promise<ApiResponse<StudyPlan>> {
    return this.get<StudyPlan>(`/study-plans/${planId}`);
  }

  async createStudyPlan(
    userId: string,
    plan: Partial<StudyPlan>
  ): Promise<ApiResponse<StudyPlan>> {
    return this.post<StudyPlan>('/study-plans', { ...plan, userId });
  }

  async updateStudyPlan(
    planId: string,
    updates: Partial<StudyPlan>
  ): Promise<ApiResponse<StudyPlan>> {
    return this.patch<StudyPlan>(`/study-plans/${planId}`, updates);
  }

  async deleteStudyPlan(planId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/study-plans/${planId}`);
  }

  async activateStudyPlan(planId: string, userId: string): Promise<ApiResponse<StudyPlan>> {
    return this.post<StudyPlan>(`/study-plans/${planId}/activate`, { userId });
  }

  // ============================================================================
  // SYNC ENDPOINTS
  // ============================================================================

  async pushToCloud(userId: string, data: any): Promise<ApiResponse<any>> {
    return this.post<any>('/sync/push', { userId, data });
  }

  async pullFromCloud(userId: string): Promise<ApiResponse<any>> {
    return this.get<any>('/sync/pull', { userId });
  }

  async getSyncStatus(userId: string): Promise<ApiResponse<any>> {
    return this.get<any>('/sync/status', { userId });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
