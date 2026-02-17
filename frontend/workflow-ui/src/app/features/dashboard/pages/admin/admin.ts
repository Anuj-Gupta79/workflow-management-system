import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStats, UserResponse } from '../../services/admin.service';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { switchMap, startWith, catchError, shareReplay, map } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private reload$ = new Subject<void>();

  stats$: Observable<AdminStats>;
  users$: Observable<UserResponse[]>;
  loading$: Observable<boolean>;

  constructor(private adminService: AdminService) {
    this.stats$ = this.reload$.pipe(
      startWith<void>(undefined),
      switchMap(() =>
        this.adminService
          .getStats()
          .pipe(catchError(() => of({ totalUsers: 0, totalTasks: 0 } as AdminStats))),
      ),
      shareReplay(1),
    );

    this.users$ = this.reload$.pipe(
      startWith<void>(undefined),
      switchMap(() => this.adminService.getUsers().pipe(catchError(() => of([])))),
      shareReplay(1),
    );

    this.loading$ = combineLatest([this.stats$, this.users$]).pipe(
      map(() => false),
      startWith(true),
    );
  }

  reload() {
    this.reload$.next();
  }

  deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.reload(); // 🔥 reload from backend instead of manual mutation
      },
      error: () => alert('Failed to delete user'),
    });
  }

  trackById(index: number, user: UserResponse): number {
    return user?.id ?? index;
  }
}
