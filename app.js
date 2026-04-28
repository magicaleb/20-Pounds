import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const DEFAULTS = {
  dailyTarget: 2000,
  toastMs: 5000,
  quickActions: [
    { label: 'Tiny bite', kcal: 80 },
    { label: 'Snack', kcal: 180 },
    { label: 'Light meal', kcal: 350 },
    { label: 'Regular meal', kcal: 550 },
    { label: 'Large meal', kcal: 800 },
    { label: 'Dessert / drink', kcal: 300 }
  ],
  mealTypes: ['meal', 'snack', 'drink', 'treat'],
  portions: ['tiny', 'small', 'medium', 'large', 'huge'],
  densities: ['light', 'normal', 'heavy'],
  baseMap: {
    meal: { tiny: 200, small: 350, medium: 550, large: 750, huge: 950 },
    snack: { tiny: 80, small: 150, medium: 250, large: 350, huge: 500 },
    drink: { tiny: 50, small: 120, medium: 220, large: 320, huge: 450 },
    treat: { tiny: 120, small: 220, medium: 360, large: 500, huge: 700 }
  },
  densityOffset: { light: -80, normal: 0, heavy: 120 }
};

const state = {
  uid: getOrCreateUid(),
  todayKey: toDateKey(new Date()),
  dailyTarget: DEFAULTS.dailyTarget,
  entries: [],
  lastDeleted: null,
  toastTimer: null,
  db: null,
  composer: { mealType: 'meal', portion: 'medium', density: 'normal' },
  edit: { id: null, mealType: 'meal', portion: 'medium', density: 'normal', kcal: 0, manualDelta: 0 }
};

const ui = {
  todayLabel: document.getElementById('todayLabel'),
  todayTotal: document.getElementById('todayTotal'),
  targetText: document.getElementById('targetText'),
  progressBar: document.getElementById('progressBar'),
  quickGrid: document.getElementById('quickGrid'),
  mealTypeChips: document.getElementById('mealTypeChips'),
  portionChips: document.getElementById('portionChips'),
  densityChips: document.getElementById('densityChips'),
  smartAddBtn: document.getElementById('smartAddBtn'),
  smartPreview: document.getElementById('smartPreview'),
  historyList: document.getElementById('historyList'),
  entryCount: document.getElementById('entryCount'),
  toast: document.getElementById('toast'),
  toastText: document.getElementById('toastText'),
  undoBtn: document.getElementById('undoBtn'),
  themeBtn: document.getElementById('themeBtn'),
  editDialog: document.getElementById('editDialog'),
  editForm: document.getElementById('editForm'),
  editTypeChips: document.getElementById('editTypeChips'),
  editPortionChips: document.getElementById('editPortionChips'),
  editDensityChips: document.getElementById('editDensityChips'),
  editCalories: document.getElementById('editCalories'),
  cancelEditBtn: document.getElementById('cancelEditBtn')
};

