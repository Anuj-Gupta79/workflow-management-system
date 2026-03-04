import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DashboardService } from '../../features/dashboard/services/dashboard.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  canActivate() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.dashboardService.getUserOrganizations(userId).pipe(
      map((orgs: any[]) => {
        if (!orgs || orgs.length === 0) {
          // No orgs = new user → show onboarding
          this.router.navigate(['/onboarding']);
          return false;
        }
        // Has orgs = experienced user → proceed normally
        return true;
      }),
      catchError(() => of(true)),
    );
  }
}
