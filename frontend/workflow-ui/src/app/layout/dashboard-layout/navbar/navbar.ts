import { Component, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, Profile } from '../../../features/profile/services/profile.service';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobile = new EventEmitter<void>();

  showNotifications = false;
  showProfileMenu = false;

  profile$: Observable<Profile>;

  notifications = [
    { id: 1, message: 'New task assigned to you' },
    { id: 2, message: 'System maintenance at 10 PM' },
  ];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private elementRef: ElementRef,
  ) {
    this.profile$ = this.profileService.getProfile().pipe(
      catchError(() => of(null as any)),
      shareReplay(1),
    );
  }

  /* ================= SIDEBAR TOGGLE ================= */

  onToggle() {
    if (window.innerWidth <= 768) {
      this.toggleMobile.emit();
    } else {
      this.toggleSidebar.emit();
    }
  }

  /* ================= DROPDOWN TOGGLES ================= */

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
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
  }

  /* Close when clicking outside */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    }
  }

  /* Close when pressing ESC */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeDropdowns();
  }
}
