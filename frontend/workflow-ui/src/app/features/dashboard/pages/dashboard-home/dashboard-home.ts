import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DashboardService } from './../../services/dashboard.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { CreateWorkspaceModalComponent } from '../../../../shared/components/create-workspace-modal/create-workspace-modal';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, CreateWorkspaceModalComponent],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  activeOrg$: Observable<any>;

  // User greeting
  userName$ = new BehaviorSubject<string>('');
  greeting$ = new BehaviorSubject<string>('');

  // Dashboard data
  isLoading$ = new BehaviorSubject<boolean>(true);
  stats$ = new BehaviorSubject({
    totalTasks: 0,
    myTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalMembers: 0,
  });
  activities$ = new BehaviorSubject<any[]>([]);
  members$ = new BehaviorSubject<any[]>([]);
  myTasks$ = new BehaviorSubject<any[]>([]);

  // Modal
  showCreateModal = false;

  constructor(
    private dashboardService: DashboardService,
    private currentOrgService: CurrentOrgService,
    private profileService: ProfileService,
    private router: Router,
  ) {
    this.activeOrg$ = this.currentOrgService.org$;
  }

  ngOnInit(): void {
    this.setGreeting();
    this.loadUserName();

    // React to org changes (e.g. user switches org from navbar)
    this.currentOrgService.org$.pipe(takeUntil(this.destroy$)).subscribe((org) => {
      this.loadDashboardData(org.id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting$.next('Good morning');
    else if (hour < 17) this.greeting$.next('Good afternoon');
    else this.greeting$.next('Good evening');
  }

  loadUserName() {
    this.profileService.getProfile().subscribe({
      next: (profile) => this.userName$.next(profile?.name?.split(' ')[0] || ''),
      error: () => {},
    });
  }

  loadDashboardData(orgId: number) {
    const userId = localStorage.getItem('userId');
    this.isLoading$.next(true);

    // Load stats + activities + members + my tasks in parallel
    forkJoin({
      stats: this.dashboardService.getDashboardStats(orgId),
      activities: this.dashboardService.getRecentActivities(orgId),
      members: this.dashboardService.getOrgMembers(orgId),
      myTasks: userId ? this.dashboardService.getMyTasks(orgId, userId) : Promise.resolve([]),
    })
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: ({ stats, activities, members, myTasks }) => {
          this.stats$.next(stats as any);
          this.activities$.next((activities as any[]) || []);
          this.members$.next((members as any[]) || []);
          this.myTasks$.next((myTasks as any[]) || []);
        },
        error: () => {
          console.error('Failed to load dashboard data');
          this.isLoading$.next(false);
        },
      });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-inprogress';
      case 'COMPLETED':
        return 'status-completed';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'ON_HOLD':
        return 'status-onhold';
      default:
        return 'status-pending';
    }
  }

  getRoleInitials(name: string): string {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
    );
  }

  goToTasks() {
    this.router.navigate(['/dashboard/tasks']);
  }
  goToCreateTask() {
    this.router.navigate(['/dashboard/tasks/new']);
  }
  goToMembers() {
    this.router.navigate(['/dashboard/members']);
  }

  onWorkspaceCreated() {
    this.showCreateModal = false;
    this.router.navigate(['/org-select']);
  }
}
