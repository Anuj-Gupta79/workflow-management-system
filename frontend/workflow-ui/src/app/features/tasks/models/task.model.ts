export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdByName?: string;
  assignedToName?: string;
}
