import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize } from 'rxjs';
import { DashboardService } from './../../services/dashboard.service';
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace.component';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateWorkspaceComponent],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent implements OnInit {
  organizations$ = new BehaviorSubject<any[]>([]);
  currentOrgId$ = new BehaviorSubject<number | null>(null);
  currentOrgName$ = new BehaviorSubject<string>('');
  currentUserRole$ = new BehaviorSubject<string>('');

  showCreateWorkspace$ = new BehaviorSubject<boolean>(false);
  isLoading$ = new BehaviorSubject<boolean>(false);

  stats$ = new BehaviorSubject({
    totalTasks: 0,
    myTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalMembers: 0,
  });

  activities$ = new BehaviorSubject<any[]>([]);

  constructor(
    private dashboardService: DashboardService,
    private currentOrgService: CurrentOrgService,
  ) {}

  ngOnInit(): void {
    console.log('DashboardHomeComponent initialized');
    this.loadOrganizations();
  }

  loadOrganizations() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!userId || !token) {
      this.showCreateWorkspace$.next(true);
      return;
    }

    this.isLoading$.next(true);
    this.dashboardService
      .getUserOrganizations(userId)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (res: any[]) => {
          if (!res || res.length === 0) {
            this.showCreateWorkspace$.next(true);
            return;
          }

          this.organizations$.next(res);
          const orgId = res[0].organization.id;
          const orgName = res[0].organization.name;
          const role = res[0].role;

          this.currentOrgId$.next(orgId);
          this.currentOrgName$.next(orgName);
          this.currentUserRole$.next(role);
          this.showCreateWorkspace$.next(false);

          this.loadDashboardStats(orgId);
          this.loadActivities(orgId);
        },
        error: () => {
          this.showCreateWorkspace$.next(true);
        },
      });
  }

  loadDashboardStats(orgId: number) {
    this.dashboardService.getDashboardStats(orgId).subscribe({
      next: (data: any) => this.stats$.next(data),
      error: () => console.error('Failed to load dashboard stats'),
    });
  }

  loadActivities(orgId: number) {
    this.dashboardService.getRecentActivities(orgId).subscribe({
      next: (data: any[]) => this.activities$.next(data),
      error: () => console.error('Failed to load activities'),
    });
  }

  // Handle event from child component
  onWorkspaceCreated() {
    this.loadOrganizations();
  }
}
