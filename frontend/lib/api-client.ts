import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  useAgencyAuth?: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl?: string) {
    const baseURL = baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:5001/api";

    console.log('API Client Base URL:', baseURL); // Debug log

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear both tokens and redirect to appropriate login
          localStorage.removeItem("token");
          localStorage.removeItem("agencyToken");
          if (window.location.pathname.startsWith("/agency")) {
            window.location.href = "/agency/login";
          } else {
            window.location.href = "/admin/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthHeaders(useAgencyAuth = false): Record<string, string> {
    const tokenKey = useAgencyAuth ? "agencyToken" : "token";
    const token = localStorage.getItem(tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: AxiosResponse): Promise<ApiResponse<T>> {
    try {
      return response.data;
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, requireAuth = false, useAgencyAuth = false } = options;

    try {
      const requestHeaders: Record<string, string> = {
        ...headers,
      };

      if (requireAuth) {
        Object.assign(requestHeaders, this.getAuthHeaders(useAgencyAuth));
      }

      const config: any = {
        method,
        headers: requestHeaders,
        url: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
      };

      if (body && method !== "GET") {
        if (body instanceof FormData) {
          delete requestHeaders["Content-Type"]; // Let axios set multipart boundary
          config.data = body;
        } else {
          config.data = body;
        }
      }

      console.log('Making API request:', {
        method,
        url: config.url,
        baseURL: this.axiosInstance.defaults.baseURL,
        headers: requestHeaders,
        hasBody: !!body
      });

      const response = await this.axiosInstance.request(config);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      console.error("Request Error:", error);
      console.error("Request Details:", {
        method,
        endpoint,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 403) {
          return {
            success: false,
            error: "Access denied",
          };
        }
        if (status === 404) {
          return {
            success: false,
            error: "Resource not found",
          };
        }
        if (status >= 500) {
          return {
            success: false,
            error: "Server error. Please try again later.",
          };
        }
        return {
          success: false,
          error: error.response.data?.message || `HTTP ${status}`,
        };
      }

      if (error.code === 'NETWORK_ERROR' || error.message.includes("Network Error")) {
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        };
      }

      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", requireAuth });
  }

  async post<T>(
    endpoint: string,
    body: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, requireAuth });
  }

  async put<T>(
    endpoint: string,
    body: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, requireAuth });
  }

  async patch<T>(
    endpoint: string,
    body: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body, requireAuth });
  }

  async delete<T>(
    endpoint: string,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", requireAuth });
  }

  // Agency-specific convenience methods
  async agencyGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", requireAuth: true, useAgencyAuth: true });
  }

  async agencyPost<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, requireAuth: true, useAgencyAuth: true });
  }

  async agencyPut<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, requireAuth: true, useAgencyAuth: true });
  }

  async agencyDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", requireAuth: true, useAgencyAuth: true });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
