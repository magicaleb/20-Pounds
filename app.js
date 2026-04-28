const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
const FIREBASE_FIRESTORE_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

// ── Model ──────────────────────────────────────────────────────────────────────
const MODEL = {
  mealMoments: [
    { id: 'snack',     label: 'Snack',     base: 220, icon: '🍎', color: '#ec4899' },
    { id: 'breakfast', label: 'Breakfast', base: 460, icon: '🍳', color: '#f59e0b' },
    { id: 'lunch',     label: 'Lunch',     base: 580, icon: '🥗', color: '#10b981' },
    { id: 'dinner',    label: 'Dinner',    base: 680, icon: '🍽', color: '#6366f1' },
    { id: 'dessert',   label: 'Dessert',   base: 340, icon: '🍰', color: '#f43f5e' },
    { id: 'drink',     label: 'Drink',     base: 160, icon: '🥤', color: '#3b82f6' },
  ],
  portions: [
    { id: 'small',   label: 'Small',   kcal: -180 },
    { id: 'regular', label: 'Regular', kcal: 0 },
    { id: 'large',   label: 'Large',   kcal: 220 },
  ],
  densities: [
    { id: 'light', label: 'Light', kcal: -100 },
    { id: 'mixed', label: 'Mixed', kcal: 0 },
    { id: 'rich',  label: 'Rich',  kcal: 170 },
  ],
  addons: [
    { id: 'fried',      label: '+Fried',       kcal: 150 },
    { id: 'sauce',      label: '+Sauce',        kcal: 90 },
    { id: 'sweetdrink', label: '+Sweet drink',  kcal: 180 },
    { id: 'alcohol',    label: '+Alcohol',      kcal: 180 },
    { id: 'seconds',    label: '+Seconds',      kcal: 250 },
    { id: 'protein',    label: '+Protein',      kcal: 120 },
    { id: 'lightswap',  label: '\u2212Lighter', kcal: -110 },
  ],
  smartPresets: [
    {
      id: 'home-plate', label: 'Home plate', emoji: '🍽', color: '#6366f1',
      draft: { mealMoment: 'dinner', portion: 'regular', density: 'mixed', addons: [] }
    },
    {
      id: 'takeout', label: 'Takeout', emoji: '📦', color: '#8b5cf6',
      draft: { mealMoment: 'dinner', portion: 'large', density: 'rich', addons: ['sauce'] }
    },
    {
      id: 'fast-combo', label: 'Fast combo', emoji: '🍟', color: '#f59e0b',
      draft: { mealMoment: 'lunch', portion: 'large', density: 'rich', addons: ['fried', 'sweetdrink'] }
    },
    {
      id: 'coffee-snack', label: 'Coffee + bite', emoji: '☕', color: '#ec4899',
      draft: { mealMoment: 'snack', portion: 'regular', density: 'mixed', addons: ['sweetdrink'] }
    },
    {
      id: 'lean-meal', label: 'Lean meal', emoji: '🥗', color: '#10b981',
      draft: { mealMoment: 'lunch', portion: 'regular', density: 'light', addons: ['protein'] }
    },
    {
      id: 'night-out', label: 'Night out', emoji: '🍸', color: '#ef4444',
      draft: { mealMoment: 'dinner', portion: 'large', density: 'rich', addons: ['alcohol', 'seconds'] }
    },
  ],
  defaultTarget: 2200,
  targetOptions: [1600, 1800, 2000, 2200, 2400, 2600, 2800],
};

// ── State ──────────────────────────────────────────────────────────────────────
const state = {
  db: null,
  uid: getOrCreateUid(),
  todayKey: dateKey(new Date()),
  entries: [],
  dailyTarget: MODEL.defaultTarget,
  activePage: 'home',
  selectedPreset: null,
  current: { mealMoment: 'lunch', portion: 'regular', density: 'mixed', addons: [] },
  editDraft: null,
  editingEntryId: null,
  lastDeleted: null,
  toastTimer: null,
};

// ── Firestore store ────────────────────────────────────────────────────────────
let fb = null;

