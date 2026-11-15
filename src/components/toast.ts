/* ==========================================================================
   OJTFlow Toast Notification Component (src/components/toast.ts)
   Uses .toast-container & .toast--* from src/styles/components.css
   ========================================================================== */

import { escapeHtml } from '../utils/escapeHtml';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger';

function ensureToastContainer(): HTMLDivElement {
  let container = document.querySelector<HTMLDivElement>('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(
  message: string,
  variant: ToastVariant = 'default',
  durationMs = 3500
): void {
  const container = ensureToastContainer();
  const toastEl = document.createElement('div');
  const variantClass = variant === 'default' ? '' : ` toast--${variant}`;

  toastEl.className = `toast${variantClass}`;
  toastEl.setAttribute('role', 'status');
  toastEl.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button type="button" class="btn btn--ghost btn--sm" style="color: inherit; padding: 0 4px;" aria-label="Dismiss notification">&times;</button>
  `;

  const removeToast = (): void => {
    if (toastEl.parentNode === container) {
      container.removeChild(toastEl);
    }
  };

  const closeBtn = toastEl.querySelector<HTMLButtonElement>('button');
  if (closeBtn) {
    closeBtn.addEventListener('click', removeToast);
  }

  container.appendChild(toastEl);
  window.setTimeout(removeToast, durationMs);
}