function getOrCreateUid() {
  const key = 'calorie-flow-user-key';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function prettyDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function timeLabel(ts) {
  const date = ts?.toDate ? ts.toDate() : new Date();
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function estimateCalories(mealType, portion, density) {
  const base = DEFAULTS.baseMap[mealType][portion];
  return Math.max(50, base + DEFAULTS.densityOffset[density]);
}

function describeEntry(entry) {
  return `${entry.mealType} • ${entry.portion} • ${entry.density}`;
}

function sanitize(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const store = {
  entriesCol() {
    return collection(state.db, 'users', state.uid, 'entries');
  },
  settingsDoc() {
    return doc(state.db, 'users', state.uid, 'settings', 'app');
  },
  async load() {
    const settingsSnap = await getDoc(this.settingsDoc());
    if (settingsSnap.exists()) {
      state.dailyTarget = Number(settingsSnap.data().dailyTarget) || DEFAULTS.dailyTarget;
    }
    const q = query(
      this.entriesCol(),
      where('entryDate', '==', state.todayKey),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    state.entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async saveTarget(next) {
    await setDoc(this.settingsDoc(), { dailyTarget: next, updatedAt: serverTimestamp() }, { merge: true });
    state.dailyTarget = next;
  },
  async addEntry(payload) {
    await addDoc(this.entriesCol(), {
      ...payload,
      entryDate: state.todayKey,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  async updateEntry(id, payload) {
    await updateDoc(doc(this.entriesCol(), id), { ...payload, updatedAt: serverTimestamp() });
  },
  async deleteEntry(id) {
    await deleteDoc(doc(this.entriesCol(), id));
  }
};

function renderQuickActions() {
  ui.quickGrid.innerHTML = '';
  for (const action of DEFAULTS.quickActions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-btn';
    btn.dataset.kcal = String(action.kcal);
    btn.dataset.label = action.label;
    btn.innerHTML = `${action.label}<small>${action.kcal} kcal</small>`;
    ui.quickGrid.appendChild(btn);
  }
}

function renderChipRow(root, options, active) {
  root.innerHTML = '';
  for (const option of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${option === active ? ' active' : ''}`;
    btn.dataset.value = option;
    btn.textContent = option;
    root.appendChild(btn);
  }
}

function renderComposer() {
  renderChipRow(ui.mealTypeChips, DEFAULTS.mealTypes, state.composer.mealType);
  renderChipRow(ui.portionChips, DEFAULTS.portions, state.composer.portion);
  renderChipRow(ui.densityChips, DEFAULTS.densities, state.composer.density);
  const kcal = estimateCalories(state.composer.mealType, state.composer.portion, state.composer.density);
  ui.smartPreview.textContent = `Estimated ${kcal} kcal`;
}

function totalKcal() {
  return state.entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
}

function renderSummary() {
  const total = totalKcal();
  const ratio = Math.min(1.25, total / Math.max(1, state.dailyTarget));
  ui.todayLabel.textContent = prettyDate(new Date());
  ui.todayTotal.textContent = `${total} kcal`;
  ui.targetText.textContent = `${total} / ${state.dailyTarget}`;
  ui.progressBar.style.width = `${Math.min(100, ratio * 100)}%`;
}

function renderHistory() {
  const items = [...state.entries].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  ui.entryCount.textContent = `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`;
  ui.historyList.innerHTML = '';

  if (!items.length) {
    ui.historyList.innerHTML = '<p class="muted">No entries yet. Tap a quick action above.</p>';
    return;
  }

  for (const item of items) {
    const node = document.createElement('article');
    node.className = 'history-item';
    node.innerHTML = `
      <div>
        <p class="item-kcal">${Number(item.calories) || 0} kcal</p>
        <p>${sanitize(describeEntry(item))}</p>
        <p class="item-meta">${sanitize(timeLabel(item.createdAt))}</p>
      </div>
      <div class="actions">
        <button type="button" class="icon-btn" data-action="edit" data-id="${item.id}">✎</button>
        <button type="button" class="icon-btn delete" data-action="delete" data-id="${item.id}">🗑</button>
      </div>
    `;
    ui.historyList.appendChild(node);
  }
}

function showToast(text, showUndo = false) {
  ui.toastText.textContent = text;
  ui.undoBtn.hidden = !showUndo;
  ui.toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), DEFAULTS.toastMs);
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('calorie-flow-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('calorie-flow-theme');
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
    return;
  }
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

async function addEntry(payload) {
  await store.addEntry(payload);
  await refresh();
  showToast('Saved');
}

function makePayloadFromComposer() {
  const mealType = state.composer.mealType;
  const portion = state.composer.portion;
  const density = state.composer.density;
  return {
    calories: estimateCalories(mealType, portion, density),
    mealType,
    portion,
    density,
    method: 'smart'
  };
}

async function refresh() {
  await store.load();
  renderSummary();
  renderHistory();
}

function openEdit(entry) {
  state.edit.id = entry.id;
  state.edit.mealType = entry.mealType;
  state.edit.portion = entry.portion;
  state.edit.density = entry.density;
  state.edit.manualDelta = Number(entry.manualDelta) || 0;
  state.edit.kcal = Number(entry.calories) || estimateCalories(entry.mealType, entry.portion, entry.density);
  renderChipRow(ui.editTypeChips, DEFAULTS.mealTypes, state.edit.mealType);
  renderChipRow(ui.editPortionChips, DEFAULTS.portions, state.edit.portion);
  renderChipRow(ui.editDensityChips, DEFAULTS.densities, state.edit.density);
  updateEditCalories();
  ui.editDialog.showModal();
}

function updateEditCalories() {
  const computed = estimateCalories(state.edit.mealType, state.edit.portion, state.edit.density) + state.edit.manualDelta;
  state.edit.kcal = Math.max(50, computed);
  ui.editCalories.textContent = `${state.edit.kcal} kcal`;
}

async function bindEvents() {
  ui.quickGrid.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-kcal]');
    if (!btn) return;
    const kcal = Number(btn.dataset.kcal);
    await addEntry({ calories: kcal, mealType: 'quick', portion: 'preset', density: btn.dataset.label || 'normal', method: 'quick' });
  });

  ui.mealTypeChips.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-value]');
    if (!btn) return;
    state.composer.mealType = btn.dataset.value;
    renderComposer();
  });
  ui.portionChips.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-value]');
    if (!btn) return;
    state.composer.portion = btn.dataset.value;
    renderComposer();
  });
  ui.densityChips.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-value]');
    if (!btn) return;
    state.composer.density = btn.dataset.value;
    renderComposer();
  });

  ui.smartAddBtn.addEventListener('click', async () => {
    await addEntry(makePayloadFromComposer());
  });

  document.querySelectorAll('[data-target-adjust]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const delta = Number(btn.dataset.targetAdjust);
      const next = Math.max(800, state.dailyTarget + delta);
      await store.saveTarget(next);
      renderSummary();
      showToast('Target updated');
    });
  });

  ui.historyList.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const entry = state.entries.find((item) => item.id === btn.dataset.id);
    if (!entry) return;

    if (btn.dataset.action === 'edit') {
      openEdit(entry);
      return;
    }

    state.lastDeleted = { ...entry };
    await store.deleteEntry(entry.id);
    await refresh();
    showToast('Deleted', true);
  });

  ui.undoBtn.addEventListener('click', async () => {
    if (!state.lastDeleted) return;
    const { id, ...payload } = state.lastDeleted;
    await addDoc(store.entriesCol(), { ...payload, updatedAt: serverTimestamp() });
    state.lastDeleted = null;
    await refresh();
    showToast('Restored');
  });

  ui.themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });

  [
    [ui.editTypeChips, 'mealType'],
    [ui.editPortionChips, 'portion'],
    [ui.editDensityChips, 'density']
  ].forEach(([root, key]) => {
    root.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-value]');
      if (!btn) return;
      state.edit[key] = btn.dataset.value;
      renderChipRow(root, key === 'mealType' ? DEFAULTS.mealTypes : key === 'portion' ? DEFAULTS.portions : DEFAULTS.densities, state.edit[key]);
      updateEditCalories();
    });
  });

  document.querySelectorAll('[data-edit-adjust]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.edit.manualDelta += Number(btn.dataset.editAdjust);
      updateEditCalories();
    });
  });

  ui.editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await store.updateEntry(state.edit.id, {
      calories: state.edit.kcal,
      mealType: state.edit.mealType,
      portion: state.edit.portion,
      density: state.edit.density,
      manualDelta: state.edit.manualDelta
    });
    ui.editDialog.close();
    await refresh();
    showToast('Updated');
  });

  ui.cancelEditBtn.addEventListener('click', () => ui.editDialog.close());
}

async function initFirebase() {
  const module = await import('./firebase-config.js');
  if (!module.FIREBASE_CONFIG?.projectId) {
    throw new Error('Set FIREBASE_CONFIG in firebase-config.js');
  }
  const app = initializeApp(module.FIREBASE_CONFIG);
  state.db = getFirestore(app);
}

async function boot() {
  initTheme();
  renderQuickActions();
  renderComposer();
  await bindEvents();

  try {
    await initFirebase();
    await refresh();
  } catch (error) {
    console.error(error);
    ui.historyList.innerHTML = `<p class="muted">Firebase setup needed. Copy firebase-config.example.js to firebase-config.js and fill values.</p>`;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

boot();
