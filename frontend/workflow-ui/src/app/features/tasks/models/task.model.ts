export enum TaskStatus {
  TO_DO       = 'TO_DO',
  PENDING     = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED   = 'COMPLETED',
  APPROVED    = 'APPROVED',
  REJECTED    = 'REJECTED',
  ON_HOLD     = 'ON_HOLD',
  CANCELLED   = 'CANCELLED',
  ARCHIVED    = 'ARCHIVED',
}

export enum TaskPriority {
  LOW    = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH   = 'HIGH',
}

export interface TaskUser {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TaskUser;
  assignedTo?: TaskUser;
}
