import { Routes } from '@angular/router';

// Public pages
import { LandingComponent } from './layout/public-layout/landing-component/landing-component';
import { LoginComponent } from './features/auth/pages/login-component/login-component';
import { SignupComponent } from './features/auth/pages/signup-component/signup-component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password-component/forgot-password-component';
import { ForgotPasswordSuccessComponent } from './features/auth/pages/forgot-password-success-component/forgot-password-success-component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password-component/reset-password-component';

// Dashboard layout
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

// Task pages
import { TaskList } from './features/tasks/pages/task-list/task-list';
import { CreateTask } from './features/tasks/pages/create-task/create-task';

// Guards
import { AuthGuard } from './cores/auth/auth.guard';
import { DashboardHome } from './features/dashboard/pages/dashboard-home/dashboard-home';
import { ProfileComponent } from './features/dashboard/pages/profile/profile';
import { Admin } from './features/dashboard/pages/admin/admin';

export const routes: Routes = [
  /* ---------------- PUBLIC (NO AUTH) ---------------- */
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-password/success', component: ForgotPasswordSuccessComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  /* ---------------- DASHBOARD (AUTH REQUIRED) ---------------- */
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHome },
      { path: 'profile', component: ProfileComponent },
      { path: 'admin', component: Admin },
      { path: 'tasks', component: TaskList },
      { path: 'tasks/new', component: CreateTask },
    ],
  },

  { path: '**', redirectTo: '' },
];
