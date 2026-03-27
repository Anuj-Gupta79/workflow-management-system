import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Member, OrgRole } from '../models/member.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private base = environment.apiUrl + '/organization-members';

  constructor(private http: HttpClient) {}

  getMembers(orgId: number): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.base}/organization/${orgId}`);
  }

  updateRole(orgId: number, userId: number, role: OrgRole): Observable<Member> {
    const params = new HttpParams().set('role', role);
    return this.http.patch<Member>(`${this.base}/organization/${orgId}/user/${userId}/role`, null, {
      params,
    });
  }

  removeMember(orgId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/organization/${orgId}/user/${userId}`);
  }

  addMember(organizationId: number, userId: number, role: OrgRole): Observable<Member> {
    return this.http.post<Member>(`${this.base}`, { organizationId, userId, role });
  }
}
