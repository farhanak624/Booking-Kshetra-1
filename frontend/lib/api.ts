import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

// Create axios instance
const ApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for booking creation
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Create admin-specific axios instance with enhanced auth handling
const AdminApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Longer timeout for admin operations
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor for auth token
ApiInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
ApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Admin request interceptor with admin-specific auth handling
AdminApiInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add admin role validation
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role !== "admin") {
            throw new Error("Admin access required");
          }
        } catch (error) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/admin/login";
          }
          return Promise.reject(new Error("Invalid admin credentials"));
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin response interceptor with enhanced error handling
AdminApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }

    // Log admin errors for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("Admin API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    return await ApiInstance.post("/auth/login", data);
  },

  register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    return await ApiInstance.post("/auth/register", data);
  },

  logout: async () => {
    return await ApiInstance.post("/auth/logout");
  },

  getProfile: async () => {
    return await ApiInstance.get("/auth/profile");
  },

  updateProfile: async (data: any) => {
    return await ApiInstance.put("/auth/profile", data);
  },
};

// Room API calls
export const roomAPI = {
  getAllRooms: async (params?: any) => {
    return await ApiInstance.get("/rooms", { params });
  },

  getRoomById: async (id: string) => {
    return await ApiInstance.get(`/rooms/${id}`);
  },

  checkAvailability: async (data: {
    checkIn: string;
    checkOut: string;
    roomType?: string;
  }) => {
    return await ApiInstance.post("/rooms/check-availability", data);
  },
};

// Booking API calls
export const bookingAPI = {
  // Public booking (no auth required)
  createPublicBooking: async (data: any) => {
    return await ApiInstance.post("/bookings/public", data);
  },

  // Public booking details (no auth required)
  getPublicBookingById: async (id: string) => {
    return await ApiInstance.get(`/bookings/public/${id}`);
  },

  // Authenticated booking
  createBooking: async (data: any) => {
    return await ApiInstance.post("/bookings", data);
  },

  getUserBookings: async (params?: any) => {
    return await ApiInstance.get("/bookings/user", { params });
  },

  getBookingById: async (id: string) => {
    return await ApiInstance.get(`/bookings/${id}`);
  },

  cancelBooking: async (id: string) => {
    return await ApiInstance.patch(`/bookings/${id}/cancel`);
  },

  // Upload license photo for vehicle rental
  uploadLicensePhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return await ApiInstance.post(`/bookings/${id}/upload-license`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Verify license photo (admin only)
  verifyLicensePhoto: async (id: string, verified: boolean) => {
    return await ApiInstance.patch(`/bookings/${id}/verify-license`, { verified });
  },
};

// Payment API calls
export const paymentAPI = {
  createOrder: async (data: { amount: number; bookingId: string }) => {
    return await ApiInstance.post("/payments/public/create-order", data);
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId: string;
  }) => {
    return await ApiInstance.post("/payments/public/verify", data);
  },
};

// Service API calls
export const serviceAPI = {
  getAllServices: async (params?: any) => {
    return await ApiInstance.get("/services", { params });
  },

  getServiceById: async (id: string) => {
    return await ApiInstance.get(`/services/${id}`);
  },
};

// Vehicle API calls (public)
export const vehicleAPI = {
  getAllVehicles: async (params?: any) => {
    return await ApiInstance.get("/vehicles", { params });
  },

  getVehiclesByType: async (type: string) => {
    return await ApiInstance.get(`/vehicles/type/${type}`);
  },

  getVehicleById: async (id: string) => {
    return await ApiInstance.get(`/vehicles/${id}`);
  },
};

// Adventure Sports API calls (public)
export const adventureSportsAPI = {
  getAllAdventureSports: async (params?: any) => {
    return await ApiInstance.get("/adventure-sports", { params });
  },

  getAdventureSportById: async (id: string) => {
    return await ApiInstance.get(`/adventure-sports/${id}`);
  },

  getAdventureSportsByCategory: async (category: string) => {
    return await ApiInstance.get(`/adventure-sports/category/${category}`);
  },
};

