import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrgRole } from '../../members/models/member.model';

export interface InviteRequest {
  organizationId: number;
  email: string;
  role: OrgRole;
}

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private base = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  sendInvite(organizationId: number, email: string, role: OrgRole): Observable<any> {
    const payload: InviteRequest = { organizationId, email, role };
    return this.http.post(`${this.base}/invites`, payload);
  }

  validateToken(token: string): Observable<any> {
    return this.http.get(`${this.base}/invites/validate?token=${token}`);
  }

  acceptInvite(token: string): Observable<any> {
    return this.http.post(`${this.base}/invites/accept?token=${token}`, null);
  }

  declineInvite(token: string): Observable<any> {
    return this.http.post(`${this.base}/invites/decline?token=${token}`, null);
  }
}
