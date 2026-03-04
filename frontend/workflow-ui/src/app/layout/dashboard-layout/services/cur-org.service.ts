import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface ActiveOrg {
  id: number;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class CurrentOrgService {
  private activeOrg$ = new BehaviorSubject<ActiveOrg | null>(null);

  // Use this in components that need to react to org switches
  org$ = this.activeOrg$.asObservable().pipe(filter((org): org is ActiveOrg => org !== null));

  setOrg(org: ActiveOrg) {
    this.activeOrg$.next(org);
  }

  // Use this for one-off reads (e.g. inside updateStatus)
  getCurrent(): ActiveOrg | null {
    return this.activeOrg$.value;
  }

  clear() {
    this.activeOrg$.next(null);
  }
}
