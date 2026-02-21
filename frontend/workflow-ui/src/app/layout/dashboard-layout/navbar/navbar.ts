import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, Profile } from '../../../features/dashboard/services/profile.service';
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
  ) {
    this.profile$ = this.profileService.getProfile().pipe(
      catchError(() => of(null as any)),
      shareReplay(1),
    );
  }

  onToggle() {
    if (window.innerWidth <= 768) {
      this.toggleMobile.emit();
    } else {
      this.toggleSidebar.emit();
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    console.log('Toggling notifications', this.showNotifications);
    this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  clearNotifications() {
    this.notifications = [];
  }

  goToProfile() {
    this.router.navigate(['/dashboard/profile']);
    this.showProfileMenu = false;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  trackByNotificationId(index: number, item: any): number {
    return item?.id ?? index;
  }
}
