import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080';
  constructor(private http: HttpClient) {}

  getUserOrganizations(userId: any) {
    return this.http.get<any[]>(`${this.baseUrl}/organization-members/user/${userId}`);
  }

  createOrganization(data: any) {
    return this.http.post(`${this.baseUrl}/organizations`, data);
  }

  getDashboardStats(orgId: number) {
    return this.http.get(`${this.baseUrl}/organizations/${orgId}/dashboard/stats`);
  }

  getRecentActivities(orgId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/organizations/${orgId}/dashboard/recent-tasks`);
  }
}
