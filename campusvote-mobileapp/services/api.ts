// API Configuration — connects to campus-vote Laravel backend
import { Platform } from "react-native";

// For physical device testing, use your computer's IP address
// For emulators, use the appropriate internal address
let API_BASE_URL = "http://192.168.0.106:8000/api"; // Physical device

if (Platform.OS === "android") {

  // API_BASE_URL = "http://10.0.2.2:8000/api"; // Android emulator
}

import AsyncStorage from "@react-native-async-storage/async-storage";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  hasVoted?: boolean;
  created_at?: string;
}

interface Election {
  id: number;
  title: string;
  description?: string;
  status: "draft" | "active" | "closed";
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
  created_at?: string;
  election?: Election;
  candidate?: Candidate;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "success";
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  async loadToken() {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      this.token = token;
    } catch (error) {
      console.error("Error loading token:", error);
    }
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem("auth_token", token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const maxRetries = 3;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      console.log(`[API] ${options.method || "GET"} ${url} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      console.log(`[API_BASE_URL] ${API_BASE_URL}`);

      const response = await fetch(url, { ...options, headers, signal: controller.signal });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: response.statusText };
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMsg =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          `Error ${response.status}`;
        console.error(`[API Error] ${errorMsg}`, data);
        return { error: errorMsg };
      }

      console.log(`[API Success] ${endpoint}`, data);
      return { data };
    } catch (error) {
      clearTimeout(timeoutId);
      const errorDetails = error instanceof Error ? error.message : String(error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("[API Timeout]", `Request to ${url} timed out after 30s`);
        if (retryCount < maxRetries) {
          console.log(`[API Retry] Retrying request... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        return { error: 'Request timed out. Please ensure the backend API is running and check your network connection.' };
      }
      
      console.error("[API Network Error]", {
        error: errorDetails,
        url,
        endpoint,
        method: options.method || "GET",
      });

      // Retry on network errors
      if (retryCount < maxRetries) {
        console.log(`[API Retry] Retrying request after network error... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        error: `Network error: ${errorDetails}. Check that the backend is running at ${API_BASE_URL}.`,
      };
    }
  }

  // Auth endpoints
  async register(data: { fullName: string; email: string; password: string }) {
    return this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: data.fullName,
        email: data.email,
        password: data.password,
      }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    const response = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
    this.clearToken();
    return response;
  }

  async getCurrentUser() {
    return this.request<User>("/user");
  }

  // Election endpoints
  async getElections(status?: string) {
    const endpoint = status ? `/elections?status=${status}` : "/elections";
    return this.request<Election[]>(endpoint);
  }

  async getElection(id: number) {
    return this.request<Election>(`/elections/${id}`);
  }

  async createElection(data: Partial<Election>) {
    return this.request<Election>("/elections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateElection(id: number, data: Partial<Election>) {
    return this.request<Election>(`/elections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteElection(id: number) {
    return this.request<{ message: string }>(`/elections/${id}`, {
      method: "DELETE",
    });
  }

  async getElectionResults(id: number) {
    return this.request<{
      election: Election;
      positions: {
        id: number;
        name: string;
        candidates: {
          id: number;
          name: string;
          vote_count: number;
          percentage: number;
          winner: boolean;
        }[];
      }[];
      total_votes: number;
    }>(`/elections/${id}/results`);
  }

  // Candidate endpoints
  async getCandidates(electionId?: number) {
    const endpoint = electionId
      ? `/candidates?election_id=${electionId}`
      : "/candidates";
    return this.request<Candidate[]>(endpoint);
  }

  async getCandidate(id: number) {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async createCandidate(data: Partial<Candidate>) {
    return this.request<Candidate>("/candidates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCandidate(id: number, data: Partial<Candidate>) {
    return this.request<Candidate>(`/candidates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCandidate(id: number) {
    return this.request<{ message: string }>(`/candidates/${id}`, {
      method: "DELETE",
    });
  }

  // Vote endpoints
  async getVotes() {
    return this.request<Vote[]>("/votes");
  }

  async castVote(electionId: number, candidateId: number) {
    return this.request<Vote>("/votes", {
      method: "POST",
      body: JSON.stringify({
        election_id: electionId,
        candidate_id: candidateId,
      }),
    });
  }

  async castVotes(electionId: number, candidateIds: number[]) {
    return this.request<{ success: boolean; message: string; votes: number }>("/votes", {
      method: "POST",
      body: JSON.stringify({
        election_id: electionId,
        candidates: candidateIds,
      }),
    });
  }

  async checkVote(electionId: number) {
    return this.request<{ has_voted: boolean }>(
      `/elections/${electionId}/check-vote`,
    );
  }

  // Announcement endpoints
  async getAnnouncements() {
    return this.request<Announcement[]>("/announcements");
  }

  async createAnnouncement(data: Partial<Announcement>) {
    return this.request<Announcement>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: number) {
    return this.request<{ message: string }>(`/announcements/${id}`, {
      method: "DELETE",
    });
  }

  // User endpoints
  async getUsers() {
    return this.request<User[]>("/users");
  }

  async getUser(id: number) {
    return this.request<User>(`/users/${id}`);
  }

  // Diagnostic endpoint
  async checkBackendConnectivity() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      console.log(`[Diagnostic] Checking backend connectivity at ${API_BASE_URL}`);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[Diagnostic] Backend is reachable", data);
        return { status: "ok", message: "Backend is reachable" };
      } else {
        console.warn("[Diagnostic] Backend returned", response.status);
        return { status: "error", message: `Backend returned status ${response.status}` };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[Diagnostic] Backend is NOT reachable:", errorMsg);
      return { 
        status: "error", 
        message: `Cannot reach backend at ${API_BASE_URL}. Error: ${errorMsg}. Make sure:
1. Backend server is running
2. IP address ${API_BASE_URL} is correct
3. Device/emulator can access the network
4. Firewall is not blocking the connection` 
      };
    }
  }
}

export const api = new ApiService();
export type { User, Election, Candidate, Vote, Announcement };
