import { Component, OnInit } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  imports: [],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  standalone: true
})
export class TaskList implements OnInit {

  tasks: Task[] = [];
  loading: boolean = true;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    console.log('ngOnInit start → loading:', this.loading);
    this.loadAllTasks();
  }

  loadAllTasks() {
    this.loading = true;

    console.log('Before API call → loading:', this.loading);

    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        console.log('INSIDE subscribe → tasks:', tasks);
        console.log('INSIDE subscribe → loading BEFORE:', this.loading);
        this.tasks = tasks;
        this.loading = false;

        console.log('INSIDE subscribe → loading AFTER:', this.loading);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });

  }

  loadByStatus(status: string) {
    this.loading = true;
    this.taskService.getTasksByStatus(status).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge bg-secondary';
      case 'IN_PROGRESS': return 'badge bg-primary';
      case 'COMPLETED': return 'badge bg-success';
      case 'APPROVED': return 'badge bg-info';
      case 'REJECTED': return 'badge bg-danger';
      case 'ON_HOLD': return 'badge bg-warning text-dark';
      case 'CANCELLED': return 'badge bg-dark';
      case 'ARCHIVED': return 'badge bg-light text-dark';
      default: return 'badge bg-secondary';
    }
  }

}
