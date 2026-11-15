/* ==========================================================================
   OJTFlow Persistent Application Shell (src/components/appShell.ts)
   Covers 9 Student views + 12 Coordinator views (21-screen inventory)
   ========================================================================== */

import type { ActiveSession, AppRouteId, NavItem, UserRole } from '../types/navigation';
import { escapeHtml } from '../utils/escapeHtml';

const STUDENT_NAV_ITEMS: NavItem[] = [
  { id: 'student-dashboard', label: 'Dashboard', section: 'Overview' },
  { id: 'student-companies', label: 'Partner Companies', section: 'Internship' },
  {
    id: 'student-company-detail',
    label: 'Company Details',
    section: 'Internship',
    hiddenInSidebar: true,
  },
  { id: 'student-applications', label: 'My Applications', section: 'Internship', badgeCount: 2 },
  { id: 'student-requirements', label: 'Requirements', section: 'Compliance' },
  { id: 'student-endorsement', label: 'Endorsement', section: 'Compliance' },
  { id: 'student-reports', label: 'Weekly Reports', section: 'Monitoring' },
  { id: 'student-notifications', label: 'Notifications', section: 'Account', badgeCount: 3 },
  { id: 'student-profile', label: 'My Profile', section: 'Account' },
];

const COORDINATOR_NAV_ITEMS: NavItem[] = [
  { id: 'coordinator-dashboard', label: 'Dashboard', section: 'Overview' },
  { id: 'coordinator-students', label: 'Student Masterlist', section: 'Cohort Management' },
  {
    id: 'coordinator-student-detail',
    label: 'Student Profile',
    section: 'Cohort Management',
    hiddenInSidebar: true,
  },
  {
    id: 'coordinator-verifications',
    label: 'Requirement Verifications',
    section: 'Cohort Management',
    badgeCount: 5,
  },
  { id: 'coordinator-companies', label: 'Partner Companies', section: 'Industry Partners' },
  {
    id: 'coordinator-company-detail',
    label: 'Company Profile',
    section: 'Industry Partners',
    hiddenInSidebar: true,
  },
  { id: 'coordinator-placements', label: 'Placements', section: 'Industry Partners' },
  {
    id: 'coordinator-endorsements',
    label: 'Endorsements',
    section: 'Deployment & Monitoring',
    badgeCount: 3,
  },
  { id: 'coordinator-reports-review', label: 'Reports Review', section: 'Deployment & Monitoring' },
  { id: 'coordinator-announcements', label: 'Announcements', section: 'Administration' },
  { id: 'coordinator-analytics', label: 'Cohort Analytics', section: 'Administration' },
  { id: 'coordinator-settings', label: 'Settings', section: 'Administration' },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return role === 'coordinator' ? COORDINATOR_NAV_ITEMS : STUDENT_NAV_ITEMS;
}

function resolveActiveSidebarId(currentRoute: AppRouteId): AppRouteId {
  if (currentRoute === 'student-company-detail') {
    return 'student-companies';
  }
  if (currentRoute === 'coordinator-student-detail') {
    return 'coordinator-students';
  }
  if (currentRoute === 'coordinator-company-detail') {
    return 'coordinator-companies';
  }
  return currentRoute;
}

export function getRouteTitle(routeId: AppRouteId, role: UserRole): string {
  if (routeId === 'login') {
    return 'Sign In';
  }
  const items = getNavItemsForRole(role);
  const match = items.find((item) => item.id === routeId);
  return match ? match.label : 'Dashboard';
}

export interface AppShellRenderOptions {
  session: ActiveSession;
  currentRoute: AppRouteId;
  pageContentHtml: string;
  onNavigate: (routeId: AppRouteId) => void;
  onLogout: () => void;
}

