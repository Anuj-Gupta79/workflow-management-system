import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { DashboardService } from './../../services/dashboard.service';
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace.component';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateWorkspaceComponent],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent implements OnInit {
  currentOrgName$: Observable<string>;
  currentUserRole$: Observable<string>;
  organizations$ = new BehaviorSubject<any[]>([]);
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

  // ✅ ADD them inside the constructor instead
  constructor(
    private dashboardService: DashboardService,
    private currentOrgService: CurrentOrgService,
  ) {
    this.currentOrgName$ = this.currentOrgService.org$.pipe(map((org) => org.name));
    this.currentUserRole$ = this.currentOrgService.org$.pipe(map((org) => org.role));
  }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
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
          const first = res[0];

          // ✅ Single source of truth — publish to service
          this.currentOrgService.setOrg({
            id: first.organization.id,
            name: first.organization.name,
            role: first.role,
          });

          this.showCreateWorkspace$.next(false);
          this.loadDashboardStats(first.organization.id);
          this.loadActivities(first.organization.id);
        },
        error: () => this.showCreateWorkspace$.next(true),
      });
  }

  loadDashboardStats(orgId: number) {
    this.dashboardService.getDashboardStats(orgId).subscribe({
      next: (data: any) => this.stats$.next(data),
      error: () => console.error('Failed to load stats'),
    });
  }

  loadActivities(orgId: number) {
    this.dashboardService.getRecentActivities(orgId).subscribe({
      next: (data: any[]) => this.activities$.next(data),
      error: () => console.error('Failed to load activities'),
    });
  }

  onWorkspaceCreated() {
    this.loadOrganizations();
  }
}
