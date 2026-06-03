const DEFAULT_FOOD_COLOR = '#7c3aed';

const FOOD_DB = [
  // ── Breakfast ────────────────────────────────────────────────────
  { id: 'eggs_toast',         name: 'Eggs & toast',         emoji: '🍳', baseCalories: 380,  color: '#d97706' },
  { id: 'pancakes',           name: 'Pancakes',             emoji: '🥞', baseCalories: 480,  color: '#d97706' },
  { id: 'waffles',            name: 'Waffles',              emoji: '🧇', baseCalories: 530,  color: '#d97706' },
  { id: 'bagel',              name: 'Bagel & cream cheese', emoji: '🥯', baseCalories: 420,  color: '#d97706' },
  { id: 'yogurt_granola',     name: 'Yogurt + granola',     emoji: '🥛', baseCalories: 360,  color: '#0d9488' },
  { id: 'oatmeal',            name: 'Oatmeal bowl',         emoji: '🥣', baseCalories: 310,  color: '#16a34a' },
  { id: 'breakfast_sandwich', name: 'Breakfast sandwich',   emoji: '🥪', baseCalories: 430,  color: '#d97706' },
  { id: 'avocado_toast',      name: 'Avocado toast',        emoji: '🥑', baseCalories: 350,  color: '#16a34a' },

  // ── Salads & Bowls ────────────────────────────────────────────────
  { id: 'chicken_salad',      name: 'Chicken salad',        emoji: '🥗', baseCalories: 460,  color: '#0d9488' },
  { id: 'caesar_salad',       name: 'Caesar salad',         emoji: '🥬', baseCalories: 360,  color: '#0d9488' },
  { id: 'greek_salad',        name: 'Greek salad',          emoji: '🫒', baseCalories: 300,  color: '#16a34a' },
  { id: 'caprese',            name: 'Caprese salad',        emoji: '🍅', baseCalories: 250,  color: '#dc2626' },
  { id: 'veggie_bowl',        name: 'Veggie bowl',          emoji: '🥦', baseCalories: 340,  color: '#0d9488' },
  { id: 'fruit_nuts',         name: 'Fruit + nuts',         emoji: '🍎', baseCalories: 280,  color: '#16a34a' },
  { id: 'sushi_rolls',        name: 'Sushi rolls',          emoji: '🍣', baseCalories: 480,  color: '#4f46e5' },
  { id: 'poke_bowl',          name: 'Poke bowl',            emoji: '🍱', baseCalories: 540,  color: '#4f46e5' },

  // ── Rice & Grains ─────────────────────────────────────────────────
  { id: 'rice_bowl',          name: 'Rice bowl',            emoji: '🍚', baseCalories: 520,  color: '#d97706' },
  { id: 'stir_fry',           name: 'Stir fry',             emoji: '🥡', baseCalories: 600,  color: '#0d9488' },
  { id: 'fried_rice',         name: 'Fried rice',           emoji: '🥘', baseCalories: 560,  color: '#d97706' },
  { id: 'grain_bowl',         name: 'Grain bowl',           emoji: '🌾', baseCalories: 430,  color: '#16a34a' },
  { id: 'congee',             name: 'Congee',               emoji: '🍲', baseCalories: 280,  color: '#0d9488' },
  { id: 'bibimbap',           name: 'Bibimbap',             emoji: '🥗', baseCalories: 590,  color: '#dc2626' },
  { id: 'paella',             name: 'Paella',               emoji: '🫕', baseCalories: 620,  color: '#d97706' },
  { id: 'dal_rice',           name: 'Dal & rice',           emoji: '🍛', baseCalories: 480,  color: '#ea580c' },

  // ── Pasta & Noodles ───────────────────────────────────────────────
  { id: 'pasta_plate',        name: 'Pasta marinara',       emoji: '🍝', baseCalories: 580,  color: '#ea580c' },
  { id: 'mac_cheese',         name: 'Mac & cheese',         emoji: '🧀', baseCalories: 580,  color: '#d97706' },
  { id: 'lasagna',            name: 'Lasagna',              emoji: '🫙', baseCalories: 720,  color: '#ea580c' },
  { id: 'ramen',              name: 'Ramen',                emoji: '🍜', baseCalories: 680,  color: '#dc2626' },
  { id: 'pad_thai',           name: 'Pad thai',             emoji: '🥢', baseCalories: 600,  color: '#d97706' },
  { id: 'udon',               name: 'Udon noodles',         emoji: '🍲', baseCalories: 520,  color: '#4f46e5' },
  { id: 'soba',               name: 'Soba noodles',         emoji: '🍱', baseCalories: 420,  color: '#0d9488' },
  { id: 'lo_mein',            name: 'Lo mein',              emoji: '🥡', baseCalories: 560,  color: '#d97706' },

  // ── Mains ─────────────────────────────────────────────────────────
  { id: 'burger_fries',       name: 'Burger + fries',       emoji: '🍔', baseCalories: 860,  color: '#dc2626' },
  { id: 'pizza_slice',        name: 'Pizza',                emoji: '🍕', baseCalories: 320,  color: '#db2777' },
  { id: 'steak_potatoes',     name: 'Steak + potatoes',     emoji: '🥩', baseCalories: 760,  color: '#dc2626' },
  { id: 'fried_chicken',      name: 'Fried chicken',        emoji: '🍗', baseCalories: 700,  color: '#d97706' },
  { id: 'bbq_ribs',           name: 'BBQ ribs',             emoji: '🍖', baseCalories: 820,  color: '#dc2626' },
  { id: 'fish_chips',         name: 'Fish & chips',         emoji: '🍟', baseCalories: 740,  color: '#2563eb' },
  { id: 'grilled_salmon',     name: 'Grilled salmon',       emoji: '🐟', baseCalories: 520,  color: '#2563eb' },
  { id: 'pork_chops',         name: 'Pork chops',           emoji: '🥓', baseCalories: 640,  color: '#d97706' },

  // ── Mexican ───────────────────────────────────────────────────────
  { id: 'tacos',              name: 'Tacos',                emoji: '🌮', baseCalories: 520,  color: '#d97706' },
  { id: 'burrito',            name: 'Burrito',              emoji: '🌯', baseCalories: 760,  color: '#ea580c' },
  { id: 'nachos',             name: 'Nachos',               emoji: '🧀', baseCalories: 560,  color: '#ea580c' },
  { id: 'quesadilla',         name: 'Quesadilla',           emoji: '🫓', baseCalories: 530,  color: '#d97706' },
  { id: 'enchiladas',         name: 'Enchiladas',           emoji: '🫕', baseCalories: 640,  color: '#ea580c' },
  { id: 'fajitas',            name: 'Fajitas',              emoji: '🌶️', baseCalories: 560,  color: '#dc2626' },
  { id: 'tamales',            name: 'Tamales',              emoji: '🫔', baseCalories: 490,  color: '#d97706' },
  { id: 'elote',              name: 'Elote',                emoji: '🌽', baseCalories: 310,  color: '#16a34a' },

  // ── Sandwiches ────────────────────────────────────────────────────
  { id: 'soup_sandwich',      name: 'Soup + sandwich',      emoji: '🥣', baseCalories: 540,  color: '#7c3aed' },
  { id: 'hot_dog',            name: 'Hot dog',              emoji: '🌭', baseCalories: 380,  color: '#dc2626' },
  { id: 'club_sandwich',      name: 'Club sandwich',        emoji: '🥪', baseCalories: 520,  color: '#0d9488' },
  { id: 'tuna_melt',          name: 'Tuna melt',            emoji: '🐟', baseCalories: 480,  color: '#2563eb' },
  { id: 'blt',                name: 'BLT',                  emoji: '🥓', baseCalories: 440,  color: '#dc2626' },
  { id: 'philly',             name: 'Philly cheesesteak',   emoji: '🥖', baseCalories: 660,  color: '#d97706' },
  { id: 'grilled_cheese',     name: 'Grilled cheese',       emoji: '🧀', baseCalories: 480,  color: '#d97706' },
  { id: 'sub_sandwich',       name: 'Italian sub',          emoji: '🥙', baseCalories: 580,  color: '#ea580c' },

  // ── Snacks & Sweets ───────────────────────────────────────────────
  { id: 'chips_crackers',     name: 'Chips & crackers',     emoji: '🥨', baseCalories: 220,  color: '#db2777' },
  { id: 'dessert',            name: 'Cake slice',           emoji: '🍰', baseCalories: 390,  color: '#db2777' },
  { id: 'ice_cream',          name: 'Ice cream',            emoji: '🍨', baseCalories: 320,  color: '#7c3aed' },
  { id: 'brownie',            name: 'Brownie',              emoji: '🍫', baseCalories: 380,  color: '#7c3aed' },
  { id: 'cookie',             name: 'Cookies',              emoji: '🍪', baseCalories: 320,  color: '#d97706' },
  { id: 'muffin',             name: 'Muffin',               emoji: '🧁', baseCalories: 380,  color: '#db2777' },
  { id: 'donut',              name: 'Donut',                emoji: '🍩', baseCalories: 350,  color: '#db2777' },
  { id: 'popcorn',            name: 'Popcorn',              emoji: '🍿', baseCalories: 380,  color: '#d97706' },

  // ── Legacy (kept for backward-compat with saved entries) ──────────
  { id: 'protein_shake',      name: 'Protein shake',        emoji: '🥤', baseCalories: 250,  color: '#2563eb' },
  { id: 'latte_sweet',        name: 'Sweet latte',          emoji: '☕', baseCalories: 240,  color: '#d97706' }
];

