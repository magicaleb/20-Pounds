const STORAGE_KEY = "calorieQuickLog.v1";
const UNDO_MS = 5000;
const CIRC = 2 * Math.PI * 80; // ≈ 502.65
const defaults = { target: 2200, entries: [] };
const types = ["Breakfast", "Lunch", "Dinner", "Snack", "Drinks"];

const categories = [
  { id: "breakfast", name: "Breakfast", color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)" },
  { id: "fast",      name: "Fast food",  color: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#f97316)" },
  { id: "bread",     name: "Bread",      color: "#f97316", grad: "linear-gradient(135deg,#f97316,#eab308)" },
  { id: "bowl",      name: "Bowl",       color: "#06b6d4", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { id: "protein",   name: "Protein",    color: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)" },
  { id: "snack",     name: "Snack",      color: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
  { id: "sweet",     name: "Sweet",      color: "#ec4899", grad: "linear-gradient(135deg,#ec4899,#ff4d6d)" },
  { id: "drinks",    name: "Drinks",     color: "#0ea5e9", grad: "linear-gradient(135deg,#0ea5e9,#6366f1)" }
];

const typeColors = { Breakfast:"#f59e0b", Lunch:"#10b981", Dinner:"#7c3aed", Snack:"#8b5cf6", Drinks:"#0ea5e9" };

const foods = [
  // Breakfast
  { name:"Eggs (2, scrambled)", cal:200, cats:["breakfast","protein"] },
  { name:"Pancakes (3 medium)", cal:520, cats:["breakfast","sweet","bread"] },
  { name:"Cereal with milk",    cal:300, cats:["breakfast"] },
  { name:"Bagel with cream cheese", cal:450, cats:["breakfast","bread"] },
  { name:"Greek yogurt (cup)", cal:150, cats:["breakfast","snack","protein"] },
  { name:"Toast with butter (2 slices)", cal:250, cats:["breakfast","bread"] },
  { name:"Oatmeal (bowl)", cal:350, cats:["breakfast"] },
  // Fast food
  { name:"Cheeseburger",        cal:650, cats:["fast","bread","protein"] },
  { name:"Hotdog and fries",    cal:740, cats:["fast"] },
  { name:"Chicken sandwich",    cal:560, cats:["fast","protein","bread"] },
  { name:"French fries (medium)", cal:380, cats:["fast","snack"] },
  { name:"Pizza (1 slice)",     cal:300, cats:["fast","bread"] },
  { name:"Pizza (2 slices)",    cal:600, cats:["fast","bread"] },
  { name:"Tacos (2)",           cal:480, cats:["fast","protein"] },
  { name:"Chicken nuggets (6-pc)", cal:280, cats:["fast","protein"] },
  // Bread
  { name:"Sandwich (deli)",     cal:420, cats:["bread","protein"] },
  { name:"Spaghetti",           cal:600, cats:["bread","bowl"] },
  { name:"Donut",               cal:350, cats:["sweet","bread"] },
  // Bowl
  { name:"Burrito",             cal:720, cats:["bowl","bread","protein"] },
  { name:"Rice bowl",           cal:500, cats:["bowl"] },
  { name:"Big salad (with dressing)", cal:400, cats:["bowl"] },
  { name:"White rice (1 cup cooked)", cal:200, cats:["bowl","bread"] },
  // Protein
  { name:"Chicken breast",      cal:280, cats:["protein"] },
  { name:"Steak (8 oz)",        cal:500, cats:["protein"] },
  { name:"Salmon fillet",       cal:350, cats:["protein"] },
  { name:"Protein bar",         cal:220, cats:["protein","snack"] },
  { name:"Shrimp (4 oz)",       cal:120, cats:["protein"] },
  // Snack
  { name:"Chips (snack bag)",   cal:300, cats:["snack"] },
  { name:"Nuts (handful)",      cal:170, cats:["snack","protein"] },
  { name:"Apple",               cal:80,  cats:["snack"] },
  { name:"Banana",              cal:110, cats:["snack"] },
  { name:"Cookies (3-4)",       cal:250, cats:["snack","sweet"] },
  // Sweet
  { name:"Twix bar",            cal:250, cats:["sweet","snack"] },
  { name:"Ice cream (2 scoops)",cal:300, cats:["sweet"] },
  { name:"Chocolate bar",       cal:230, cats:["sweet","snack"] },
  // Drinks
  { name:"Coffee (black)",      cal:5,   cats:["drinks"] },
  { name:"Coffee with cream & sugar", cal:80, cats:["drinks"] },
  { name:"Latte (medium)",      cal:250, cats:["drinks"] },
  { name:"Beer (regular can)",  cal:150, cats:["drinks"] },
  { name:"Wine (glass)",        cal:130, cats:["drinks"] },
  { name:"Cocktail (mixed)",    cal:200, cats:["drinks"] },
  { name:"Orange juice (glass)",cal:110, cats:["drinks"] },
  { name:"Soda (can)",          cal:140, cats:["drinks"] },
  { name:"Protein shake",       cal:200, cats:["drinks","protein"] },
  // Big meals
  { name:"Restaurant entree",   cal:900, cats:["fast","protein","bowl"] }
];

const portionOptions = [
  { name:"Less",  hint:"~¾",     multiplier:.75 },
  { name:"Same",  hint:"~1×",    multiplier:1   },
  { name:"More",  hint:"~1¼×",   multiplier:1.25},
  { name:"A lot", hint:"~1½×",   multiplier:1.6 }
];

/* ── State ── */
const state = {
  data: loadData(),
  query: "",
  sheetFood: null,
  sheetPortion: portionOptions[1],
  sheetAdjust: 0,
  editingId: null,
  lastDeleted: null,
  showAll: false,
  toastTimer: null,
  _triggerEl: null
};

const els = Object.fromEntries([...document.querySelectorAll('[id]')].map(n => [n.id, n]));

/* ── Inject SVG gradients ── */
(function injectGradients() {
  const svg = document.querySelector('.ring-svg');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff4d6d"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="overGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>`;
  svg.prepend(defs);
})();

/* ── Utilities ── */
function cloneDefaults() { return { target: defaults.target, entries: [] }; }
function makeId() { return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function todayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function dayKey(daysAgo) { return todayKey(new Date(Date.now() - daysAgo * 86400000)); }
function formatDate(dateKey) {
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  const [, m, d] = dateKey.split('-');
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${parseInt(d)}`;
}
function inferType(hour) {
  if (hour < 10) return "Breakfast";
  if (hour < 14) return "Lunch";
  if (hour < 18) return "Snack";
  if (hour < 21) return "Dinner";
  return "Snack";
}
function loadData() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!s || typeof s !== "object") return cloneDefaults();
    return { target: Math.max(1, Math.round(Number(s.target || defaults.target))), entries: Array.isArray(s.entries) ? s.entries : [] };
  } catch { return cloneDefaults(); }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ target: state.data.target, entries: state.data.entries })); }
