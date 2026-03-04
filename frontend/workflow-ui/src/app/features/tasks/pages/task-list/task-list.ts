import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, Observable, of, merge, EMPTY } from 'rxjs';
import { startWith, switchMap, catchError, shareReplay, mapTo, takeUntil } from 'rxjs/operators';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
})
export class TaskList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();

  tasks$: Observable<Task[]> = of([]);
  loading$: Observable<boolean> = of(false);
  openTaskId: number | null = null;
  updatingTaskId: number | null = null;

  constructor(
    private taskService: TaskService,
    private currentOrgService: CurrentOrgService,
  ) {}

  ngOnInit(): void {
    // ✅ Whenever active org changes, automatically reload tasks for that org
    this.currentOrgService.org$.pipe(takeUntil(this.destroy$)).subscribe((org) => {
      this.tasks$ = this.reload$.pipe(
        startWith<void>(undefined),
        switchMap(() => this.taskService.getAllTasks(org.id).pipe(catchError(() => of([])))),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

      this.loading$ = merge(this.reload$.pipe(mapTo(true)), this.tasks$.pipe(mapTo(false))).pipe(
        startWith(true),
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload() {
    this.reload$.next();
  }

  toggleStatusMenu(taskId: number) {
    this.openTaskId = this.openTaskId === taskId ? null : taskId;
  }

  updateStatus(task: Task, newStatus: TaskStatus) {
    if (task.status === newStatus) return;

    const orgId = this.currentOrgService.getCurrent()?.id; // ✅ snapshot read
    if (!orgId) return;

    this.updatingTaskId = task.id;
    this.taskService.updateTaskStatus(orgId, task.id, newStatus).subscribe({
      next: () => {
        this.updatingTaskId = null;
        this.openTaskId = null;
        this.reload();
      },
      error: () => {
        this.updatingTaskId = null;
        alert('Failed to update status');
      },
    });
  }

  trackById(index: number, task: Task) {
    return task?.id ?? index;
  }

  getBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'badge bg-secondary';
      case TaskStatus.IN_PROGRESS:
        return 'badge bg-primary';
      case TaskStatus.COMPLETED:
        return 'badge bg-success';
      case TaskStatus.APPROVED:
        return 'badge bg-info';
      case TaskStatus.REJECTED:
        return 'badge bg-danger';
      case TaskStatus.ON_HOLD:
        return 'badge bg-warning text-dark';
      case TaskStatus.CANCELLED:
        return 'badge bg-dark';
      case TaskStatus.ARCHIVED:
        return 'badge bg-light text-dark';
      default:
        return 'badge bg-secondary';
    }
  }

  readonly allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.ON_HOLD],
    [TaskStatus.ON_HOLD]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.COMPLETED]: [TaskStatus.APPROVED, TaskStatus.REJECTED],
    [TaskStatus.APPROVED]: [TaskStatus.ARCHIVED],
    [TaskStatus.REJECTED]: [],
    [TaskStatus.CANCELLED]: [],
    [TaskStatus.ARCHIVED]: [],
  };
}
