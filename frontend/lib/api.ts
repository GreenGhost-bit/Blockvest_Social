const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
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
        
        // Handle specific error cases
        if (response.status === 401) {
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          throw new Error('Authentication required. Please reconnect your wallet.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. Insufficient permissions.');
        }
        
        if (response.status >= 500 && retryCount < 3) {
          // Retry on server errors
          console.warn(`Server error, retrying... (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < 3 && error instanceof TypeError) {
        // Network error, retry
        console.warn(`Network error, retrying... (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
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

  mfa = {
    getStatus: () => this.get('/mfa/status'),

    setupTOTP: () => this.post('/mfa/setup/totp'),

    verifyTOTP: (data: { token: string; isSetupVerification?: boolean }) =>
      this.post('/mfa/verify/totp', data),

    setupAlgorand: () => this.post('/mfa/setup/algorand'),

    verifyAlgorand: (data: { challenge: string; signature: string; isSetupVerification?: boolean }) =>
      this.post('/mfa/verify/algorand', data),

    setupEmail: () => this.post('/mfa/setup/email'),

    verifyEmail: (data: { code: string; isSetupVerification?: boolean }) =>
      this.post('/mfa/verify/email', data),

    verifyBackupCode: (data: { code: string }) =>
      this.post('/mfa/verify/backup-code', data),

    trustDevice: (data: { deviceName: string }) =>
      this.post('/mfa/trust-device', data),

    updateSettings: (data: { settings: any }) =>
      this.put('/mfa/settings', data),

    disableMethod: (method: string) =>
      this.delete(`/mfa/disable/${method}`),

    getTrustedDevices: () => this.get('/mfa/trusted-devices'),

    removeTrustedDevice: (deviceId: string) =>
      this.delete(`/mfa/trusted-devices/${deviceId}`),
  };

  riskAssessment = {
    assessInvestment: (investmentId: string) =>
      this.post(`/risk-assessment/assess/${investmentId}`),

    getAssessment: (investmentId: string) =>
      this.get(`/risk-assessment/investment/${investmentId}`),

    getBorrowerAssessments: (borrowerId: string) =>
      this.get(`/risk-assessment/borrower/${borrowerId}`),

    overrideAssessment: (assessmentId: string, data: { factor: string; newScore: number; reason: string }) =>
      this.put(`/risk-assessment/override/${assessmentId}`, data),

    getAnalytics: (timeframe: number = 30) =>
      this.get(`/risk-assessment/analytics/platform?timeframe=${timeframe}`),

    reassessInvestment: (assessmentId: string) =>
      this.post(`/risk-assessment/reassess/${assessmentId}`),
  };
}

export const api = new ApiClient();
export default api;