const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x !== undefined) n.textContent = x; return n; };

/* ── Time-aware food suggestions ── */
function suggestedFoods() {
  const hour = new Date().getHours();
  let primary, secondary;
  if      (hour >= 5  && hour < 11) { primary = "breakfast"; secondary = "protein"; }
  else if (hour >= 11 && hour < 15) { primary = "bowl";      secondary = "fast";    }
  else if (hour >= 15 && hour < 18) { primary = "snack";     secondary = "drinks";  }
  else if (hour >= 18 && hour < 23) { primary = "protein";   secondary = "fast";    }
  else                               { primary = "drinks";    secondary = "snack";   }

  // Collect primary cat foods first, then secondary, then rest
  const seen = new Set();
  const result = [];
  for (const catId of [primary, secondary]) {
    for (const f of foods) {
      if (!seen.has(f.name) && f.cats.includes(catId)) {
        seen.add(f.name);
        result.push(f);
      }
    }
  }
  // Fill up to 8 from remaining
  for (const f of foods) {
    if (result.length >= 8) break;
    if (!seen.has(f.name)) { seen.add(f.name); result.push(f); }
  }
  return result.slice(0, 8);
}

/* ── Calorie ring ── */
function updateRing() {
  const today = todayKey();
  const total = state.data.entries.filter(e => e.dateKey === today).reduce((s, e) => s + e.calories, 0);
  const target = state.data.target;
  const pct = Math.min(1, total / target);
  const offset = CIRC * (1 - pct);
  els.ringFill.style.strokeDashoffset = offset;
  els.ringFill.classList.toggle('over', total > target);
  const remaining = target - total;
  els.ringNum.textContent = Math.abs(remaining).toLocaleString();
  els.ringLbl.textContent = remaining >= 0 ? 'left today' : 'over!';
}