const store = {
  entriesCol:  () => fb.collection(state.db, 'users', state.uid, 'entries'),
  settingsDoc: () => fb.doc(state.db, 'users', state.uid, 'settings', 'app'),
  entryDoc:    (id) => fb.doc(state.db, 'users', state.uid, 'entries', id),

  async loadSettings() {
    const snap = await fb.getDoc(this.settingsDoc());
    if (!snap.exists()) return;
    state.dailyTarget = Number(snap.data().dailyTarget || MODEL.defaultTarget);
  },

  async saveSettings(target) {
    await fb.setDoc(
      this.settingsDoc(),
      { dailyTarget: target, updatedAt: fb.serverTimestamp() },
      { merge: true }
    );
  },

  async loadTodayEntries() {
    const q = fb.query(
      this.entriesCol(),
      fb.where('entryDate', '==', state.todayKey),
      fb.orderBy('createdAt', 'desc')
    );
    state.entries = (await fb.getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addEntry(payload) {
    await fb.addDoc(this.entriesCol(), {
      ...payload,
      entryDate: state.todayKey,
      createdAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
    });
  },

  async updateEntry(entryId, payload) {
    await fb.updateDoc(this.entryDoc(entryId), { ...payload, updatedAt: fb.serverTimestamp() });
  },

  async removeEntry(entryId) {
    await fb.deleteDoc(this.entryDoc(entryId));
  },
};

// ── Pure helpers ───────────────────────────────────────────────────────────────
function calculateEstimate(draft) {
  const meal    = MODEL.mealMoments.find(m => m.id === draft.mealMoment);
  const portion = MODEL.portions.find(p => p.id === draft.portion);
  const density = MODEL.densities.find(d => d.id === draft.density);
  const addonItems = MODEL.addons.filter(a => draft.addons.includes(a.id));
  const base       = (meal?.base || 0) + (portion?.kcal || 0) + (density?.kcal || 0);
  const addonTotal = addonItems.reduce((s, a) => s + a.kcal, 0);
  return {
    calories:     Math.max(60, base + addonTotal),
    base,
    addonTotal,
    mealLabel:    meal?.label    || 'Meal',
    portionLabel: portion?.label || 'Regular',
    densityLabel: density?.label || 'Mixed',
    addonLabels:  addonItems.map(a => a.label),
    mealColor:    meal?.color    || '#6366f1',
    mealIcon:     meal?.icon     || '🍽',
  };
}

function getOrCreateUid() {
  const key = 'twenty-pounds-uid';
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const uid = crypto.randomUUID();
  localStorage.setItem(key, uid);
  return uid;
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prettyDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function timeLabel(d) {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function $(id) { return document.getElementById(id); }

function toggleSel(arr, id) {
  const i = arr.indexOf(id);
  i >= 0 ? arr.splice(i, 1) : arr.push(id);
}

function makePills(containerId, items, activeCheck, onClick) {
  const el = $(containerId);
  el.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pill${activeCheck(item.id) ? ' active' : ''}`;
    btn.textContent = item.label;
    btn.addEventListener('click', () => onClick(item.id));
    el.appendChild(btn);
  });
}

// ── Navigation ─────────────────────────────────────────────────────────────────
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p =>
    p.classList.toggle('active', p.id === `page-${pageId}`)
  );
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === pageId)
  );
  state.activePage = pageId;
  if (pageId === 'home')     renderHome();
  if (pageId === 'log')      renderLog();
  if (pageId === 'history')  renderHistory();
  if (pageId === 'settings') renderSettings();
}

function renderCurrentPage() {
  navigateTo(state.activePage);
}

// ── Home page ──────────────────────────────────────────────────────────────────
function renderHome() {
  $('greeting').textContent  = greeting();
  $('dateLabel').textContent = prettyDate(new Date());

  const total = state.entries.reduce((s, e) => s + Number(e.calories || 0), 0);
  const pct   = Math.min(1, total / Math.max(1, state.dailyTarget));
  const circumference = 565.5; // 2π × 90

  $('ringConsumed').textContent = total.toLocaleString();
  const remaining = state.dailyTarget - total;
  $('ringRemaining').textContent = remaining >= 0
    ? `${remaining.toLocaleString()} left`
    : `${Math.abs(remaining).toLocaleString()} over`;

  const ring = $('ringFill');
  ring.style.strokeDashoffset = String(circumference * (1 - pct));
  ring.style.stroke = pct < 0.5 ? '#10b981' : pct < 0.85 ? '#f59e0b' : '#ef4444';

  // Meal breakdown row
  const mealTotals = {};
  state.entries.forEach(e => {
    const m = e.mealMoment || 'lunch';
    mealTotals[m] = (mealTotals[m] || 0) + Number(e.calories || 0);
  });
  const shown = ['breakfast', 'lunch', 'dinner', 'snack'];
  $('mealRow').innerHTML = shown.map(id => {
    const m = MODEL.mealMoments.find(x => x.id === id);
    const kcal = mealTotals[id] || 0;
    return `<div class="meal-chip">
      <span class="meal-chip-icon">${m.icon}</span>
      <span class="meal-chip-name">${m.label}</span>
      <span class="meal-chip-kcal" style="color:${m.color}">${kcal}</span>
    </div>`;
  }).join('');

  // Entry list
  const count = state.entries.length;
  $('homeEntryCount').textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;

  if (!count) {
    $('homeEntryList').innerHTML = `<div class="empty-state">
      <p class="empty-icon">🍽</p>
      <p class="empty-text">Nothing logged yet.</p>
      <p class="empty-sub">Tap Log to add your first meal.</p>
    </div>`;
    return;
  }

  const sorted = [...state.entries].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  $('homeEntryList').innerHTML = sorted.map(e => entryCardHTML(e)).join('');
}

// ── Log page ───────────────────────────────────────────────────────────────────
function renderLog() {
  renderPresets();
  renderTuneSection();
  renderEstimatePanel();
}

function renderPresets() {
  $('presetGrid').innerHTML = MODEL.smartPresets.map(p => {
    const kcal = calculateEstimate(p.draft).calories;
    const sel  = state.selectedPreset === p.id;
    return `<button class="preset-card${sel ? ' selected' : ''}" data-preset="${p.id}" type="button"
      style="background:${p.color}1a; border-color:${sel ? p.color : 'transparent'}">
      <span class="preset-emoji">${p.emoji}</span>
      <span class="preset-name" style="color:${p.color}">${p.label}</span>
      <span class="preset-kcal">${kcal} kcal</span>
    </button>`;
  }).join('');
}

function renderTuneSection() {
  makePills('mealMomentRow', MODEL.mealMoments, id => id === state.current.mealMoment, id => {
    state.current.mealMoment = id; state.selectedPreset = null;
    renderTuneSection(); renderPresets(); renderEstimatePanel();
  });
  makePills('portionRow', MODEL.portions, id => id === state.current.portion, id => {
    state.current.portion = id; state.selectedPreset = null;
    renderTuneSection(); renderPresets(); renderEstimatePanel();
  });
  makePills('densityRow', MODEL.densities, id => id === state.current.density, id => {
    state.current.density = id; state.selectedPreset = null;
    renderTuneSection(); renderPresets(); renderEstimatePanel();
  });
  makePills('addonRow', MODEL.addons, id => state.current.addons.includes(id), id => {
    toggleSel(state.current.addons, id); state.selectedPreset = null;
    renderTuneSection(); renderPresets(); renderEstimatePanel();
  });
}

function renderEstimatePanel() {
  const est = calculateEstimate(state.current);
  $('estimateNum').textContent       = String(est.calories);
  $('estimateBreakdown').textContent = `Base ${est.base} \u00b7 ${est.addonTotal >= 0 ? '+' : ''}${est.addonTotal} extras`;
}

function applyPreset(presetId) {
  const preset = MODEL.smartPresets.find(p => p.id === presetId);
  if (!preset) return;
  state.current = {
    mealMoment: preset.draft.mealMoment,
    portion:    preset.draft.portion,
    density:    preset.draft.density,
    addons:     [...preset.draft.addons],
  };
  state.selectedPreset = presetId;
  renderTuneSection();
  renderPresets();
  renderEstimatePanel();
}

// ── History page ───────────────────────────────────────────────────────────────
function renderHistory() {
  $('historyDateLabel').textContent = prettyDate(new Date());

  const total     = state.entries.reduce((s, e) => s + Number(e.calories || 0), 0);
  const remaining = Math.max(0, state.dailyTarget - total);
  const pct       = Math.min(100, Math.round(total / Math.max(1, state.dailyTarget) * 100));

  $('historySummary').innerHTML = `
    <div class="stat-cell">
      <p class="stat-val" style="color:#6366f1">${total.toLocaleString()}</p>
      <p class="stat-lbl">Consumed</p>
    </div>
    <div class="stat-cell">
      <p class="stat-val" style="color:#10b981">${remaining.toLocaleString()}</p>
      <p class="stat-lbl">Remaining</p>
    </div>
    <div class="stat-cell">
      <p class="stat-val" style="color:${pct > 100 ? '#ef4444' : '#f59e0b'}">${pct}%</p>
      <p class="stat-lbl">Of target</p>
    </div>`;

  if (!state.entries.length) {
    $('historyList').innerHTML = `<div class="empty-state">
      <p class="empty-icon">📋</p>
      <p class="empty-text">No entries today.</p>
    </div>`;
    return;
  }

  const sorted = [...state.entries].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  $('historyList').innerHTML = sorted.map(e => entryCardHTML(e)).join('');
}

// ── Settings page ──────────────────────────────────────────────────────────────
function renderSettings() {
  $('targetGrid').innerHTML = MODEL.targetOptions.map(t =>
    `<button class="target-btn${t === state.dailyTarget ? ' active' : ''}" data-target="${t}" type="button">${t}</button>`
  ).join('');
}

// ── Shared entry card HTML ─────────────────────────────────────────────────────
function entryCardHTML(entry) {
  const est = calculateEstimate({
    mealMoment: entry.mealMoment || 'lunch',
    portion:    entry.portion    || 'regular',
    density:    entry.density    || 'mixed',
    addons:     Array.isArray(entry.addons) ? entry.addons : [],
  });
  const ts = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date();
  const extras = est.addonLabels.length ? ` · ${est.addonLabels.join(', ')}` : '';
  return `<div class="entry-card">
    <div>
      <p class="entry-kcal" style="color:${est.mealColor}">${entry.calories} kcal · ${est.mealIcon} ${est.mealLabel}</p>
      <p class="entry-detail">${est.portionLabel} · ${est.densityLabel}${extras}</p>
      <p class="entry-time">${timeLabel(ts)}</p>
    </div>
    <div class="entry-actions">
      <button data-action="edit" data-id="${entry.id}" aria-label="Edit">✏</button>
      <button class="del-btn" data-action="delete" data-id="${entry.id}" aria-label="Delete">✕</button>
    </div>
  </div>`;
}

// ── Edit dialog ────────────────────────────────────────────────────────────────
function openEditDialog(entryId) {
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return;
  state.editingEntryId = entryId;
  state.editDraft = {
    mealMoment: entry.mealMoment || 'lunch',
    portion:    entry.portion    || 'regular',
    density:    entry.density    || 'mixed',
    addons:     Array.isArray(entry.addons) ? [...entry.addons] : [],
  };
  renderEditDialog();
  $('editDialog').showModal();
}

function renderEditDialog() {
  makePills('editMealRow', MODEL.mealMoments, id => id === state.editDraft.mealMoment, id => {
    state.editDraft.mealMoment = id; renderEditDialog();
  });
  makePills('editPortionRow', MODEL.portions, id => id === state.editDraft.portion, id => {
    state.editDraft.portion = id; renderEditDialog();
  });
  makePills('editDensityRow', MODEL.densities, id => id === state.editDraft.density, id => {
    state.editDraft.density = id; renderEditDialog();
  });
  makePills('editAddonRow', MODEL.addons, id => state.editDraft.addons.includes(id), id => {
    toggleSel(state.editDraft.addons, id); renderEditDialog();
  });
  $('editEstimateValue').textContent = String(calculateEstimate(state.editDraft).calories);
}

// ── Event wiring ───────────────────────────────────────────────────────────────
function wireEvents() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => navigateTo(btn.dataset.page))
  );
  $('settingsShortcut').addEventListener('click', () => navigateTo('settings'));

  // Preset cards (delegated)
  $('presetGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-preset]');
    if (btn) applyPreset(btn.dataset.preset);
  });

  // Add entry
  $('addEntryBtn').addEventListener('click', handleAddEntry);

  // Entry actions on both lists (delegated)
  ['homeEntryList', 'historyList'].forEach(listId =>
    $(listId).addEventListener('click', handleEntryAction)
  );

  // Settings target grid
  $('targetGrid').addEventListener('click', async e => {
    const btn = e.target.closest('[data-target]');
    if (!btn) return;
    state.dailyTarget = Number(btn.dataset.target);
    renderSettings();
    if (state.db) await store.saveSettings(state.dailyTarget);
  });

  // Edit dialog
  $('cancelEditBtn').addEventListener('click', () => $('editDialog').close());
  $('deleteEditBtn').addEventListener('click', handleDeleteFromEdit);
  $('editForm').addEventListener('submit', onSaveEdit);

  // Undo toast
  $('undoBtn').addEventListener('click', async () => {
    if (!state.lastDeleted || !state.db) return;
    await store.addEntry(state.lastDeleted);
    state.lastDeleted = null;
    await store.loadTodayEntries();
    renderCurrentPage();
    showToast('Restored.');
  });
}

async function handleAddEntry() {
  if (!state.db) { showToast('Connect Firebase to save entries.', false); return; }
  const est = calculateEstimate(state.current);
  await store.addEntry({
    calories:   est.calories,
    mealMoment: state.current.mealMoment,
    portion:    state.current.portion,
    density:    state.current.density,
    addons:     [...state.current.addons],
  });
  await store.loadTodayEntries();
  showToast(`Saved ${est.calories} kcal.`);
  navigateTo('home');
}

async function handleEntryAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn || !state.db) return;
  const { action, id } = btn.dataset;
  if (action === 'edit') { openEditDialog(id); return; }
  if (action === 'delete') {
    stashDeleted(id);
    await store.removeEntry(id);
    await store.loadTodayEntries();
    renderCurrentPage();
    showToast('Deleted.', true);
  }
}

async function handleDeleteFromEdit() {
  if (!state.editingEntryId || !state.db) return;
  stashDeleted(state.editingEntryId);
  await store.removeEntry(state.editingEntryId);
  $('editDialog').close();
  await store.loadTodayEntries();
  renderCurrentPage();
  showToast('Deleted.', true);
}

async function onSaveEdit(e) {
  e.preventDefault();
  if (!state.db || !state.editingEntryId) return;
  const est = calculateEstimate(state.editDraft);
  await store.updateEntry(state.editingEntryId, {
    calories:   est.calories,
    mealMoment: state.editDraft.mealMoment,
    portion:    state.editDraft.portion,
    density:    state.editDraft.density,
    addons:     [...state.editDraft.addons],
  });
  await store.loadTodayEntries();
  $('editDialog').close();
  renderCurrentPage();
  showToast('Updated.');
}

function stashDeleted(entryId) {
  const found = state.entries.find(e => e.id === entryId);
  if (!found) return;
  state.lastDeleted = {
    calories:   Number(found.calories || 0),
    mealMoment: found.mealMoment || 'lunch',
    portion:    found.portion    || 'regular',
    density:    found.density    || 'mixed',
    addons:     Array.isArray(found.addons) ? found.addons : [],
  };
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(message, canUndo = false) {
  $('toastText').textContent = message;
  $('undoBtn').hidden = !canUndo;
  $('toast').classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3500);
}

// ── Init ───────────────────────────────────────────────────────────────────────
async function init() {
  wireEvents();
  navigateTo('home');
  // Pre-render the log page while Firebase loads so it's instant on navigate
  renderLog();

  try {
    const [{ FIREBASE_CONFIG }, { initializeApp }, {
      addDoc, collection, deleteDoc, doc, getDoc, getDocs,
      getFirestore, orderBy, query, serverTimestamp, setDoc, updateDoc, where
    }] = await Promise.all([
      import('./firebase-config.js'),
      import(FIREBASE_APP_URL),
      import(FIREBASE_FIRESTORE_URL),
    ]);
    fb = {
      addDoc, collection, deleteDoc, doc, getDoc, getDocs,
      getFirestore, orderBy, query, serverTimestamp, setDoc, updateDoc, where
    };
    state.db = fb.getFirestore(initializeApp(FIREBASE_CONFIG));
    await store.loadSettings();
    await store.loadTodayEntries();
    renderHome();
    renderSettings();
  } catch (err) {
    showToast("Firebase config missing \u2014 data won't save.", false);
    console.warn('[20lbs] Firebase init failed:', err);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

init();
