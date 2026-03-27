import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserOrganizations(userId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/organization-members/user/${userId}`);
  }

  createOrganization(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/organizations`, data);
  }

  getDashboardStats(orgId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/organizations/${orgId}/dashboard/stats`);
  }

  getRecentActivities(orgId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/organizations/${orgId}/dashboard/recent-tasks`);
  }

  // 👇 NEW — members list for dashboard preview
  getOrgMembers(orgId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/organization-members/organization/${orgId}`);
  }

  // 👇 NEW — tasks assigned to current user
  getMyTasks(orgId: number, userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/organizations/${orgId}/tasks/assigned/${userId}`);
  }
}
