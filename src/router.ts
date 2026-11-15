/* ==========================================================================
   OJTFlow Client-Side Hash Router & Role Guard (src/router.ts)
   Enforces strict 2-role isolation across the 21-screen inventory
   ========================================================================== */

import { mountAiWidget, unmountAiWidget } from './components/aiWidget';
import { getRouteTitle, renderAppShell } from './components/appShell';
import { showToast } from './components/toast';
import type { AppRouteId, RouteState } from './types/navigation';
import { escapeHtml } from './utils/escapeHtml';
import {
  clearSession,
  getActiveSession,
  getDefaultRouteForRole,
  isRouteAllowedForRole,
} from './utils/session';

export type RouteRenderer = (container: HTMLElement, state: RouteState) => void;

const ALL_VALID_ROUTES: ReadonlySet<AppRouteId> = new Set<AppRouteId>([
  'login',
  'student-dashboard',
  'student-companies',
  'student-company-detail',
  'student-applications',
  'student-requirements',
  'student-endorsement',
  'student-reports',
  'student-notifications',
  'student-profile',
  'coordinator-dashboard',
  'coordinator-students',
  'coordinator-student-detail',
  'coordinator-verifications',
  'coordinator-companies',
  'coordinator-company-detail',
  'coordinator-placements',
  'coordinator-endorsements',
  'coordinator-reports-review',
  'coordinator-announcements',
  'coordinator-analytics',
  'coordinator-settings',
]);

const routeRegistry = new Map<AppRouteId, RouteRenderer>();
let rootMountElement: HTMLElement | null = null;

export function registerRouteRenderer(routeId: AppRouteId, renderer: RouteRenderer): void {
  routeRegistry.set(routeId, renderer);
}

export function navigateTo(routeId: AppRouteId, paramId?: string): void {
  const querySuffix = paramId && paramId.trim().length > 0 ? `?id=${encodeURIComponent(paramId.trim())}` : '';
  const targetHash = `#/${routeId}${querySuffix}`;

  if (window.location.hash === targetHash) {
    renderCurrentRoute();
    return;
  }
  window.location.hash = targetHash;
}

function parseHashState(): RouteState {
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!rawHash) {
    return { routeId: 'login' };
  }

  const [pathPart, queryPart] = rawHash.split('?');
  const candidate = pathPart as AppRouteId;
  const routeId: AppRouteId = ALL_VALID_ROUTES.has(candidate) ? candidate : 'login';

  let paramId: string | undefined;
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const idValue = params.get('id');
    if (idValue && idValue.trim().length > 0) {
      paramId = idValue.trim();
    }
  }

  return { routeId, paramId };
}

function renderPlaceholderScreen(container: HTMLElement, state: RouteState, title: string): void {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header_info">
        <h1 class="page-header_title">${escapeHtml(title)}</h1>
        <p class="page-header_description">
          Route <code>#/${escapeHtml(state.routeId)}</code> mounted inside persistent shell. Ready for phase implementation.
        </p>
      </div>
      <div class="page-header_actions">
        <span class="badge badge--info">Shell Verified</span>
      </div>
    </div>

    <div class="card">
      <div class="card_body">
        <div class="empty-state">
          <div class="empty-state_title">${escapeHtml(title)} View</div>
          <p class="empty-state_description">
            Navigation, role guard, and layout shell are active. Screen markup will be populated in its assigned build phase.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function renderCurrentRoute(): void {
  if (!rootMountElement) {
    return;
  }

  const session = getActiveSession();
  const parsed = parseHashState();

  // Unauthenticated guard -> force login
  if (!session) {
    unmountAiWidget();
    if (parsed.routeId !== 'login') {
      window.location.hash = '#/login';
      return;
    }

    const loginRenderer = routeRegistry.get('login');
    if (loginRenderer) {
      loginRenderer(rootMountElement, parsed);
    } else {
      rootMountElement.innerHTML = `
        <main style="padding: 2rem; font-family: var(--font-body);">
          <h1>OJTFlow Sign In</h1>
          <p>Phase 4 router active. Login view will be built in Phase 5.</p>
        </main>
      `;
    }
    return;
  }

  // Authenticated guard -> block login or cross-role routes
  if (parsed.routeId === 'login' || !isRouteAllowedForRole(parsed.routeId, session.role)) {
    const fallbackRoute = getDefaultRouteForRole(session.role);
    window.location.hash = `#/${fallbackRoute}`;
    return;
  }

  const pageTitle = getRouteTitle(parsed.routeId, session.role);
  const outlet = renderAppShell(rootMountElement, {
    session,
    currentRoute: parsed.routeId,
    pageContentHtml: '',
    onNavigate: (targetRoute) => navigateTo(targetRoute),
    onLogout: () => {
      clearSession();
      unmountAiWidget();
      showToast('Signed out of OJTFlow.', 'default');
      navigateTo('login');
    },
  });

  mountAiWidget(session.role);

  const renderer = routeRegistry.get(parsed.routeId);
  if (renderer) {
    renderer(outlet, parsed);
  } else {
    renderPlaceholderScreen(outlet, parsed, pageTitle);
  }
}

export function initRouter(rootElement: HTMLElement): void {
  rootMountElement = rootElement;
  window.addEventListener('hashchange', renderCurrentRoute);
  renderCurrentRoute();
}