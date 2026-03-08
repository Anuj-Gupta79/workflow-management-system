import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InviteService } from '../../../organization/services/invite.service';

type PageState =
  | 'loading'
  | 'invalid'
  | 'expired'
  | 'declined-already'
  | 'ready'
  | 'accepting'
  | 'declining'
  | 'success'
  | 'declined';

interface InviteDetails {
  id: number;
  token: string;
  inviteeEmail: string;
  organization: {
    id: number;
    name: string;
    owner?: { id: number; name: string; email: string };
  };
  invitedBy: { id: number; name: string; email: string };
  role: string;
  status: string;
  expiryTime: string;
  createdAt: string;
}

@Component({
  selector: 'app-invite-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invite-page.html',
  styleUrls: ['./invite-page.css'],
})
export class InvitePageComponent implements OnInit {
  state: PageState = 'loading';
  invite: InviteDetails | null = null;
  errorMessage = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inviteService: InviteService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.state = 'invalid';
      this.errorMessage = 'No invite token found in the link.';
      return;
    }
    this.validateToken();
  }

  validateToken(): void {
    this.state = 'loading';
    this.inviteService.validateToken(this.token).subscribe({
      next: (invite: InviteDetails) => {
        this.invite = invite;

        if (!this.isLoggedIn()) {
          localStorage.setItem('pendingInviteToken', this.token);
          this.router.navigate(['/login'], {
            queryParams: {
              inviteToken: this.token,
              returnUrl: '/invite?token=' + this.token,
            },
          });
          return;
        }

        this.state = 'ready';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const msg: string = err?.error?.message ?? '';
        if (msg.toLowerCase().includes('expired')) {
          this.state = 'expired';
        } else if (msg.toLowerCase().includes('accepted')) {
          this.state = 'invalid';
          this.errorMessage = 'This invitation has already been accepted.';
        } else if (msg.toLowerCase().includes('declined')) {
          this.state = 'declined-already';
        } else {
          this.state = 'invalid';
          this.errorMessage = msg || 'This invite link is invalid or has been revoked.';
        }
      },
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  accept(): void {
    this.state = 'accepting';
    this.inviteService.acceptInvite(this.token).subscribe({
      next: () => {
        localStorage.removeItem('pendingInviteToken');
        this.state = 'success';
        setTimeout(() => this.router.navigate(['/org-select']), 2500);
      },
      error: (err: any) => {
        this.state = 'ready';
        this.cdr.detectChanges();
        this.errorMessage = err?.error?.message || 'Failed to accept invite. Please try again.';
      },
    });
  }

  decline(): void {
    this.state = 'declining';
    this.inviteService.declineInvite(this.token).subscribe({
      next: () => {
        localStorage.removeItem('pendingInviteToken');
        this.state = 'declined';
        setTimeout(() => this.router.navigate(['/']), 3000);
      },
      error: (err: any) => {
        this.state = 'ready';
        this.cdr.detectChanges();
        this.errorMessage = err?.error?.message || 'Failed to decline invite.';
      },
    });
  }
}
