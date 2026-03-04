import { Component, EventEmitter, Output, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, Profile } from '../../../features/profile/services/profile.service';
import { CurrentOrgService, ActiveOrg } from '../services/cur-org.service';
import { DashboardService } from '../../../features/dashboard/services/dashboard.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobile = new EventEmitter<void>();

  showNotifications = false;
  showProfileMenu = false;
  showOrgMenu = false;

  profile$: Observable<Profile>;
  activeOrg$: Observable<ActiveOrg | null>;
  allOrgs$ = new BehaviorSubject<any[]>([]);

  notifications = [
    { id: 1, message: 'New task assigned to you' },
    { id: 2, message: 'System maintenance at 10 PM' },
  ];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private currentOrgService: CurrentOrgService,
    private dashboardService: DashboardService,
    private elementRef: ElementRef,
  ) {
    this.profile$ = this.profileService.getProfile().pipe(
      catchError(() => of(null as any)),
      shareReplay(1),
    );
    this.activeOrg$ = this.currentOrgService.activeOrg$;
  }

  ngOnInit(): void {
    // Load all orgs so the switcher has the full list
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.dashboardService
        .getUserOrganizations(userId)
        .pipe(catchError(() => of([])))
        .subscribe((orgs) => this.allOrgs$.next(orgs));
    }
  }

  /* ================= SIDEBAR TOGGLE ================= */
  onToggle() {
    if (window.innerWidth <= 768) {
      this.toggleMobile.emit();
    } else {
      this.toggleSidebar.emit();
    }
  }

  /* ================= ORG SWITCHER ================= */
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
    // Navigate to dashboard home so stats/tasks reload for new org
    this.router.navigate(['/dashboard']);
  }

  goToOrgSelect() {
    this.showOrgMenu = false;
    this.router.navigate(['/org-select']);
  }

  /* ================= DROPDOWN TOGGLES ================= */
  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
    this.showOrgMenu = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
    this.showOrgMenu = false;
  }

  /* ================= ACTIONS ================= */
  clearNotifications() {
    this.notifications = [];
  }

  goToProfile() {
    this.router.navigate(['/dashboard/profile']);
    this.closeDropdowns();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.currentOrgService.clear();
    this.router.navigate(['/login']);
    this.closeDropdowns();
  }

  trackByNotificationId(index: number, item: any): number {
    return item?.id ?? index;
  }

  /* ================= CLOSE HANDLERS ================= */
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
