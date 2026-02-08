import { Routes } from '@angular/router';

// Auth pages
import { LandingComponent } from './features/auth/pages/landing-component/landing-component';
import { LoginComponent } from './features/auth/pages/login-component/login-component';
import { SignupComponent } from './features/auth/pages/signup-component/signup-component';

// Task pages
import { TaskList } from './features/tasks/pages/task-list/task-list';
import { CreateTask } from './features/tasks/pages/create-task/create-task';

export const routes: Routes = [
  /* ---------------- PUBLIC (NO AUTH) ---------------- */

  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  /* ---------------- TASKS (AUTH LATER) ---------------- */

  { path: 'tasks', component: TaskList },
  { path: 'tasks/new', component: CreateTask },

  /* ---------------- FALLBACK ---------------- */

  { path: '**', redirectTo: '' },
];
