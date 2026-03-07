import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-task.html',
  styleUrls: ['./create-task.css'],
})
export class CreateTask implements OnInit {
  submitting = false;
  taskForm!: FormGroup;
  members$ = new BehaviorSubject<any[]>([]);
  loadingMembers$ = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private dashboardService: DashboardService,
    private router: Router,
    private currentOrgService: CurrentOrgService,
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['MEDIUM'],
      assignedTo: [null],
    });
  }

  ngOnInit(): void {
    const orgId = this.currentOrgService.getCurrent()?.id;
    if (!orgId) return;

    this.loadingMembers$.next(true);
    this.dashboardService
      .getOrgMembers(orgId)
      .pipe(finalize(() => this.loadingMembers$.next(false)))
      .subscribe({
        next: (members) => this.members$.next(members || []),
        error: () => this.members$.next([]),
      });
  }

  submit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const orgId = this.currentOrgService.getCurrent()?.id;
    if (!orgId) {
      alert('No active organization. Please select a workspace first.');
      return;
    }

    this.submitting = true;

    const payload: any = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description || undefined,
      priority: this.taskForm.value.priority,
    };

    const assignedTo = this.taskForm.value.assignedTo;

    if (assignedTo) {
      // Use assign endpoint after creation
      this.taskService.createTask(orgId, payload).subscribe({
        next: (task) => {
          this.taskService.assignTask(orgId, task.id, assignedTo).subscribe({
            next: () => this.router.navigate(['/dashboard/tasks']),
            error: () => this.router.navigate(['/dashboard/tasks']), // still navigate even if assign fails
          });
        },
        error: () => {
          this.submitting = false;
          alert('Failed to create task');
        },
      });
    } else {
      this.taskService.createTask(orgId, payload).subscribe({
        next: () => this.router.navigate(['/dashboard/tasks']),
        error: () => {
          this.submitting = false;
          alert('Failed to create task');
        },
      });
    }
  }

  get f() {
    return this.taskForm.controls;
  }
}
