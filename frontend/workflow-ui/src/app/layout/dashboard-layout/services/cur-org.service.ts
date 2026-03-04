// current-org.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrentOrgService {
  private currentOrgId$ = new BehaviorSubject<number | null>(null);

  setOrg(orgId: number) {
    this.currentOrgId$.next(orgId);
  }

  getOrg() {
    return this.currentOrgId$.asObservable();
  }

  getCurrent() {
    return this.currentOrgId$.value;
  }
}
