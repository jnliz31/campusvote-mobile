// API Configuration
import { Platform } from 'react-native';

let API_BASE_URL = 'http://127.0.0.1:8000/api'; // Default for web/iOS

if (Platform.OS === 'android') {
  API_BASE_URL = 'http://10.0.2.2:8000/api'; // Android emulator
}

// For physical device testing, uncomment and use your computer's IP:
// API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000/api';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  hasVoted?: boolean;
  created_at?: string;
}

interface Election {
  id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  start_date?: string;
  end_date?: string;
  candidates?: Candidate[];
}

interface Candidate {
  id: number;
  election_id: number;
  name: string;
  position?: string;
  description?: string;
  photo?: string;
}

interface Vote {
  id: number;
  user_id: number;
  election_id: number;
  candidate_id: number;
  election?: Election;
  candidate?: Candidate;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  async loadToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      this.token = token;
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  setToken(token: string) {
    this.token = token;
    AsyncStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    AsyncStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // Auth endpoints
  async register(data: { fullName: string; email: string; password: string }) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.fullName,
        email: data.email,
        password: data.password,
      }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async getCurrentUser() {
    return this.request<User>('/user');
  }

  // Election endpoints
  async getElections(status?: string) {
    const endpoint = status ? `/elections?status=${status}` : '/elections';
    return this.request<Election[]>(endpoint);
  }

  async getElection(id: number) {
    return this.request<Election>(`/elections/${id}`);
  }

  async createElection(data: Partial<Election>) {
    return this.request<Election>('/elections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateElection(id: number, data: Partial<Election>) {
    return this.request<Election>(`/elections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteElection(id: number) {
    return this.request<{ message: string }>(`/elections/${id}`, {
      method: 'DELETE',
    });
  }

  async getElectionResults(id: number) {
    return this.request<{ election: Election; results: any[]; total_votes: number }>(
      `/elections/${id}/results`
    );
  }

  // Candidate endpoints
  async getCandidates(electionId?: number) {
    const endpoint = electionId
      ? `/candidates?election_id=${electionId}`
      : '/candidates';
    return this.request<Candidate[]>(endpoint);
  }

  async getCandidate(id: number) {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async createCandidate(data: Partial<Candidate>) {
    return this.request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCandidate(id: number, data: Partial<Candidate>) {
    return this.request<Candidate>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCandidate(id: number) {
    return this.request<{ message: string }>(`/candidates/${id}`, {
      method: 'DELETE',
    });
  }

  // Vote endpoints
  async getVotes() {
    return this.request<Vote[]>('/votes');
  }

  async castVote(electionId: number, candidateId: number) {
    return this.request<Vote>('/votes', {
      method: 'POST',
      body: JSON.stringify({ election_id: electionId, candidate_id: candidateId }),
    });
  }

  async checkVote(electionId: number) {
    return this.request<{ has_voted: boolean }>(`/elections/${electionId}/check-vote`);
  }

  // Announcement endpoints
  async getAnnouncements() {
    return this.request<Announcement[]>('/announcements');
  }

  async createAnnouncement(data: Partial<Announcement>) {
    return this.request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: number) {
    return this.request<{ message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUsers() {
    return this.request<User[]>('/users');
  }

  async getUser(id: number) {
    return this.request<User>(`/users/${id}`);
  }
}

export const api = new ApiService();
export type { User, Election, Candidate, Vote, Announcement };
