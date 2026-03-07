import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = 'http://localhost:8080/organizations';

  constructor(private http: HttpClient) {}

  getAllTasks(orgId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/${orgId}/tasks`);
  }

  createTask(orgId: number, payload: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.base}/${orgId}/tasks`, payload);
  }

  updateTaskStatus(orgId: number, taskId: number, newStatus: TaskStatus): Observable<Task> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.patch<Task>(`${this.base}/${orgId}/tasks/${taskId}/status`, null, { params });
  }

  assignTask(orgId: number, taskId: number, userId: number): Observable<Task> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.patch<Task>(`${this.base}/${orgId}/tasks/${taskId}/assign`, null, { params });
  }

  getPendingTasks(orgId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/${orgId}/tasks/pending`);
  }

  approveTask(orgId: number, taskId: number): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${orgId}/tasks/${taskId}/approve`, null);
  }

  rejectTask(orgId: number, taskId: number, reason: string): Observable<Task> {
    const params = new HttpParams().set('reason', reason);
    return this.http.patch<Task>(`${this.base}/${orgId}/tasks/${taskId}/reject`, null, { params });
  }
}
