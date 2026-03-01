import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../cores/auth/auth.service';

@Component({
  selector: 'app-signup-component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup-component.html',
  styleUrls: ['./signup-component.css'],
})
export class SignupComponent {
  signupForm!: FormGroup;

  showPassword = false;

  strengthText = '';
  strengthClass = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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

    this.authService.signup(this.signupForm.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => console.error(err),
    });
  }
}
