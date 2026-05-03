const STORAGE_KEY = "calorieQuickLog.v1";
const UNDO_MS = 5000;
const defaults = { target: 2200, entries: [] };
const types = ["Breakfast", "Lunch", "Dinner", "Snack", "Drinks"];

const categories = [
  { id: "breakfast", name: "Breakfast", hint: "eggs, cereal, pancakes", color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#f97316)" },
  { id: "fast",      name: "Fast food",  hint: "burgers, tacos, fries",  color: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#f97316)" },
  { id: "bread",     name: "Bread",      hint: "sandwiches, pizza, pasta",color: "#f97316", grad: "linear-gradient(135deg,#f97316,#eab308)" },
  { id: "bowl",      name: "Bowl",       hint: "rice, burritos, salads",  color: "#06b6d4", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { id: "protein",   name: "Protein",    hint: "meat, eggs, fish",        color: "#10b981", grad: "linear-gradient(135deg,#10b981,#06b6d4)" },
  { id: "snack",     name: "Snack",      hint: "chips, nuts, small items",color: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
  { id: "sweet",     name: "Sweet",      hint: "candy, cookies, dessert", color: "#ec4899", grad: "linear-gradient(135deg,#ec4899,#ff4d6d)" },
  { id: "drinks",    name: "Drinks",     hint: "coffee, alcohol, juice",  color: "#0ea5e9", grad: "linear-gradient(135deg,#0ea5e9,#6366f1)" }
];

const typeColors = { Breakfast:"#f59e0b", Lunch:"#10b981", Dinner:"#7c3aed", Snack:"#8b5cf6", Drinks:"#0ea5e9" };

const foods = [
  // Breakfast
  { name:"Eggs (2, scrambled)", cal:200, comps:["2 eggs in a pan","small fist-size when done","one side portion"], cats:["breakfast","protein"] },
  { name:"Pancakes (3 medium)", cal:520, comps:["3 palm-wide pancakes","short stack at a diner","breakfast plate"], cats:["breakfast","sweet","bread"] },
  { name:"Cereal with milk", cal:300, comps:["1 bowl","cereal box serving + milk"], cats:["breakfast"] },
  { name:"Bagel with cream cheese", cal:450, comps:["1 bagel + 2 tbsp cream cheese","hand-size ring"], cats:["breakfast","bread"] },
  { name:"Greek yogurt (cup)", cal:150, comps:["small single-serve cup","snack portion"], cats:["breakfast","snack","protein"] },
  { name:"Toast with butter (2 slices)", cal:250, comps:["2 slices of bread","hand-length pair"], cats:["breakfast","bread"] },
  { name:"Oatmeal (bowl)", cal:350, comps:["medium bowl","larger fist portion with toppings"], cats:["breakfast"] },
  // Fast food
  { name:"Cheeseburger", cal:650, comps:["1 full cheeseburger","two-fist sandwich"], cats:["fast","bread","protein"] },
  { name:"Hotdog and fries", cal:740, comps:["hotdog + medium fries","small combo tray","full paper plate"], cats:["fast"] },
  { name:"Chicken sandwich", cal:560, comps:["1 sandwich","hand-size fillet with bun"], cats:["fast","protein","bread"] },
  { name:"French fries (medium)", cal:380, comps:["medium fry carton","2 handfuls"], cats:["fast","snack"] },
  { name:"Pizza (1 slice)", cal:300, comps:["1 large slice","hand-length wedge","1/8 of a large pie"], cats:["fast","bread"] },
  { name:"Pizza (2 slices)", cal:600, comps:["2 large slices","a quarter pie","typical single order"], cats:["fast","bread"] },
  { name:"Tacos (2)", cal:480, comps:["2 street tacos","2 filled small tortillas"], cats:["fast","protein"] },
  { name:"Chicken nuggets (6-pc)", cal:280, comps:["6 nuggets","small fry-box full"], cats:["fast","protein"] },
  // Bread
  { name:"Sandwich (deli)", cal:420, comps:["full deli sandwich","two palm-slabs of bread + filling"], cats:["bread","protein"] },
  { name:"Spaghetti", cal:600, comps:["2 fists of cooked pasta","full plate mound","large cereal bowl"], cats:["bread","bowl"] },
  { name:"Donut", cal:350, comps:["1 glazed donut","round fist-size treat"], cats:["sweet","bread"] },
  // Bowl
  { name:"Burrito", cal:720, comps:["full wrapped burrito","forearm-length wrap","Chipotle size"], cats:["bowl","bread","protein"] },
  { name:"Rice bowl", cal:500, comps:["meal-prep bowl","restaurant grain bowl","moderate plate portion"], cats:["bowl"] },
  { name:"Big salad (with dressing)", cal:400, comps:["large salad bowl","restaurant side salad + croutons"], cats:["bowl"] },
  { name:"White rice (1 cup cooked)", cal:200, comps:["fist-size portion","side dish cup"], cats:["bowl","bread"] },
  // Protein
  { name:"Chicken breast", cal:280, comps:["palm-size breast","deck-of-cards thickness","medium fillet"], cats:["protein"] },
  { name:"Steak (8 oz)", cal:500, comps:["deck of cards × 2","restaurant medium steak","large hand-size cut"], cats:["protein"] },
  { name:"Salmon fillet", cal:350, comps:["hand-size fillet","restaurant portion","palm-thick piece"], cats:["protein"] },
  { name:"Protein bar", cal:220, comps:["1 bar","palm-length bar"], cats:["protein","snack"] },
  { name:"Shrimp (4 oz)", cal:120, comps:["small palm full","side portion"], cats:["protein"] },
  // Snack
  { name:"Chips (snack bag)", cal:300, comps:["2 handfuls","small bag","snack bowl"], cats:["snack"] },
  { name:"Nuts (handful)", cal:170, comps:["small handful","shot-glass worth","1 oz portion"], cats:["snack","protein"] },
  { name:"Apple", cal:80, comps:["1 medium apple","fist-size fruit"], cats:["snack"] },
  { name:"Banana", cal:110, comps:["1 medium banana","hand-length fruit"], cats:["snack"] },
  { name:"Cookies (3-4)", cal:250, comps:["3 medium cookies","small stack","palm full"], cats:["snack","sweet"] },
  // Sweet
  { name:"Twix bar", cal:250, comps:["1 standard Twix","2 fun-size bars"], cats:["sweet","snack"] },
  { name:"Ice cream (2 scoops)", cal:300, comps:["2 standard scoops","generous cup"], cats:["sweet"] },
  { name:"Chocolate bar", cal:230, comps:["1 standard bar","palm-size slab"], cats:["sweet","snack"] },
  // Drinks
  { name:"Coffee (black)", cal:5, comps:["1 mug, no additives"], cats:["drinks"] },
  { name:"Coffee with cream & sugar", cal:80, comps:["1 mug + cream + sugar"], cats:["drinks"] },
  { name:"Latte (medium)", cal:250, comps:["12 oz latte","Starbucks medium"], cats:["drinks"] },
  { name:"Beer (regular can)", cal:150, comps:["1 can, 12 oz","about a pint"], cats:["drinks"] },
  { name:"Wine (glass)", cal:130, comps:["5 oz pour","standard restaurant glass"], cats:["drinks"] },
  { name:"Cocktail (mixed)", cal:200, comps:["1 standard cocktail","8 oz mixed drink"], cats:["drinks"] },
  { name:"Orange juice (glass)", cal:110, comps:["8 oz glass","breakfast juice glass"], cats:["drinks"] },
  { name:"Soda (can)", cal:140, comps:["1 can, 12 oz","standard soda can"], cats:["drinks"] },
  { name:"Protein shake", cal:200, comps:["1 scoop protein + water","blender bottle"], cats:["drinks","protein"] },
  // Big meals
  { name:"Restaurant entree", cal:900, comps:["full sit-down entree","dinner plate","main + side dish"], cats:["fast","protein","bowl"] },
];

const portionOptions = [
  { name:"Less",   hint:"Smaller portion", multiplier:.75 },
  { name:"Same",   hint:"About that much", multiplier:1   },
  { name:"More",   hint:"Bigger serving",  multiplier:1.25 },
  { name:"A lot",  hint:"Very large",      multiplier:1.6  }
];

const state = {
  data: loadData(),
  selectedCategories: new Set(),
  query: "",
  selectedFood: null,
  selectedPortion: portionOptions[1],
  calorieAdjust: 0,
  editingId: null,
  lastDeleted: null,
  showAll: false,
  toastTimer: null
};

const els = Object.fromEntries([...document.querySelectorAll('[id]')].map(n => [n.id, n]));

function cloneDefaults() { return { target: defaults.target, entries: [] }; }
function makeId() { return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function todayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
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

const currentCalories = () => {
  const manual = Number(els.manualCalories?.value);
  if (manual > 0) return Math.round(manual);
  if (!state.selectedFood) return 0;
  return Math.max(0, Math.round((state.selectedFood.cal * state.selectedPortion.multiplier + state.calorieAdjust) / 25) * 25);
};

function setStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const id = step === 'categories' ? 'stepCategories' : step === 'search' ? 'stepSearch' : 'stepPortion';
  document.getElementById(id).classList.add('active');
  if (step === 'search') els.foodSearch.focus();
}
function setPage(page) {
  const d = page === 'dashboard';
  els.entryPage.classList.toggle('active', !d);
  els.dashboardPage.classList.toggle('active', d);
  els.entryTab.classList.toggle('active', !d);
  els.dashboardTab.classList.toggle('active', d);
  if (d) renderDashboard();
}

/* ── Persistent calorie bar (always visible) ── */
function updateCalBar() {
  const today = todayKey();
  const total = state.data.entries.filter(e => e.dateKey === today).reduce((s, e) => s + e.calories, 0);
  const target = state.data.target;
  const pct = Math.min(100, Math.round(total / target * 100));
  const remaining = target - total;
  els.calBarFill.style.width = `${pct}%`;
  els.calBarFill.classList.toggle('over', total > target);
  els.calBarText.textContent = `${total.toLocaleString()} cal`;
  els.calBarGoal.textContent = remaining >= 0
    ? `/ ${target.toLocaleString()} · ${remaining.toLocaleString()} left`
    : `/ ${target.toLocaleString()} · ${Math.abs(remaining).toLocaleString()} over!`;
}

/* ── Render: step 1 – category grid ── */
function renderCategories() {
  els.categoryGrid.replaceChildren();
  categories.forEach(c => {
    const active = state.selectedCategories.has(c.id);
    const b = el('button', 'food-block' + (active ? ' active' : ''));
    b.type = 'button';
    if (active) {
      b.style.background = c.grad;
      b.style.color = '#fff';
    } else {
      b.style.background = `${c.color}18`;
      b.style.borderColor = `${c.color}44`;
      b.style.color = c.color;
    }
    b.textContent = c.name;
    b.onclick = () => {
      state.selectedCategories.clear();
      state.selectedCategories.add(c.id);
      renderSearch();
      setStep('search');
    };
    els.categoryGrid.appendChild(b);
  });
}

/* ── Render: step 2 – search / results ── */
function renderSearch() {
  // Filter chips
  els.selectedFilters.replaceChildren();
  [...state.selectedCategories].forEach(id => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const chip = el('span', 'filter-chip', cat.name);
    chip.style.background = cat.grad;
    els.selectedFilters.appendChild(chip);
  });

  // Results
  els.resultsList.replaceChildren();
  const q = state.query.toLowerCase();
  const matches = foods.filter(f =>
    (!state.selectedCategories.size || [...state.selectedCategories].some(id => f.cats.includes(id))) &&
    (!q || f.name.toLowerCase().includes(q))
  );
  if (!matches.length) {
    const msg = el('div', 'empty-state', 'No matches — try clearing a filter or a different search term.');
    msg.setAttribute('role', 'status');
    els.resultsList.appendChild(msg);
    return;
  }
  matches.forEach(f => {
    const b = el('button', 'result-card');
    b.type = 'button';
    b.append(el('span', 'result-name', f.name), el('span', 'result-cal', `${f.cal}`));
    b.onclick = () => {
      state.selectedFood = f;
      state.selectedPortion = portionOptions[1];
      state.calorieAdjust = 0;
      if (els.manualCalories) els.manualCalories.value = '';
      renderPortion();
      setStep('portion');
    };
    els.resultsList.appendChild(b);
  });
}

/* ── Render: step 2 – portion ── */
function renderPortion() {
  if (!state.selectedFood) return;
  els.selectedFoodName.textContent = state.selectedFood.name;
  els.selectedCalories.textContent = currentCalories().toLocaleString();

  // Comparison chips
  els.compareList.replaceChildren();
  (state.selectedFood.comps || []).forEach(c => {
    els.compareList.appendChild(el('span', 'compare-chip', `≈ ${c}`));
  });

  // Portion buttons
  els.portionGrid.replaceChildren();
  portionOptions.forEach(o => {
    const b = el('button', 'portion-card' + (state.selectedPortion === o ? ' active' : ''));
    b.append(el('span', '', o.name), el('small', '', o.hint));
    b.onclick = () => { state.selectedPortion = o; renderPortion(); };
    els.portionGrid.appendChild(b);
  });
}

/* ── Render: dashboard ── */
function renderDashboard() {
  const today = todayKey();
  const todayEntries = state.data.entries.filter(e => e.dateKey === today);
  const total = todayEntries.reduce((s, e) => s + e.calories, 0);
  const target = state.data.target;
  const remaining = target - total;
  const pct = Math.min(100, Math.round(total / target * 100));

  els.todayTotal.textContent = total.toLocaleString();
  els.remainingText.textContent = remaining >= 0
    ? `${remaining.toLocaleString()} left`
    : `${Math.abs(remaining).toLocaleString()} over!`;
  els.progressText.textContent = `${pct}%`;
  els.progressFill.style.width = `${pct}%`;
  els.progressFill.classList.toggle('over', total > target);

  // Target input pre-fill
  els.targetInput.value = target;

  // History
  const allEntries = [...state.data.entries].reverse();
  const shown = state.showAll ? allEntries : allEntries.slice(0, 15);
  els.historyList.replaceChildren();

  if (!allEntries.length) {
    els.entryCount.textContent = 'No entries yet';
  } else {
    els.entryCount.textContent = `${state.data.entries.length} entr${state.data.entries.length === 1 ? 'y' : 'ies'} total`;
    shown.forEach(entry => {
      const div = el('div', 'entry');
      div.style.borderLeftColor = typeColors[entry.type] || '#8b5cf6';
      const info = el('div', '');
      info.append(
        el('div', 'entry-name', entry.food || entry.note || 'Entry'),
        el('div', 'entry-meta', `${entry.portion || ''}${entry.portion ? ' · ' : ''}${entry.type} · ${formatDate(entry.dateKey)}`)
      );
      div.append(info, el('div', 'entry-cal', `${entry.calories.toLocaleString()}`));
      div.onclick = () => openModal(entry.id);
      els.historyList.appendChild(div);
    });
  }
  els.showAllButton.style.display = allEntries.length > 15 ? '' : 'none';
  els.showAllButton.textContent = state.showAll ? 'Show less' : 'Show all';
  updateCalBar();
}

/* ── Add entry ── */
function addEntry() {
  const calories = currentCalories();
  if (!state.selectedFood || !calories) return;
  const now = new Date();
  state.data.entries.push({
    id: makeId(),
    calories,
    type: inferType(now.getHours()),
    food: state.selectedFood.name,
    note: els.noteInput.value.trim(),
    portion: state.selectedPortion.name,
    createdAt: now.toISOString(),
    dateKey: todayKey(now)
  });
  saveData();
  resetEntryFlow();
  updateCalBar();
  showToast(`✓ ${calories.toLocaleString()} cal logged`);
}

function resetEntryFlow() {
  state.selectedFood = null;
  state.selectedCategories.clear();
  state.query = '';
  state.calorieAdjust = 0;
  state.selectedPortion = portionOptions[1];
  els.noteInput.value = '';
  els.foodSearch.value = '';
  if (els.manualCalories) els.manualCalories.value = '';
  renderCategories();
  setStep('categories');
}

/* ── Modal (edit/custom) ── */
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
  if (state._triggerEl && typeof state._triggerEl.focus === 'function') {
    state._triggerEl.focus();
  }
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
  a.href = url;
  a.download = `calories-${todayKey()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ── Bind events ── */
function bind() {
  els.entryTab.onclick = () => setPage('entry');
  els.dashboardTab.onclick = () => setPage('dashboard');

  // Step navigation
  els.toSearchButton.onclick = () => { state.selectedCategories.clear(); renderSearch(); setStep('search'); };
  els.backToCategories.onclick = () => { renderCategories(); setStep('categories'); };
  els.backToSearch.onclick = () => { renderSearch(); setStep('search'); };

  // Search
  els.foodSearch.oninput = () => { state.query = els.foodSearch.value; renderSearch(); };

  // Calorie nudge
  document.querySelectorAll('.adjust-btn').forEach(btn =>
    btn.onclick = () => { state.calorieAdjust += Number(btn.dataset.adjust); renderPortion(); }
  );

  // Log entry
  els.addButton.onclick = addEntry;

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
  els.saveEntryButton.onclick = saveModal;
  els.deleteEntryButton.onclick = deleteEntry;
  els.entryModal.onclick = e => { if (e.target === els.entryModal) closeModal(); };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && els.entryModal.classList.contains('open')) closeModal();
  });

  // Undo toast
  els.undoButton.onclick = undoDelete;
}

function render() {
  renderCategories();
  updateCalBar();
}

bind();
render();
