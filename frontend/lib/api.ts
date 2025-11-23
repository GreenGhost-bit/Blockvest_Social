const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Clean up expired cache entries every 10 minutes
    setInterval(() => {
      this.cleanExpiredCache();
    }, 10 * 60 * 1000);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!url || url.trim() === '') {
      throw new Error('Invalid endpoint URL');
    }
    
    // Check cache for GET requests
    const cacheKey = this.getCacheKey(endpoint, options);
    if ((options.method === 'GET' || !options.method) && retryCount === 0) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) {
        console.log('Cache hit for:', cacheKey);
        return cachedData;
      }
    }
    
    // Create request key for deduplication (only for GET requests)
    const requestKey = options.method === 'GET' || !options.method 
      ? `${url}_${token || 'no-token'}` 
      : null;
    
    // Check if same request is already pending
    if (requestKey && this.pendingRequests.has(requestKey)) {
      console.log('Deduplicating request:', requestKey);
      return this.pendingRequests.get(requestKey)!;
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Add timeout to requests
    const controller = new AbortController();
    const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    config.signal = controller.signal;

    // Create the request promise
    const requestPromise = this.executeRequest<T>(url, config, controller, timeoutId, endpoint, options, retryCount);
    
    // Store the promise for deduplication
    if (requestKey) {
      this.pendingRequests.set(requestKey, requestPromise);
    }

    try {
      const result = await requestPromise;
      
      // Cache successful GET requests
      if ((options.method === 'GET' || !options.method) && retryCount === 0) {
        this.setCache(cacheKey, result);
      }
      
      return result;
    } finally {
      // Clean up the pending request
      if (requestKey) {
        this.pendingRequests.delete(requestKey);
      }
    }
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (!entry || typeof entry.timestamp !== 'number' || typeof entry.ttl !== 'number') {
        keysToDelete.push(key);
        continue;
      }
      
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private getCacheKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private getFromCache<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(cacheKey: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private async executeRequest<T>(
    url: string,
    config: RequestInit,
    controller: AbortController,
    timeoutId: NodeJS.Timeout,
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<T> {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
      if (response.status === 401) {
        // Clear invalid token and user data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
          return this.executeRequest<T>(url, config, controller, timeoutId, endpoint, options, retryCount + 1);
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retryCount < 3 && error instanceof TypeError) {
        // Network error, retry
        console.warn(`Network error, retrying... (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
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