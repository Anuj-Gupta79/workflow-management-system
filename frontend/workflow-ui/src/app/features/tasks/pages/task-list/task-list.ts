import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { Subject, Observable, of, merge } from 'rxjs';
import { RouterModule } from '@angular/router';
import { startWith, switchMap, catchError, shareReplay, mapTo } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
  standalone: true,
})
export class TaskList implements OnInit {
  // RxJS-driven state
  private reload$ = new Subject<void>();
  tasks$: Observable<Task[]>;
  loading$: Observable<boolean>;
  openTaskId: number | null = null;
  updatingTaskId: number | null = null;

  constructor(private taskService: TaskService) {
    this.tasks$ = this.reload$.pipe(
      startWith<void>(undefined),
      switchMap(() => this.taskService.getAllTasks().pipe(catchError(() => of([])))),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.loading$ = merge(this.reload$.pipe(mapTo(true)), this.tasks$.pipe(mapTo(false))).pipe(
      startWith(true),
    );
  }

  ngOnInit(): void {
    this.reload();
  }

  trackById(index: number, task: Task) {
    return task?.id ?? index;
  }

  // trigger reload
  reload() {
    this.reload$.next();
  }

  loadByStatus(status: TaskStatus) {
    // For filtering you'd implement a separate subject and switchMap to getTasksByStatus
    // Here we just reload the full list as a placeholder
    this.reload();
  }

  toggleStatusMenu(taskId: number) {
    this.openTaskId = this.openTaskId === taskId ? null : taskId;
  }

  updateStatus(task: Task, newStatus: TaskStatus) {
    if (task.status === newStatus) return;

    this.updatingTaskId = task.id;

    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
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
