import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CurrentOrgService } from '../../layout/dashboard-layout/services/cur-org.service';

@Injectable({ providedIn: 'root' })
export class OrgGuard implements CanActivate {
  constructor(
    private currentOrgService: CurrentOrgService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.currentOrgService.getCurrent()) {
      return true;
    }
    // No active org — send to org selection screen
    this.router.navigate(['/org-select']);
    return false;
  }
}
