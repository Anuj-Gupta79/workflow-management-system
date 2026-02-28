import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password-success',
  standalone: true,
  templateUrl: './forgot-password-success-component.html',
  styleUrls: ['./forgot-password-success-component.css'],
})
export class ForgotPasswordSuccessComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
