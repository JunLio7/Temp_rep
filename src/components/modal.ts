/* ==========================================================================
   OJTFlow Modal Dialog Component (src/components/modal.ts)
   Uses .modal-backdrop & .modal from src/styles/components.css
   ========================================================================== */

import { escapeHtml } from '../utils/escapeHtml';

export interface ModalOptions {
  title: string;
  bodyHtml: string;
  footerHtml?: string;
  size?: 'default' | 'lg';
  onMount?: (modalElement: HTMLElement) => void;
  onClose?: () => void;
}

let activeBackdrop: HTMLDivElement | null = null;
let activeEscapeHandler: ((event: KeyboardEvent) => void) | null = null;
let activeOnClose: (() => void) | undefined;

export function closeModal(): void {
  if (activeEscapeHandler) {
    document.removeEventListener('keydown', activeEscapeHandler);
    activeEscapeHandler = null;
  }

  if (activeBackdrop && activeBackdrop.parentNode) {
    activeBackdrop.parentNode.removeChild(activeBackdrop);
  }
  activeBackdrop = null;

  if (activeOnClose) {
    const callback = activeOnClose;
    activeOnClose = undefined;
    callback();
  }
}

export function openModal(options: ModalOptions): void {
  closeModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', options.title);

  const sizeClass = options.size === 'lg' ? ' modal--lg' : '';
  const footerMarkup = options.footerHtml
    ? `<div class="modal_footer">${options.footerHtml}</div>`
    : '';

  backdrop.innerHTML = `
    <div class="modal${sizeClass}">
      <div class="modal_header">
        <h3 class="modal_title">${escapeHtml(options.title)}</h3>
        <button type="button" class="btn btn--ghost btn--sm" data-modal-close aria-label="Close modal">&times;</button>
      </div>
      <div class="modal_body">
        ${options.bodyHtml}
      </div>
      ${footerMarkup}
    </div>
  `;

  backdrop.addEventListener('click', (event: MouseEvent) => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  const closeButtons = backdrop.querySelectorAll<HTMLElement>('[data-modal-close]');
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => closeModal());
  });

  activeEscapeHandler = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', activeEscapeHandler);

  activeBackdrop = backdrop;
  activeOnClose = options.onClose;

  document.body.appendChild(backdrop);

  const modalEl = backdrop.querySelector<HTMLElement>('.modal');
  if (modalEl && options.onMount) {
    options.onMount(modalEl);
  }
}