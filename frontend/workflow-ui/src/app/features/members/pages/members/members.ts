import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, Observable, of, merge } from 'rxjs';
import { takeUntil, startWith, switchMap, catchError, mapTo, shareReplay } from 'rxjs/operators';
import { Member, OrgRole, ORG_ROLES, ROLE_HIERARCHY } from '../../models/member.model';
import { MemberService } from '../../services/member.service';
import { CurrentOrgService } from '../../../../layout/dashboard-layout/services/cur-org.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.html',
  styleUrls: ['./members.css'],
})
export class MembersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();

  members$: Observable<Member[]> = of([]);
  loading$: Observable<boolean> = of(true);
  error$ = new BehaviorSubject<string>('');

  // Current user context
  currentUserId: number | null = null;
  currentRole: OrgRole = 'EMPLOYEE';
  canManage = false; // OWNER or ADMIN
  isManager = false;

  // Role change inline editing
  editingMemberId: number | null = null;
  editingRole: OrgRole = 'EMPLOYEE';

  // Remove confirmation
  removingMemberId: number | null = null;

  // Add member panel
  showAddPanel = false;
  addEmail = '';
  addRole: OrgRole = 'EMPLOYEE';
  addLoading = false;
  addError = '';

  // Search
  searchText = '';
  filterRole = '';

  readonly ORG_ROLES = ORG_ROLES;
  readonly ROLE_HIERARCHY = ROLE_HIERARCHY;

  private allMembers: Member[] = [];
  filteredMembers: Member[] = [];

  constructor(
    private memberService: MemberService,
    private currentOrgService: CurrentOrgService,
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.currentUserId = userId ? +userId : null;

    this.currentOrgService.org$.pipe(takeUntil(this.destroy$)).subscribe((org) => {
      this.currentRole = org.role as OrgRole;
      this.canManage = ['OWNER', 'ADMIN'].includes(org.role);
      this.isManager = org.role === 'MANAGER';

      this.members$ = this.reload$.pipe(
        startWith<void>(undefined),
        switchMap(() =>
          this.memberService.getMembers(org.id).pipe(
            catchError(() => {
              this.error$.next('Failed to load members.');
              return of([]);
            }),
          ),
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

      this.loading$ = merge(this.reload$.pipe(mapTo(true)), this.members$.pipe(mapTo(false))).pipe(
        startWith(true),
      );

      this.members$.pipe(takeUntil(this.destroy$)).subscribe((members) => {
        this.allMembers = members;
        this.applyFilters();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.error$.next('');
    this.editingMemberId = null;
    this.removingMemberId = null;
    this.reload$.next();
  }

  // ===== FILTERS =====
  applyFilters(): void {
    let list = [...this.allMembers];
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(
        (m) => m.user.name.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q),
      );
    }
    if (this.filterRole) {
      list = list.filter((m) => m.role === this.filterRole);
    }
    // Sort by role hierarchy desc then name
    list.sort(
      (a, b) =>
        ROLE_HIERARCHY[b.role] - ROLE_HIERARCHY[a.role] || a.user.name.localeCompare(b.user.name),
    );
    this.filteredMembers = list;
  }

  // ===== ROLE EDIT =====
  startEdit(member: Member): void {
    this.editingMemberId = member.id;
    this.editingRole = member.role;
    this.removingMemberId = null;
  }

  cancelEdit(): void {
    this.editingMemberId = null;
  }

  saveRole(member: Member): void {
    if (this.editingRole === member.role) {
      this.cancelEdit();
      return;
    }
    const orgId = this.currentOrgService.getCurrent()?.id;
    if (!orgId) return;

    this.memberService.updateRole(orgId, member.user.id, this.editingRole).subscribe({
      next: () => {
        this.editingMemberId = null;
        this.reload();
      },
      error: () => alert('Failed to update role.'),
    });
  }

  // ===== REMOVE =====
  confirmRemove(memberId: number): void {
    this.removingMemberId = memberId;
    this.editingMemberId = null;
  }

  cancelRemove(): void {
    this.removingMemberId = null;
  }

  doRemove(member: Member): void {
    const orgId = this.currentOrgService.getCurrent()?.id;
    if (!orgId) return;

    this.memberService.removeMember(orgId, member.user.id).subscribe({
      next: () => {
        this.removingMemberId = null;
        this.reload();
      },
      error: () => alert('Failed to remove member.'),
    });
  }

  // ===== ADD MEMBER =====
  toggleAddPanel(): void {
    this.showAddPanel = !this.showAddPanel;
    this.addEmail = '';
    this.addRole = 'EMPLOYEE';
    this.addError = '';
  }

  // ===== HELPERS =====
  canEditMember(member: Member): boolean {
    if (!this.canManage) return false;
    if (member.role === 'OWNER') return false;
    // Admin cannot edit another admin unless they are owner
    if (member.role === 'ADMIN' && this.currentRole !== 'OWNER') return false;
    if (member.user.id === this.currentUserId) return false;
    return true;
  }

  canRemoveMember(member: Member): boolean {
    if (!this.canManage) return false;
    if (member.role === 'OWNER') return false;
    if (member.user.id === this.currentUserId) return false;
    if (member.role === 'ADMIN' && this.currentRole !== 'OWNER') return false;
    return true;
  }

  getRoleClass(role: OrgRole): string {
    const map: Record<OrgRole, string> = {
      OWNER: 'role-owner',
      ADMIN: 'role-admin',
      MANAGER: 'role-manager',
      EMPLOYEE: 'role-employee',
    };
    return map[role];
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  trackById(_: number, m: Member) {
    return m.id;
  }
}
