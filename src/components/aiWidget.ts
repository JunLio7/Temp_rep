/* ==========================================================================
   OJTFlow Floating AI Assistant Widget (src/components/aiWidget.ts)
   Uses .ai-widget* classes from src/styles/components.css
   ========================================================================== */

import type { UserRole } from '../types/navigation';
import { escapeHtml } from '../utils/escapeHtml';

interface ChatMessage {
  sender: 'assistant' | 'user';
  text: string;
}

const INITIAL_GREETINGS: Record<UserRole, string> = {
  student:
    'Hi! I am the OJTFlow Assistant. Ask me about your requirement verification status, endorsement steps, partner companies, or weekly accomplishment reports.',
  coordinator:
    'Hello! I am the OJTFlow Coordinator Assistant. Ask me about pending requirement verifications, MOA partner companies, endorsement approvals, or cohort placement summaries.',
};

function generateAssistantReply(prompt: string, role: UserRole): string {
  const normalized = prompt.toLowerCase();

  if (role === 'student') {
    if (normalized.includes('requirement') || normalized.includes('verify') || normalized.includes('status')) {
      return 'You can check each physical requirement’s verification badge under "Requirements". Items marked "For Revision" include coordinator remarks so you know what to resubmit in person.';
    }
    if (normalized.includes('endorsement') || normalized.includes('moa')) {
      return 'Once your pre-deployment requirements are marked "Verified" and you have an accepted company placement, your Endorsement Letter status updates automatically under "Endorsement".';
    }
    if (normalized.includes('company') || normalized.includes('apply') || normalized.includes('internship')) {
      return 'Browse MOA-verified host training establishments in "Partner Companies" and track your submitted applications in "My Applications".';
    }
    if (normalized.includes('report') || normalized.includes('journal')) {
      return 'Submit your weekly accomplishment summaries under "Weekly Reports" so your OJT Coordinator can review your milestones.';
    }
    return 'I can help you navigate Partner Companies, My Applications, Requirement Verification statuses, Endorsement tracking, and Weekly Reports. Which section do you need help with?';
  }

  if (normalized.includes('verify') || normalized.includes('requirement') || normalized.includes('pending')) {
    return 'Open "Requirement Verifications" to review student documentary statuses and mark items as Verified or For Revision with remarks.';
  }
  if (normalized.includes('endorsement')) {
    return 'Go to "Endorsements" to review and approve endorsement letter requests for students with cleared pre-deployment checklists.';
  }
  if (normalized.includes('company') || normalized.includes('moa') || normalized.includes('partner')) {
    return 'Use "Partner Companies" to monitor active MOA validity dates, slot availability, and deployed student counts.';
  }
  return 'I can assist with Student Masterlist filtering, Requirement Verifications, Endorsement approvals, Partner Companies, and Cohort Analytics. What would you like to check?';
}

export function mountAiWidget(role: UserRole): void {
  unmountAiWidget();

  let isOpen = false;
  const messages: ChatMessage[] = [
    { sender: 'assistant', text: INITIAL_GREETINGS[role] },
  ];

  const container = document.createElement('div');
  container.className = 'ai-widget';
  container.id = 'ojtflow-ai-widget';

  const render = (): void => {
    const messagesMarkup = messages
      .map(
        (msg) => `
          <div class="ai-widget_bubble ai-widget_bubble--${msg.sender}">
            ${escapeHtml(msg.text)}
          </div>
        `
      )
      .join('');

    const panelMarkup = isOpen
      ? `
        <div class="ai-widget_panel" role="region" aria-label="OJTFlow AI Assistant">
          <div class="ai-widget_header">
            <div>
              <div style="font-weight: 700; font-size: 0.875rem;">OJTFlow Assistant</div>
              <div style="font-size: 0.7rem; opacity: 0.85;">${role === 'student' ? 'Student Guidance' : 'Coordinator Support'}</div>
            </div>
            <button type="button" class="btn btn--ghost btn--sm" data-ai-close style="color: #ffffff; padding: 0 6px;" aria-label="Close assistant">&times;</button>
          </div>
          <div class="ai-widget_messages" data-ai-messages>
            ${messagesMarkup}
          </div>
          <form class="ai-widget_input-row" data-ai-form>
            <input
              type="text"
              class="form-control"
              name="prompt"
              placeholder="Ask about OJT steps..."
              autocomplete="off"
              style="height: 36px; font-size: 0.8125rem;"
            />
            <button type="submit" class="btn btn--primary btn--sm" style="height: 36px;">Send</button>
          </form>
        </div>
      `
      : '';

    container.innerHTML = `
      ${panelMarkup}
      <button type="button" class="ai-widget_trigger" data-ai-toggle aria-expanded="${String(isOpen)}">
        <span>AI Assistant</span>
      </button>
    `;

    const toggleBtn = container.querySelector<HTMLButtonElement>('[data-ai-toggle]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        render();
      });
    }

    const closeBtn = container.querySelector<HTMLButtonElement>('[data-ai-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        isOpen = false;
        render();
      });
    }

    const form = container.querySelector<HTMLFormElement>('[data-ai-form]');
    if (form) {
      form.addEventListener('submit', (event: SubmitEvent) => {
        event.preventDefault();
        const input = form.querySelector<HTMLInputElement>('input[name="prompt"]');
        const rawText = input?.value.trim() ?? '';
        if (!rawText) {
          return;
        }
        messages.push({ sender: 'user', text: rawText });
        messages.push({ sender: 'assistant', text: generateAssistantReply(rawText, role) });
        render();
      });
    }

    const messagesBox = container.querySelector<HTMLDivElement>('[data-ai-messages]');
    if (messagesBox) {
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  };

  render();
  document.body.appendChild(container);
}

export function unmountAiWidget(): void {
  const existing = document.getElementById('ojtflow-ai-widget');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}