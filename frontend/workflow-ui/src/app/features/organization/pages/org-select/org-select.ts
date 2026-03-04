import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

@Component({
  selector: 'app-org-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './org-select.html',
  styleUrls: ['./org-select.css'],
})
export class OrgSelectComponent implements OnInit {
  orgs$ = new BehaviorSubject<any[]>([]);
  isLoading$ = new BehaviorSubject<boolean>(true);

  // Create workspace panel
  showCreate = false;
  workspaceName = '';
  isCreating$ = new BehaviorSubject<boolean>(false);
  createError$ = new BehaviorSubject<string | null>(null);

  constructor(
    private dashboardService: DashboardService,
    private currentOrgService: CurrentOrgService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrgs();
  }

  loadOrgs() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading$.next(true);
    this.dashboardService
      .getUserOrganizations(userId)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (res: any[]) => this.orgs$.next(res || []),
        error: () => this.orgs$.next([]),
      });
  }

  enterOrg(org: any) {
    this.currentOrgService.setOrg({
      id: org.organization.id,
      name: org.organization.name,
      role: org.role,
    });
    this.router.navigate(['/dashboard']);
  }

  getRoleIcon(role: string): string {
    switch (role?.toUpperCase()) {
      case 'OWNER':
        return '👑';
      case 'ADMIN':
        return '🛡️';
      case 'MANAGER':
        return '📊';
      default:
        return '👤';
    }
  }

  getRoleColor(role: string): string {
    switch (role?.toUpperCase()) {
      case 'OWNER':
        return 'role-owner';
      case 'ADMIN':
        return 'role-admin';
      case 'MANAGER':
        return 'role-manager';
      default:
        return 'role-employee';
    }
  }

  createWorkspace() {
    if (!this.workspaceName.trim()) {
      this.createError$.next('Workspace name is required');
      return;
    }
    this.isCreating$.next(true);
    this.createError$.next(null);

    this.dashboardService
      .createOrganization({ name: this.workspaceName })
      .pipe(finalize(() => this.isCreating$.next(false)))
      .subscribe({
        next: () => {
          this.workspaceName = '';
          this.showCreate = false;
          this.loadOrgs();
        },
        error: () => this.createError$.next('Failed to create workspace. Try again.'),
      });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.currentOrgService.clear();
    this.router.navigate(['/login']);
  }
}
