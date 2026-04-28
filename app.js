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

const MODEL = {
  mealMoments: [
    { id: 'snack', label: 'Snack', base: 220 },
    { id: 'breakfast', label: 'Breakfast', base: 460 },
    { id: 'lunch', label: 'Lunch', base: 580 },
    { id: 'dinner', label: 'Dinner', base: 680 },
    { id: 'dessert', label: 'Dessert', base: 340 },
    { id: 'drink', label: 'Drink', base: 160 }
  ],
  portions: [
    { id: 'small', label: 'Small', kcal: -180 },
    { id: 'regular', label: 'Regular', kcal: 0 },
    { id: 'large', label: 'Large', kcal: 220 }
  ],
  densities: [
    { id: 'light', label: 'Light', kcal: -100 },
    { id: 'mixed', label: 'Mixed', kcal: 0 },
    { id: 'rich', label: 'Rich', kcal: 170 }
  ],
  addons: [
    { id: 'fried', label: '+Fried', kcal: 150 },
    { id: 'sauce', label: '+Sauce', kcal: 90 },
    { id: 'sweetdrink', label: '+Sweet drink', kcal: 180 },
    { id: 'alcohol', label: '+Alcohol', kcal: 180 },
    { id: 'seconds', label: '+Seconds', kcal: 250 },
    { id: 'protein', label: '+Protein', kcal: 120 },
    { id: 'lightswap', label: '-Lighter prep', kcal: -110 }
  ],
  smartPresets: [
    {
      id: 'home-plate',
      label: 'Home plate',
      draft: { mealMoment: 'dinner', portion: 'regular', density: 'mixed', addons: [] }
    },
    {
      id: 'takeout',
      label: 'Takeout',
      draft: { mealMoment: 'dinner', portion: 'large', density: 'rich', addons: ['sauce'] }
    },
    {
      id: 'fast-combo',
      label: 'Fast combo',
      draft: { mealMoment: 'lunch', portion: 'large', density: 'rich', addons: ['fried', 'sweetdrink'] }
    },
    {
      id: 'coffee-snack',
      label: 'Coffee + bite',
      draft: { mealMoment: 'snack', portion: 'regular', density: 'mixed', addons: ['sweetdrink'] }
    },
    {
      id: 'lean-meal',
      label: 'Lean meal',
      draft: { mealMoment: 'lunch', portion: 'regular', density: 'light', addons: ['protein'] }
    },
    {
      id: 'night-out',
      label: 'Night out',
      draft: { mealMoment: 'dinner', portion: 'large', density: 'rich', addons: ['alcohol', 'seconds'] }
    }
  ],
  defaultTarget: 2200
};

const state = {
  db: null,
  uid: getOrCreateUid(),
  todayKey: dateKey(new Date()),
  entries: [],
  dailyTarget: MODEL.defaultTarget,
  current: { mealMoment: 'lunch', portion: 'regular', density: 'mixed', addons: [] },
  editDraft: null,
  editingEntryId: null,
  lastDeleted: null,
  toastTimer: null
};

const ui = {
  todayLabel: byId('todayLabel'),
  todayTotal: byId('todayTotal'),
  goalDetail: byId('goalDetail'),
  goalProgress: byId('goalProgress'),
  goalProgressWrap: byId('goalProgressWrap'),
  goalStatus: byId('goalStatus'),
  presetGrid: byId('presetGrid'),
  mealTypeGrid: byId('mealTypeGrid'),
  portionGrid: byId('portionGrid'),
  densityGrid: byId('densityGrid'),
  addonGrid: byId('addonGrid'),
  estimateBreakdown: byId('estimateBreakdown'),
  estimateValue: byId('estimateValue'),
  saveEntryBtn: byId('saveEntryBtn'),
  toggleHistoryBtn: byId('toggleHistoryBtn'),
  historySheet: byId('historySheet'),
  closeHistoryBtn: byId('closeHistoryBtn'),
  targetSelect: byId('targetSelect'),
  entryCount: byId('entryCount'),
  historyList: byId('historyList'),
  editDialog: byId('editDialog'),
  editForm: byId('editForm'),
  editMealGrid: byId('editMealGrid'),
  editPortionGrid: byId('editPortionGrid'),
  editDensityGrid: byId('editDensityGrid'),
  editAddonGrid: byId('editAddonGrid'),
  editEstimateValue: byId('editEstimateValue'),
  cancelEditBtn: byId('cancelEditBtn'),
  toast: byId('toast'),
  toastText: byId('toastText'),
  undoBtn: byId('undoBtn')
};

