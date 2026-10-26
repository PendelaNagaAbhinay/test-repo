let hackathonTotalHours = 48;
let hackathonStartTime = Date.now() - (1000 * 60 * 60 * 37); // Simulated 37 hours into the 48h hackathon

const PHASES = [
  { minHour: 0, maxHour: 10, text: 'Phase 1: Delusional optimism & planning multi-agent AI blockchain toasters.' },
  { minHour: 10, maxHour: 20, text: 'Phase 2: Realizing nobody read the API docs & wrestling with AWS Security Groups.' },
  { minHour: 20, maxHour: 30, text: 'Phase 3: Scope Massacre — deleting 85% of planned features so something builds.' },
  { minHour: 30, maxHour: 40, text: 'Phase 4: Peak panic velocity — consuming espresso and declaring bugs as features.' },
  { minHour: 40, maxHour: 47, text: 'Phase 5: The Unit Test Purge — commenting out assertions that fail.' },
  { minHour: 47, maxHour: 48, text: 'Phase 6: The Desperation Pitch — praying to Demo Gods that EC2 responds.' },
  { minHour: 48, maxHour: 999, text: 'Phase 7: Code Freeze — Ship it and pretend that bug was intentional.' }
];

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function isValidHttpUrl(str) {
  if (!str) return false;
  return /^https?:\/\//i.test(str.trim());
}

// Fetch System Health (AWS Region & EC2 Status)
async function fetchHealth() {
  try {
    const res = await fetch('/health');
    const data = await res.json();

    const regionEl = document.getElementById('aws-region-label');
    const dotEl = document.getElementById('health-indicator-dot');
    const alertBanner = document.getElementById('config-alert-banner');
    const alertText = document.getElementById('config-alert-text');

    if (regionEl && data.region) regionEl.textContent = data.region;

    if (!res.ok || data.status === 'error') {
      if (dotEl) {
        dotEl.classList.remove('bg-emerald-400');
        dotEl.classList.add('bg-rose-500');
      }
      if (alertBanner) {
        alertBanner.classList.remove('hidden');
        if (alertText) alertText.textContent = data.error || 'APP_DEPLOYMENT_KEY invalid in EC2 .env!';
      }
    } else {
      if (dotEl) {
        dotEl.classList.remove('bg-rose-500');
        dotEl.classList.add('bg-emerald-400');
      }
    }
  } catch (err) {
    console.warn('Health check fetch failed:', err.message);
  }
}

