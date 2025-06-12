import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://your-app.replit.app';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

class ApiServiceClass {
  private async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.makeRequest('/api/auth/user');
  }

  // Driver registration
  async registerDriver(driverData: any) {
    return this.makeRequest('/api/drivers/register', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updateDriverProfile(driverId: string, updates: any) {
    return this.makeRequest(`/api/drivers/${driverId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Contractor registration
  async registerContractor(contractorData: any) {
    return this.makeRequest('/api/contractors/register', {
      method: 'POST',
      body: JSON.stringify(contractorData),
    });
  }

  // Opportunities
  async getOpportunities(filters?: any) {
    const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.makeRequest(`/api/opportunities${queryParams}`);
  }

  async applyToOpportunity(opportunityId: string) {
    return this.makeRequest(`/api/opportunities/${opportunityId}/apply`, {
      method: 'POST',
    });
  }

  // Documents
  async uploadDocument(formData: FormData) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return await response.json();
  }

  async getDocuments() {
    return this.makeRequest('/api/documents');
  }

  async deleteDocument(documentId: string) {
    return this.makeRequest(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Background checks
  async requestBackgroundCheck(contractorId: string, checkType: string) {
    return this.makeRequest('/api/background-checks/request', {
      method: 'POST',
      body: JSON.stringify({ contractorId, checkType }),
    });
  }

  async getBackgroundCheckStatus(requestId: string) {
    return this.makeRequest(`/api/background-checks/${requestId}/status`);
  }

  // Location services
  async updateLocation(location: { latitude: number; longitude: number; address?: string }) {
    return this.makeRequest('/api/location/update', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async getNearbyOpportunities(location: { latitude: number; longitude: number; radius?: number }) {
    return this.makeRequest('/api/location/nearby-opportunities', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  // Dashboard insights
  async getDashboardInsights() {
    return this.makeRequest('/api/dashboard/insights');
  }

  async getPerformanceMetrics() {
    return this.makeRequest('/api/dashboard/performance');
  }
}

export const ApiService = new ApiServiceClass();