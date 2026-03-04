import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task.html',
  styleUrls: ['./create-task.css'],
})
export class CreateTask {
  submitting = false;
  taskForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private currentOrgService: CurrentOrgService, // 👈 injected
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      assignedToName: [''],
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

    const payload = {
      title: this.taskForm.value.title!,
      description: this.taskForm.value.description || undefined,
      assignedToName: this.taskForm.value.assignedToName || undefined,
    };

    this.taskService.createTask(orgId, payload).subscribe({
      next: () => this.router.navigate(['/dashboard/tasks']), // 👈 fixed route too
      error: () => {
        this.submitting = false;
        alert('Failed to create task');
      },
    });
  }
}
