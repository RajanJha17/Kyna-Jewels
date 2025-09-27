const API_BASE_URL = "http://localhost:5000/api";
import { getAccessToken } from "@/lib/authToken";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = getAccessToken();
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        credentials: "include",
        ...options,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          error: data.message || "Request failed",
        };
      }
    } catch {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  // Auth APIs
  async signup(userData: { name: string; email: string; password: string }) {
    return this.makeRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
    useCookie?: boolean;
  }) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.makeRequest("/auth/logout", {
      method: "POST",
    });
  }

  async verifyEmail(verificationData: { email: string; otp: string }) {
    return this.makeRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.makeRequest(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }
async updateProfile(profileData: Record<string, any>) {
  return this.makeRequest("/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // explicitly JSON
    },
    body: JSON.stringify(profileData),
  });
}


  async checkAuth() {
    return this.makeRequest("/auth/check-auth");
  }

  async getProfile() {
  return this.makeRequest("/auth/profile", {
    method: "GET",
  });
}


  // Test API connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok; // Any successful response means server is running
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
