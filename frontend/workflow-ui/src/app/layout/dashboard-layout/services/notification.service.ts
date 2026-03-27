import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AppNotification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private base = environment.apiUrl;
  private eventSource: EventSource | null = null;

  private _notifications$ = new BehaviorSubject<AppNotification[]>([]);
  private _unreadCount$   = new BehaviorSubject<number>(0);

  notifications$ = this._notifications$.asObservable();
  unreadCount$   = this._unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  // ===== SSE =====
  connect(): void {
    if (this.eventSource) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.eventSource = new EventSource(
      `${this.base}/notifications/stream?token=${token}`
    );

    this.eventSource.addEventListener('unread-count', (event: MessageEvent) => {
      const count = parseInt(event.data, 10);
      this._unreadCount$.next(isNaN(count) ? 0 : count);
    });

    this.eventSource.onerror = () => {
      this.disconnect();
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  // ===== HTTP =====
  fetchNotifications(onDone?: () => void): void {
    this.http.get<AppNotification[]>(`${this.base}/notifications/me`)
      .subscribe({
        next: (notifications) => {
          this._notifications$.next(notifications);
          const unread = notifications.filter(n => !n.read).length;
          this._unreadCount$.next(unread);
          onDone?.();
        },
        error: () => {
          onDone?.();
        }
      });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.base}/notifications/${id}/read`, null);
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.base}/notifications/me/read-all`, null);
  }
}