const SIZE_OPTIONS = [
  { id: 'tiny',    name: 'Tiny',       ratio: 0.5,  cue: 'A few bites / half snack' },
  { id: 'small',   name: 'Small',      ratio: 0.75, cue: 'Palm size / light plate' },
  { id: 'regular', name: 'Regular',    ratio: 1,    cue: 'Standard meal / one plate' },
  { id: 'large',   name: 'Large',      ratio: 1.35, cue: 'Heaped plate / takeout box' },
  { id: 'xlarge',  name: 'Very large', ratio: 1.75, cue: 'Two plates / very filling' }
];

const CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast',       emoji: '🌅', foodIds: ['eggs_toast', 'pancakes', 'waffles', 'bagel', 'yogurt_granola', 'oatmeal', 'breakfast_sandwich', 'avocado_toast'] },
  { id: 'salads',    name: 'Salads & Bowls',  emoji: '🥗', foodIds: ['chicken_salad', 'caesar_salad', 'greek_salad', 'caprese', 'veggie_bowl', 'fruit_nuts', 'sushi_rolls', 'poke_bowl'] },
  { id: 'rice',      name: 'Rice & Grains',   emoji: '🍚', foodIds: ['rice_bowl', 'stir_fry', 'fried_rice', 'grain_bowl', 'congee', 'bibimbap', 'paella', 'dal_rice'] },
  { id: 'pasta',     name: 'Pasta & Noodles', emoji: '🍝', foodIds: ['pasta_plate', 'mac_cheese', 'lasagna', 'ramen', 'pad_thai', 'udon', 'soba', 'lo_mein'] },
  { id: 'mains',     name: 'Mains',           emoji: '🍔', foodIds: ['burger_fries', 'pizza_slice', 'steak_potatoes', 'fried_chicken', 'bbq_ribs', 'fish_chips', 'grilled_salmon', 'pork_chops'] },
  { id: 'mexican',   name: 'Mexican',          emoji: '🌮', foodIds: ['tacos', 'burrito', 'nachos', 'quesadilla', 'enchiladas', 'fajitas', 'tamales', 'elote'] },
  { id: 'sandwiches',name: 'Sandwiches',       emoji: '🥪', foodIds: ['soup_sandwich', 'hot_dog', 'club_sandwich', 'tuna_melt', 'blt', 'philly', 'grilled_cheese', 'sub_sandwich'] },
  { id: 'snacks',    name: 'Snacks & Sweets',  emoji: '🍰', foodIds: ['chips_crackers', 'dessert', 'ice_cream', 'brownie', 'cookie', 'muffin', 'donut', 'popcorn'] }
];