const store = {
  entriesCollection: () => collection(state.db, 'users', state.uid, 'entries'),
  settingsDoc: () => doc(state.db, 'users', state.uid, 'settings', 'app'),

  async loadSettings() {
    const snap = await getDoc(this.settingsDoc());
    if (!snap.exists()) return;
    state.dailyTarget = Number(snap.data().dailyTarget || MODEL.defaultTarget);
  },

  async saveSettings(target) {
    await setDoc(this.settingsDoc(), { dailyTarget: target, updatedAt: serverTimestamp() }, { merge: true });
  },

  async loadTodayEntries() {
    const q = query(
      this.entriesCollection(),
      where('entryDate', '==', state.todayKey),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    state.entries = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },

  async addEntry(payload) {
    await addDoc(this.entriesCollection(), {
      ...payload,
      entryDate: state.todayKey,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async updateEntry(entryId, payload) {
    await updateDoc(doc(this.entriesCollection(), entryId), {
      ...payload,
      updatedAt: serverTimestamp()
    });
  },

  async removeEntry(entryId) {
    await deleteDoc(doc(this.entriesCollection(), entryId));
  }
};

async function init() {
  ui.todayLabel.textContent = prettyDate(new Date());
  renderPresetButtons();
  renderMainSelectors();
  wireEvents();
  renderEstimate();

  try {
    const { FIREBASE_CONFIG } = await import('./firebase-config.js');
    const app = initializeApp(FIREBASE_CONFIG);
    state.db = getFirestore(app);
    await store.loadSettings();
    await store.loadTodayEntries();
    renderAll();
  } catch (error) {
    showToast('Firebase setup missing. Create firebase-config.js', false);
    console.error(error);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW failed', err));
  }
}

function wireEvents() {
  ui.saveEntryBtn.addEventListener('click', handleAddEntry);
  ui.toggleHistoryBtn.addEventListener('click', () => toggleHistory(true));
  ui.closeHistoryBtn.addEventListener('click', () => toggleHistory(false));

  ui.targetSelect.addEventListener('change', async () => {
    state.dailyTarget = Number(ui.targetSelect.value);
    renderSummary();
    if (state.db) await store.saveSettings(state.dailyTarget);
  });

  ui.historyList.addEventListener('click', onHistoryAction);
  ui.cancelEditBtn.addEventListener('click', () => ui.editDialog.close());
  ui.editForm.addEventListener('submit', onSaveEdit);

  ui.undoBtn.addEventListener('click', async () => {
    if (!state.lastDeleted || !state.db) return;
    await store.addEntry(state.lastDeleted);
    state.lastDeleted = null;
    await store.loadTodayEntries();
    renderAll();
    showToast('Restored.');
  });
}

function calculateEstimate(draft) {
  const meal = lookup(MODEL.mealMoments, draft.mealMoment);
  const portion = lookup(MODEL.portions, draft.portion);
  const density = lookup(MODEL.densities, draft.density);
  const addonItems = MODEL.addons.filter((item) => draft.addons.includes(item.id));

  const base = (meal?.base || 0) + (portion?.kcal || 0) + (density?.kcal || 0);
  const addonTotal = addonItems.reduce((sum, item) => sum + item.kcal, 0);
  const calories = Math.max(60, base + addonTotal);

  return {
    calories,
    base,
    addonTotal,
    mealLabel: meal?.label || 'Meal',
    portionLabel: portion?.label || 'Regular',
    densityLabel: density?.label || 'Mixed',
    addonLabels: addonItems.map((item) => item.label)
  };
}

function applyPreset(presetId) {
  const preset = MODEL.smartPresets.find((p) => p.id === presetId);
  if (!preset) return;
  state.current = {
    mealMoment: preset.draft.mealMoment,
    portion: preset.draft.portion,
    density: preset.draft.density,
    addons: [...preset.draft.addons]
  };
  renderMainSelectors();
  renderEstimate();
}

function renderPresetButtons() {
  ui.presetGrid.innerHTML = '';
  MODEL.smartPresets.forEach((preset) => {
    const button = document.createElement('button');
    button.className = 'quick-btn';
    button.type = 'button';
    button.textContent = preset.label;
    button.addEventListener('click', () => applyPreset(preset.id));
    ui.presetGrid.appendChild(button);
  });
}

function renderMainSelectors() {
  renderSingleSelect(ui.mealTypeGrid, MODEL.mealMoments, state.current.mealMoment, (id) => {
    state.current.mealMoment = id;
    renderMainSelectors();
    renderEstimate();
  });

  renderSingleSelect(ui.portionGrid, MODEL.portions, state.current.portion, (id) => {
    state.current.portion = id;
    renderMainSelectors();
    renderEstimate();
  });

  renderSingleSelect(ui.densityGrid, MODEL.densities, state.current.density, (id) => {
    state.current.density = id;
    renderMainSelectors();
    renderEstimate();
  });

  renderMultiSelect(ui.addonGrid, MODEL.addons, state.current.addons, (id) => {
    toggleSelection(state.current.addons, id);
    renderMainSelectors();
    renderEstimate();
  });
}

async function handleAddEntry() {
  if (!state.db) return;
  const estimate = calculateEstimate(state.current);
  await store.addEntry({
    calories: estimate.calories,
    mealMoment: state.current.mealMoment,
    portion: state.current.portion,
    density: state.current.density,
    addons: [...state.current.addons]
  });
  await store.loadTodayEntries();
  renderAll();
  showToast(`Saved ${estimate.calories} kcal.`);
}

async function onHistoryAction(event) {
  const action = event.target.dataset.action;
  const entryId = event.target.dataset.id;
  if (!action || !entryId || !state.db) return;

  const found = state.entries.find((item) => item.id === entryId);
  if (!found) return;

  if (action === 'delete') {
    state.lastDeleted = {
      calories: Number(found.calories || 0),
      mealMoment: found.mealMoment || 'lunch',
      portion: found.portion || 'regular',
      density: found.density || 'mixed',
      addons: Array.isArray(found.addons) ? found.addons : []
    };
    await store.removeEntry(entryId);
    await store.loadTodayEntries();
    renderAll();
    showToast('Deleted.');
    return;
  }

  if (action === 'edit') {
    state.editingEntryId = entryId;
    state.editDraft = {
      mealMoment: found.mealMoment || 'lunch',
      portion: found.portion || 'regular',
      density: found.density || 'mixed',
      addons: Array.isArray(found.addons) ? [...found.addons] : []
    };
    renderEditDialog();
    ui.editDialog.showModal();
  }
}

function renderEditDialog() {
  renderSingleSelect(ui.editMealGrid, MODEL.mealMoments, state.editDraft.mealMoment, (id) => {
    state.editDraft.mealMoment = id;
    renderEditDialog();
  });

  renderSingleSelect(ui.editPortionGrid, MODEL.portions, state.editDraft.portion, (id) => {
    state.editDraft.portion = id;
    renderEditDialog();
  });

  renderSingleSelect(ui.editDensityGrid, MODEL.densities, state.editDraft.density, (id) => {
    state.editDraft.density = id;
    renderEditDialog();
  });

  renderMultiSelect(ui.editAddonGrid, MODEL.addons, state.editDraft.addons, (id) => {
    toggleSelection(state.editDraft.addons, id);
    renderEditDialog();
  });

  ui.editEstimateValue.textContent = String(calculateEstimate(state.editDraft).calories);
}

async function onSaveEdit(event) {
  event.preventDefault();
  if (!state.db || !state.editingEntryId) return;

  const estimate = calculateEstimate(state.editDraft);
  await store.updateEntry(state.editingEntryId, {
    calories: estimate.calories,
    mealMoment: state.editDraft.mealMoment,
    portion: state.editDraft.portion,
    density: state.editDraft.density,
    addons: [...state.editDraft.addons]
  });

  await store.loadTodayEntries();
  renderAll();
  ui.editDialog.close();
  showToast('Updated.');
}

function renderAll() {
  renderEstimate();
  renderSummary();
  renderHistory();
}

function renderEstimate() {
  const estimate = calculateEstimate(state.current);
  ui.estimateValue.textContent = String(estimate.calories);
  ui.estimateBreakdown.textContent = `Base ${estimate.base} + extras ${estimate.addonTotal}`;
}

function renderSummary() {
  const total = state.entries.reduce((sum, item) => sum + Number(item.calories || 0), 0);
  const pct = Math.min(100, Math.round((total / Math.max(1, state.dailyTarget)) * 100));
  ui.todayTotal.textContent = `${total} kcal`;
  ui.goalDetail.textContent = `${total} / ${state.dailyTarget} kcal`;
  ui.goalProgress.style.width = `${pct}%`;
  ui.goalProgressWrap.setAttribute('aria-valuenow', String(pct));
  ui.targetSelect.value = String(state.dailyTarget);

  if (pct < 35) ui.goalStatus.textContent = 'Plenty of room left today.';
  else if (pct < 85) ui.goalStatus.textContent = 'Good pace. Keep logging roughly.';
  else if (pct <= 100) ui.goalStatus.textContent = 'Close to target.';
  else ui.goalStatus.textContent = 'Over target can happen — consistency wins.';
}

function renderHistory() {
  const items = [...state.entries].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  ui.entryCount.textContent = `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`;
  ui.historyList.innerHTML = '';

  if (!items.length) {
    ui.historyList.innerHTML = '<div class="empty">No entries yet today.</div>';
    return;
  }

  items.forEach((entry) => {
    const estimate = calculateEstimate({
      mealMoment: entry.mealMoment || 'lunch',
      portion: entry.portion || 'regular',
      density: entry.density || 'mixed',
      addons: Array.isArray(entry.addons) ? entry.addons : []
    });

    const timestamp = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date();
    const addonSummary = estimate.addonLabels.length ? estimate.addonLabels.join(', ') : 'No add-ons';

    const node = document.createElement('article');
    node.className = 'history-item';
    node.innerHTML = `
      <div>
        <p><strong>${entry.calories} kcal</strong> · ${estimate.mealLabel} · ${estimate.portionLabel}/${estimate.densityLabel}</p>
        <p class="entry-meta">${addonSummary} · ${timeLabel(timestamp)}</p>
      </div>
      <div class="actions">
        <button data-action="edit" data-id="${entry.id}" aria-label="Edit">✏️</button>
        <button class="delete" data-action="delete" data-id="${entry.id}" aria-label="Delete">🗑️</button>
      </div>
    `;
    ui.historyList.appendChild(node);
  });
}

function renderSingleSelect(target, items, activeId, onClick) {
  target.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip ${item.id === activeId ? 'active' : ''}`;
    button.textContent = item.label;
    button.addEventListener('click', () => onClick(item.id));
    target.appendChild(button);
  });
}

function renderMultiSelect(target, items, selectedIds, onClick) {
  target.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip ${selectedIds.includes(item.id) ? 'active' : ''}`;
    button.textContent = item.label;
    button.addEventListener('click', () => onClick(item.id));
    target.appendChild(button);
  });
}

function toggleHistory(open) {
  ui.historySheet.classList.toggle('open', open);
  ui.historySheet.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function showToast(message, canUndo = true) {
  ui.toastText.textContent = message;
  ui.undoBtn.hidden = !canUndo;
  ui.toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 3500);
}

function toggleSelection(selection, id) {
  const idx = selection.indexOf(id);
  if (idx >= 0) selection.splice(idx, 1);
  else selection.push(id);
}

function lookup(list, id) {
  return list.find((item) => item.id === id);
}

function byId(id) {
  return document.getElementById(id);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function prettyDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function timeLabel(date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function getOrCreateUid() {
  const key = 'twenty-pounds-personal-uid';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const uid = crypto.randomUUID();
  localStorage.setItem(key, uid);
  return uid;
}

init();
