import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, merge, of, Observable } from 'rxjs';
import { takeUntil, startWith, switchMap, catchError, mapTo, shareReplay } from 'rxjs/operators';
import { Task } from '../../../tasks/models/task.model';
import { TaskService } from '../../../tasks/services/task.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

type ActionState = 'idle' | 'approving' | 'rejecting';

interface TaskAction {
  taskId: number;
  state: ActionState;
  showRejectInput: boolean;
  rejectReason: string;
}

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.html',
  styleUrls: ['./approvals.css'],
})
export class ApprovalsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();

  tasks$: Observable<Task[]> = of([]);
  loading$: Observable<boolean> = of(true);
  error$ = new BehaviorSubject<string>('');

  taskActions: Map<number, TaskAction> = new Map();

  canApprove = false;
  currentRole = '';

  constructor(
    private taskService: TaskService,
    private currentOrgService: CurrentOrgService,
  ) {}

  ngOnInit(): void {
    this.currentOrgService.org$.pipe(takeUntil(this.destroy$)).subscribe((org) => {
      this.currentRole = org.role;
      this.canApprove = ['OWNER', 'ADMIN', 'MANAGER'].includes(org.role);

      this.tasks$ = this.reload$.pipe(
        startWith<void>(undefined),
        switchMap(() =>
          this.taskService.getPendingTasks(org.id).pipe(
            catchError(() => {
              this.error$.next('Failed to load pending tasks.');
              return of([]);
            }),
          ),
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

      this.loading$ = merge(this.reload$.pipe(mapTo(true)), this.tasks$.pipe(mapTo(false))).pipe(
        startWith(true),
      );

      // init task actions whenever tasks stream emits
      this.tasks$.pipe(takeUntil(this.destroy$)).subscribe((tasks) => {
        tasks.forEach((t) => {
          if (!this.taskActions.has(t.id)) this.initAction(t.id);
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.error$.next('');
    this.taskActions.clear();
    this.reload$.next();
  }

  initAction(taskId: number): void {
    this.taskActions.set(taskId, {
      taskId,
      state: 'idle',
      showRejectInput: false,
      rejectReason: '',
    });
  }

  getAction(taskId: number): TaskAction {
    if (!this.taskActions.has(taskId)) this.initAction(taskId);
    return this.taskActions.get(taskId)!;
  }

  approve(task: Task): void {
    const orgId = this.currentOrgService.getCurrent()?.id;
    if (!orgId) return;

    const action = this.getAction(task.id);
    action.state = 'approving';

    this.taskService.approveTask(orgId, task.id).subscribe({
      next: () => this.reload(),
      error: () => {
        action.state = 'idle';
        alert('Failed to approve task.');
      },
    });
  }

  toggleRejectInput(taskId: number): void {
    const action = this.getAction(taskId);
    action.showRejectInput = !action.showRejectInput;
    if (!action.showRejectInput) action.rejectReason = '';
  }

  confirmReject(task: Task): void {
    const orgId = this.currentOrgService.getCurrent()?.id;
    if (!orgId) return;

    const action = this.getAction(task.id);
    if (!action.rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    action.state = 'rejecting';
    this.taskService.rejectTask(orgId, task.id, action.rejectReason.trim()).subscribe({
      next: () => this.reload(),
      error: () => {
        action.state = 'idle';
        alert('Failed to reject task.');
      },
    });
  }

  trackById(_: number, task: Task) {
    return task.id;
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      HIGH: 'priority-high',
      MEDIUM: 'priority-medium',
      LOW: 'priority-low',
    };
    return map[priority] ?? 'priority-medium';
  }

  getPriorityIcon(priority: string): string {
    const map: Record<string, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };
    return map[priority] ?? '🟡';
  }
}
