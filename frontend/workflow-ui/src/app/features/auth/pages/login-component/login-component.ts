import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { AuthService } from '../../../../cores/auth/auth.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  // 🔥 Reactive state
  isLoading$ = new BehaviorSubject<boolean>(false);
  serverError$ = new BehaviorSubject<string | null>(null);

  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.loginForm.invalid || this.isLoading$.value) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading$.next(true);
    this.serverError$.next(null);

    this.authService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.isLoading$.next(false);
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.status === 401) {
            this.serverError$.next('Invalid email or password');
          } else if (err.status === 0) {
            this.serverError$.next('Server not reachable');
          } else {
            this.serverError$.next(err.error?.message || 'Something went wrong');
          }
        },
      });
  }
}
