import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, Observable, of, merge, BehaviorSubject } from 'rxjs';
import {
  startWith,
  switchMap,
  catchError,
  shareReplay,
  mapTo,
  takeUntil,
  map,
} from 'rxjs/operators';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

type SortField = 'title' | 'status' | 'priority' | 'createdAt';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
})
export class TaskList implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  reload$ = new Subject<void>();
  allTasks$ = new BehaviorSubject<Task[]>([]);

  // Raw stream
  rawTasks$: Observable<Task[]> = of([]);
  loading$: Observable<boolean> = of(false);

  // Filtered/sorted result
  filteredTasks: Task[] = [];

  // Filters
  filterStatus = '';
  filterPriority = '';
  filterAssignee = '';
  myTasksOnly = false;
  searchText = '';

  // Sorting
  sortField: SortField = 'createdAt';
  sortDir: SortDir = 'desc';

  // Status menu
  openTaskId: number | null = null;
  updatingTaskId: number | null = null;

  // Current user id for "My Tasks"
  currentUserId: number | null = null;

  // Unique assignees for filter dropdown
  assignees: { id: number; name: string }[] = [];

  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;

  readonly allStatuses = Object.values(TaskStatus);
  readonly allPriorities = Object.values(TaskPriority);

  constructor(
    private taskService: TaskService,
    private currentOrgService: CurrentOrgService,
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.currentUserId = userId ? +userId : null;

    this.currentOrgService.org$.pipe(takeUntil(this.destroy$)).subscribe((org) => {
      this.rawTasks$ = this.reload$.pipe(
        startWith<void>(undefined),
        switchMap(() => this.taskService.getAllTasks(org.id).pipe(catchError(() => of([])))),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

      this.loading$ = merge(this.reload$.pipe(mapTo(true)), this.rawTasks$.pipe(mapTo(false))).pipe(
        startWith(true),
      );

      // Store raw tasks and apply filters whenever they change
      this.rawTasks$.pipe(takeUntil(this.destroy$)).subscribe((tasks) => {
        this.allTasks$.next(tasks);
        this.buildAssignees(tasks);
        this.applyFilters();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload() {
    this.reload$.next();
  }

  // ===== FILTERING =====
  applyFilters() {
    let tasks = [...this.allTasks$.value];

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
      );
    }

    if (this.filterStatus) tasks = tasks.filter((t) => t.status === this.filterStatus);

    if (this.filterPriority) tasks = tasks.filter((t) => t.priority === this.filterPriority);

    if (this.filterAssignee) tasks = tasks.filter((t) => t.assignedTo?.id === +this.filterAssignee);

    if (this.myTasksOnly && this.currentUserId)
      tasks = tasks.filter(
        (t) => t.assignedTo?.id === this.currentUserId || t.createdBy?.id === this.currentUserId,
      );

    this.filteredTasks = this.sortTasks(tasks);
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterAssignee = '';
    this.myTasksOnly = false;
    this.searchText = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filterStatus ||
      this.filterPriority ||
      this.filterAssignee ||
      this.myTasksOnly ||
      this.searchText
    );
  }

  // ===== SORTING =====
  sortBy(field: SortField) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  sortTasks(tasks: Task[]): Task[] {
    const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...tasks].sort((a, b) => {
      let cmp = 0;
      switch (this.sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'priority':
          cmp = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // ===== ASSIGNEES DROPDOWN =====
  buildAssignees(tasks: Task[]) {
    const map = new Map<number, string>();
    tasks.forEach((t) => {
      if (t.assignedTo) map.set(t.assignedTo.id, t.assignedTo.name);
    });
    this.assignees = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }

  // ===== STATUS UPDATE =====
  toggleStatusMenu(taskId: number) {
    this.openTaskId = this.openTaskId === taskId ? null : taskId;
  }

  updateStatus(task: Task, newStatus: TaskStatus) {
    if (task.status === newStatus) return;
    const orgId = this.currentOrgService.getCurrent()?.id;
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

  // Close status menu on outside click
  @HostListener('document:click')
  onDocumentClick() {
    this.openTaskId = null;
  }

  // ===== HELPERS =====
  trackById(_: number, task: Task) {
    return task?.id;
  }

  getStatusClass(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      [TaskStatus.TO_DO]: 'status-todo',
      [TaskStatus.PENDING]: 'status-pending',
      [TaskStatus.IN_PROGRESS]: 'status-inprogress',
      [TaskStatus.COMPLETED]: 'status-completed',
      [TaskStatus.APPROVED]: 'status-approved',
      [TaskStatus.REJECTED]: 'status-rejected',
      [TaskStatus.ON_HOLD]: 'status-onhold',
      [TaskStatus.CANCELLED]: 'status-cancelled',
      [TaskStatus.ARCHIVED]: 'status-archived',
    };
    return map[status] ?? 'status-todo';
  }

  getPriorityClass(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      [TaskPriority.HIGH]: 'priority-high',
      [TaskPriority.MEDIUM]: 'priority-medium',
      [TaskPriority.LOW]: 'priority-low',
    };
    return map[priority] ?? 'priority-medium';
  }

  getPriorityIcon(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      [TaskPriority.HIGH]: '🔴',
      [TaskPriority.MEDIUM]: '🟡',
      [TaskPriority.LOW]: '🟢',
    };
    return map[priority] ?? '🟡';
  }

  readonly allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TO_DO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.APPROVED, TaskStatus.REJECTED],
    [TaskStatus.IN_PROGRESS]: [
      TaskStatus.PENDING,
      TaskStatus.COMPLETED,
      TaskStatus.ON_HOLD,
      TaskStatus.CANCELLED,
    ],
    [TaskStatus.ON_HOLD]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.COMPLETED]: [TaskStatus.APPROVED, TaskStatus.REJECTED],
    [TaskStatus.APPROVED]: [TaskStatus.ARCHIVED],
    [TaskStatus.REJECTED]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.CANCELLED]: [],
    [TaskStatus.ARCHIVED]: [],
  };
}
