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

const FOOD_DB = [
  { id: 'rice_bowl', name: 'Rice bowl', emoji: '🍚', baseCalories: 520 },
  { id: 'pasta_plate', name: 'Pasta', emoji: '🍝', baseCalories: 620 },
  { id: 'burger_fries', name: 'Burger + fries', emoji: '🍔', baseCalories: 860 },
  { id: 'pizza_slice', name: 'Pizza', emoji: '🍕', baseCalories: 320 },
  { id: 'chicken_salad', name: 'Chicken salad', emoji: '🥗', baseCalories: 460 },
  { id: 'breakfast_sandwich', name: 'Breakfast sandwich', emoji: '🥪', baseCalories: 430 },
  { id: 'burrito', name: 'Burrito', emoji: '🌯', baseCalories: 760 },
  { id: 'tacos', name: 'Tacos', emoji: '🌮', baseCalories: 520 },
  { id: 'sushi_rolls', name: 'Sushi rolls', emoji: '🍣', baseCalories: 480 },
  { id: 'stir_fry', name: 'Stir fry', emoji: '🥡', baseCalories: 600 },
  { id: 'steak_potatoes', name: 'Steak + potatoes', emoji: '🥩', baseCalories: 760 },
  { id: 'soup_sandwich', name: 'Soup + sandwich', emoji: '🥣', baseCalories: 540 },
  { id: 'fried_chicken', name: 'Fried chicken', emoji: '🍗', baseCalories: 700 },
  { id: 'protein_shake', name: 'Protein shake', emoji: '🥤', baseCalories: 250 },
  { id: 'latte_sweet', name: 'Sweet latte', emoji: '☕', baseCalories: 240 },
  { id: 'yogurt_granola', name: 'Yogurt + granola', emoji: '🥛', baseCalories: 360 },
  { id: 'fruit_nuts', name: 'Fruit + nuts', emoji: '🍎', baseCalories: 280 },
  { id: 'chips_crackers', name: 'Chips / crackers', emoji: '🥨', baseCalories: 220 },
  { id: 'dessert', name: 'Dessert', emoji: '🍰', baseCalories: 390 },
  { id: 'ice_cream', name: 'Ice cream', emoji: '🍨', baseCalories: 320 }
];

const SIZE_OPTIONS = [
  { id: 'tiny', name: 'Tiny', ratio: 0.5, cue: 'A few bites / half snack' },
  { id: 'small', name: 'Small', ratio: 0.75, cue: 'Palm size / light plate' },
  { id: 'regular', name: 'Regular', ratio: 1, cue: 'Standard meal / one plate' },
  { id: 'large', name: 'Large', ratio: 1.35, cue: 'Heaped plate / takeout box' },
  { id: 'xlarge', name: 'Very large', ratio: 1.75, cue: 'Two plates / very filling' }
];

const DEFAULT_TARGET = 2000;
const TOAST_MS = 5200;

const state = {
  uid: getOrCreateUid(),
  todayKey: toDateKey(new Date()),
  dailyTarget: DEFAULT_TARGET,
  entries: [],
  selectedFoodId: null,
  lastDeleted: null,
  db: null,
  toastTimer: null,
  edit: { id: null, foodId: null, sizeId: null }
};

const ui = {
  todayLabel: document.getElementById('todayLabel'),
  todayTotal: document.getElementById('todayTotal'),
  targetText: document.getElementById('targetText'),
  progressBar: document.getElementById('progressBar'),
  themeBtn: document.getElementById('themeBtn'),
  wizardTitle: document.getElementById('wizardTitle'),
  wizardHint: document.getElementById('wizardHint'),
  stepFood: document.getElementById('stepFood'),
  stepSize: document.getElementById('stepSize'),
  foodGrid: document.getElementById('foodGrid'),
  sizeGrid: document.getElementById('sizeGrid'),
  selectedFoodPreview: document.getElementById('selectedFoodPreview'),
  backToFoodBtn: document.getElementById('backToFoodBtn'),
  historyList: document.getElementById('historyList'),
  entryCount: document.getElementById('entryCount'),
  toast: document.getElementById('toast'),
  toastText: document.getElementById('toastText'),
  undoBtn: document.getElementById('undoBtn'),
  editDialog: document.getElementById('editDialog'),
  editForm: document.getElementById('editForm'),
  editFoodGrid: document.getElementById('editFoodGrid'),
  editSizeGrid: document.getElementById('editSizeGrid'),
  editPreview: document.getElementById('editPreview'),
  cancelEditBtn: document.getElementById('cancelEditBtn')
};

