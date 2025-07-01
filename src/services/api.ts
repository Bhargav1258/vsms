import { ServiceRequest, Mechanic, Invoice, User, Vehicle } from '../types';

const API_URL = 'http://localhost:3001/api';

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  vehicleDetails?: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const http = {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${API_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Success' : 'Error'),
        data: (data.data || data) as T,
        error: !response.ok ? data.message || data.error : undefined,
      };
    } catch (error) {
      console.error('GET request failed:', error);
      return {
        success: false,
        message: 'Request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        message: responseData.message || (response.ok ? 'Success' : 'Error'),
        data: (responseData.data || responseData) as T,
        error: !response.ok ? responseData.message || responseData.error : undefined,
      };
    } catch (error) {
      console.error('POST request failed:', error);
      return {
        success: false,
        message: 'Request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        message: responseData.message || (response.ok ? 'Success' : 'Error'),
        data: responseData.data || responseData,
        error: !response.ok ? responseData.message || responseData.error : undefined,
      };
    } catch (error) {
      console.error('PUT request failed:', error);
      return {
        success: false,
        message: 'Request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        message: responseData.message || (response.ok ? 'Success' : 'Error'),
        data: responseData.data || responseData,
        error: !response.ok ? responseData.message || responseData.error : undefined,
      };
    } catch (error) {
      console.error('DELETE request failed:', error);
      return {
        success: false,
        message: 'Request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      return {
        success: response.ok,
        message: responseData.message || (response.ok ? 'Success' : 'Error'),
        data: responseData.data || responseData,
      };
    } catch (error) {
      console.error('PATCH request failed:', error);
      return {
        success: false,
        message: 'Request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

export const authAPI = {
  async login(credentials: LoginRequest): Promise<ApiResponse<any>> {
    return http.post('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<any>> {
    try {
      if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.address) {
        throw new Error('All fields are required');
      }

      const registrationData = {
        ...userData,
        role: userData.role || 'USER',
      };

      console.log('Sending registration request:', registrationData);
      const response = await http.post('/auth/register', registrationData);
      console.log('Registration response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await http.post<void>('/auth/logout', undefined);
    localStorage.removeItem('authToken');
    return response;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return http.get<User>('/auth/me');
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await http.post<{ token: string }>('/auth/refresh', undefined);
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response;
  },
};

export const serviceRequestAPI = {
  getAll: () => http.get<ServiceRequest[]>('/service-requests'),
  getById: (id: number) => http.get<ServiceRequest>(`/service-requests/${id}`),
  create: (data: CreateServiceRequestDTO) => http.post<ServiceRequest>('/service-requests', data),
  update: (id: number, data: Partial<ServiceRequest>) => http.put<ServiceRequest>(`/service-requests/${id}`, data),
  delete: (id: number) => http.delete<void>(`/service-requests/${id}`),
  assignMechanic: (id: number, mechanicId: number, notes?: string) =>
    http.post<ServiceRequest>(`/service-requests/${id}/assign-mechanic?mechanicId=${mechanicId}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`),
  updateStatus: async (id: number, status: string) =>
    http.put(`/service-requests/${id}/status?status=${encodeURIComponent(status)}`, null),
};

export const mechanicAPI = {
  async getAll(): Promise<ApiResponse<Mechanic[]>> {
    return http.get<Mechanic[]>('/users?role=MECHANIC');
  },

  async create(mechanic: Omit<Mechanic, 'id' | 'vehicles'>): Promise<ApiResponse<Mechanic>> {
    return http.post<Mechanic>('/auth/register', { 
      ...mechanic, 
      role: 'MECHANIC'
    });
  },

  async update(id: number, mechanic: Partial<Mechanic>): Promise<ApiResponse<Mechanic>> {
    return http.put<Mechanic>(`/users/${id}`, mechanic);
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return http.delete<void>(`/users/${id}`);
  },

  getAvailable: async (date?: string): Promise<ApiResponse<Mechanic[]>> => {
    const endpoint = `/users/available?role=MECHANIC${date ? `&date=${date}` : ''}`;
    return http.get<Mechanic[]>(endpoint);
  },
};

export const invoiceAPI = {
  async getAll(): Promise<ApiResponse<Invoice[]>> {
    return http.get('/invoices');
  },

  async create(invoice: Omit<Invoice, 'id'>): Promise<ApiResponse<Invoice>> {
    return http.post('/invoices', invoice);
  },

  async update(id: number, invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return http.put(`/invoices/${id}`, invoice);
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/invoices/${id}`);
  },

  getUserInvoices: async (userId: string): Promise<ApiResponse<Invoice[]>> => {
    return http.get<Invoice[]>(`/users/${userId}/invoices`);
  },

  downloadPDF: async (id: string): Promise<ApiResponse<Blob>> => {
    try {
      const response = await fetch(`${API_URL}/invoices/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return { success: true, message: 'Download successful', data: blob };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to download PDF',
        error: error instanceof Error ? error.message : 'Failed to download PDF',
      };
    }
  },
};

export const paymentAPI = {
  processPayment: async (paymentData: {
    invoiceId: string;
    amount: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: { address: string; city: string; zipCode: string };
  }): Promise<ApiResponse<{ transactionId: string; status: string }>> => {
    return http.post('/payments/process', paymentData);
  },

  getPaymentHistory: async (userId: string): Promise<ApiResponse<any[]>> => {
    return http.get(`/users/${userId}/payments`);
  },

  refundPayment: async (transactionId: string, reason?: string): Promise<ApiResponse<any>> => {
    return http.post(`/payments/${transactionId}/refund`, { reason });
  },
};

export const analyticsAPI = {
  getDashboardStats: async (): Promise<
    ApiResponse<{
      totalRequests: number;
      activeMechanics: number;
      pendingAssignments: number;
      totalInvoices: number;
      revenue: number;
      completedServices: number;
    }>
  > => {
    return http.get('/analytics/dashboard');
  },

  getServiceStats: async (period: 'week' | 'month' | 'year'): Promise<ApiResponse<any[]>> => {
    return http.get(`/analytics/services?period=${period}`);
  },

  getMechanicPerformance: async (): Promise<ApiResponse<any[]>> => {
    return http.get('/analytics/mechanics');
  },

  getRevenueReport: async (startDate: string, endDate: string): Promise<ApiResponse<any>> => {
    return http.get(`/analytics/revenue?start=${startDate}&end=${endDate}`);
  },
};

export const fileAPI = {
  upload: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Success' : 'Error'),
        data: data.data,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        message: 'File upload failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  download: async (filename: string): Promise<ApiResponse<Blob>> => {
    try {
      const response = await fetch(`${API_URL}/files/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Download failed',
          error: errorData.message,
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        message: 'Download successful',
        data: blob,
      };
    } catch (error) {
      console.error('File download failed:', error);
      return {
        success: false,
        message: 'File download failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

export const notificationAPI = {
  getAll: async (userId: string): Promise<ApiResponse<any[]>> => {
    return http.get(`/users/${userId}/notifications`);
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    return http.patch(`/notifications/${notificationId}/read`, undefined);
  },

  markAllAsRead: async (userId: string): Promise<ApiResponse<void>> => {
    return http.patch(`/users/${userId}/notifications/read-all`, undefined);
  },

  delete: async (notificationId: string): Promise<ApiResponse<void>> => {
    return http.delete(`/notifications/${notificationId}`);
  },
};

export const setupTokenRefresh = () => {
  const ONE_HOUR = 60 * 60 * 1000;
  setInterval(async () => {
    const originalGet = http.get;

    http.get = async function <T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
      const result = await originalGet.call(this, endpoint, params);
      if (!result.success && result.error?.includes('token') && result.error?.includes('expired')) {
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse.success) {
          return originalGet.call(this, endpoint, params);
        } else {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      }
      return result;
    };
  }, ONE_HOUR);
};

setupTokenRefresh();

export interface CreateServiceRequestDTO {
  vehicleId: number;
  description: string;
  serviceType: string;
  priority: string;
  preferredDate: string;
  userId?: number;
}

export const vehiclesAPI = {
  async create(userId: number, vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<ApiResponse<Vehicle>> {
    return http.post<Vehicle>(`/vehicles/user/${userId}`, vehicle);
  },
  async getByUserId(userId: number): Promise<ApiResponse<Vehicle[]>> {
    return http.get<Vehicle[]>(`/vehicles/user/${userId}`);
  },
  async getAll(): Promise<ApiResponse<Vehicle[]>> {
    return http.get<Vehicle[]>('/vehicles/all');
  },
  // You can add more methods (get, update, delete) as needed
};

export const serviceItemAPI = {
  create: (serviceRequestId: number, data: Omit<ServiceItem, 'id' | 'invoiceId'>) =>
    http.post<ServiceItem>(`/service-requests/${serviceRequestId}/service-items`, data),
  createInvoice: (serviceRequestId: number, data: { serviceItems: any[] }) =>
    http.post(`/service-requests/${serviceRequestId}/invoice`, data),
};

export async function addServiceItemToRequest(serviceRequestId: number, item: {
  name: string;
  description: string;
  price: number;
  quantity: number;
  type: string;
  partNumber?: string;
  warrantyInfo?: string;
}) {
  const response = await fetch(`${API_URL}/service-requests/${serviceRequestId}/service-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response is empty or not JSON, set data to null
    data = null;
  }
  if (!response.ok) {
    // If backend returned JSON error, use it; otherwise, generic error
    const errorMsg = data && data.error ? data.error : 'Failed to add service item';
    throw new Error(errorMsg);
  }
  if (!data) {
    throw new Error('No response data from server');
  }
  return data;
}