/* ── Page / tab ── */
function setPage(page) {
  const d = page === 'dashboard';
  els.entryPage.classList.toggle('active', !d);
  els.dashboardPage.classList.toggle('active', d);
  els.entryTab.classList.toggle('active', !d);
  els.dashboardTab.classList.toggle('active', d);
  if (d) renderDashboard();
}

/* ── Food grid (suggestions or search results) ── */
function renderFoodGrid() {
  els.foodGrid.replaceChildren();
  const q = state.query.trim().toLowerCase();

  if (q) {
    // Search results as list rows
    const matches = foods.filter(f => f.name.toLowerCase().includes(q));
    if (!matches.length) {
      const m = el('div', 'empty-state', 'No matches found.');
      m.setAttribute('role', 'status');
      els.foodGrid.appendChild(m);
      return;
    }
    matches.forEach(f => {
      const b = el('button', 'food-result');
      b.type = 'button';
      b.append(el('span', 'result-name', f.name), el('span', 'result-cal', String(f.cal)));
      b.onclick = () => openSheet(f);
      els.foodGrid.appendChild(b);
    });
  } else {
    // Time-aware tile suggestions
    const suggested = suggestedFoods();
    suggested.forEach(f => {
      const cat = categories.find(c => f.cats.includes(c.id)) || categories[0];
      const b = el('button', 'food-tile');
      b.type = 'button';
      b.style.background = `${cat.color}18`;
      b.style.borderColor = `${cat.color}44`;
      const name = el('div', 'tile-name', f.name);
      name.style.color = cat.color;
      const cal = el('div', 'tile-cal', `${f.cal} cal`);
      cal.style.color = cat.color;
      b.append(name, cal);
      b.onclick = () => openSheet(f);
      els.foodGrid.appendChild(b);
    });
  }
}

/* ── Bottom sheet (portion picker) ── */
function sheetCalories() {
  if (!state.sheetFood) return 0;
  return Math.max(0, Math.round((state.sheetFood.cal * state.sheetPortion.multiplier + state.sheetAdjust) / 25) * 25);
}

function updateSheet() {
  els.sheetCal.textContent = sheetCalories().toLocaleString();
  els.sheetPortions.replaceChildren();
  portionOptions.forEach(o => {
    const b = el('button', 'portion-btn' + (state.sheetPortion === o ? ' active' : ''));
    b.type = 'button';
    b.append(el('span', '', o.name), el('small', '', o.hint));
    b.onclick = () => { state.sheetPortion = o; updateSheet(); };
    els.sheetPortions.appendChild(b);
  });
}

function openSheet(food) {
  state.sheetFood = food;
  state.sheetPortion = portionOptions[1]; // default: Same
  state.sheetAdjust = 0;
  els.sheetName.textContent = food.name;
  updateSheet();
  els.sheetOverlay.classList.add('open');
  setTimeout(() => els.sheetLogBtn.focus(), 80);
}

function closeSheet() {
  els.sheetOverlay.classList.remove('open');
  state.sheetFood = null;
}

function logFromSheet() {
  const calories = sheetCalories();
  if (!state.sheetFood || !calories) return;
  const now = new Date();
  state.data.entries.push({
    id: makeId(),
    calories,
    type: inferType(now.getHours()),
    food: state.sheetFood.name,
    note: '',
    portion: state.sheetPortion.name,
    createdAt: now.toISOString(),
    dateKey: todayKey(now)
  });
  saveData();
  closeSheet();
  updateRing();
  showToast(`✓ ${calories.toLocaleString()} cal logged`);
}

