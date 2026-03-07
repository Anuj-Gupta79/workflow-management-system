export interface MemberUser {
    id: number;
    name: string;
    email: string;
  }

  export interface Member {
    id: number;
    user: MemberUser;
    role: OrgRole;
    joinedAt?: string;
  }

  export type OrgRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

  export const ORG_ROLES: OrgRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

  export const ROLE_HIERARCHY: Record<OrgRole, number> = {
    OWNER:    4,
    ADMIN:    3,
    MANAGER:  2,
    EMPLOYEE: 1,
  };
