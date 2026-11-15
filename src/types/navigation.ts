/* ==========================================================================
   OJTFlow Navigation & Role Types (src/types/navigation.ts)
   Strict 2-Role Scope: 'student' | 'coordinator' (No Dean/Admin portals)
   ========================================================================== */

export type UserRole = 'student' | 'coordinator';

export type AuthRouteId = 'login';

export type StudentRouteId =
  | 'student-dashboard'
  | 'student-companies'
  | 'student-company-detail'
  | 'student-applications'
  | 'student-requirements'
  | 'student-endorsement'
  | 'student-reports'
  | 'student-notifications'
  | 'student-profile';

export type CoordinatorRouteId =
  | 'coordinator-dashboard'
  | 'coordinator-students'
  | 'coordinator-student-detail'
  | 'coordinator-verifications'
  | 'coordinator-companies'
  | 'coordinator-company-detail'
  | 'coordinator-placements'
  | 'coordinator-endorsements'
  | 'coordinator-reports-review'
  | 'coordinator-announcements'
  | 'coordinator-analytics'
  | 'coordinator-settings';

export type AppRouteId = AuthRouteId | StudentRouteId | CoordinatorRouteId;

export interface NavItem {
  id: Exclude<AppRouteId, AuthRouteId>;
  label: string;
  section: string;
  badgeCount?: number;
  hiddenInSidebar?: boolean;
}

export interface ActiveSession {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string;
  fullName: string;
  subtitle: string;
  avatarInitials: string;
}

export interface RouteState {
  routeId: AppRouteId;
  paramId?: string;
}