function getOrCreateUid() {
  const key = 'calorie-flow-user-key';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const uid = crypto.randomUUID();
  localStorage.setItem(key, uid);
  return uid;
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

function formatTime(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date();
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function sanitize(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function findFood(foodId) {
  return FOOD_DB.find((f) => f.id === foodId) || FOOD_DB[0];
}

function findSize(sizeId) {
  return SIZE_OPTIONS.find((s) => s.id === sizeId) || SIZE_OPTIONS[2];
}

function estimateCalories(foodId, sizeId) {
  const food = findFood(foodId);
  const size = findSize(sizeId);
  return Math.round(food.baseCalories * size.ratio);
}

function describeEntry(entry) {
  return `${entry.foodName} · ${entry.sizeName}`;
}

const store = {
  entriesCol() {
    return collection(state.db, 'users', state.uid, 'entries');
  },
  settingsDoc() {
    return doc(state.db, 'users', state.uid, 'settings', 'app');
  },
  async loadAll() {
    const settingsSnap = await getDoc(this.settingsDoc());
    if (settingsSnap.exists()) {
      state.dailyTarget = Number(settingsSnap.data().dailyTarget) || DEFAULT_TARGET;
    }

    const q = query(this.entriesCol(), where('entryDate', '==', state.todayKey), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    state.entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async saveTarget(target) {
    await setDoc(this.settingsDoc(), { dailyTarget: target, updatedAt: serverTimestamp() }, { merge: true });
    state.dailyTarget = target;
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
    await updateDoc(doc(this.entriesCol(), id), {
      ...payload,
      updatedAt: serverTimestamp()
    });
  },
  async deleteEntry(id) {
    await deleteDoc(doc(this.entriesCol(), id));
  }
};

function renderFoodGrid(root, activeId = null, compact = false) {
  root.innerHTML = '';
  FOOD_DB.forEach((food) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `food-btn${food.id === activeId ? ' active' : ''}${compact ? ' compact' : ''}`;
    btn.dataset.foodId = food.id;
    btn.innerHTML = `<span class="food-emoji" aria-hidden="true">${food.emoji}</span><span>${food.name}</span><small>~${food.baseCalories} kcal regular</small>`;
    root.appendChild(btn);
  });
}

function renderSizeGrid(root, activeId = null) {
  root.innerHTML = '';
  SIZE_OPTIONS.forEach((size) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `size-btn${size.id === activeId ? ' active' : ''}`;
    btn.dataset.sizeId = size.id;
    btn.innerHTML = `<strong>${size.name}</strong><span>${size.cue}</span>`;
    root.appendChild(btn);
  });
}

function showStep(step) {
  if (step === 'food') {
    ui.stepFood.hidden = false;
    ui.stepSize.hidden = true;
    ui.wizardTitle.textContent = 'Step 1 · What did you eat?';
    ui.wizardHint.textContent = 'Pick the closest option. Precision is not required.';
    return;
  }

  ui.stepFood.hidden = true;
  ui.stepSize.hidden = false;
  const food = findFood(state.selectedFoodId);
  ui.wizardTitle.textContent = 'Step 2 · How much?';
  ui.wizardHint.textContent = 'Choose a size reference and it saves instantly.';
  ui.selectedFoodPreview.innerHTML = `<span class="food-emoji">${food.emoji}</span> ${food.name}`;
}

function totalCalories() {
  return state.entries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
}

function renderSummary() {
  const total = totalCalories();
  const ratio = Math.min(1.25, total / Math.max(1, state.dailyTarget));
  ui.todayLabel.textContent = prettyDate(new Date());
  ui.todayTotal.textContent = `${total} kcal`;
  ui.targetText.textContent = `${total} / ${state.dailyTarget} kcal`;
  ui.progressBar.style.width = `${Math.min(100, ratio * 100)}%`;
}

function renderHistory() {
  const sorted = [...state.entries].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  ui.entryCount.textContent = `${sorted.length} ${sorted.length === 1 ? 'entry' : 'entries'}`;
  ui.historyList.innerHTML = '';

  if (!sorted.length) {
    ui.historyList.innerHTML = '<p class="muted">No entries yet. Start with Step 1 above.</p>';
    return;
  }

  sorted.forEach((entry) => {
    const node = document.createElement('article');
    node.className = 'history-item';
    node.innerHTML = `
      <div>
        <p class="item-kcal">${Number(entry.calories) || 0} kcal</p>
        <p>${sanitize(describeEntry(entry))}</p>
        <p class="item-meta">${sanitize(formatTime(entry.createdAt))}</p>
      </div>
      <div class="item-actions">
        <button type="button" class="icon-btn" data-action="edit" data-id="${entry.id}" aria-label="Edit">✎</button>
        <button type="button" class="icon-btn delete-btn" data-action="delete" data-id="${entry.id}" aria-label="Delete">🗑</button>
      </div>
    `;
    ui.historyList.appendChild(node);
  });
}

function showToast(message, withUndo = false) {
  ui.toastText.textContent = message;
  ui.undoBtn.hidden = !withUndo;
  ui.toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), TOAST_MS);
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('calorie-flow-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('calorie-flow-theme');
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
    return;
  }
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

async function refresh() {
  await store.loadAll();
  renderSummary();
  renderHistory();
}

async function saveChoice(foodId, sizeId) {
  const food = findFood(foodId);
  const size = findSize(sizeId);
  await store.addEntry({
    foodId,
    foodName: food.name,
    foodEmoji: food.emoji,
    sizeId,
    sizeName: size.name,
    calories: estimateCalories(foodId, sizeId)
  });
  await refresh();
  showToast('Saved');
}

function openEdit(entry) {
  state.edit.id = entry.id;
  state.edit.foodId = entry.foodId;
  state.edit.sizeId = entry.sizeId;
  renderFoodGrid(ui.editFoodGrid, state.edit.foodId, true);
  renderSizeGrid(ui.editSizeGrid, state.edit.sizeId);
  ui.editPreview.textContent = `${estimateCalories(state.edit.foodId, state.edit.sizeId)} kcal`;
  ui.editDialog.showModal();
}

function updateEditPreview() {
  ui.editPreview.textContent = `${estimateCalories(state.edit.foodId, state.edit.sizeId)} kcal`;
}

async function initFirebase() {
  const module = await import('./firebase-config.js');
  if (!module.FIREBASE_CONFIG?.projectId) {
    throw new Error('Set FIREBASE_CONFIG in firebase-config.js');
  }
  const app = initializeApp(module.FIREBASE_CONFIG);
  state.db = getFirestore(app);
}

function bindEvents() {
  ui.foodGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-food-id]');
    if (!btn) return;
    state.selectedFoodId = btn.dataset.foodId;
    showStep('size');
  });

  ui.sizeGrid.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-size-id]');
    if (!btn || !state.selectedFoodId) return;
    await saveChoice(state.selectedFoodId, btn.dataset.sizeId);
    showStep('food');
  });

  ui.backToFoodBtn.addEventListener('click', () => showStep('food'));

  ui.historyList.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const entry = state.entries.find((e) => e.id === btn.dataset.id);
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

  ui.editFoodGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-food-id]');
    if (!btn) return;
    state.edit.foodId = btn.dataset.foodId;
    renderFoodGrid(ui.editFoodGrid, state.edit.foodId, true);
    updateEditPreview();
  });

  ui.editSizeGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-size-id]');
    if (!btn) return;
    state.edit.sizeId = btn.dataset.sizeId;
    renderSizeGrid(ui.editSizeGrid, state.edit.sizeId);
    updateEditPreview();
  });

  ui.editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const food = findFood(state.edit.foodId);
    const size = findSize(state.edit.sizeId);
    await store.updateEntry(state.edit.id, {
      foodId: food.id,
      foodName: food.name,
      foodEmoji: food.emoji,
      sizeId: size.id,
      sizeName: size.name,
      calories: estimateCalories(food.id, size.id)
    });
    ui.editDialog.close();
    await refresh();
    showToast('Updated');
  });

  ui.cancelEditBtn.addEventListener('click', () => ui.editDialog.close());

  document.querySelectorAll('[data-target-adjust]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const delta = Number(btn.dataset.targetAdjust);
      const nextTarget = Math.max(900, state.dailyTarget + delta);
      await store.saveTarget(nextTarget);
      renderSummary();
      showToast('Target updated');
    });
  });

  ui.themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });
}

async function boot() {
  initTheme();
  renderFoodGrid(ui.foodGrid);
  renderSizeGrid(ui.sizeGrid);
  showStep('food');
  bindEvents();

  try {
    await initFirebase();
    await refresh();
  } catch (error) {
    console.error(error);
    ui.historyList.innerHTML = '<p class="muted">Firebase setup required. Add firebase-config.js from template.</p>';
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

boot();
