import { Routes } from '@angular/router';

// Public pages
import { LandingComponent } from './layout/public-layout/landing-component/landing-component';
import { LoginComponent } from './features/auth/pages/login-component/login-component';
import { SignupComponent } from './features/auth/pages/signup-component/signup-component';

// Dashboard layout
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

// Task pages
import { TaskList } from './features/tasks/pages/task-list/task-list';
import { CreateTask } from './features/tasks/pages/create-task/create-task';

// Guards
import { AuthGuard } from './cores/auth/auth.guard';

export const routes: Routes = [
  /* ---------------- PUBLIC (NO AUTH) ---------------- */
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  /* ---------------- DASHBOARD (AUTH REQUIRED) ---------------- */
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [
      // {
      //   path: '',
      //   redirectTo: 'tasks',
      //   pathMatch: 'full',
      // },
      {
        path: 'tasks',
        component: TaskList,
      },
      {
        path: 'tasks/new',
        component: CreateTask,
      },
    ],
  },

  /* ---------------- FALLBACK ---------------- */
  { path: '**', redirectTo: '' },
];
