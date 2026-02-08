import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private baseUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/status/${status}`);
  }

  updateTaskStatus(taskId: number, newStatus: TaskStatus): Observable<Task> {
    const params = new HttpParams().set('newStatus', newStatus);

    return this.http.patch<Task>(`${this.baseUrl}/${taskId}/status`, null, { params });
  }

  createTask(payload: { title: string; description?: string; assignedToName?: string }) {
    return this.http.post('http://localhost:8080/tasks', payload);
  }
}
