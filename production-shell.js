(() => {
  'use strict';

  const SETTINGS_KEY = 'sgsProductionSettingsV1';
  const POWER_KEY = 'sgsPowerProgressV1';
  const AUDIO_KEY = 'sgsAudioSettings';

  const defaults = {
    theme: 'system',
    haptics: true,
    language: 'en',
    username: 'Player 1'
  };

  function safeJson(key, fallback = {}) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' ? { ...fallback, ...value } : { ...fallback };
    } catch (error) {
      return { ...fallback };
    }
  }

  let settings = safeJson(SETTINGS_KEY, defaults);

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {}
  }

  function progress() {
    return safeJson(POWER_KEY, {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalScore: 0,
      xp: 0,
      currentStreak: 0,
      bestStreak: 0,
      unlocked: {}
    });
  }

  function leaderboard(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function applyTheme() {
    document.documentElement.dataset.theme = settings.theme;
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('theme-light', !dark);
  }

  function haptic(strong = false) {
    if (settings.haptics && navigator.vibrate) navigator.vibrate(strong ? 22 : 10);
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        color-scheme: dark light;
        --sgs-surface: rgba(11, 16, 30, 0.94);
        --sgs-surface-high: rgba(18, 27, 48, 0.96);
        --sgs-outline: rgba(135, 255, 219, 0.38);
        --sgs-primary: #00ffaa;
        --sgs-secondary: #ffca55;
        --sgs-danger: #ff5a6a;
        --sgs-text: #f4fffb;
        --sgs-muted: #a8c8c0;
        --sgs-radius: 18px;
        --sgs-shadow: 0 16px 48px rgba(0, 0, 0, 0.36);
      }

      body.theme-light {
        --sgs-surface: rgba(247, 251, 255, 0.96);
        --sgs-surface-high: rgba(255, 255, 255, 0.98);
        --sgs-outline: rgba(0, 95, 73, 0.25);
        --sgs-primary: #006c52;
        --sgs-secondary: #7a4e00;
        --sgs-danger: #b3261e;
        --sgs-text: #07130f;
        --sgs-muted: #40534e;
      }

      html, body {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }

      * {
        -webkit-tap-highlight-color: transparent;
      }

      button, .menu-item, .letter-key, .cell, .start-button, .modal-button {
        min-height: 44px;
      }

      button:focus-visible,
      .menu-item:focus-visible,
      .letter-key:focus-visible,
      .cell:focus-visible,
      input:focus-visible {
        outline: 3px solid var(--sgs-secondary);
        outline-offset: 3px;
      }

      .menu-box,
      .game-panel,
      .game-status,
      .modal-content,
      .pause-card,
      .power-panel {
        border-color: var(--sgs-outline) !important;
        border-radius: var(--sgs-radius) !important;
        background: var(--sgs-surface) !important;
        color: var(--sgs-text);
        box-shadow: var(--sgs-shadow) !important;
      }

      .start-button,
      .modal-button,
      .sound-btn,
      .mobile-action-btn,
      .power-action,
      .power-close,
      .prod-nav-btn,
      .prod-chip {
        border-radius: 14px !important;
        position: relative;
        overflow: hidden;
      }

      .prod-topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 640;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: max(10px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) 10px max(14px, env(safe-area-inset-left));
        background: linear-gradient(180deg, rgba(5, 8, 22, 0.96), rgba(5, 8, 22, 0.72));
        border-bottom: 1px solid var(--sgs-outline);
        backdrop-filter: blur(14px);
        color: var(--sgs-text);
      }

      body.theme-light .prod-topbar {
        background: linear-gradient(180deg, rgba(247, 251, 255, 0.96), rgba(247, 251, 255, 0.76));
      }

      .prod-brand {
        display: flex;
        flex-direction: column;
        min-width: 0;
        font: 800 0.9rem system-ui, sans-serif;
      }

      .prod-brand span {
        color: var(--sgs-muted);
        font: 600 0.72rem system-ui, sans-serif;
      }

      .prod-status {
        min-height: 36px;
        padding: 8px 10px;
        border: 1px solid var(--sgs-outline);
        border-radius: 999px;
        color: var(--sgs-primary);
        background: rgba(0, 255, 170, 0.08);
        font: 800 0.72rem system-ui, sans-serif;
        white-space: nowrap;
      }

      .prod-bottom-nav {
        position: fixed;
        left: max(12px, env(safe-area-inset-left));
        right: max(12px, env(safe-area-inset-right));
        bottom: max(74px, calc(env(safe-area-inset-bottom) + 74px));
        z-index: 635;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        padding: 8px;
        border: 1px solid var(--sgs-outline);
        border-radius: 20px;
        background: var(--sgs-surface);
        box-shadow: var(--sgs-shadow);
        backdrop-filter: blur(14px);
      }

      .prod-nav-btn {
        min-height: 46px;
        border: 0;
        color: var(--sgs-muted);
        background: transparent;
        font: 800 0.72rem system-ui, sans-serif;
        cursor: pointer;
      }

      .prod-nav-btn.active {
        color: var(--sgs-primary);
        background: rgba(0, 255, 170, 0.12);
      }

      .prod-sheet {
        position: fixed;
        inset: 0;
        z-index: 790;
        display: none;
        align-items: flex-end;
        justify-content: center;
        padding: 18px max(12px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
        background: rgba(0, 0, 0, 0.62);
      }

      .prod-sheet.open { display: flex; }

      .prod-panel {
        width: min(720px, 100%);
        max-height: min(760px, 88dvh);
        overflow: auto;
        border: 1px solid var(--sgs-outline);
        border-radius: 24px 24px 18px 18px;
        background: var(--sgs-surface-high);
        color: var(--sgs-text);
        box-shadow: var(--sgs-shadow);
      }

      .prod-panel-head {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 18px;
        border-bottom: 1px solid var(--sgs-outline);
        background: var(--sgs-surface-high);
      }

      .prod-panel h2,
      .prod-panel h3,
      .prod-panel p {
        margin: 0;
      }

      .prod-panel h2 {
        font: 900 1.15rem system-ui, sans-serif;
      }

      .prod-close {
        width: 44px;
        height: 44px;
        border: 1px solid var(--sgs-outline);
        background: rgba(0, 255, 170, 0.08);
        color: var(--sgs-primary);
        border-radius: 14px;
        font: 900 1.2rem system-ui, sans-serif;
      }

      .prod-body {
        display: grid;
        gap: 14px;
        padding: 18px;
      }

      .prod-card {
        border: 1px solid var(--sgs-outline);
        border-radius: 18px;
        background: rgba(0, 0, 0, 0.14);
        padding: 14px;
      }

      body.theme-light .prod-card {
        background: rgba(255, 255, 255, 0.68);
      }

      .prod-profile {
        display: grid;
        grid-template-columns: 64px minmax(0, 1fr);
        gap: 14px;
        align-items: center;
      }

      .prod-avatar {
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: linear-gradient(135deg, var(--sgs-primary), var(--sgs-secondary));
        color: #07130f;
        font: 1000 1.5rem system-ui, sans-serif;
      }

      .prod-progress {
        height: 12px;
        margin-top: 10px;
        border-radius: 999px;
        background: rgba(127, 127, 127, 0.24);
        overflow: hidden;
      }

      .prod-progress span {
        display: block;
        height: 100%;
        width: var(--value, 0%);
        background: linear-gradient(90deg, var(--sgs-primary), var(--sgs-secondary));
      }

      .prod-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .prod-stat strong {
        display: block;
        color: var(--sgs-primary);
        font: 900 1.08rem system-ui, sans-serif;
      }

      .prod-stat span,
      .prod-muted {
        color: var(--sgs-muted);
        font: 650 0.8rem system-ui, sans-serif;
      }

      .prod-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        align-items: center;
        min-height: 52px;
        border-bottom: 1px solid rgba(127, 127, 127, 0.16);
      }

      .prod-row:last-child {
        border-bottom: 0;
      }

      .prod-chip {
        min-height: 42px;
        padding: 8px 12px;
        border: 1px solid var(--sgs-outline);
        background: rgba(0, 255, 170, 0.08);
        color: var(--sgs-primary);
        font: 800 0.78rem system-ui, sans-serif;
        cursor: pointer;
      }

      .prod-chip.danger {
        border-color: rgba(255, 90, 106, 0.52);
        color: var(--sgs-danger);
        background: rgba(255, 90, 106, 0.1);
      }

      .prod-update {
        position: fixed;
        left: 50%;
        bottom: max(132px, calc(env(safe-area-inset-bottom) + 132px));
        z-index: 850;
        display: none;
        width: min(420px, calc(100% - 28px));
        transform: translateX(-50%);
        border: 1px solid var(--sgs-outline);
        border-radius: 18px;
        background: var(--sgs-surface-high);
        color: var(--sgs-text);
        box-shadow: var(--sgs-shadow);
        padding: 14px;
      }

      .prod-update.open {
        display: grid;
        gap: 10px;
      }

      .prod-update-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .prod-select,
      .prod-input {
        width: 100%;
        min-height: 44px;
        border: 1px solid var(--sgs-outline);
        border-radius: 14px;
        padding: 8px 10px;
        color: var(--sgs-text);
        background: var(--sgs-surface);
      }

      .mobile-action-btn.muted {
        border-color: rgba(255, 90, 106, 0.72);
        color: #ff9aa4;
        background: rgba(255, 90, 106, 0.12);
      }

      @media (min-width: 781px) {
        .prod-bottom-nav {
          width: min(520px, calc(100% - 32px));
          left: 50%;
          right: auto;
          bottom: max(18px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
        }
      }

      @media (max-width: 780px) {
        .sound-control {
          top: max(54px, calc(env(safe-area-inset-top) + 48px));
          left: 10px;
          right: 10px;
          justify-content: center;
        }

        .game-container {
          padding-top: max(94px, calc(env(safe-area-inset-top) + 86px)) !important;
        }

        .prod-bottom-nav {
          bottom: max(72px, calc(env(safe-area-inset-bottom) + 72px));
        }

        body.game-active .prod-bottom-nav {
          display: none;
        }
      }

      @media (max-width: 360px) {
        .prod-bottom-nav {
          gap: 6px;
          padding: 6px;
        }

        .prod-nav-btn {
          font-size: 0.66rem;
        }

        .prod-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDom() {
    document.body.insertAdjacentHTML('beforeend', `
      <header class="prod-topbar" aria-label="App status">
        <div class="prod-brand">Smart Games Suite Pro<span id="prodSubtitle">Offline game suite</span></div>
        <div class="prod-status" id="prodStatus" role="status">Offline Ready</div>
      </header>

      <nav class="prod-bottom-nav" aria-label="Primary navigation">
        <button class="prod-nav-btn active" id="prodHomeBtn" type="button">Home</button>
        <button class="prod-nav-btn" id="prodProfileBtn" type="button">Profile</button>
        <button class="prod-nav-btn" id="prodSettingsBtn" type="button">Settings</button>
        <button class="prod-nav-btn" id="prodPowerBtn" type="button">Power</button>
      </nav>

      <section class="prod-sheet" id="prodSheet" aria-modal="true" role="dialog" aria-labelledby="prodSheetTitle">
        <div class="prod-panel">
          <div class="prod-panel-head">
            <h2 id="prodSheetTitle">Profile</h2>
            <button class="prod-close" id="prodCloseBtn" type="button" aria-label="Close">x</button>
          </div>
          <div class="prod-body" id="prodSheetBody"></div>
        </div>
      </section>

      <aside class="prod-update" id="prodUpdatePrompt" role="status" aria-live="polite">
        <strong>Update available</strong>
        <span class="prod-muted">A newer offline version is ready.</span>
        <div class="prod-update-actions">
          <button class="prod-chip" id="prodUpdateLaterBtn" type="button">Later</button>
          <button class="prod-chip" id="prodUpdateNowBtn" type="button">Update</button>
        </div>
      </aside>
    `);
  }

  function levelFromXp(xp) {
    return Math.max(1, Math.floor(Number(xp || 0) / 500) + 1);
  }

  function highestScore() {
    return Math.max(0, ...leaderboard('tttLeaderboard').map((item) => Number(item.score) || 0), ...leaderboard('wordLeaderboard').map((item) => Number(item.score) || 0));
  }

  function renderProfile() {
    const p = progress();
    const level = levelFromXp(p.xp);
    const xpInLevel = Number(p.xp || 0) % 500;
    const winRate = p.gamesPlayed ? Math.round((Number(p.wins || 0) / Number(p.gamesPlayed || 1)) * 100) : 0;
    const achievements = Object.keys(p.unlocked || {}).filter((key) => p.unlocked[key]).length;

    return `
      <section class="prod-card prod-profile">
        <div class="prod-avatar" aria-hidden="true">${settings.username.slice(0, 1).toUpperCase() || 'P'}</div>
        <div>
          <label class="prod-muted" for="prodUsername">Username</label>
          <input class="prod-input" id="prodUsername" value="${escapeHtml(settings.username)}" maxlength="24" autocomplete="off">
          <div class="prod-muted">Level ${level} • ${Number(p.xp || 0)} XP</div>
          <div class="prod-progress" aria-label="XP progress to next level"><span style="--value:${Math.min(100, (xpInLevel / 500) * 100)}%"></span></div>
        </div>
      </section>
      <section class="prod-card prod-grid">
        ${stat('Games Played', p.gamesPlayed)}
        ${stat('High Score', highestScore())}
        ${stat('Win Rate', `${winRate}%`)}
        ${stat('Daily Streak', p.currentStreak)}
        ${stat('Best Streak', p.bestStreak)}
        ${stat('Achievements', achievements)}
      </section>
      <section class="prod-card">
        <h3>Recent Play</h3>
        <p class="prod-muted">${recentPlay()}</p>
      </section>
      <section class="prod-card">
        <h3>Theme</h3>
        <select class="prod-select" id="prodThemeSelect" aria-label="Theme selection">
          <option value="system"${settings.theme === 'system' ? ' selected' : ''}>System Theme</option>
          <option value="dark"${settings.theme === 'dark' ? ' selected' : ''}>Dark Mode</option>
          <option value="light"${settings.theme === 'light' ? ' selected' : ''}>Light Mode</option>
        </select>
      </section>
    `;
  }

  function renderSettings() {
    const audio = safeJson(AUDIO_KEY, { musicEnabled: true, sfxEnabled: true });
    return `
      <section class="prod-card">
        ${row('Theme', '<select class="prod-select" id="prodThemeSelect"><option value="system">System Theme</option><option value="dark">Dark Mode</option><option value="light">Light Mode</option></select>')}
        ${row('Language', '<select class="prod-select" id="prodLanguageSelect"><option value="en">English</option></select>')}
        ${row('Music', `<button class="prod-chip" id="prodMusicToggle" type="button">${audio.musicEnabled ? 'ON' : 'OFF'}</button>`)}
        ${row('Sound Effects', `<button class="prod-chip" id="prodSfxToggle" type="button">${audio.sfxEnabled ? 'ON' : 'OFF'}</button>`)}
        ${row('Haptics', `<button class="prod-chip" id="prodHapticToggle" type="button">${settings.haptics ? 'ON' : 'OFF'}</button>`)}
      </section>
      <section class="prod-card">
        ${row('Export Local Data', '<button class="prod-chip" id="prodExportBtn" type="button">Export</button>')}
        ${row('Import Local Data', '<button class="prod-chip" id="prodImportBtn" type="button">Import</button><input id="prodImportFile" type="file" accept="application/json" hidden>')}
        ${row('Reset Progress', '<button class="prod-chip danger" id="prodResetBtn" type="button">Reset</button>')}
      </section>
      <section class="prod-card">
        ${row('Privacy Policy', '<a class="prod-chip" href="privacy-policy.html">Open</a>')}
        ${row('Terms of Service', '<a class="prod-chip" href="terms.html">Open</a>')}
        ${row('About', '<span class="prod-muted">Smart Games Suite Pro v1.1.0 • Offline-first</span>')}
        ${row('Contact Support', '<a class="prod-chip" href="mailto:support@example.com">Email</a>')}
        ${row('Feedback', '<button class="prod-chip" id="prodFeedbackBtn" type="button">Copy Email</button>')}
        ${row('Rate App', '<span class="prod-muted">Available after Play Store upload</span>')}
      </section>
    `;
  }

  function stat(label, value) {
    return `<div class="prod-stat"><strong>${escapeHtml(String(value || 0))}</strong><span>${escapeHtml(label)}</span></div>`;
  }

  function row(label, control) {
    return `<div class="prod-row"><span>${escapeHtml(label)}</span><span>${control}</span></div>`;
  }

  function recentPlay() {
    const items = [...leaderboard('tttLeaderboard'), ...leaderboard('wordLeaderboard')]
      .filter((item) => item && item.name)
      .slice(-3)
      .map((item) => `${item.name}: ${item.score || 0} points`);
    return items.length ? items.join(' • ') : 'Play any game to build your local history.';
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function openSheet(mode) {
    const sheet = document.getElementById('prodSheet');
    const title = document.getElementById('prodSheetTitle');
    const body = document.getElementById('prodSheetBody');
    if (!sheet || !title || !body) return;

    title.textContent = mode === 'settings' ? 'Settings' : 'Profile';
    body.innerHTML = mode === 'settings' ? renderSettings() : renderProfile();
    sheet.classList.add('open');
    bindSheet(mode);
    haptic();
  }

  function closeSheet() {
    document.getElementById('prodSheet')?.classList.remove('open');
  }

  function bindSheet(mode) {
    const theme = document.getElementById('prodThemeSelect');
    if (theme) {
      theme.value = settings.theme;
      theme.addEventListener('change', () => {
        settings.theme = theme.value;
        saveSettings();
        applyTheme();
      });
    }

    const username = document.getElementById('prodUsername');
    if (username) {
      username.addEventListener('change', () => {
        settings.username = username.value.trim().slice(0, 24) || defaults.username;
        saveSettings();
        openSheet('profile');
      });
    }

    document.getElementById('prodHapticToggle')?.addEventListener('click', () => {
      settings.haptics = !settings.haptics;
      saveSettings();
      haptic(true);
      openSheet(mode);
    });

    document.getElementById('prodMusicToggle')?.addEventListener('click', () => document.getElementById('musicBtn')?.click());
    document.getElementById('prodSfxToggle')?.addEventListener('click', () => document.getElementById('sfxBtn')?.click());
    document.getElementById('prodExportBtn')?.addEventListener('click', exportData);
    document.getElementById('prodImportBtn')?.addEventListener('click', () => document.getElementById('prodImportFile')?.click());
    document.getElementById('prodImportFile')?.addEventListener('change', importData);
    document.getElementById('prodResetBtn')?.addEventListener('click', resetLocalProgress);
    document.getElementById('prodFeedbackBtn')?.addEventListener('click', () => navigator.clipboard?.writeText('support@example.com').catch(() => {}));
  }

  function exportData() {
    const keys = ['sgsPowerProgressV1', 'sgsAudioSettings', 'sgsProductionSettingsV1', 'tttLeaderboard', 'wordLeaderboard'];
    const data = {};
    keys.forEach((key) => {
      data[key] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'smart-games-suite-local-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const data = JSON.parse(text);
      ['sgsPowerProgressV1', 'sgsAudioSettings', 'sgsProductionSettingsV1', 'tttLeaderboard', 'wordLeaderboard'].forEach((key) => {
        if (typeof data[key] === 'string') localStorage.setItem(key, data[key]);
      });
      settings = safeJson(SETTINGS_KEY, defaults);
      applyTheme();
      openSheet('settings');
      alert('Local data imported.');
    }).catch(() => alert('Import failed. The selected file is not valid app data.'));
  }

  function resetLocalProgress() {
    if (!confirm('Reset local progress, XP, achievements, and leaderboards on this device?')) return;
    ['sgsPowerProgressV1', 'tttLeaderboard', 'wordLeaderboard'].forEach((key) => localStorage.removeItem(key));
    openSheet('settings');
  }

  function updateOnlineStatus() {
    const status = document.getElementById('prodStatus');
    if (!status) return;
    status.textContent = navigator.onLine ? 'Online • Cached' : 'Offline Ready';
  }

  function bindPwaUpdates() {
    let waitingWorker = null;
    const prompt = document.getElementById('prodUpdatePrompt');

    function showUpdate(worker) {
      waitingWorker = worker;
      prompt?.classList.add('open');
    }

    window.addEventListener('sgs-service-worker-ready', (event) => {
      const registration = event.detail;
      if (!registration) return;
      if (registration.waiting) showUpdate(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker);
        });
      });
    });

    document.getElementById('prodUpdateNowBtn')?.addEventListener('click', () => {
      waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
      prompt?.classList.remove('open');
    });

    document.getElementById('prodUpdateLaterBtn')?.addEventListener('click', () => {
      prompt?.classList.remove('open');
    });

    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  function bindGlobalEvents() {
    document.getElementById('prodCloseBtn')?.addEventListener('click', closeSheet);
    document.getElementById('prodSheet')?.addEventListener('click', (event) => {
      if (event.target.id === 'prodSheet') closeSheet();
    });
    document.getElementById('prodHomeBtn')?.addEventListener('click', () => {
      haptic();
      if (typeof showMenu === 'function') showMenu('mainMenu');
    });
    document.getElementById('prodProfileBtn')?.addEventListener('click', () => openSheet('profile'));
    document.getElementById('prodSettingsBtn')?.addEventListener('click', () => openSheet('settings'));
    document.getElementById('prodPowerBtn')?.addEventListener('click', () => document.getElementById('powerFab')?.click());
    document.addEventListener('click', (event) => {
      if (event.target.closest('button, .menu-item, .letter-key, .cell, a')) haptic();
    }, { passive: true });
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  }

  function boot() {
    injectStyles();
    ensureDom();
    applyTheme();
    updateOnlineStatus();
    bindGlobalEvents();
    bindPwaUpdates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
