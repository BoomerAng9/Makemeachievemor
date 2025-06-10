import { apiRequest } from "./queryClient";
import type { InsertContractor, InsertVehicle, InsertDocument, Contractor, Vehicle, Document, Opportunity, Message, JobAssignment } from "@shared/schema";

export const contractorApi = {
  create: async (data: InsertContractor): Promise<Contractor> => {
    const response = await apiRequest('POST', '/api/contractors', data);
    return response.json();
  },

  get: async (id: number): Promise<Contractor> => {
    const response = await apiRequest('GET', `/api/contractors/${id}`);
    return response.json();
  },

  update: async (id: number, data: Partial<InsertContractor>): Promise<Contractor> => {
    const response = await apiRequest('PUT', `/api/contractors/${id}`, data);
    return response.json();
  },

  getStats: async (id: number) => {
    const response = await apiRequest('GET', `/api/contractors/${id}/stats`);
    return response.json();
  },
};

export const vehicleApi = {
  create: async (contractorId: number, data: Omit<InsertVehicle, 'contractorId'>): Promise<Vehicle> => {
    const response = await apiRequest('POST', `/api/contractors/${contractorId}/vehicles`, data);
    return response.json();
  },

  getByContractor: async (contractorId: number): Promise<Vehicle[]> => {
    const response = await apiRequest('GET', `/api/contractors/${contractorId}/vehicles`);
    return response.json();
  },
};

export const documentApi = {
  upload: async (contractorId: number, file: File, documentType: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    
    const response = await fetch(`/api/contractors/${contractorId}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = (await response.text()) || response.statusText;
      throw new Error(`${response.status}: ${text}`);
    }

    return response.json();
  },

  getByContractor: async (contractorId: number): Promise<Document[]> => {
    const response = await apiRequest('GET', `/api/contractors/${contractorId}/documents`);
    return response.json();
  },
};

export const opportunityApi = {
  getAvailable: async (): Promise<Opportunity[]> => {
    const response = await apiRequest('GET', '/api/opportunities');
    return response.json();
  },

  accept: async (opportunityId: number, contractorId: number): Promise<JobAssignment> => {
    const response = await apiRequest('POST', `/api/opportunities/${opportunityId}/accept`, { contractorId });
    return response.json();
  },
};

export const jobApi = {
  getByContractor: async (contractorId: number): Promise<JobAssignment[]> => {
    const response = await apiRequest('GET', `/api/contractors/${contractorId}/jobs`);
    return response.json();
  },
};

export const messageApi = {
  getByContractor: async (contractorId: number): Promise<Message[]> => {
    const response = await apiRequest('GET', `/api/contractors/${contractorId}/messages`);
    return response.json();
  },

  create: async (contractorId: number, data: Omit<Message, 'id' | 'contractorId' | 'createdAt'>): Promise<Message> => {
    const response = await apiRequest('POST', `/api/contractors/${contractorId}/messages`, data);
    return response.json();
  },
};