const DEFAULT_TARGET = 2000;
const TOAST_MS = 5200;
const STORAGE_KEY = 'calorieQuickLog.v1';

// ─── localStorage helpers ────────────────────────
function loadStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { entries: [], settings: {} }; }
  catch { return { entries: [], settings: {} }; }
}

function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const state = {
  todayKey: toDateKey(new Date()),
  dailyTarget: DEFAULT_TARGET,
  entries: [],
  selectedCatId: null,
  selectedFoodId: null,
  lastDeleted: null,
  toastTimer: null,
  edit: { id: null, foodId: null, sizeId: null }
};

const ui = {
  todayTotal:          document.getElementById('todayTotal'),
  targetText:          document.getElementById('targetText'),
  progressBar:         document.getElementById('progressBar'),
  themeBtn:            document.getElementById('themeBtn'),
  pip1:                document.getElementById('pip1'),
  pip2:                document.getElementById('pip2'),
  pip3:                document.getElementById('pip3'),
  wizardTitle:         document.getElementById('wizardTitle'),
  wizardHint:          document.getElementById('wizardHint'),
  stepCat:             document.getElementById('stepCat'),
  stepFood:            document.getElementById('stepFood'),
  stepSize:            document.getElementById('stepSize'),
  catGrid:             document.getElementById('catGrid'),
  foodGrid:            document.getElementById('foodGrid'),
  sizeGrid:            document.getElementById('sizeGrid'),
  selectedFoodPreview: document.getElementById('selectedFoodPreview'),
  backToCatBtn:        document.getElementById('backToCatBtn'),
  backToFoodBtn:       document.getElementById('backToFoodBtn'),
  historyList:         document.getElementById('historyList'),
  entryCount:          document.getElementById('entryCount'),
  toast:               document.getElementById('toast'),
  toastText:           document.getElementById('toastText'),
  undoBtn:             document.getElementById('undoBtn'),
  editDialog:          document.getElementById('editDialog'),
  editForm:            document.getElementById('editForm'),
  editFoodGrid:        document.getElementById('editFoodGrid'),
  editSizeGrid:        document.getElementById('editSizeGrid'),
  editPreview:         document.getElementById('editPreview'),
  cancelEditBtn:       document.getElementById('cancelEditBtn'),
  closeEditBtn:        document.getElementById('closeEditBtn')
};

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(ts) {
  const d = ts ? new Date(ts) : new Date();
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

const store = {
  loadAll() {
    const data = loadStorage();
    state.dailyTarget = Number(data.settings?.dailyTarget) || DEFAULT_TARGET;
    state.entries = (data.entries || []).filter((e) => e.entryDate === state.todayKey);
  },
  saveTarget(target) {
    const data = loadStorage();
    data.settings = { ...data.settings, dailyTarget: target };
    saveStorage(data);
    state.dailyTarget = target;
  },
  addEntry(payload) {
    const data = loadStorage();
    const entry = {
      id: crypto.randomUUID(),
      ...payload,
      entryDate: state.todayKey,
      createdAt: new Date().toISOString()
    };
    data.entries = [entry, ...(data.entries || [])];
    saveStorage(data);
    state.entries = data.entries.filter((e) => e.entryDate === state.todayKey);
  },
  updateEntry(id, payload) {
    const data = loadStorage();
    data.entries = (data.entries || []).map((e) =>
      e.id === id ? { ...e, ...payload, updatedAt: new Date().toISOString() } : e
    );
    saveStorage(data);
    state.entries = data.entries.filter((e) => e.entryDate === state.todayKey);
  },
  deleteEntry(id) {
    const data = loadStorage();
    data.entries = (data.entries || []).filter((e) => e.id !== id);
    saveStorage(data);
    state.entries = data.entries.filter((e) => e.entryDate === state.todayKey);
  },
  restoreEntry(entry) {
    const data = loadStorage();
    data.entries = [entry, ...(data.entries || []).filter((e) => e.id !== entry.id)];
    saveStorage(data);
    state.entries = data.entries.filter((e) => e.entryDate === state.todayKey);
  }
};

function renderCatGrid(root) {
  root.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    btn.dataset.catId = cat.id;
    btn.innerHTML = `<span class="cat-emoji" aria-hidden="true">${cat.emoji}</span><span class="cat-name">${cat.name}</span>`;
    root.appendChild(btn);
  });
}

