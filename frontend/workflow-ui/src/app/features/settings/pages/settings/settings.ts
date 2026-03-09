import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CurrentOrgService,
  ActiveOrg,
} from '../../../../layout/dashboard-layout/services/cur-org.service';
import { AuthService } from '../../../../cores/auth/auth.service';
import { ToastService } from '../../../../shared/service/toast.service';

type Tab = 'account' | 'organization' | 'appearance';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private base = 'http://localhost:8080';

  activeTab: Tab = 'account';

  // Org context
  currentOrg: ActiveOrg | null = null;
  isOwner = false;

  // ===== Account — Change Password =====
  passwordForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  passwordLoading = false;

  // ===== Organization =====
  orgName = '';
  orgNameLoading = false;
  showDeleteModal = false;
  deleteConfirmText = '';
  deleteLoading = false;

  // ===== Appearance =====
  isDarkMode = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private currentOrgService: CurrentOrgService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.currentOrgService.org$.pipe(takeUntil(this.destroy$)).subscribe((org) => {
      this.currentOrg = org;
      this.isOwner = org.role === 'OWNER';
      this.orgName = org.name;
    });

    // Load dark mode from localStorage
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  // ===== PASSWORD =====
  passwordMatchValidator(group: FormGroup) {
    const newPwd = group.get('newPassword')?.value;
    const confirmPwd = group.get('confirmPassword')?.value;
    return newPwd === confirmPwd ? null : { passwordMismatch: true };
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid || this.passwordLoading) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    if (currentPassword === newPassword) {
      this.toastService.error('New password must be different from current password.');
      return;
    }

    this.passwordLoading = true;
    this.http.put(`${this.base}/users/me/password`, { currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordForm.reset();
        this.toastService.success('Password changed successfully!');
      },
      error: (err) => {
        this.passwordLoading = false;
        this.toastService.error(err?.error?.message || 'Failed to change password.');
      },
    });
  }

  // ===== ORGANIZATION =====
  saveOrgName(): void {
    if (!this.orgName.trim() || !this.currentOrg) return;
    this.orgNameLoading = true;

    this.http
      .put(`${this.base}/organizations/${this.currentOrg.id}`, { name: this.orgName.trim() })
      .subscribe({
        next: (org: any) => {
          this.orgNameLoading = false;
          // Update the active org name in the service
          this.currentOrgService.setOrg({ ...this.currentOrg!, name: org.name });
          this.toastService.success('Organization name updated!');
        },
        error: (err) => {
          this.orgNameLoading = false;
          this.toastService.error(err?.error?.message || 'Failed to update organization name.');
        },
      });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteConfirmText = '';
  }

  confirmDelete(): void {
    if (this.deleteConfirmText !== this.currentOrg?.name || !this.currentOrg) return;
    this.deleteLoading = true;

    this.http.delete(`${this.base}/organizations/${this.currentOrg.id}`).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.currentOrgService.clear();
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.deleteLoading = false;
        this.closeDeleteModal();
        this.toastService.error(err?.error?.message || 'Failed to delete organization.');
      },
    });
  }

  get canConfirmDelete(): boolean {
    return this.deleteConfirmText === this.currentOrg?.name;
  }

  // ===== APPEARANCE =====
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    this.toastService.success(`${this.isDarkMode ? 'Dark' : 'Light'} mode enabled.`);
  }
}
