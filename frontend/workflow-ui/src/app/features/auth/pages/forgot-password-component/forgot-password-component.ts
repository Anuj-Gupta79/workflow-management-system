import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { AuthService } from '../../../../cores/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['./forgot-password-component.css'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  isLoading$ = new BehaviorSubject<boolean>(false);
  serverError$ = new BehaviorSubject<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.forgotForm.invalid || this.isLoading$.value) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading$.next(true);
    this.serverError$.next(null);

    this.authService
      .forgotPassword(this.forgotForm.value.email)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/forgot-password/success']);
        },
        error: (err) => {
          if (err.status === 404) {
            this.serverError$.next('No account found with this email');
          } else {
            this.serverError$.next('Something went wrong. Try again.');
          }
        },
      });
  }
}