function renderFoodGrid(root, activeId = null, foodIds = null) {
  root.innerHTML = '';
  const foods = foodIds ? FOOD_DB.filter((f) => foodIds.includes(f.id)) : FOOD_DB;
  const isCompact = root.classList.contains('compact-grid');
  foods.forEach((food) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `food-btn${food.id === activeId ? ' active' : ''}${isCompact ? ' compact' : ''}`;
    btn.dataset.foodId = food.id;
    btn.style.setProperty('--food-color', food.color || DEFAULT_FOOD_COLOR);
    btn.innerHTML = `<span class="food-emoji-wrap" aria-hidden="true">${food.emoji}</span><span class="food-name">${food.name}</span><small>~${food.baseCalories} kcal</small>`;
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
    btn.innerHTML = `<span class="size-dot" aria-hidden="true"></span><span class="size-label"><strong>${size.name}</strong><span>${size.cue}</span></span>`;
    root.appendChild(btn);
  });
}

function showStep(step) {
  ui.pip1.classList.toggle('active', step === 'cat');
  ui.pip2.classList.toggle('active', step === 'food');
  ui.pip3.classList.toggle('active', step === 'size');

  ui.stepCat.hidden  = step !== 'cat';
  ui.stepFood.hidden = step !== 'food';
  ui.stepSize.hidden = step !== 'size';

  if (step === 'cat') {
    ui.wizardTitle.textContent = 'What type of meal?';
    ui.wizardHint.textContent = 'Pick a category to narrow choices.';
    return;
  }

  if (step === 'food') {
    const cat = CATEGORIES.find((c) => c.id === state.selectedCatId);
    ui.wizardTitle.textContent = cat ? cat.name : 'What did you eat?';
    ui.wizardHint.textContent = 'Pick the closest option.';
    renderFoodGrid(ui.foodGrid, null, cat ? cat.foodIds : null);
    return;
  }

  const food = findFood(state.selectedFoodId);
  ui.wizardTitle.textContent = 'How much?';
  ui.wizardHint.textContent = 'Tap a size to log instantly.';
  ui.selectedFoodPreview.innerHTML = `<span class="food-emoji-wrap" style="--food-color:${food.color || DEFAULT_FOOD_COLOR}" aria-hidden="true">${food.emoji}</span><span>${food.name}</span>`;
}

