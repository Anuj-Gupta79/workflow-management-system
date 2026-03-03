import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize } from 'rxjs';
import { DashboardService } from './../../services/dashboard.service';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-workspace.component.html',
  styleUrls: ['./create-workspace.component.css'],
})
export class CreateWorkspaceComponent {
  workspaceName = '';
  isLoading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Emit an event when workspace is successfully created
  @Output() workspaceCreated = new EventEmitter<void>();

  constructor(private dashboardService: DashboardService) {}

  createWorkspace() {
    if (!this.workspaceName.trim()) {
      this.error$.next('Workspace name is required');
      return;
    }

    this.isLoading$.next(true);
    this.error$.next(null);

    this.dashboardService
      .createOrganization({ name: this.workspaceName })
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: () => {
          this.workspaceName = '';
          this.workspaceCreated.emit(); // notify parent
        },
        error: () => {
          this.error$.next('Failed to create workspace');
        },
      });
  }
}
