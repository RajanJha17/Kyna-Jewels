const API_BASE_URL = "http://localhost:5000/api";
import { getAccessToken } from "@/lib/authToken";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  // Additional fields that backend may return directly
  token?: string;
  user?: any;
  [key: string]: any; // Allow any additional fields from backend
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = getAccessToken();
      
      // Debug logging
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      console.log(`🔑 Token from storage:`, token ? `${token.substring(0, 20)}...` : 'NULL');
      console.log(`🍪 Cookies will be sent automatically via credentials: "include"`);
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          // Always add Authorization header if token is available in storage
          // Backend will check cookie first, then fall back to Authorization header
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        credentials: "include", // This automatically sends httpOnly cookies
        ...options,
      });
      
      console.log(`📡 Response status: ${response.status}`);

      const data = await response.json();

      // Return backend response directly (don't double wrap)
      if (response.ok) {
        // Backend already returns { success, data, message }
        return data;
      } else {
        return {
          success: false,
          error: data.message || data.error || "Request failed",
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
  async updateProfile(profileData: Record<string, any>, profileImage?: File) {
    // If there's an image, use FormData
    if (profileImage) {
      const formData = new FormData();
      
      // Add all profile data fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      // Add the image file
      formData.append('profileImage', profileImage);
      
      return this.makeRequest("/auth/profile", {
        method: "PUT",
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });
    } else {
      // No image, use JSON
      return this.makeRequest("/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
    }
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


// Order Tracking API Service
class TrackingApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = getAccessToken(); // Get authentication token
      
      // Debug logging
      console.log(`🌐 Tracking API Request: ${options.method || 'GET'} ${endpoint}`);
      console.log(`🔑 Token:`, token ? `${token.substring(0, 20)}...` : 'NULL');
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if token exists
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        credentials: "include", // Send cookies with request
        ...options,
      });

      console.log(`📡 Response status: ${response.status}`);

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || "Request failed",
        };
      }
    } catch (error) {
      console.error('❌ Tracking API Error:', error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  async trackOrder(orderNumber: string, email: string) {
    return this.makeRequest("/tracking/track", {
      method: "POST",
      body: JSON.stringify({ orderNumber, email }),
    });
  }

  async getOrderHistory(email: string, limit: number = 10) {
    return this.makeRequest(`/tracking/history/${email}?limit=${limit}`, {
      method: "GET",
    });
  }

  async healthCheck() {
    return this.makeRequest("/tracking/health", {
      method: "GET",
    });
  }

  async cancelShipment(data: {
    docketNumber: string;
    reason: string;
    orderNumber?: string;
    email?: string;
  }) {
    return this.makeRequest("/tracking/cancel-shipment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAllTestOrders() {
    return this.makeRequest("/tracking/test-orders", {
      method: "GET",
    });
  }

  async downloadPOD(data: {
    orderNumber: string;
    docketNumber: string;
    email: string;
  }) {
    return this.makeRequest("/tracking/download-pod", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export const trackingApi = new TrackingApiService();
export default apiService;
