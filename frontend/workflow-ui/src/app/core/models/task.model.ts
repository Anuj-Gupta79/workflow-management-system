export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  createdByName?: string;
  assignedToName?: string;
}