function totalCalories() {
  return state.entries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
}

function renderSummary() {
  const total = totalCalories();
  const ratio = Math.min(1.25, total / Math.max(1, state.dailyTarget));
  ui.todayTotal.textContent = total;
  ui.targetText.textContent = state.dailyTarget;
  ui.progressBar.style.width = `${Math.min(100, ratio * 100)}%`;
}

function renderHistory() {
  const sorted = [...state.entries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
      <span class="item-emoji" aria-hidden="true">${sanitize(entry.foodEmoji || '🍽')}</span>
      <div class="item-body">
        <p class="item-label">${sanitize(entry.foodName || '')} · ${sanitize(entry.sizeName || '')}</p>
        <p class="item-meta">${sanitize(formatTime(entry.createdAt))}</p>
      </div>
      <span class="item-kcal-badge">${Number(entry.calories) || 0} kcal</span>
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

function refresh() {
  store.loadAll();
  renderSummary();
  renderHistory();
}

function saveChoice(foodId, sizeId) {
  const food = findFood(foodId);
  const size = findSize(sizeId);
  store.addEntry({
    foodId,
    foodName: food.name,
    foodEmoji: food.emoji,
    sizeId,
    sizeName: size.name,
    calories: estimateCalories(foodId, sizeId)
  });
  refresh();
  showToast('Saved');
}

function scrollActiveEditFoodIntoView() {
  requestAnimationFrame(() => {
    ui.editFoodGrid
      .querySelector('.food-btn.active')
      ?.scrollIntoView({ block: 'nearest' });
  });
}

function renderEditFoodGrid() {
  renderFoodGrid(ui.editFoodGrid, state.edit.foodId, null);
  scrollActiveEditFoodIntoView();
}

function openEdit(entry) {
  state.edit.id = entry.id;
  state.edit.foodId = entry.foodId;
  state.edit.sizeId = entry.sizeId;
  renderEditFoodGrid();
  renderSizeGrid(ui.editSizeGrid, state.edit.sizeId);
  ui.editPreview.textContent = `${estimateCalories(state.edit.foodId, state.edit.sizeId)} kcal`;
  ui.editDialog.showModal();
}

function updateEditPreview() {
  ui.editPreview.textContent = `${estimateCalories(state.edit.foodId, state.edit.sizeId)} kcal`;
}

function bindEvents() {
  ui.catGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-cat-id]');
    if (!btn) return;
    state.selectedCatId = btn.dataset.catId;
    showStep('food');
  });

  ui.foodGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-food-id]');
    if (!btn) return;
    state.selectedFoodId = btn.dataset.foodId;
    showStep('size');
  });

  ui.sizeGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-size-id]');
    if (!btn || !state.selectedFoodId) return;
    saveChoice(state.selectedFoodId, btn.dataset.sizeId);
    showStep('cat');
  });

  ui.backToCatBtn.addEventListener('click', () => showStep('cat'));
  ui.backToFoodBtn.addEventListener('click', () => showStep('food'));

  ui.historyList.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const entry = state.entries.find((e) => e.id === btn.dataset.id);
    if (!entry) return;

    if (btn.dataset.action === 'edit') {
      openEdit(entry);
      return;
    }

    state.lastDeleted = { ...entry };
    store.deleteEntry(entry.id);
    refresh();
    showToast('Deleted', true);
  });

  ui.undoBtn.addEventListener('click', () => {
    if (!state.lastDeleted) return;
    store.restoreEntry(state.lastDeleted);
    state.lastDeleted = null;
    refresh();
    showToast('Restored');
  });

  ui.editFoodGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-food-id]');
    if (!btn) return;
    state.edit.foodId = btn.dataset.foodId;
    renderEditFoodGrid();
    updateEditPreview();
  });

  ui.editSizeGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-size-id]');
    if (!btn) return;
    state.edit.sizeId = btn.dataset.sizeId;
    renderSizeGrid(ui.editSizeGrid, state.edit.sizeId);
    updateEditPreview();
  });

  ui.editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const food = findFood(state.edit.foodId);
    const size = findSize(state.edit.sizeId);
    store.updateEntry(state.edit.id, {
      foodId: food.id,
      foodName: food.name,
      foodEmoji: food.emoji,
      sizeId: size.id,
      sizeName: size.name,
      calories: estimateCalories(food.id, size.id)
    });
    ui.editDialog.close();
    refresh();
    showToast('Updated');
  });

  ui.cancelEditBtn.addEventListener('click', () => ui.editDialog.close());
  ui.closeEditBtn.addEventListener('click', () => ui.editDialog.close());

  ui.editDialog.addEventListener('click', (event) => {
    if (event.target === ui.editDialog) ui.editDialog.close();
  });

  document.querySelectorAll('[data-target-adjust]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.targetAdjust);
      const nextTarget = Math.max(900, state.dailyTarget + delta);
      store.saveTarget(nextTarget);
      renderSummary();
      showToast('Target updated');
    });
  });

  ui.themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });
}

function boot() {
  initTheme();
  renderCatGrid(ui.catGrid);
  renderSizeGrid(ui.sizeGrid);
  showStep('cat');
  bindEvents();
  refresh();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

boot();
