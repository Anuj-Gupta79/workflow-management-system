import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../cores/auth/auth.service';

@Component({
  selector: 'app-signup-component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup-component.html',
  styleUrls: ['./signup-component.css'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  strengthText = '';
  strengthClass = '';
  loading = false;
  error = '';

  // Invite flow
  inviteToken = '';
  inviteEmail = '';
  hasInvite = false;

  private base = 'http://localhost:8080';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.inviteToken =
      this.route.snapshot.queryParamMap.get('inviteToken') ||
      localStorage.getItem('pendingInviteToken') ||
      '';

    if (this.inviteToken) {
      // Validate and pre-fill email from invite
      this.http.get<any>(`${this.base}/invites/validate?token=${this.inviteToken}`).subscribe({
        next: (invite) => {
          this.hasInvite = true;
          this.inviteEmail = invite.inviteeEmail;
          this.signupForm.patchValue({ email: invite.inviteeEmail });
          this.signupForm.get('email')?.disable(); // lock to invite email
        },
        error: () => {
          // Token invalid — clear and proceed normally
          localStorage.removeItem('pendingInviteToken');
          this.inviteToken = '';
        },
      });
    }
  }

  checkStrength() {
    const password = this.signupForm.get('password')?.value || '';
    if (password.length < 6) {
      this.strengthText = 'Weak password';
      this.strengthClass = 'strength-weak';
    } else if (password.match(/[A-Z]/) && password.match(/[0-9]/)) {
      this.strengthText = 'Strong password';
      this.strengthClass = 'strength-strong';
    } else {
      this.strengthText = 'Medium strength';
      this.strengthClass = 'strength-medium';
    }
  }

  submit() {
    if (this.signupForm.invalid) return;
    this.loading = true;
    this.error = '';

    // getRawValue includes disabled fields (email)
    const payload = this.signupForm.getRawValue();

    this.authService.signup(payload as any).subscribe({
      next: () => {
        if (this.inviteToken) {
          // After signup, redirect back to invite page to accept/decline
          localStorage.removeItem('pendingInviteToken');
          this.router.navigateByUrl('/invite?token=' + this.inviteToken);
        } else {
          this.router.navigate(['/org-select']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Signup failed. Please try again.';
      },
    });
  }
}
