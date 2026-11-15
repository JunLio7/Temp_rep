/* ==========================================================================
   OJTFlow Session & Role Guard Utility (src/utils/session.ts)
   Enforces strict 2-role isolation ('student' | 'coordinator')
   ========================================================================== */

import type { ActiveSession, AppRouteId, UserRole } from '../types/navigation';

const SESSION_STORAGE_KEY = 'ojtflow_active_session_v1';

const DEFAULT_DEMO_SESSIONS: Record<UserRole, ActiveSession> = {
  student: {
    isAuthenticated: true,
    role: 'student',
    userId: 'STU-2026-0412',
    fullName: 'Juan Dela Cruz',
    subtitle: 'BSIT - Business Analytics • 3rd Year',
    avatarInitials: 'JD',
  },
  coordinator: {
    isAuthenticated: true,
    role: 'coordinator',
    userId: 'COORD-CICS-01',
    fullName: 'Prof. Maria Santos',
    subtitle: 'OJT Coordinator • CICS',
    avatarInitials: 'MS',
  },
};

export function getActiveSession(): ActiveSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<ActiveSession>;
    if (
      parsed &&
      parsed.isAuthenticated === true &&
      (parsed.role === 'student' || parsed.role === 'coordinator') &&
      typeof parsed.userId === 'string' &&
      typeof parsed.fullName === 'string'
    ) {
      return {
        isAuthenticated: true,
        role: parsed.role,
        userId: parsed.userId,
        fullName: parsed.fullName,
        subtitle: parsed.subtitle ?? '',
        avatarInitials: parsed.avatarInitials ?? 'OJ',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function startSessionForRole(role: UserRole, customName?: string): ActiveSession {
  const base = DEFAULT_DEMO_SESSIONS[role];
  const resolvedName = customName && customName.trim().length > 0 ? customName.trim() : base.fullName;
  const initials = resolvedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const session: ActiveSession = {
    ...base,
    fullName: resolvedName,
    avatarInitials: initials || base.avatarInitials,
  };

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getDefaultRouteForRole(role: UserRole): AppRouteId {
  return role === 'coordinator' ? 'coordinator-dashboard' : 'student-dashboard';
}

export function isRouteAllowedForRole(routeId: AppRouteId, role: UserRole): boolean {
  if (routeId === 'login') {
    return true;
  }
  if (role === 'student') {
    return routeId.startsWith('student-');
  }
  return routeId.startsWith('coordinator-');
}