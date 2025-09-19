// API Configuration and Base Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const adminToken = localStorage.getItem('admin_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || 'Request failed',
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error', 0);
    }
  }

  // Authentication
  async register(data: { email: string; password: string }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.makeRequest('/auth/login', {
      method: 'POST', 
      body: JSON.stringify(data),
    });
  }

  async refreshToken() {
    return this.makeRequest('/auth/refresh', { method: 'POST' });
  }

  async logout() {
    return this.makeRequest('/auth/logout', { method: 'POST' });
  }

  // Admin Authentication
  async verifyAdminCode(code: string) {
    return this.makeRequest('/admin/verify-gate-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async adminRegister(data: { email: string; password: string; adminCode: string }) {
    return this.makeRequest('/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminLogin(data: { email: string; password: string }) {
    return this.makeRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Assessments
  async submitPHQ(answers: number[]) {
    return this.makeRequest('/assessments/phq', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async submitGAD(answers: number[]) {
    return this.makeRequest('/assessments/gad', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getAssessmentHistory() {
    return this.makeRequest('/assessments/history');
  }

  // Mood Tracking
  async submitMood(data: { moodValue: number; note?: string }) {
    return this.makeRequest('/mood', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMoodHistory(days?: number) {
    const query = days ? `?days=${days}` : '';
    return this.makeRequest(`/mood/history${query}`);
  }

  async getMoodStreak() {
    return this.makeRequest('/mood/streak');
  }

  // Counseling & Booking
  async getAvailableSlots() {
    return this.makeRequest('/slots/available');
  }

  async bookSession(slotId: string) {
    return this.makeRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    });
  }

  async getMyBookings() {
    return this.makeRequest('/bookings/my');
  }

  async cancelBooking(bookingId: string) {
    return this.makeRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  // Community
  async getCommunityPosts(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.makeRequest(`/community/posts${query}`);
  }

  async createPost(data: { content: string; category: string }) {
    return this.makeRequest('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async likePost(postId: string) {
    return this.makeRequest(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addComment(postId: string, content: string, parentId?: string) {
    return this.makeRequest(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  }

  // Chatbot
  async sendChatMessage(message: string) {
    return this.makeRequest('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChatHistory() {
    return this.makeRequest('/chatbot/history');
  }

  // Resources
  async getResources(type?: string) {
    const query = type ? `?type=${type}` : '';
    return this.makeRequest(`/resources${query}`);
  }

  // User Data
  async exportUserData() {
    return this.makeRequest('/user/export');
  }

  async deleteUserAccount() {
    return this.makeRequest('/user/delete', { method: 'DELETE' });
  }

  // Admin Dashboard
  async getAdminMetrics(dateRange?: { start: string; end: string }) {
    const query = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    return this.makeRequest(`/admin/metrics${query}`);
  }

  async getActiveUsers() {
    return this.makeRequest('/admin/users/active');
  }

  async getPendingBookings() {
    return this.makeRequest('/admin/bookings/pending');
  }

  async createSlot(data: any) {
    return this.makeRequest('/admin/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addResource(data: any) {
    return this.makeRequest('/admin/resources', {
      method: 'POST', 
      body: JSON.stringify(data),
    });
  }

  async sendAdminMessage(userCode: string, message: string) {
    return this.makeRequest('/admin/messages', {
      method: 'POST',
      body: JSON.stringify({ userCode, message }),
    });
  }
}

export const apiService = new APIService();