(function () {
  const scriptTag = document.currentScript || document.querySelector('script[data-askaisle-key]');
  const widgetKey = scriptTag ? scriptTag.getAttribute('data-askaisle-key') : null;
  const baseUrl = scriptTag ? new URL(scriptTag.src).origin : window.location.origin;

  if (!widgetKey) {
    console.warn('[AskAisle] Missing data-askaisle-key on widget script tag.');
    return;
  }

  // Prevent duplicate initialization
  if (document.getElementById('askaisle-root')) return;

  const host = document.createElement('div');
  host.id = 'askaisle-root';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  let config = {
    color: '#09090B',
    display_name: 'Store Support',
    welcome_message: 'Hi there! Ask me anything about products, sizing, shipping, or returns.',
    show_branding: true,
  };

  let isOpen = false;
  let conversationId = null;
  let isStreaming = false;

  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .askaisle-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: var(--primary-color, #09090B);
      color: #ffffff;
      box-shadow: 0 12px 28px -4px rgba(9, 9, 11, 0.32), 0 4px 10px -2px rgba(9, 9, 11, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2147483647;
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;
      border: 1px solid rgba(255, 255, 255, 0.14);
      outline: none;
    }
    .askaisle-launcher:hover {
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 18px 34px -4px rgba(9, 9, 11, 0.4);
    }
    .askaisle-launcher:focus-visible {
      outline: 2px solid #2563EB;
      outline-offset: 3px;
    }
    .askaisle-window {
      position: fixed;
      bottom: 94px;
      right: 24px;
      width: 384px;
      max-width: calc(100vw - 32px);
      height: 600px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483647;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .askaisle-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .askaisle-header {
      background: var(--primary-color, #09090B);
      color: #ffffff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .askaisle-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .askaisle-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: -0.02em;
    }
    .askaisle-title {
      font-weight: 700;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    .askaisle-status {
      font-size: 11px;
      opacity: 0.86;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
    .askaisle-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
    }
    .askaisle-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #ffffff;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .askaisle-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .askaisle-messages {
      flex: 1;
      padding: 18px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #F8FAFC;
    }
    .askaisle-msg {
      max-width: 85%;
      padding: 12px 15px;
      font-size: 13.5px;
      line-height: 1.55;
      border-radius: 16px;
      word-wrap: break-word;
    }
    .askaisle-msg.assistant {
      align-self: flex-start;
      background: #ffffff;
      color: #0F172A;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
      border-bottom-left-radius: 4px;
      border: 1px solid #E2E8F0;
    }
    .askaisle-msg.user {
      align-self: flex-end;
      background: var(--primary-color, #09090B);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .askaisle-quick-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .askaisle-chip {
      background: #ffffff;
      border: 1px solid #CBD5E1;
      color: #1E293B;
      padding: 6px 11px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .askaisle-chip:hover {
      border-color: var(--primary-color, #09090B);
      background: #F1F5F9;
    }
    .askaisle-sources {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #E2E8F0;
      font-size: 11px;
      color: #64748B;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .askaisle-source-link {
      color: #2563EB;
      background: #EFF6FF;
      padding: 2px 8px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
    }
    .askaisle-source-link:hover {
      text-decoration: underline;
    }
    .askaisle-typing {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      padding: 4px 2px;
    }
    .askaisle-typing span {
      width: 6px;
      height: 6px;
      background: #94A3B8;
      border-radius: 50%;
      animation: askaisle-bounce 1.2s infinite ease-in-out;
    }
    .askaisle-typing span:nth-child(2) { animation-delay: 0.15s; }
    .askaisle-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes askaisle-bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    .askaisle-lead-form {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .askaisle-lead-input {
      padding: 8px 12px;
      font-size: 12.5px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      outline: none;
    }
    .askaisle-lead-btn {
      padding: 8px 12px;
      background: var(--primary-color, #09090B);
      color: #fff;
      font-size: 12px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .askaisle-footer {
      padding: 12px 16px;
      background: #ffffff;
      border-top: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .askaisle-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .askaisle-input {
      flex: 1;
      padding: 10px 14px;
      font-size: 13.5px;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      outline: none;
      color: #0F172A;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .askaisle-input:focus {
      border-color: var(--primary-color, #09090B);
      box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
    }
    .askaisle-send {
      background: var(--primary-color, #09090B);
      color: #ffffff;
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.15s;
    }
    .askaisle-send:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .askaisle-badge {
      font-size: 10.5px;
      text-align: center;
      color: #94A3B8;
    }
    .askaisle-badge a {
      color: #475569;
      text-decoration: none;
      font-weight: 600;
    }
  `;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.innerHTML = `
    <button class="askaisle-launcher" aria-label="Open store support chat">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
      </svg>
    </button>
    <div class="askaisle-window" role="dialog" aria-label="Store AI Support Assistant">
      <div class="askaisle-header">
        <div class="askaisle-header-info">
          <div class="askaisle-avatar">AI</div>
          <div>
            <div class="askaisle-title">Store Support</div>
            <div class="askaisle-status">
              <span class="askaisle-status-dot"></span>
              <span>AI Assistant · Verified Store Catalog</span>
            </div>
          </div>
        </div>
        <button class="askaisle-close" aria-label="Close support chat">&times;</button>
      </div>
      <div class="askaisle-messages"></div>
      <div class="askaisle-footer">
        <div class="askaisle-input-row">
          <input type="text" class="askaisle-input" maxlength="500" placeholder="Ask about sizing, shipping, returns..." />
          <button class="askaisle-send" aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="askaisle-badge">
          Powered by <a href="https://askaisle.com" target="_blank" rel="noopener">AskAisle</a>
        </div>
      </div>
    </div>
  `;
  shadow.appendChild(container);

  const launcher = shadow.querySelector('.askaisle-launcher');
  const chatWindow = shadow.querySelector('.askaisle-window');
  const closeBtn = shadow.querySelector('.askaisle-close');
  const messagesContainer = shadow.querySelector('.askaisle-messages');
  const input = shadow.querySelector('.askaisle-input');
  const sendBtn = shadow.querySelector('.askaisle-send');
  const titleEl = shadow.querySelector('.askaisle-title');
  const badgeEl = shadow.querySelector('.askaisle-badge');

  function updateTheme() {
    container.style.setProperty('--primary-color', config.color);
    titleEl.textContent = config.display_name;
    if (!config.show_branding) {
      badgeEl.style.display = 'none';
    }
  }

  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `askaisle-msg ${role}`;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return msg;
  }

  function appendQuickChips() {
    const chipsRow = document.createElement('div');
    chipsRow.className = 'askaisle-quick-chips';
    ['Shipping & delivery times', 'Return & refund policy', 'Size & stock check'].forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'askaisle-chip';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        chipsRow.remove();
        input.value = label;
        handleSend();
      });
      chipsRow.appendChild(btn);
    });
    messagesContainer.appendChild(chipsRow);
  }

  fetch(`${baseUrl}/api/widget/config?key=${encodeURIComponent(widgetKey)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && !data.error) {
        config = { ...config, ...data };
        updateTheme();
      }
      appendMessage('assistant', config.welcome_message);
      appendQuickChips();
    })
    .catch(() => {
      updateTheme();
      appendMessage('assistant', config.welcome_message);
      appendQuickChips();
    });

  launcher.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatWindow.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      chatWindow.classList.remove('open');
    }
  });

  async function handleSend() {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    input.value = '';
    appendMessage('user', text);
    isStreaming = true;
    sendBtn.disabled = true;

    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'askaisle-msg assistant';
    assistantMsg.innerHTML = '<div class="askaisle-typing"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(assistantMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    let firstTokenReceived = false;

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_key: widgetKey,
          conversation_id: conversationId,
          message: text,
        }),
      });

      if (response.status === 429) {
        assistantMsg.textContent =
          'Our automated assistant is currently offline. Please reach out to our team via our Contact Us page.';
        isStreaming = false;
        sendBtn.disabled = false;
        return;
      }

      if (!response.ok) {
        assistantMsg.textContent = 'Sorry, we encountered a temporary issue. Please try again in a moment.';
        isStreaming = false;
        sendBtn.disabled = false;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'token';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('event:')) {
            currentEvent = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.replace('data:', '').trim();
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'token' && typeof data === 'string') {
                if (!firstTokenReceived) {
                  assistantMsg.textContent = '';
                  firstTokenReceived = true;
                }
                assistantMsg.textContent += data;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              } else if (currentEvent === 'sources' && Array.isArray(data) && data.length > 0) {
                const sourcesBox = document.createElement('div');
                sourcesBox.className = 'askaisle-sources';
                sourcesBox.textContent = 'Verified source:';
                const uniqueTitles = new Set();
                data.forEach((src) => {
                  if (!src.title || uniqueTitles.has(src.title)) return;
                  uniqueTitles.add(src.title);
                  if (src.url) {
                    const link = document.createElement('a');
                    link.href = src.url;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.className = 'askaisle-source-link';
                    link.textContent = src.title;
                    sourcesBox.appendChild(link);
                  } else {
                    const span = document.createElement('span');
                    span.className = 'askaisle-source-link';
                    span.textContent = src.title;
                    sourcesBox.appendChild(span);
                  }
                });
                assistantMsg.appendChild(sourcesBox);
              } else if (data && data.conversation_id) {
                conversationId = data.conversation_id;
                if (data.answered === false) {
                  renderLeadForm(assistantMsg, conversationId);
                }
              }
            } catch (e) {
              // ignore json parse errors on partial lines
            }
          }
        }
      }
    } catch (e) {
      assistantMsg.textContent = 'Connection interrupted. Please check your internet and try again.';
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
    }
  }

  function renderLeadForm(targetMsg, convId) {
    const form = document.createElement('div');
    form.className = 'askaisle-lead-form';
    form.innerHTML = `
      <input type="email" placeholder="Enter your email for a direct reply..." class="askaisle-lead-input" />
      <button class="askaisle-lead-btn">Notify me when answered</button>
    `;
    const emailInput = form.querySelector('.askaisle-lead-input');
    const emailBtn = form.querySelector('.askaisle-lead-btn');

    emailBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email) return;
      emailBtn.disabled = true;
      emailBtn.textContent = 'Sending...';
      try {
        await fetch(`${baseUrl}/api/chat/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: convId,
            email: email,
            widget_key: widgetKey,
          }),
        });
        form.innerHTML =
          '<span style="font-size: 12px; color: #059669; font-weight: 600;">✓ Received! Our store team will email you shortly.</span>';
      } catch (err) {
        emailBtn.disabled = false;
        emailBtn.textContent = 'Try again';
      }
    });

    targetMsg.appendChild(form);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
  sendBtn.addEventListener('click', handleSend);
})();
