import { IStorage, storage } from '../storage'; // Assuming IStorage is exported from storage
import type { Opportunity } from '@shared/schema';

// Custom Error Classes
export class JobNotFoundError extends Error {
  constructor(message = "Job not found") {
    super(message);
    this.name = "JobNotFoundError";
  }
}

export class InvalidJobStateError extends Error {
  constructor(message = "Job is not in a valid state for this operation") {
    super(message);
    this.name = "InvalidJobStateError";
  }
}

export class JobLockedError extends Error {
  constructor(message = "Job is currently locked or action cannot be performed at this time") {
    super(message);
    this.name = "JobLockedError";
  }
}

export class PermissionDeniedError extends Error {
  constructor(message = "Permission denied for this operation") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export class InvalidStateTransitionError extends Error {
    constructor(message = "Invalid state transition for the job") {
        super(message);
        this.name = "InvalidStateTransitionError";
    }
}


export class OpportunityService {
  private storage: IStorage;

  constructor(storageInstance: IStorage) {
    this.storage = storageInstance;
  }

  async requestJob(jobId: string, requestingUserId: string): Promise<Opportunity> {
    const job = await this.storage.getOpportunityById(jobId);

    if (!job) {
      throw new JobNotFoundError(`Job with ID ${jobId} not found.`);
    }

    if (job.status !== 'open') {
      throw new InvalidJobStateError(`Job ${jobId} is not open. Current status: ${job.status}.`);
    }

    if (job.lockExpiresAt && new Date(job.lockExpiresAt) > new Date()) {
      if (job.assigned_to !== requestingUserId) { // Or if assigned_to is null/different
        throw new JobLockedError(`Job ${jobId} is currently locked by another user or process.`);
      }
      // If locked by the same user, allow them to proceed or refresh lock (depending on desired logic)
      // For now, let's assume a simple lock check.
    }

    const lockExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const updateData: Partial<Opportunity> = {
      status: 'requested',
      assigned_to: requestingUserId,
      requestedAt: new Date(),
      lockExpiresAt,
      updatedAt: new Date(),
    };

    const updatedJob = await this.storage.updateOpportunity(jobId, updateData);
    if (!updatedJob) {
        // This case should ideally not happen if getOpportunityById succeeded and update is valid
        throw new Error("Failed to update job after locking.");
    }

    // Notification logic (can be kept in service or moved to a dedicated notification service)
    try {
        await this.storage.createJobNotification(jobId, requestingUserId, 'job_requested');
    } catch (notificationError) {
        console.error(`Failed to create notification for job ${jobId} request by ${requestingUserId}:`, notificationError);
        // Non-critical error, so we don't throw, but we log it.
    }

    return updatedJob;
  }

  async updateJobStatus(jobId: string, newStatus: string, actingUserId: string, authenticatedUser: any): Promise<Opportunity> {
    const job = await this.storage.getOpportunityById(jobId);

    if (!job) {
      throw new JobNotFoundError(`Job with ID ${jobId} not found.`);
    }

    let updateData: Partial<Opportunity> = { updatedAt: new Date() };

    switch (newStatus) {
      case 'assigned':
        if (job.status !== 'requested') {
          throw new InvalidStateTransitionError(`Cannot assign job ${jobId}. Current status: ${job.status}. Expected: requested.`);
        }
        // Permission check: typically admin/super_admin can assign
        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'super_admin')) {
          throw new PermissionDeniedError(`User ${actingUserId} does not have permission to assign job ${jobId}.`);
        }
        // Ensure the job is being assigned to the user who requested it, or allow admin to override
        if (job.assigned_to !== actingUserId && actingUserId !== authenticatedUser.id) { // Simple check, might need refinement for admin override
             console.warn(`Admin ${authenticatedUser.id} assigning job ${jobId} to ${actingUserId}, overriding request by ${job.assigned_to}`);
        }

        updateData = {
          ...updateData,
          status: 'assigned',
          assignedAt: new Date(),
          lockExpiresAt: null, // Clear lock on assignment
          // assigned_to remains the user who requested, unless admin changes it explicitly (not handled here yet)
        };
        break;

      case 'picked_up':
        if (job.status !== 'assigned') {
          throw new InvalidStateTransitionError(`Cannot mark job ${jobId} as picked up. Current status: ${job.status}. Expected: assigned.`);
        }
        if (job.assigned_to !== actingUserId) {
          throw new PermissionDeniedError(`User ${actingUserId} is not assigned to job ${jobId}.`);
        }
        updateData = {
          ...updateData,
          status: 'picked_up',
          pickedUpAt: new Date(),
        };
        break;

      // TODO: Implement 'delivered' and 'paid' cases as per instructions for full scope
      // For this initial subtask, 'assigned' and 'picked_up' are covered.

      default:
        throw new Error(`Unsupported status transition: ${newStatus}`);
    }

    const updatedJob = await this.storage.updateOpportunity(jobId, updateData);
    if (!updatedJob) {
        throw new Error(`Failed to update job ${jobId} to status ${newStatus}.`);
    }

    // Potential notification for status update
    // await this.storage.createJobNotification(jobId, actingUserId, `job_${newStatus}`);

    return updatedJob;
  }
}