// Yoga API calls
export const yogaAPI = {
  getAllSessions: async (params?: any) => {
    return await ApiInstance.get("/yoga/sessions", { params });
  },

  getSessionById: async (id: string) => {
    return await ApiInstance.get(`/yoga/sessions/${id}`);
  },

  getAllTeachers: async (params?: any) => {
    return await ApiInstance.get("/yoga/teachers", { params });
  },

  getTeacherById: async (id: string) => {
    return await ApiInstance.get(`/yoga/teachers/${id}`);
  },

  bookSession: async (data: { sessionId: string; participants: number }) => {
    return await ApiInstance.post("/yoga/book", data);
  },

  // Daily yoga sessions
  getAllDailySessions: async (params?: any) => {
    return await ApiInstance.get("/yoga/daily-sessions", { params });
  },

  getDailySessionById: async (id: string) => {
    return await ApiInstance.get(`/yoga/daily-sessions/${id}`);
  },
};

// Notification API calls
export const notificationAPI = {
  sendBookingConfirmation: async (bookingId: string) => {
    return await ApiInstance.post("/notifications/booking-confirmation", {
      bookingId,
    });
  },

  sendWhatsApp: async (data: { phone: string; message: string }) => {
    return await ApiInstance.post("/notifications/whatsapp", data);
  },

  sendEmail: async (data: { email: string; subject: string; html: string }) => {
    return await ApiInstance.post("/notifications/email", data);
  },
};

