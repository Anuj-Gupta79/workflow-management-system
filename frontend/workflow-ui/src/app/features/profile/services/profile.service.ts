import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
}


@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = environment.apiUrl + '/users/me';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.api);
  }

  updateProfile(data: { name: string; email: string }): Observable<Profile> {
    return this.http.put<Profile>(this.api, data);
  }
}
