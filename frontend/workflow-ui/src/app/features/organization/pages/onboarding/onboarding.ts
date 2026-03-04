import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreateWorkspaceModalComponent } from '../../../../shared/components/create-workspace-modal/create-workspace-modal';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, CreateWorkspaceModalComponent],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css'],
})
export class OnboardingComponent {
  showModal = false;

  sections = [
    {
      icon: '📊',
      title: 'Dashboard & Stats',
      color: 'blue',
      description:
        'Your command center. The dashboard gives you a live snapshot of everything happening in your workspace.',
      points: [
        'Total tasks, my tasks, completed, and overdue — all at a glance',
        'Recent activity feed shows what your team has been up to',
        'Role and workspace info always visible at the top',
      ],
    },
    {
      icon: '📋',
      title: 'Creating & Managing Tasks',
      color: 'indigo',
      description:
        'Tasks are the core of FlowSync. Create them, assign them, and move them through a structured status workflow.',
      points: [
        'Create tasks with title, description, and assignee',
        'Tasks follow a workflow: Pending → In Progress → Completed → Approved',
        'Update status directly from the task list with one click',
        'Filter tasks by status, assignee, or creator',
      ],
      workflow: ['PENDING', 'IN PROGRESS', 'COMPLETED', 'APPROVED'],
    },
    {
      icon: '✅',
      title: 'Approval Workflows',
      color: 'green',
      description:
        'Once a task is completed, it enters an approval chain. Managers and admins can approve or reject.',
      points: [
        'Completed tasks go to APPROVED or REJECTED by authorized members',
        'Approved tasks can be archived for record-keeping',
        'Full audit trail — every status change is logged',
        'Only members with the right role can approve',
      ],
    },
    {
      icon: '👥',
      title: 'Team Members & Roles',
      color: 'purple',
      description:
        'Every workspace has a role-based access system. Each member gets exactly the permissions they need.',
      roles: [
        {
          name: 'OWNER',
          icon: '👑',
          desc: 'Full control. Can delete workspace, manage all members and tasks.',
        },
        {
          name: 'ADMIN',
          icon: '🛡️',
          desc: 'Can manage members, approve tasks, and configure settings.',
        },
        {
          name: 'MANAGER',
          icon: '📊',
          desc: 'Can create and assign tasks, approve work in their scope.',
        },
        { name: 'EMPLOYEE', icon: '👤', desc: 'Can view and update tasks assigned to them.' },
      ],
    },
    {
      icon: '🔀',
      title: 'Switching Organizations',
      color: 'orange',
      description:
        'You can be part of multiple workspaces — personal projects, different companies, different teams.',
      points: [
        'Use the workspace switcher in the top navbar',
        'Each workspace is fully isolated — separate tasks, members, and data',
        'Your role can differ across workspaces',
        'Create a new workspace anytime from the switcher or here',
      ],
    },
  ];

  constructor(private router: Router) {}

  markSeenAndGo() {
    localStorage.setItem('hasSeenOnboarding', 'true');
    this.router.navigate(['/org-select']);
  }

  onWorkspaceCreated() {
    localStorage.setItem('hasSeenOnboarding', 'true');
    this.showModal = false;
    this.router.navigate(['/org-select']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}
