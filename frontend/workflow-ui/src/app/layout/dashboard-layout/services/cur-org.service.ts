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
  private _activeOrg$ = new BehaviorSubject<ActiveOrg | null>(null);

  // Full observable including null (for navbar to show/hide org switcher)
  activeOrg$ = this._activeOrg$.asObservable();

  // Filtered — only emits when org is set (use in TaskList, Members, etc.)
  org$ = this._activeOrg$.asObservable().pipe(filter((org): org is ActiveOrg => org !== null));

  setOrg(org: ActiveOrg) {
    this._activeOrg$.next(org);
  }

  getCurrent(): ActiveOrg | null {
    return this._activeOrg$.value;
  }

  clear() {
    this._activeOrg$.next(null);
  }
}