// Fetch Hackathon Information, Milestones & Meme State
async function fetchInfo() {
  try {
    const res = await fetch('/api/info');
    if (!res.ok) return;
    const data = await res.json();

    if (data.hackathonName) {
      const titleEl = document.getElementById('hackathon-title');
      if (titleEl) titleEl.textContent = data.hackathonName;
    }

    if (data.durationHours) {
      hackathonTotalHours = data.durationHours;
    }

    // Apply State Controls (.env HACKATHON_STATE)
    const stateBadge = document.getElementById('state-badge');
    const panicWarningTag = document.getElementById('panic-warning-tag');
    const appBody = document.getElementById('app-body');

    if (stateBadge && data.hackathonState) {
      stateBadge.textContent = data.hackathonState;
    }

    if (data.hackathonState === 'PANIC_MODE') {
      if (appBody) appBody.classList.add('panic-mode-active');
      if (panicWarningTag) panicWarningTag.classList.remove('hidden');
    } else {
      if (appBody) appBody.classList.remove('panic-mode-active');
      if (panicWarningTag) panicWarningTag.classList.add('hidden');
    }

    // Apply Submission Gate (.env ENABLE_SUBMISSIONS)
    const openSubmitBtn = document.getElementById('open-submit-modal-btn');
    const submitBtnLabel = document.getElementById('submit-btn-label');
    const modalDisabledWarning = document.getElementById('modal-disabled-warning');
    const submitBtn = document.getElementById('submit-btn');

    if (data.enableSubmissions === false) {
      if (openSubmitBtn) {
        openSubmitBtn.disabled = true;
        if (submitBtnLabel) submitBtnLabel.textContent = '🔒 Submissions Locked (.env)';
      }
      if (modalDisabledWarning) modalDisabledWarning.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (openSubmitBtn) {
        openSubmitBtn.disabled = false;
        if (submitBtnLabel) submitBtnLabel.textContent = 'Submit Project';
      }
      if (modalDisabledWarning) modalDisabledWarning.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = false;
    }

    // Render Dynamic Hackathon Meme
    if (data.meme) {
      const memeImg = document.getElementById('meme-img');
      const memeTitle = document.getElementById('meme-title');
      const memeCaption = document.getElementById('meme-caption');
      const memeBadge = document.getElementById('meme-badge');

      if (memeImg && data.meme.url) memeImg.src = data.meme.url;
      if (memeTitle && data.meme.title) memeTitle.textContent = data.meme.title;
      if (memeCaption && data.meme.caption) memeCaption.textContent = `"${data.meme.caption}"`;
      if (memeBadge) memeBadge.textContent = `STATE: ${data.hackathonState || 'RUNNING'}`;
    }

    // Render Milestones
    const container = document.getElementById('milestones-container');
    if (container && Array.isArray(data.milestones)) {
      container.innerHTML = data.milestones.map((m) => `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-slate-700 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              Hour ${m.hour}
            </span>
          </div>
          <h4 class="text-sm font-bold text-slate-200">${m.title}</h4>
          <p class="text-xs text-slate-400 leading-relaxed">${m.desc}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Info fetch failed:', err.message);
  }
}

// Countdown timer loop
function startCountdown() {
  function update() {
    const now = Date.now();
    const elapsedMs = now - hackathonStartTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    const totalMs = hackathonTotalHours * 60 * 60 * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-minutes');
    const secsEl = document.getElementById('cd-seconds');

    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');

    // Update phase banner
    const currentPhase = PHASES.find(p => elapsedHours >= p.minHour && elapsedHours < p.maxHour) || PHASES[PHASES.length - 1];
    const phaseEl = document.getElementById('current-phase-text');
    if (phaseEl) phaseEl.textContent = currentPhase.text;
  }

  update();
  setInterval(update, 1000);
}

// Fetch Survival Counters
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const stats = await res.json();
    renderStats(stats);
  } catch (err) {
    console.warn('Stats fetch failed:', err.message);
  }
}

function renderStats(stats) {
  const coffeesEl = document.getElementById('stat-coffees');
  const prayersEl = document.getElementById('stat-prayers');
  const bugsEl = document.getElementById('stat-bugs');

  if (coffeesEl && typeof stats.coffeesDrank === 'number') coffeesEl.textContent = stats.coffeesDrank;
  if (prayersEl && typeof stats.prayersOffered === 'number') prayersEl.textContent = stats.prayersOffered;
  if (bugsEl && typeof stats.bugsPromotedToFeatures === 'number') bugsEl.textContent = stats.bugsPromotedToFeatures;
}

// Increment Survival Metric
async function incrementMetric(metric) {
  try {
    const res = await fetch(`/api/stats/${metric}/increment`, { method: 'POST' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.stats) {
      renderStats(data.stats);
    }
  } catch (err) {
    console.error('Failed to increment metric:', err);
  }
}

// Fetch and Render Projects
async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) return;
    const projects = await res.json();

    const countEl = document.getElementById('projects-count');
    if (countEl) countEl.textContent = `${projects.length} Projects Surviving`;

    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (projects.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center py-10 text-slate-500 text-sm">No projects submitted yet. Be the first to brave the judges!</p>`;
      return;
    }

    grid.innerHTML = projects.map(p => `
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/30 transition shadow-lg space-y-4">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider block mb-0.5">
                Team: ${escapeHtml(p.teamName)}
              </span>
              <h4 class="text-lg font-bold text-slate-100">${escapeHtml(p.title)}</h4>
            </div>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
              ${escapeHtml(p.tag || 'Hackathon Build')}
            </span>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(p.description)}</p>

          <div class="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1">
            <span class="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
              <span>⚠️ Known Bugs & Confessions:</span>
            </span>
            <p class="text-xs text-rose-300/90 italic font-mono">"${escapeHtml(p.knownBugs || 'None disclosed')}"</p>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>${formatDate(p.createdAt)}</span>
          ${isValidHttpUrl(p.demoUrl) ? `<a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1">Demo &rarr;</a>` : ''}
        </div>
      </div>
    `).join('');

    refreshIcons();
  } catch (err) {
    console.error('Fetch projects failed:', err);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(isoStr) {
  if (!isoStr) return 'Recently';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Recently';
  }
}

// Modal handling
function setupModal() {
  const modal = document.getElementById('submit-modal');
  const openBtn = document.getElementById('open-submit-modal-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('project-form');
  const formError = document.getElementById('form-error');

  function openModal() {
    if (modal) modal.classList.remove('hidden');
    if (formError) formError.classList.add('hidden');
  }

  function closeModal() {
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formError) formError.classList.add('hidden');

      const title = document.getElementById('input-title').value.trim();
      const teamName = document.getElementById('input-team').value.trim();
      const tag = document.getElementById('input-tag').value;
      const description = document.getElementById('input-desc').value.trim();
      const knownBugs = document.getElementById('input-bugs').value.trim();
      const demoUrl = document.getElementById('input-url').value.trim();

      if (!title || !teamName) {
        if (formError) {
          formError.textContent = 'Project name and team name are required!';
          formError.classList.remove('hidden');
        }
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Shipping...';
      }

      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, teamName, tag, description, knownBugs, demoUrl })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Submission failed');
        }

        closeModal();
        await fetchProjects();
      } catch (err) {
        if (formError) {
          formError.textContent = err.message;
          formError.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Ship Project 🚀';
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchHealth();
  fetchInfo();
  startCountdown();
  fetchStats();
  fetchProjects();
  setupModal();
  refreshIcons();

  setInterval(fetchHealth, 15000);
  setInterval(fetchStats, 10000);
  setInterval(fetchProjects, 20000);
});
