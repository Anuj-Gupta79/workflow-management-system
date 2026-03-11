import {
  Component,
  EventEmitter,
  Output,
  HostListener,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, Profile } from '../../../features/profile/services/profile.service';
import { CurrentOrgService, ActiveOrg } from '../services/cur-org.service';
import { DashboardService } from '../../../features/dashboard/services/dashboard.service';
import { NotificationService, AppNotification } from '../services/notification.service';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { catchError, shareReplay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobile = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  showNotifications = false;
  showProfileMenu = false;
  showOrgMenu = false;

  profile$: Observable<Profile>;
  activeOrg$: Observable<ActiveOrg | null>;
  allOrgs$ = new BehaviorSubject<any[]>([]);

  notifications: AppNotification[] = [];
  unreadCount = 0;
  notifLoading = false;
  markingAllRead = false;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private currentOrgService: CurrentOrgService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {
    this.profile$ = this.profileService.getProfile().pipe(
      catchError(() => of(null as any)),
      shareReplay(1),
    );
    this.activeOrg$ = this.currentOrgService.activeOrg$;
  }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.dashboardService
        .getUserOrganizations(userId)
        .pipe(catchError(() => of([])))
        .subscribe((orgs) => this.allOrgs$.next(orgs));
    }

    this.notificationService.connect();

    this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    });

    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggle() {
    if (window.innerWidth <= 768) {
      this.toggleMobile.emit();
    } else {
      this.toggleSidebar.emit();
    }
  }

  toggleOrgMenu(event: Event) {
    event.stopPropagation();
    this.showOrgMenu = !this.showOrgMenu;
    this.showNotifications = false;
    this.showProfileMenu = false;
  }

  switchOrg(org: any) {
    this.currentOrgService.setOrg({
      id: org.organization.id,
      name: org.organization.name,
      role: org.role,
    });
    this.showOrgMenu = false;
    this.router.navigate(['/dashboard']);
  }

  goToOrgSelect() {
    this.showOrgMenu = false;
    this.router.navigate(['/org-select']);
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
    this.showOrgMenu = false;

    if (this.showNotifications) {
      this.notifLoading = true;
      this.notificationService.fetchNotifications(() => {
        this.notifLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  markAsRead(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Replace the object so Angular detects the change
        this.notifications = this.notifications.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n,
        );
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      },
    });
  }

  markAllRead(): void {
    if (this.markingAllRead) return;
    this.markingAllRead = true;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
        this.unreadCount = 0;
        this.markingAllRead = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.markingAllRead = false;
        this.cdr.markForCheck();
      },
    });
  }

  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      TASK_ASSIGNED: 'assignment_ind',
      TASK_APPROVED: 'check_circle',
      TASK_REJECTED: 'cancel',
      INVITE_ACCEPTED: 'person_add',
      INVITE_DECLINED: 'person_remove',
    };
    return map[type] ?? 'notifications';
  }

  getNotifIconColor(type: string): string {
    const map: Record<string, string> = {
      TASK_ASSIGNED: '#6366f1',
      TASK_APPROVED: '#10b981',
      TASK_REJECTED: '#ef4444',
      INVITE_ACCEPTED: '#10b981',
      INVITE_DECLINED: '#f59e0b',
    };
    return map[type] ?? '#94a3b8';
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
    this.showOrgMenu = false;
  }

  goToProfile() {
    this.router.navigate(['/dashboard/profile']);
    this.closeDropdowns();
  }

  logout() {
    this.notificationService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.currentOrgService.clear();
    this.router.navigate(['/login']);
    this.closeDropdowns();
  }

  trackByNotificationId(_: number, item: AppNotification): number {
    return item.id;
  }

  closeDropdowns() {
    this.showNotifications = false;
    this.showProfileMenu = false;
    this.showOrgMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeDropdowns();
  }
}
