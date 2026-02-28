import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../../cores/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password-component.html',
  styleUrls: ['./reset-password-component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token!: string;

  loading = false;
  serverError: string | null = null;

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  submit() {
    if (this.resetForm.invalid) return;

    const password = this.resetForm.value.password;

    this.loading = true;
    this.serverError = null;

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.serverError = 'Invalid or expired reset link';
        this.loading = false;
      },
    });
  }
}
