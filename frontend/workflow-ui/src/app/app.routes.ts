import { Routes } from '@angular/router';
import { TaskList as TaskListComponent } from './pages/task/task-list/task-list';

export const routes: Routes = [
  { path: 'tasks', component: TaskListComponent },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' }
];
