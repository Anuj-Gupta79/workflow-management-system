import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize } from 'rxjs';
import { DashboardService } from '../../../features/dashboard/services/dashboard.service';

@Component({
  selector: 'app-create-workspace-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-workspace-modal.html',
  styleUrls: ['./create-workspace-modal.css'],
})
export class CreateWorkspaceModalComponent {
  @Output() workspaceCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  workspaceName = '';
  isLoading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

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
          this.workspaceCreated.emit();
          this.closed.emit();
        },
        error: () => this.error$.next('Failed to create workspace. Try again.'),
      });
  }

  close() {
    this.closed.emit();
  }

  // Close on ESC key
  @HostListener('document:keydown.escape')
  onEsc() {
    this.close();
  }
}