/* ── Dashboard ── */
function renderWeekChart() {
  els.weekRow.replaceChildren();
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const today = new Date();
  const target = state.data.target;
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = todayKey(date);
    const total = state.data.entries.filter(e => e.dateKey === key).reduce((s, e) => s + e.calories, 0);
    const isToday = (i === 0);
    const dayDiv = el('div', 'week-day');
    dayDiv.appendChild(el('div', 'week-lbl', days[date.getDay()]));
    let dotClass = 'week-dot';
    if (total === 0) dotClass += ' empty';
    else if (total > target) dotClass += ' over';
    else if (total > target * 0.9) dotClass += ' near';
    else dotClass += ' under';
    if (isToday) dotClass += ' today';
    const dot = el('div', dotClass, total > 0 ? (total >= 1000 ? `${Math.round(total/100)/10}k` : String(total)) : '');
    dayDiv.appendChild(dot);
    els.weekRow.appendChild(dayDiv);
  }
}

function renderDashboard() {
  const today = todayKey();
  const todayEntries = state.data.entries.filter(e => e.dateKey === today);
  const total = todayEntries.reduce((s, e) => s + e.calories, 0);
  const target = state.data.target;
  els.targetInput.value = target;
  renderWeekChart();
  updateRing();

  // History
  const all = [...state.data.entries].reverse();
  const shown = state.showAll ? all : all.slice(0, 15);
  els.historyList.replaceChildren();
  if (!all.length) {
    els.entryCount.textContent = 'Nothing logged yet';
  } else {
    const remaining = target - total;
    els.entryCount.textContent = remaining >= 0
      ? `${total.toLocaleString()} of ${target.toLocaleString()} cal today`
      : `${Math.abs(remaining).toLocaleString()} cal over today`;
    shown.forEach(entry => {
      const div = el('div', 'entry');
      div.style.borderLeftColor = typeColors[entry.type] || '#8b5cf6';
      const info = el('div', '');
      info.append(
        el('div', 'entry-name', entry.food || 'Entry'),
        el('div', 'entry-meta', `${entry.type} · ${formatDate(entry.dateKey)}${entry.note ? ' · ' + entry.note : ''}`)
      );
      div.append(info, el('div', 'entry-cal', entry.calories.toLocaleString()));
      div.onclick = () => openModal(entry.id);
      els.historyList.appendChild(div);
    });
  }
  els.showAllButton.style.display = all.length > 15 ? '' : 'none';
  els.showAllButton.textContent = state.showAll ? 'Show less' : 'Show all';
}

/* ── Modal (edit / custom entry) ── */
function populateTypeSelect(selectedType) {
  els.modalType.innerHTML = '';
  types.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t; o.selected = t === selectedType;
    els.modalType.appendChild(o);
  });
}
function openModal(id) {
  const entry = state.data.entries.find(e => e.id === id);
  if (!entry) return;
  state._triggerEl = document.activeElement;
  state.editingId = id;
  els.modalTitle.textContent = 'Edit entry';
  els.modalCalories.value = entry.calories;
  els.modalFood.value = entry.food || '';
  els.modalNote.value = entry.note || '';
  populateTypeSelect(entry.type);
  els.deleteEntryButton.style.display = '';
  els.entryModal.classList.add('open');
  setTimeout(() => els.modalCalories.focus(), 50);
}
function openCustomModal() {
  state._triggerEl = document.activeElement;
  state.editingId = null;
  els.modalTitle.textContent = 'Custom entry';
  els.modalCalories.value = '';
  els.modalFood.value = '';
  els.modalNote.value = '';
  populateTypeSelect(inferType(new Date().getHours()));
  els.deleteEntryButton.style.display = 'none';
  els.entryModal.classList.add('open');
  setTimeout(() => els.modalCalories.focus(), 50);
}
function closeModal() {
  els.entryModal.classList.remove('open');
  state.editingId = null;
  if (state._triggerEl && typeof state._triggerEl.focus === 'function') state._triggerEl.focus();
  state._triggerEl = null;
}
function saveModal() {
  const calories = Math.max(0, Math.min(5000, Math.round(Number(els.modalCalories.value) || 0)));
  if (!calories) return;
  if (state.editingId) {
    const entry = state.data.entries.find(e => e.id === state.editingId);
    if (entry) {
      entry.calories = calories;
      entry.food = els.modalFood.value.trim() || entry.food;
      entry.note = els.modalNote.value.trim();
      entry.type = els.modalType.value;
    }
    showToast('Entry updated');
  } else {
    const now = new Date();
    state.data.entries.push({
      id: makeId(),
      calories,
      type: els.modalType.value,
      food: els.modalFood.value.trim() || 'Custom',
      note: els.modalNote.value.trim(),
      portion: 'Custom',
      createdAt: now.toISOString(),
      dateKey: todayKey(now)
    });
    showToast(`✓ ${calories.toLocaleString()} cal logged`);
  }
  saveData();
  closeModal();
  renderDashboard();
}
function deleteEntry() {
  const idx = state.data.entries.findIndex(e => e.id === state.editingId);
  if (idx < 0) return;
  state.lastDeleted = { entry: state.data.entries[idx], index: idx };
  state.data.entries.splice(idx, 1);
  saveData();
  closeModal();
  renderDashboard();
  showToast('Entry deleted', true);
}
function undoDelete() {
  if (!state.lastDeleted) return;
  state.data.entries.splice(state.lastDeleted.index, 0, state.lastDeleted.entry);
  state.lastDeleted = null;
  saveData();
  renderDashboard();
  els.toast.classList.remove('open');
  clearTimeout(state.toastTimer);
}

