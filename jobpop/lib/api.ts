const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  isVerified: boolean;
  avatar?: string;
  role: 'applicant' | 'employer';
  companyName?: string;
  wallet: {
    balance: number;
    currency: string;
  };
  stats?: {
    totalJobs: number;
    averageRating: number;
  };
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  employer: User;
  companyName: string;
  pay: {
    amount: number;
    currency: string;
    type: 'hourly' | 'fixed' | 'commission';
  };
  location: {
    address: string;
    city: string;
    coordinates: {
      type: string;
      coordinates: number[];
    };
  };
  date: string;
  time: {
    start: string;
    end: string;
  };
  duration: number;
  requirements: {
    skills: string[];
    experience: string;
    age: {
      min: number;
      max: number;
    };
    ownVehicle: boolean;
    validLicense: boolean;
  };
  status: string;
  isUrgent: boolean;
  isTrending: boolean;
  applications?: Application[];
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  job: Job;
  applicant: User;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  appliedAt: string;
}

export interface Transaction {
  _id: string;
  user: string;
  type: 'earned' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('jobpop_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    role: 'applicant' | 'employer';
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('jobpop_token', response.data.token);
      }
    }
    
    return response;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('jobpop_token', response.data.token);
      }
    }
    
    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobpop_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Jobs methods
  async getJobs(params?: {
    category?: string;
    location?: string;
    minPay?: number;
    maxPay?: number;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; total: number; page: number; pages: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    return this.request(endpoint);
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async createJob(jobData: Partial<Job>): Promise<Job> {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string): Promise<void> {
    return this.request<void>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications methods
  async applyForJob(jobId: string, message?: string): Promise<Application> {
    return this.request<Application>(`/applications/${jobId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getMyApplications(): Promise<Application[]> {
    return this.request<Application[]>('/applications/my');
  }

  async getJobApplications(jobId: string): Promise<Application[]> {
    return this.request<Application[]>(`/applications/job/${jobId}`);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: 'accepted' | 'rejected' | 'completed'
  ): Promise<Application> {
    return this.request<Application>(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // User methods
  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request<{ avatar: string }>('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Wallet methods
  async getWallet(): Promise<{ balance: number; currency: string }> {
    return this.request<{ balance: number; currency: string }>('/payments/wallet');
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/payments/transactions');
  }

  async withdrawFunds(amount: number, paymentMethod: string): Promise<Transaction> {
    return this.request<Transaction>('/payments/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    });
  }

  // Ratings methods
  async rateJob(jobId: string, rating: number, review?: string): Promise<void> {
    return this.request<void>(`/ratings/${jobId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  async getUserRatings(userId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    reviews: Array<{
      rating: number;
      review?: string;
      job: Job;
      createdAt: string;
    }>;
  }> {
    return this.request(`/ratings/user/${userId}`);
  }

  // Notifications methods
  async getNotifications(): Promise<Array<{
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>> {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Chat methods
  async getChats(): Promise<Array<{
    _id: string;
    participants: User[];
    lastMessage?: {
      content: string;
      sender: string;
      createdAt: string;
    };
    unreadCount: number;
  }>> {
    return this.request('/chat');
  }

  async getChatMessages(chatId: string): Promise<Array<{
    _id: string;
    content: string;
    sender: User;
    createdAt: string;
  }>> {
    return this.request(`/chat/${chatId}/messages`);
  }

  async sendMessage(chatId: string, content: string): Promise<{
    _id: string;
    content: string;
    sender: User;
    createdAt: string;
  }> {
    return this.request(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }
}

// Create singleton instance
export const api = new ApiClient();
