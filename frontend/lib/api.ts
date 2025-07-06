const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  auth = {
    connectWallet: (data: { walletAddress: string; signature: string; message: string }) =>
      this.post('/auth/connect-wallet', data),
    
    register: (data: { walletAddress: string; profile: any }) =>
      this.post('/auth/register', data),
  };

  users = {
    getProfile: () => this.get('/users/profile'),
    
    updateProfile: (data: any) => this.put('/users/profile', data),
    
    getDashboard: () => this.get('/users/dashboard'),
    
    getReputation: () => this.get('/users/reputation'),
  };

  investments = {
    create: (data: {
      amount: number;
      purpose: string;
      description: string;
      interestRate: number;
      duration: number;
    }) => this.post('/investments/create', data),
    
    fund: (data: { investmentId: string; transactionId: string }) =>
      this.post('/investments/fund', data),
    
    explore: (params: { page?: number; limit?: number; status?: string } = {}) => {
      const queryString = new URLSearchParams(params as any).toString();
      return this.get(`/investments/explore?${queryString}`);
    },
    
    getMyInvestments: () => this.get('/investments/my-investments'),
    
    getById: (id: string) => this.get(`/investments/${id}`),
  };

  documents = {
    getMyDocuments: (params: { status?: string; type?: string } = {}) => {
      const queryString = new URLSearchParams(params as any).toString();
      return this.get(`/documents/my-documents?${queryString}`);
    },

    getVerificationQueue: (params: { status?: string; page?: number; limit?: number } = {}) => {
      const queryString = new URLSearchParams(params as any).toString();
      return this.get(`/documents/verification-queue?${queryString}`);
    },

    verify: (id: string, data: { algorandTxId?: string }) =>
      this.put(`/documents/${id}/verify`, data),

    reject: (id: string, data: { reason: string }) =>
      this.put(`/documents/${id}/reject`, data),

    delete: (id: string) => this.delete(`/documents/${id}`),

    getStats: () => this.get('/documents/stats'),
  };
}

export const api = new ApiClient();
export default api;