/* ── Toast ── */
function showToast(msg, canUndo = false) {
  clearTimeout(state.toastTimer);
  els.toastText.textContent = msg;
  els.undoButton.style.display = canUndo ? '' : 'none';
  els.toast.classList.add('open');
  state.toastTimer = setTimeout(() => els.toast.classList.remove('open'), UNDO_MS);
}

/* ── Export ── */
function exportData() {
  const csv = ["date,food,calories,type,portion,note",
    ...state.data.entries.map(e =>
      [e.dateKey, `"${(e.food||'').replace(/"/g,'""')}"`, e.calories, e.type, e.portion||'', `"${(e.note||'').replace(/"/g,'""')}"`].join(',')
    )
  ].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = `calories-${todayKey()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ── Bind ── */
function bind() {
  els.entryTab.onclick    = () => setPage('entry');
  els.dashboardTab.onclick = () => setPage('dashboard');

  // Search
  els.foodSearch.oninput = () => { state.query = els.foodSearch.value; renderFoodGrid(); };

  // Sheet nudge buttons
  document.querySelectorAll('.nudge').forEach(btn =>
    btn.onclick = () => { state.sheetAdjust += Number(btn.dataset.adjust); updateSheet(); }
  );
  els.sheetLogBtn.onclick = logFromSheet;
  els.sheetOverlay.onclick = e => { if (e.target === els.sheetOverlay) closeSheet(); };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (els.sheetOverlay.classList.contains('open')) closeSheet();
      if (els.entryModal.classList.contains('open')) closeModal();
    }
  });

  // Dashboard controls
  els.saveTargetButton.onclick = () => {
    const t = Math.max(500, Math.min(10000, Math.round(Number(els.targetInput.value) || defaults.target)));
    state.data.target = t;
    saveData();
    renderDashboard();
    showToast('Goal saved!');
  };
  els.customButton.onclick = openCustomModal;
  els.exportButton.onclick = exportData;
  els.clearOldButton.onclick = () => {
    if (!confirm('Clear all entries from before today?')) return;
    const today = todayKey();
    const removed = state.data.entries.filter(e => e.dateKey !== today).length;
    state.data.entries = state.data.entries.filter(e => e.dateKey === today);
    saveData();
    renderDashboard();
    showToast(`Cleared ${removed} old entr${removed===1?'y':'ies'}`);
  };
  els.showAllButton.onclick = () => { state.showAll = !state.showAll; renderDashboard(); };

  // Modal
  els.closeModalButton.onclick = closeModal;
  els.saveEntryButton.onclick  = saveModal;
  els.deleteEntryButton.onclick = deleteEntry;
  els.entryModal.onclick = e => { if (e.target === els.entryModal) closeModal(); };

  // Undo toast
  els.undoButton.onclick = undoDelete;
}

bind();
renderFoodGrid();
updateRing();