// Admin API calls
export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    return await AdminApiInstance.get("/admin/dashboard");
  },

  // Room Management
  getAllRooms: async (params?: any) => {
    return await AdminApiInstance.get("/admin/rooms", { params });
  },

  createRoom: async (data: FormData) => {
    return await AdminApiInstance.post("/admin/rooms", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateRoom: async (id: string, data: FormData) => {
    return await AdminApiInstance.put(`/admin/rooms/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteRoom: async (id: string) => {
    return await AdminApiInstance.delete(`/admin/rooms/${id}`);
  },

  getRoomAvailability: async (params?: any) => {
    return await AdminApiInstance.get("/admin/rooms/availability", { params });
  },

  bulkUpdateAvailability: async (data: any) => {
    return await AdminApiInstance.patch("/admin/rooms/bulk-availability", data);
  },

  // Booking Management
  getAllBookings: async (params?: any) => {
    return await AdminApiInstance.get("/admin/bookings", { params });
  },

  createBooking: async (data: any) => {
    return await AdminApiInstance.post("/admin/bookings", data);
  },

  updateBookingStatus: async (id: string, data: { status: string }) => {
    return await AdminApiInstance.put(`/admin/bookings/${id}/status`, data);
  },

  // User Management
  getAllUsers: async (params?: any) => {
    return await AdminApiInstance.get("/admin/users", { params });
  },

  updateUserStatus: async (id: string, data: { isActive: boolean }) => {
    return await AdminApiInstance.patch(`/admin/users/${id}/status`, data);
  },

  // Service Management
  getAllServices: async (params?: any) => {
    return await AdminApiInstance.get("/admin/services", { params });
  },

  createService: async (data: any) => {
    return await AdminApiInstance.post("/admin/services", data);
  },

  updateService: async (id: string, data: any) => {
    return await AdminApiInstance.put(`/admin/services/${id}`, data);
  },

  deleteService: async (id: string) => {
    return await AdminApiInstance.delete(`/admin/services/${id}`);
  },

  // Yoga Session Management
  getAllYogaSessions: async (params?: any) => {
    return await AdminApiInstance.get("/yoga/sessions", { params });
  },

  getYogaSessionById: async (id: string) => {
    return await AdminApiInstance.get(`/yoga/sessions/${id}`);
  },

  createYogaSession: async (data: any) => {
    return await AdminApiInstance.post("/yoga/sessions", data);
  },

  updateYogaSession: async (id: string, data: any) => {
    return await AdminApiInstance.put(`/yoga/sessions/${id}`, data);
  },

  deleteYogaSession: async (id: string) => {
    return await AdminApiInstance.delete(`/yoga/sessions/${id}`);
  },

  // Yoga Teacher Management
  getAllYogaTeachers: async (params?: any) => {
    return await AdminApiInstance.get("/yoga/teachers", { params });
  },

  getYogaTeacherById: async (id: string) => {
    return await AdminApiInstance.get(`/yoga/teachers/${id}`);
  },

  createYogaTeacher: async (data: any) => {
    return await AdminApiInstance.post("/yoga/teachers", data);
  },

  updateYogaTeacher: async (id: string, data: any) => {
    return await AdminApiInstance.put(`/yoga/teachers/${id}`, data);
  },

  deleteYogaTeacher: async (id: string) => {
    return await AdminApiInstance.delete(`/yoga/teachers/${id}`);
  },

  // Yoga Course Management
  getAllYogaCourses: async (params?: any) => {
    return await AdminApiInstance.get("/yoga/courses", { params });
  },

  getYogaCourseById: async (id: string) => {
    return await AdminApiInstance.get(`/yoga/courses/${id}`);
  },

  // Yoga Analytics
  getYogaAnalytics: async () => {
    return await AdminApiInstance.get("/yoga/analytics");
  },

  // Daily Yoga Session Management
  getAllDailyYogaSessions: async (params?: any) => {
    return await AdminApiInstance.get("/yoga/daily-sessions", { params });
  },

  getDailyYogaSessionById: async (id: string) => {
    return await AdminApiInstance.get(`/yoga/daily-sessions/${id}`);
  },

  createDailyYogaSession: async (data: any) => {
    return await AdminApiInstance.post("/yoga/daily-sessions", data);
  },

  updateDailyYogaSession: async (id: string, data: any) => {
    return await AdminApiInstance.put(`/yoga/daily-sessions/${id}`, data);
  },

  deleteDailyYogaSession: async (id: string) => {
    return await AdminApiInstance.delete(`/yoga/daily-sessions/${id}`);
  },

  // Adventure Sports Management
  getAllAdventureSports: async (params?: any) => {
    return await AdminApiInstance.get("/admin/adventure-sports", { params });
  },

  createAdventureSport: async (data: any) => {
    return await AdminApiInstance.post("/admin/adventure-sports", data);
  },

  updateAdventureSport: async (id: string, data: any) => {
    return await AdminApiInstance.put(`/admin/adventure-sports/${id}`, data);
  },

  deleteAdventureSport: async (id: string) => {
    return await AdminApiInstance.delete(`/admin/adventure-sports/${id}`);
  },

  uploadAdventureSportImages: async (id: string, data: FormData) => {
    return await AdminApiInstance.post(
      `/admin/adventure-sports/${id}/upload-images`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // Vehicle Rental Management
  getAllVehicles: async (params?: any) => {
    return await AdminApiInstance.get("/admin/vehicles", { params });
  },

  createVehicle: async (data: any) => {
    return await AdminApiInstance.post("/admin/vehicles", data);
  },

  updateVehicle: async (id: string, data: any) => {
    return await AdminApiInstance.put(`/admin/vehicles/${id}`, data);
  },

  deleteVehicle: async (id: string) => {
    return await AdminApiInstance.delete(`/admin/vehicles/${id}`);
  },

  uploadVehicleImages: async (id: string, data: FormData) => {
    return await AdminApiInstance.post(
      `/vehicles/admin/${id}/upload-images`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // Accommodation Management
  getAllAccommodations: async () => {
    return await AdminApiInstance.get("/admin/accommodations");
  },

  createAccommodation: async (data: FormData) => {
    return await AdminApiInstance.post("/admin/accommodations", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateAccommodation: async (id: string, data: FormData) => {
    return await AdminApiInstance.put(`/admin/accommodations/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteAccommodation: async (id: string) => {
    return await AdminApiInstance.delete(`/admin/accommodations/${id}`);
  },
};

// Accommodation API calls (public)
export const accommodationAPI = {
  getAllAccommodations: async () => {
    return await ApiInstance.get("/accommodations");
  },
};

// Contact API calls
export const contactAPI = {
  sendMessage: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    return await ApiInstance.post("/contact", data);
  },
};

// Note: Coupon API has been moved to /lib/api/coupons.ts for better organization

// Service pricing constants
export const SERVICE_PRICES = {
  TRANSPORT: {
    PICKUP: 1500,
    DROP: 1500,
  },
  BREAKFAST: 200, // per person per day
  FOOD: 150, // per adult per day (included in room booking)
  BIKE_RENTAL: 500, // per bike per day
  SIGHTSEEING: 1500, // per person
  SURFING: 2000, // per person
  YOGA: {
    "200hr": 15000,
    "300hr": 20000,
  },
} as const;

// Export the main instance for custom calls
export default ApiInstance;

// Export the admin instance for custom admin calls
export { AdminApiInstance };
