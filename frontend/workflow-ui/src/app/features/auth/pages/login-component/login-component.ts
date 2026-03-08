import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { AuthService } from '../../../../cores/auth/auth.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  isLoading$ = new BehaviorSubject<boolean>(false);
  serverError$ = new BehaviorSubject<string | null>(null);

  showPassword = false;

  // Invite flow
  private inviteToken = '';
  private returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Pick up invite token from query param or localStorage
    this.inviteToken =
      this.route.snapshot.queryParamMap.get('inviteToken') ||
      localStorage.getItem('pendingInviteToken') ||
      '';

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
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
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: () => {
          if (this.inviteToken) {
            // Redirect back to invite page — it will handle accept/decline
            this.router.navigateByUrl('/invite?token=' + this.inviteToken);
          } else if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigate(['/org-select']);
          }
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
