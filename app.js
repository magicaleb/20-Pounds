import {
  initializeApp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
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

const constants = {
  DEFAULT_DAILY_TARGET: 2000,
  TOAST_TIMEOUT_MS: 6000,
  QUICK_PRESETS: [
    { type: 'small meal', calories: 300 },
    { type: 'medium meal', calories: 550 },
    { type: 'large meal', calories: 800 },
    { type: 'snack', calories: 180 }
  ]
};

const state = {
  uid: getOrCreateUid(),
  todayKey: dateUtils.toEntryDate(new Date()),
  dailyTarget: constants.DEFAULT_DAILY_TARGET,
  entries: [],
  activeEntryId: null,
  lastDeleted: null,
  toastTimer: null,
  db: null,
  initialized: false
};

const ui = {
  todayDate: document.getElementById('todayDate'),
  todayTotal: document.getElementById('todayTotal'),
  targetText: document.getElementById('targetText'),
  targetBar: document.getElementById('targetBar'),
  targetPct: document.getElementById('targetPct'),
  ringProgress: document.getElementById('ringProgress'),
  quickPresetGrid: document.getElementById('quickPresetGrid'),
  quickStickyGrid: document.getElementById('quickStickyGrid'),
  quickNote: document.getElementById('quickNote'),
  manualEntryBtn: document.getElementById('manualEntryBtn'),
  historyList: document.getElementById('historyList'),
  entryCount: document.getElementById('entryCount'),
  dailyTargetInput: document.getElementById('dailyTargetInput'),
  saveTargetBtn: document.getElementById('saveTargetBtn'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage'),
  undoDeleteBtn: document.getElementById('undoDeleteBtn'),
  statusBanner: document.getElementById('statusBanner'),
  entryModal: document.getElementById('entryModal'),
  entryForm: document.getElementById('entryForm'),
  entryModalTitle: document.getElementById('entryModalTitle'),
  entryCalories: document.getElementById('entryCalories'),
  entryNote: document.getElementById('entryNote'),
  entryQuickType: document.getElementById('entryQuickType'),
  cancelEntryBtn: document.getElementById('cancelEntryBtn')
};

const dateUtils = {
  toEntryDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  prettyToday(date) {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  },
  compactTime(date) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
};

const firebaseModule = {
  async init() {
    let cfg;
    try {
      const module = await import('./firebase-config.js');
      cfg = module.FIREBASE_CONFIG;
    } catch (error) {
      throw new Error('firebase-config.js missing. Copy firebase-config.example.js to firebase-config.js and set values.');
    }
    if (!cfg || !cfg.projectId) {
      throw new Error('Firebase config is incomplete. Check firebase-config.js.');
    }
    const app = initializeApp(cfg);
    return getFirestore(app);
  }
};

const store = {
  entriesCollection() {
    return collection(state.db, 'users', state.uid, 'entries');
  },
  settingsDoc() {
    return doc(state.db, 'users', state.uid, 'settings', 'main');
  },
  async loadSettings() {
    const snapshot = await getDoc(this.settingsDoc());
    if (snapshot.exists()) {
      const data = snapshot.data();
      state.dailyTarget = Number(data.dailyTarget) || constants.DEFAULT_DAILY_TARGET;
    }
  },
  async saveSettings(dailyTarget) {
    await setDoc(this.settingsDoc(), {
      dailyTarget,
      updatedAt: serverTimestamp()
    }, { merge: true });
    state.dailyTarget = dailyTarget;
  },
  async loadEntriesForToday() {
    const q = query(
      this.entriesCollection(),
      where('entryDate', '==', state.todayKey),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    state.entries = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  },
  async createEntry({ calories, note = '', quickType = 'manual' }) {
    const payload = {
      calories: Number(calories),
      note: note.trim(),
      quickType: quickType.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      entryDate: state.todayKey
    };
    const ref = await addDoc(this.entriesCollection(), payload);
    return ref.id;
  },
  async updateEntry(entryId, updates) {
    await updateDoc(doc(this.entriesCollection(), entryId), {
      ...updates,
      calories: Number(updates.calories),
      note: (updates.note || '').trim(),
      quickType: (updates.quickType || 'manual').trim(),
      updatedAt: serverTimestamp()
    });
  },
  async deleteEntry(entryId) {
    await deleteDoc(doc(this.entriesCollection(), entryId));
  }
};

function getOrCreateUid() {
  const key = 'twenty-pounds-uid';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const uid = crypto.randomUUID();
  localStorage.setItem(key, uid);
  return uid;
}

function getTodayTotal() {
  return state.entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
}

function renderPresets(target) {
  target.innerHTML = '';
  constants.QUICK_PRESETS.forEach((preset) => {
    const button = document.createElement('button');
    button.className = 'quick-btn';
    button.type = 'button';
    button.dataset.presetType = preset.type;
    button.dataset.presetCalories = String(preset.calories);
    button.innerHTML = `${preset.type}<small>${preset.calories} kcal</small>`;
    target.appendChild(button);
  });
}

function renderSummary() {
  const total = getTodayTotal();
  const target = Math.max(1, state.dailyTarget);
  const ratio = Math.min(total / target, 2);
  const pct = Math.round((total / target) * 100);
  const ringCircumference = 2 * Math.PI * 50;
  const strokeOffset = ringCircumference * (1 - Math.min(ratio, 1));

  ui.todayDate.textContent = dateUtils.prettyToday(new Date());
  ui.todayTotal.textContent = String(total);
  ui.targetText.textContent = `${total} / ${target} kcal`;
  ui.targetPct.textContent = `${Math.max(0, pct)}%`;
  ui.targetBar.style.width = `${Math.min(ratio * 100, 100)}%`;
  ui.ringProgress.style.strokeDasharray = String(ringCircumference);
  ui.ringProgress.style.strokeDashoffset = String(strokeOffset);
  ui.dailyTargetInput.value = String(target);
}

function renderHistory() {
  const entries = [...state.entries].sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
  ui.historyList.innerHTML = '';
  ui.entryCount.textContent = `${entries.length} ${entries.length === 1 ? 'item' : 'items'}`;

  if (!entries.length) {
    ui.historyList.innerHTML = '<div class="empty-state">No entries yet today. Tap a quick-add button to start.</div>';
    return;
  }

  entries.forEach((entry) => {
    const node = document.createElement('article');
    node.className = 'history-item';
    const createdDate = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date();
    const noteText = entry.note ? ` • ${entry.note}` : '';

    node.innerHTML = `
      <div class="entry-main">
        <p><strong>${entry.calories} kcal</strong> — ${sanitize(entry.quickType || 'manual')}</p>
        <p class="entry-meta">${sanitize(dateUtils.compactTime(createdDate))}${sanitize(noteText)}</p>
      </div>
      <div class="item-actions">
        <button type="button" data-action="edit" data-id="${entry.id}" aria-label="Edit entry">✏️</button>
        <button type="button" class="delete-btn" data-action="delete" data-id="${entry.id}" aria-label="Delete entry">🗑️</button>
      </div>
    `;

    ui.historyList.appendChild(node);
  });
}

function sanitize(text) {
  return String(text).replace(/[<>&"]/g, (m) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[m]));
}

function showStatus(message) {
  ui.statusBanner.hidden = false;
  ui.statusBanner.textContent = message;
  window.clearTimeout(showStatus._timer);
  showStatus._timer = window.setTimeout(() => {
    ui.statusBanner.hidden = true;
  }, 3600);
}

function setLoading(isLoading) {
  document.body.classList.toggle('loading', isLoading);
}

function showToast(message) {
  ui.toastMessage.textContent = message;
  ui.toast.classList.add('show');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(hideToast, constants.TOAST_TIMEOUT_MS);
}

function hideToast() {
  ui.toast.classList.remove('show');
}

async function refreshEntries() {
  await store.loadEntriesForToday();
  renderHistory();
  renderSummary();
}

async function handleQuickAdd(calories, quickType) {
  try {
    const note = ui.quickNote.value.trim();
    await store.createEntry({ calories, quickType, note });
    ui.quickNote.value = '';
    await refreshEntries();
  } catch (error) {
    console.error(error);
    showStatus('Could not save entry. Please retry.');
  }
}

function openEntryModal({ mode, entry }) {
  state.activeEntryId = entry?.id || null;
  ui.entryModalTitle.textContent = mode === 'edit' ? 'Edit entry' : 'Manual entry';
  ui.entryCalories.value = entry?.calories ? String(entry.calories) : '';
  ui.entryNote.value = entry?.note || ui.quickNote.value || '';
  ui.entryQuickType.value = entry?.quickType || 'manual';
  ui.entryModal.showModal();
}

function closeEntryModal() {
  state.activeEntryId = null;
  ui.entryForm.reset();
  ui.entryModal.close();
}

async function undoDelete() {
  if (!state.lastDeleted) return;
  const { calories, note, quickType } = state.lastDeleted;
  try {
    await store.createEntry({ calories, note, quickType });
    state.lastDeleted = null;
    hideToast();
    await refreshEntries();
  } catch (error) {
    console.error(error);
    showStatus('Undo failed.');
  }
}

function wireEvents() {
  [ui.quickPresetGrid, ui.quickStickyGrid].forEach((grid) => {
    grid.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-preset-calories]');
      if (!btn) return;
      handleQuickAdd(Number(btn.dataset.presetCalories), btn.dataset.presetType || 'quick');
    });
  });

  ui.manualEntryBtn.addEventListener('click', () => openEntryModal({ mode: 'create' }));

  ui.historyList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const entryId = button.dataset.id;
    const targetEntry = state.entries.find((entry) => entry.id === entryId);
    if (!targetEntry) return;

    if (button.dataset.action === 'edit') {
      openEntryModal({ mode: 'edit', entry: targetEntry });
      return;
    }

    if (button.dataset.action === 'delete') {
      try {
        state.lastDeleted = targetEntry;
        await store.deleteEntry(entryId);
        await refreshEntries();
        showToast('Entry deleted');
      } catch (error) {
        console.error(error);
        showStatus('Could not delete entry.');
      }
    }
  });

  ui.entryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const calories = Number(ui.entryCalories.value);
    if (!Number.isFinite(calories) || calories <= 0) {
      showStatus('Calories must be a positive number.');
      return;
    }
    const payload = {
      calories,
      note: ui.entryNote.value,
      quickType: ui.entryQuickType.value || 'manual'
    };

    try {
      if (state.activeEntryId) {
        await store.updateEntry(state.activeEntryId, payload);
      } else {
        await store.createEntry(payload);
      }
      closeEntryModal();
      await refreshEntries();
    } catch (error) {
      console.error(error);
      showStatus('Could not save entry changes.');
    }
  });

  ui.cancelEntryBtn.addEventListener('click', closeEntryModal);
  ui.undoDeleteBtn.addEventListener('click', undoDelete);

  ui.saveTargetBtn.addEventListener('click', async () => {
    const nextTarget = Number(ui.dailyTargetInput.value);
    if (!Number.isFinite(nextTarget) || nextTarget <= 0) {
      showStatus('Target must be greater than zero.');
      return;
    }

    try {
      await store.saveSettings(nextTarget);
      renderSummary();
      showStatus('Daily target updated.');
    } catch (error) {
      console.error(error);
      showStatus('Could not save settings.');
    }
  });
}

async function boot() {
  renderPresets(ui.quickPresetGrid);
  renderPresets(ui.quickStickyGrid);
  wireEvents();

  try {
    setLoading(true);
    state.db = await firebaseModule.init();
    await store.loadSettings();
    await refreshEntries();
    state.initialized = true;
  } catch (error) {
    console.error(error);
    showStatus(error.message || 'App could not initialize.');
    renderHistory();
    renderSummary();
  } finally {
    setLoading(false);
  }
}

boot();