export function renderAppShell(
  rootElement: HTMLElement,
  options: AppShellRenderOptions
): HTMLElement {
  const { session, currentRoute, pageContentHtml, onNavigate, onLogout } = options;
  const navItems = getNavItemsForRole(session.role);
  const activeSidebarId = resolveActiveSidebarId(currentRoute);
  const currentTitle = getRouteTitle(currentRoute, session.role);
  const portalLabel = session.role === 'coordinator' ? 'Coordinator Portal' : 'Student Portal';

  let lastSection = '';
  const navMarkup = navItems
    .filter((item) => !item.hiddenInSidebar)
    .map((item) => {
      const sectionHeader =
        item.section !== lastSection
          ? `<div class="sidebar_section-label">${escapeHtml(item.section)}</div>`
          : '';
      lastSection = item.section;

      const isActive = item.id === activeSidebarId;
      const activeClass = isActive ? ' sidebar_link--active' : '';
      const badgeMarkup =
        typeof item.badgeCount === 'number' && item.badgeCount > 0
          ? `<span class="badge badge--primary" style="margin-left: auto;">${item.badgeCount}</span>`
          : '';

      return `
        ${sectionHeader}
        <a
          href="#/${escapeHtml(item.id)}"
          class="sidebar_link${activeClass}"
          data-nav-route="${escapeHtml(item.id)}"
          ${isActive ? 'aria-current="page"' : ''}
        >
          <span>${escapeHtml(item.label)}</span>
          ${badgeMarkup}
        </a>
      `;
    })
    .join('');

  rootElement.innerHTML = `
    <div class="app-shell" id="ojtflow-shell">
      <div class="app-shell_backdrop" data-shell-backdrop></div>

      <aside class="app-shell_sidebar" aria-label="Primary Navigation">
        <div class="sidebar_brand">
          <span class="sidebar_logo">OJ</span>
          <div class="sidebar_brand-text">
            <span class="sidebar_title">OJTFlow</span>
            <span class="sidebar_subtitle">${escapeHtml(portalLabel)}</span>
          </div>
        </div>

        <nav class="sidebar_nav">
          ${navMarkup}
        </nav>

        <div class="sidebar_footer">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);">
            <div
              style="
                width: 36px;
                height: 36px;
                border-radius: var(--radius-full);
                background-color: var(--color-primary-subtle);
                color: var(--color-primary);
                font-weight: var(--weight-bold);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              "
            >
              ${escapeHtml(session.avatarInitials)}
            </div>
            <div style="min-width: 0;">
              <div style="font-size: var(--text-xs); font-weight: var(--weight-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(session.fullName)}
              </div>
              <div style="font-size: 0.6875rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(session.subtitle)}
              </div>
            </div>
          </div>
          <button type="button" class="btn btn--secondary btn--sm btn--block" data-shell-logout>
            Sign Out
          </button>
        </div>
      </aside>

      <div class="app-shell_main">
        <header class="app-shell_topbar">
          <div class="topbar_left">
            <button
              type="button"
              class="topbar_menu-btn"
              data-shell-menu-toggle
              aria-label="Toggle navigation menu"
            >
              &#9776;
            </button>
            <div class="topbar_breadcrumb">
              <span>${escapeHtml(portalLabel)}</span>
              <span>/</span>
              <span class="topbar_breadcrumb-current">${escapeHtml(currentTitle)}</span>
            </div>
          </div>

          <div class="topbar_right">
            <span class="badge badge--neutral">AY 2026–2027 • 1st Sem</span>
            <span class="badge badge--primary">${escapeHtml(session.role === 'coordinator' ? 'Coordinator' : 'Student')}</span>
          </div>
        </header>

        <main class="app-shell_content" id="page-outlet">
          ${pageContentHtml}
        </main>
      </div>
    </div>
  `;

  const shellEl = rootElement.querySelector<HTMLDivElement>('#ojtflow-shell');
  const menuBtn = rootElement.querySelector<HTMLButtonElement>('[data-shell-menu-toggle]');
  const backdropEl = rootElement.querySelector<HTMLDivElement>('[data-shell-backdrop]');
  const logoutBtn = rootElement.querySelector<HTMLButtonElement>('[data-shell-logout]');

  const closeMobileSidebar = (): void => {
    shellEl?.classList.remove('app-shell--sidebar-open');
  };

  menuBtn?.addEventListener('click', () => {
    shellEl?.classList.toggle('app-shell--sidebar-open');
  });

  backdropEl?.addEventListener('click', closeMobileSidebar);

  logoutBtn?.addEventListener('click', () => {
    closeMobileSidebar();
    onLogout();
  });

  const navLinks = rootElement.querySelectorAll<HTMLAnchorElement>('[data-nav-route]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      const targetRoute = link.getAttribute('data-nav-route') as AppRouteId | null;
      if (targetRoute) {
        closeMobileSidebar();
        onNavigate(targetRoute);
      }
    });
  });

  const outlet = rootElement.querySelector<HTMLElement>('#page-outlet');
  if (!outlet) {
    throw new Error('Failed to mount #page-outlet inside appShell.');
  }
  return outlet;
}