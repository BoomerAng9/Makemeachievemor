import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractorApi, vehicleApi, documentApi, opportunityApi, jobApi, messageApi } from "@/lib/api";
import type { InsertContractor, InsertVehicle } from "@shared/schema";

export function useContractor(id?: number) {
  return useQuery({
    queryKey: ['/api/contractors', id],
    queryFn: () => id ? contractorApi.get(id) : null,
    enabled: !!id,
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: contractorApi.create,
    onSuccess: (contractor) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
    },
  });
}

export function useUpdateContractor(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<InsertContractor>) => contractorApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors', id] });
    },
  });
}

export function useContractorVehicles(contractorId?: number) {
  return useQuery({
    queryKey: ['/api/contractors', contractorId, 'vehicles'],
    queryFn: () => contractorId ? vehicleApi.getByContractor(contractorId) : [],
    enabled: !!contractorId,
  });
}

export function useCreateVehicle(contractorId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<InsertVehicle, 'contractorId'>) => vehicleApi.create(contractorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors', contractorId, 'vehicles'] });
    },
  });
}

export function useContractorDocuments(contractorId?: number) {
  return useQuery({
    queryKey: ['/api/contractors', contractorId, 'documents'],
    queryFn: () => contractorId ? documentApi.getByContractor(contractorId) : [],
    enabled: !!contractorId,
  });
}

export function useUploadDocument(contractorId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) => 
      documentApi.upload(contractorId, file, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors', contractorId, 'documents'] });
    },
  });
}

export function useAvailableOpportunities() {
  return useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: opportunityApi.getAvailable,
  });
}

export function useAcceptOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, contractorId }: { opportunityId: number; contractorId: number }) =>
      opportunityApi.accept(opportunityId, contractorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
  });
}

export function useContractorJobs(contractorId?: number) {
  return useQuery({
    queryKey: ['/api/contractors', contractorId, 'jobs'],
    queryFn: () => contractorId ? jobApi.getByContractor(contractorId) : [],
    enabled: !!contractorId,
  });
}

export function useContractorMessages(contractorId?: number) {
  return useQuery({
    queryKey: ['/api/contractors', contractorId, 'messages'],
    queryFn: () => contractorId ? messageApi.getByContractor(contractorId) : [],
    enabled: !!contractorId,
  });
}

export function useContractorStats(contractorId?: number) {
  return useQuery({
    queryKey: ['/api/contractors', contractorId, 'stats'],
    queryFn: () => contractorId ? contractorApi.getStats(contractorId) : null,
    enabled: !!contractorId,
  });
}
