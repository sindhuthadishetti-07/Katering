/**
 * KateringKing — Admin Panel Logic
 * Wires up every interaction in admin.html with Firebase via cms.js.
 */

import {
  login, logout, resetPassword, onAuth, isAdmin, currentUser,
  getCategories, addCategory, updateCategory, deleteCategory,
  getAllItems, getItem, addItem, updateItem, deleteItem, setItemStatus,
  getSiteContent, setSiteContent,
  uploadImage, deleteImage, compressImage,
  exportBackup, validateBackup, restoreBackup,
  isMigrated, TABS, COL, db,
} from './cms.js';

import { collection, getDocs } from
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ══════════════════════════════════════════════════════════════
// DOM HELPERS
// ══════════════════════════════════════════════════════════════
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function show(el)  { if (el) el.style.display = ''; }
function hide(el)  { if (el) el.style.display = 'none'; }
function showFlex(el) { if (el) el.style.display = 'flex'; }

// ── Toast ─────────────────────────────────────────────────────
let _toastTimer;
function toast(msg, type = '') {
  const t = $('kk-toast');
  if (!t) return;
  t.textContent  = msg;
  t.className    = 'show' + (type ? ` toast-${type}` : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = ''; }, 3400);
}

// ── Error / success banners ────────────────────────────────────
function showError(id, msg) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
function clearError(id) {
  const el = $(id);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('show');
}
function showSuccess(id, msg) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

// ── Confirm dialog ─────────────────────────────────────────────
function confirm(msg) {
  return window.confirm(msg);   // plain browser confirm — reliable cross-device
}

// ══════════════════════════════════════════════════════════════
// AUTH FLOW
// ══════════════════════════════════════════════════════════════
const loginCard  = $('kk-login-card');
const dashboard  = $('kk-dashboard');

function showLogin() {
  hide(dashboard);
  show(loginCard);
}
function showDashboard(user) {
  hide(loginCard);
  showFlex(dashboard);
  dashboard.classList.add('open');
  $('kk-user-email').textContent   = 'Administrator';
  $('settings-email').textContent  = 'Administrator';
  $('settings-uid').textContent    = user.uid   || '';
  loadOverviewStats();
  loadSettings(user);
}

// Username → email map
// The email is read from the Firebase Auth token at runtime —
// it is NOT stored in this file.
const USERNAME_MAP = {
  'admin': null, // resolved at runtime from Firebase Auth
};

function resolveEmail(usernameOrEmail) {
  const lower = (usernameOrEmail || '').trim().toLowerCase();
  // If the user typed a full email address, use it directly
  if (lower.includes('@')) return lower;
  // 'admin' is a valid username — Firebase will verify credentials
  // We pass a placeholder and let Firebase Auth handle the rejection
  // for wrong passwords. The actual email lookup is done server-side.
  if (lower === 'admin') return _getAdminEmail();
  return null;
}

// Read admin email from meta tag in admin.html (set at deploy time)
// This keeps the email out of JS source code
function _getAdminEmail() {
  const meta = document.querySelector('meta[name="kk-admin-ref"]');
  return meta ? atob(meta.content) : null;
}

// Login form
$('kk-login-form').addEventListener('submit', async e => {
  e.preventDefault();
  clearError('kk-login-error');

  const usernameInput = $('kk-username');
  const raw           = usernameInput?.value.trim() || '';
  const email         = resolveEmail(raw);

  if (!email) {
    showError('kk-login-error', `Unknown username "${raw}". Please check and try again.`);
    return;
  }

  const btn = $('kk-login-btn');
  btn.disabled    = true;
  btn.textContent = 'Signing in…';
  try {
    await login(email, $('kk-password').value);
    // onAuth callback calls showDashboard
  } catch (err) {
    showError('kk-login-error', err.message);
    btn.disabled    = false;
    btn.textContent = 'Sign In';
  }
});

// Forgot password toggle
$('kk-show-reset').addEventListener('click', () => {
  const wrap = $('kk-reset-wrap');
  wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
});

// Send reset email
$('kk-send-reset').addEventListener('click', async () => {
  clearError('kk-reset-error');
  const btn   = $('kk-send-reset');
  const email = $('kk-reset-email').value.trim();
  if (!email) { showError('kk-reset-error', 'Enter your email address.'); return; }
  btn.disabled    = true;
  btn.textContent = 'Sending…';
  try {
    await resetPassword(email);
    showSuccess('kk-reset-success', `Reset email sent to ${email}. Check your inbox.`);
  } catch (err) {
    showError('kk-reset-error', err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Send Reset Email';
  }
});

// Logout
[$('kk-logout-btn'), $('kk-sidebar-logout')].forEach(btn => {
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await logout();
    showLogin();
    toast('Signed out.', '');
  });
});

// Auth state observer
onAuth(user => {
  if (user) {
    showDashboard(user);
  } else {
    showLogin();
  }
});

// ══════════════════════════════════════════════════════════════
// SIDEBAR / MOBILE TAB NAVIGATION
// ══════════════════════════════════════════════════════════════
const PANE_LABELS = {
  'pane-overview':  'Overview',
  'pane-nonveg':    'Non-Veg',
  'pane-veg':       'Veg',
  'pane-signature': 'Signature',
  'pane-content':   'Content',
  'pane-backup':    'Backup',
  'pane-settings':  'Settings',
};

// Build mobile tab strip
function buildMobileTabs() {
  const strip = $('kk-mobile-tabs');
  if (!strip) return;
  strip.innerHTML = '';
  Object.entries(PANE_LABELS).forEach(([paneId, label]) => {
    const btn = document.createElement('button');
    btn.className    = 'kk-mobile-tab' + (paneId === 'pane-overview' ? ' active' : '');
    btn.dataset.pane = paneId;
    btn.textContent  = label;
    btn.addEventListener('click', () => switchPane(paneId));
    strip.appendChild(btn);
  });
}

function switchPane(paneId) {
  $$('.kk-pane').forEach(p => p.classList.remove('active'));
  $$('.kk-nav-item').forEach(b => b.classList.remove('active'));
  $$('.kk-mobile-tab').forEach(b => b.classList.remove('active'));

  const pane    = $(paneId);
  const navBtn  = document.querySelector(`.kk-nav-item[data-pane="${paneId}"]`);
  const mobBtn  = document.querySelector(`.kk-mobile-tab[data-pane="${paneId}"]`);
  if (pane)   pane.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
  if (mobBtn) {
    mobBtn.classList.add('active');
    mobBtn.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }

  // Lazy-load pane data
  if (paneId === 'pane-nonveg')    loadMenuPane('nonveg');
  if (paneId === 'pane-veg')       loadMenuPane('veg');
  if (paneId === 'pane-signature') loadMenuPane('signature');
  if (paneId === 'pane-content')   loadContentPane();
  if (paneId === 'pane-settings')  loadSettings(currentUser());
}

$$('.kk-nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchPane(btn.dataset.pane));
});

// ══════════════════════════════════════════════════════════════
// OVERVIEW STATS
// ══════════════════════════════════════════════════════════════
async function loadOverviewStats() {
  // Show loading state
  ['stat-total-items','stat-published','stat-draft','stat-cats'].forEach(id => {
    $(id).textContent = '…';
  });

  // Timeout wrapper — if Firestore hangs for 10s, show error
  const withTimeout = (promise, ms = 10000) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out — check Firestore rules and admin token.')), ms)
      )
    ]);

  try {
    const [itemsSnap, catsSnap] = await withTimeout(Promise.all([
      getDocs(collection(db, COL.ITEMS)),
      getDocs(collection(db, COL.CATEGORIES)),
    ]));

    const items     = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const published = items.filter(i => i.status === 'published').length;
    const draft     = items.filter(i => i.status === 'draft').length;

    $('stat-total-items').textContent = items.length;
    $('stat-published').textContent   = published;
    $('stat-draft').textContent       = draft;
    $('stat-cats').textContent        = catsSnap.size;

    // Render recent dishes (last 8 updated)
    const recent = [...items]
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 8);

    const recentEl = $('kk-recent-dishes');
    if (recentEl) {
      if (!recent.length) {
        recentEl.innerHTML = `<div class="kk-empty-state" style="padding:1.5rem 0">
          No dishes yet. Use the menu tabs above to add dishes.</div>`;
      } else {
        recentEl.innerHTML = recent.map(item => `
          <div class="kk-dish-row">
            ${item.imageUrl
              ? `<img src="${_esc(item.imageUrl)}" class="kk-dish-thumb"
                      alt="${_esc(item.name)}"
                      onerror="this.style.display='none'" />`
              : `<div class="kk-dish-thumb-placeholder">🍽</div>`}
            <div class="kk-dish-info">
              <div class="kk-dish-name-text">${_esc(item.name)}
                <span class="kk-badge ${item.status === 'published'
                  ? 'kk-badge-published' : 'kk-badge-draft'}">
                  ${item.status === 'published' ? 'live' : 'draft'}</span>
              </div>
              <div class="kk-dish-meta">${_esc(item.menuTab)} · ${_esc(item.categoryName || '')}</div>
            </div>
          </div>`).join('');
      }
    }

  } catch (err) {
    console.error('[Overview] loadOverviewStats failed:', err);
    ['stat-total-items','stat-published','stat-draft','stat-cats'].forEach(id => {
      $(id).textContent = '!';
    });
    const recentEl = $('kk-recent-dishes');
    if (recentEl) {
      recentEl.innerHTML = `<div class="kk-empty-state" style="color:#f28b82;padding:1rem 0">
        <strong>Could not load data.</strong><br/>
        ${_esc(err.message)}<br/><br/>
        <small>Sign out and sign back in to refresh your admin token,
        then check Firestore rules allow admin reads.</small>
      </div>`;
    }
  }
}

// Quick-action buttons on overview
$('qa-add-nonveg').addEventListener('click', () => {
  switchPane('pane-nonveg');
  setTimeout(() => openDishModal(null, 'nonveg'), 300);
});
$('qa-add-veg').addEventListener('click', () => {
  switchPane('pane-veg');
  setTimeout(() => openDishModal(null, 'veg'), 300);
});
$('qa-add-sig').addEventListener('click', () => {
  switchPane('pane-signature');
  setTimeout(() => openDishModal(null, 'signature'), 300);
});

// ══════════════════════════════════════════════════════════════
// MENU PANE — load, search, category accordion
// ══════════════════════════════════════════════════════════════

// Cache to avoid redundant Firestore reads
const _paneCache = {};

async function loadMenuPane(tabId, force = false) {
  const listEl = $(`list-${tabId}`);
  if (!listEl) return;

  if (_paneCache[tabId] && !force) {
    renderMenuPane(tabId, _paneCache[tabId].cats, _paneCache[tabId].items, listEl);
    return;
  }

  listEl.innerHTML = `<div class="kk-loading-state">
    <span class="kk-spinner"></span> Loading…</div>`;

  try {
    const [cats, items] = await Promise.all([
      getCategories(tabId),
      getAllItems(tabId),
    ]);
    _paneCache[tabId] = { cats, items };
    renderMenuPane(tabId, cats, items, listEl);
  } catch (err) {
    listEl.innerHTML = `<div class="kk-empty-state">
      Failed to load: ${err.message}</div>`;
  }
}

function renderMenuPane(tabId, cats, items, listEl, filter = '') {
  if (!cats.length && !items.length) {
    listEl.innerHTML = `<div class="kk-empty-state">
      No data yet. Run the seed script first, or add a category and dish.</div>`;
    return;
  }

  // Group items by categoryId
  const byCategory = {};
  for (const it of items) {
    if (filter && !it.name.toLowerCase().includes(filter.toLowerCase())) continue;
    const cid = it.categoryId || '__none__';
    if (!byCategory[cid]) byCategory[cid] = [];
    byCategory[cid].push(it);
  }

  let html = '';
  cats.forEach(cat => {
    const catItems = byCategory[cat.id] || [];
    if (filter && !catItems.length) return; // hide empty cats during search
    html += `
      <div class="kk-cat-block open" data-cat-id="${cat.id}">
        <div class="kk-cat-header">
          <span class="kk-cat-name">${_esc(cat.name)}</span>
          <span class="kk-cat-count">${catItems.length} dish${catItems.length !== 1 ? 'es' : ''}</span>
          <div style="display:flex;gap:.4rem;margin-left:.3rem">
            <button class="kk-btn kk-btn-ghost kk-btn-sm"
                    onclick="window._kkRenameCategory('${cat.id}','${tabId}',this)"
                    title="Rename category">✎</button>
            <button class="kk-btn kk-btn-danger kk-btn-sm"
                    onclick="window._kkDeleteCategory('${cat.id}','${tabId}')"
                    title="Delete category">✕</button>
          </div>
          <span class="kk-cat-chevron">›</span>
        </div>
        <div class="kk-cat-body">
          ${catItems.length
            ? catItems.map(it => dishRowHTML(it)).join('')
            : `<div style="padding:.8rem 1rem;font-size:.78rem;color:var(--text-muted)">
                No dishes in this category yet.</div>`
          }
          <div style="padding:.6rem 1rem;border-top:1px solid rgba(255,255,255,.04)">
            <button class="kk-btn kk-btn-ghost kk-btn-sm"
                    data-add-dish="${tabId}"
                    data-default-cat="${cat.id}">+ Add Dish Here</button>
          </div>
        </div>
      </div>`;
  });

  // Orphaned items (no category)
  if (byCategory['__none__']?.length) {
    html += `<div class="kk-cat-block open">
      <div class="kk-cat-header">
        <span class="kk-cat-name" style="color:var(--text-muted)">Uncategorised</span>
      </div>
      <div class="kk-cat-body">
        ${byCategory['__none__'].map(it => dishRowHTML(it)).join('')}
      </div>
    </div>`;
  }

  if (!html) {
    html = `<div class="kk-empty-state">No dishes match "${_esc(filter)}".</div>`;
  }

  listEl.innerHTML = html;

  // Category accordion toggle
  listEl.querySelectorAll('.kk-cat-header').forEach(h => {
    h.addEventListener('click', e => {
      // Ignore button clicks inside header
      if (e.target.closest('button')) return;
      h.closest('.kk-cat-block').classList.toggle('open');
    });
  });

  // Edit dish buttons
  listEl.querySelectorAll('[data-edit-dish]').forEach(btn => {
    btn.addEventListener('click', () =>
      openDishModal(btn.dataset.editDish, tabId));
  });

  // Add dish buttons (inline)
  listEl.querySelectorAll('[data-add-dish]').forEach(btn => {
    btn.addEventListener('click', () =>
      openDishModal(null, btn.dataset.addDish, btn.dataset.defaultCat));
  });

  // Toggle publish/draft
  listEl.querySelectorAll('[data-toggle-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { id, current } = btn.dataset;
      const next = current === 'published' ? 'draft' : 'published';
      try {
        await setItemStatus(id, next);
        toast(`Dish ${next === 'published' ? 'published' : 'set to draft'}.`, 'success');
        invalidateCache(tabId);
        loadMenuPane(tabId, true);
      } catch (err) { toast(err.message, 'error'); }
    });
  });
}

function dishRowHTML(item) {
  const imgHtml = item.imageUrl
    ? `<img src="${_esc(item.imageUrl)}" class="kk-dish-thumb"
            alt="${_esc(item.name)}"
            onerror="this.style.display='none'" />`
    : `<div class="kk-dish-thumb-placeholder">🍽</div>`;

  const badge = item.status === 'published'
    ? '<span class="kk-badge kk-badge-published">live</span>'
    : '<span class="kk-badge kk-badge-draft">draft</span>';

  const toggleLabel = item.status === 'published' ? 'Unpublish' : 'Publish';

  return `
    <div class="kk-dish-row">
      ${imgHtml}
      <div class="kk-dish-info">
        <div class="kk-dish-name-text">
          ${_esc(item.name)}
          ${item.variant ? `<span style="color:var(--gold);font-size:.78rem"> ${_esc(item.variant)}</span>` : ''}
          ${badge}
        </div>
        ${item.description
          ? `<div class="kk-dish-meta">${_esc(item.description.slice(0, 80))}${item.description.length > 80 ? '…' : ''}</div>`
          : ''}
      </div>
      <div class="kk-dish-actions">
        <button class="kk-btn kk-btn-ghost kk-btn-sm"
                data-toggle-status data-id="${item.id}"
                data-current="${item.status}">${toggleLabel}</button>
        <button class="kk-btn kk-btn-ghost kk-btn-sm"
                data-edit-dish="${item.id}">Edit</button>
      </div>
    </div>`;
}

// Search
$$('[data-search]').forEach(input => {
  input.addEventListener('input', () => {
    const tabId = input.dataset.search;
    const cache = _paneCache[tabId];
    if (!cache) return;
    const listEl = $(`list-${tabId}`);
    renderMenuPane(tabId, cache.cats, cache.items, listEl, input.value.trim());
  });
});

// ── Toolbar buttons — event delegation on kk-main ────────────
// Handles: + Add Dish (toolbar), + Add Category (toolbar)
// Uses delegation so it works regardless of when panes render.
$('kk-main').addEventListener('click', e => {
  // + Add Dish button in toolbar
  const addDishBtn = e.target.closest('[data-add-dish]');
  if (addDishBtn && !addDishBtn.dataset.defaultCat) {
    const tabId = addDishBtn.dataset.addDish;
    openDishModal(null, tabId);
    return;
  }
});

// Add category buttons in toolbar
$$('[data-add-cat]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tabId = btn.dataset.addCat;
    const name  = window.prompt(
      `Category name for ${tabId === 'signature' ? 'Signature Reserve course' : tabId + ' menu'}:`
    );
    if (!name?.trim()) return;
    try {
      const order = (_paneCache[tabId]?.cats?.length ?? 0) + 1;
      await addCategory(tabId, name.trim(), order);
      toast(`Category "${name}" added.`, 'success');
      invalidateCache(tabId);
      loadMenuPane(tabId, true);
      loadOverviewStats();
    } catch (err) { toast(err.message, 'error'); }
  });
});

// Global handlers called from inline onclick in rendered HTML
window._kkRenameCategory = async (catId, tabId, btn) => {
  const current = btn.closest('.kk-cat-block')
    .querySelector('.kk-cat-name')?.textContent?.trim() || '';
  const name = window.prompt('Rename category to:', current);
  if (!name?.trim() || name.trim() === current) return;
  try {
    await updateCategory(catId, { name: name.trim() });
    toast('Category renamed.', 'success');
    invalidateCache(tabId);
    loadMenuPane(tabId, true);
  } catch (err) { toast(err.message, 'error'); }
};

window._kkDeleteCategory = async (catId, tabId) => {
  if (!confirm(
    'Delete this category?\n\nAll dishes in it will become uncategorised. ' +
    'They will still appear in your menu until you assign them a new category or delete them.'
  )) return;
  try {
    await deleteCategory(catId);
    toast('Category deleted.', 'success');
    invalidateCache(tabId);
    loadMenuPane(tabId, true);
    loadOverviewStats();
  } catch (err) { toast(err.message, 'error'); }
};

function invalidateCache(tabId) {
  delete _paneCache[tabId];
}

// ══════════════════════════════════════════════════════════════
// DISH MODAL — Add / Edit
// ══════════════════════════════════════════════════════════════
const dishModal    = $('kk-dish-modal');
const modalTitle   = $('kk-modal-title');
const modalSaveBtn = $('kk-modal-save');
const modalDelBtn  = $('kk-modal-delete');

let _modalTabId = '';

async function openDishModal(itemId, tabId, defaultCatId = '') {
  _modalTabId = tabId;
  $('modal-tab-id').value   = tabId;
  $('modal-item-id').value  = itemId || '';
  clearError('modal-error');

  // Populate category select
  await populateCategorySelect(tabId, defaultCatId);

  if (itemId) {
    // Edit mode
    modalTitle.textContent = 'Edit Dish';
    show(modalDelBtn);
    try {
      const item = await getItem(itemId);
      if (!item) { toast('Dish not found.', 'error'); return; }
      $('modal-name').value        = item.name        || '';
      $('modal-variant').value     = item.variant     || '';
      $('modal-description').value = item.description || '';
      $('modal-price').value       = item.price       || '';
      $('modal-order').value       = item.displayOrder ?? 0;
      $('modal-featured').checked  = item.featured    || false;
      $('modal-status').value      = item.status      || 'published';
      $('modal-category').value    = item.categoryId  || '';
      $('modal-img-url').value     = item.imageUrl    || '';
      $('modal-img-path').value    = item.imagePath   || '';

      // Show existing image preview
      if (item.imageUrl) {
        const preview = $('modal-img-preview');
        preview.src = item.imageUrl;
        preview.classList.add('show');
        $('modal-img-remove').classList.add('show');
      }
    } catch (err) { toast(err.message, 'error'); return; }
  } else {
    // Add mode
    modalTitle.textContent = 'Add Dish';
    hide(modalDelBtn);
    $('modal-name').value        = '';
    $('modal-variant').value     = '';
    $('modal-description').value = '';
    $('modal-price').value       = '';
    $('modal-order').value       = (_paneCache[tabId]?.items?.length ?? 0);
    $('modal-featured').checked  = false;
    $('modal-status').value      = 'published';
    $('modal-img-url').value     = '';
    $('modal-img-path').value    = '';
    $('modal-img-preview').classList.remove('show');
    $('modal-img-remove').classList.remove('show');
    $('modal-img-status').textContent = '';
  }

  dishModal.classList.add('open');
  $('modal-name').focus();
}

async function populateCategorySelect(tabId, defaultCatId = '') {
  const sel = $('modal-category');
  sel.innerHTML = '<option value="">Loading categories…</option>';
  try {
    const cats = await getCategories(tabId);
    if (!cats.length) {
      sel.innerHTML = '<option value="">No categories found — run seed.js first</option>';
      return;
    }
    sel.innerHTML = '<option value="">— Select category —</option>';
    cats.forEach(cat => {
      const opt       = document.createElement('option');
      opt.value       = cat.id;
      opt.textContent = cat.name;
      if (cat.id === defaultCatId) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('[CMS] populateCategorySelect failed:', err);
    sel.innerHTML = `<option value="">Error: ${err.message}</option>`;
  }
}

function closeDishModal() {
  dishModal.classList.remove('open');
  // Reset progress & status
  hide($('modal-progress-wrap'));
  $('modal-progress-bar').style.width = '0%';
  $('modal-img-status').textContent   = '';
}

$('kk-modal-close').addEventListener('click',  closeDishModal);
$('kk-modal-cancel').addEventListener('click', closeDishModal);

// Image file picker & compression
$('modal-img-file').addEventListener('change', async e => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast('Please select an image file (JPEG, PNG, WebP).', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast('Image too large. Maximum 5 MB.', 'error');
    return;
  }

  $('modal-img-status').textContent = 'Compressing…';
  try {
    const compressed = await compressImage(file, 1200);

    // Show preview
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = $('modal-img-preview');
      preview.src = ev.target.result;
      preview.classList.add('show');
      $('modal-img-remove').classList.add('show');
    };
    reader.readAsDataURL(compressed);

    // Upload to Storage
    const tabId     = $('modal-tab-id').value || 'misc';
    const safeId    = `${Date.now()}_${compressed.name.replace(/[^a-zA-Z0-9.]/g,'_')}`;
    const path      = `dishes/${tabId}/${safeId}`;

    show($('modal-progress-wrap'));
    $('modal-img-status').textContent = 'Uploading…';

    const { url, path: storagePath } = await uploadImage(
      compressed, path,
      pct => { $('modal-progress-bar').style.width = pct + '%'; }
    );

    $('modal-img-url').value  = url;
    $('modal-img-path').value = storagePath;
    $('modal-img-status').textContent = '✓ Image uploaded.';
    hide($('modal-progress-wrap'));
  } catch (err) {
    $('modal-img-status').textContent = `Upload failed: ${err.message}`;
  }
});

// Remove image
$('modal-img-remove').addEventListener('click', () => {
  $('modal-img-preview').classList.remove('show');
  $('modal-img-remove').classList.remove('show');
  $('modal-img-url').value  = '';
  $('modal-img-path').value = '';
  $('modal-img-status').textContent = '';
  $('modal-img-file').value = '';
});

// Save dish
modalSaveBtn.addEventListener('click', async () => {
  clearError('modal-error');
  const name = $('modal-name').value.trim();
  if (!name) { showError('modal-error', 'Dish name is required.'); return; }

  const catId = $('modal-category').value;
  if (!catId)  { showError('modal-error', 'Please select a category.'); return; }

  // Resolve category name for denormalisation
  const tabId  = $('modal-tab-id').value;
  const cats   = await getCategories(tabId);
  const cat    = cats.find(c => c.id === catId);

  const payload = {
    menuTab:      tabId,
    categoryId:   catId,
    categoryName: cat?.name || '',
    name,
    variant:      $('modal-variant').value.trim(),
    description:  $('modal-description').value.trim(),
    price:        $('modal-price').value.trim(),
    displayOrder: parseInt($('modal-order').value) || 0,
    featured:     $('modal-featured').checked,
    status:       $('modal-status').value,
    imageUrl:     $('modal-img-url').value,
    imagePath:    $('modal-img-path').value,
  };

  modalSaveBtn.disabled    = true;
  modalSaveBtn.textContent = 'Saving…';

  try {
    const itemId = $('modal-item-id').value;
    if (itemId) {
      await updateItem(itemId, payload);
      toast('Dish updated.', 'success');
    } else {
      await addItem(payload);
      toast('Dish added.', 'success');
    }
    closeDishModal();
    invalidateCache(tabId);
    loadMenuPane(tabId, true);
    loadOverviewStats();
  } catch (err) {
    showError('modal-error', err.message);
  } finally {
    modalSaveBtn.disabled    = false;
    modalSaveBtn.textContent = 'Save Dish';
  }
});

// Delete dish
modalDelBtn.addEventListener('click', async () => {
  const itemId = $('modal-item-id').value;
  const tabId  = $('modal-tab-id').value;
  if (!confirm('Permanently delete this dish? This cannot be undone.')) return;

  try {
    // Delete Storage image if one exists
    const oldPath = $('modal-img-path').value;
    if (oldPath) await deleteImage(oldPath);

    await deleteItem(itemId);
    toast('Dish deleted.', 'success');
    closeDishModal();
    invalidateCache(tabId);
    loadMenuPane(tabId, true);
    loadOverviewStats();
  } catch (err) { toast(err.message, 'error'); }
});

// ══════════════════════════════════════════════════════════════
// SITE CONTENT PANE
// ══════════════════════════════════════════════════════════════
async function loadContentPane() {
  try {
    const data = await getSiteContent('siteText');
    if (!data) return;
    if (data.pioneer)      $('content-pioneer').value      = data.pioneer;
    if (data.founder)      $('content-founder').value      = data.founder;
    if (data.educated)     $('content-educated').value     = data.educated;
    if (data.hospitality)  $('content-hospitality').value  = data.hospitality;
  } catch { /* non-fatal */ }
}

$('btn-save-content').addEventListener('click', async () => {
  const btn = $('btn-save-content');
  btn.disabled    = true;
  btn.textContent = 'Saving…';
  try {
    await setSiteContent('siteText', {
      pioneer:     $('content-pioneer').value.trim(),
      founder:     $('content-founder').value.trim(),
      educated:    $('content-educated').value.trim(),
      hospitality: $('content-hospitality').value.trim(),
    });
    toast('Site content saved.', 'success');
  } catch (err) { toast(err.message, 'error'); } finally {
    btn.disabled    = false;
    btn.textContent = 'Save Content';
  }
});

$('btn-reload-content').addEventListener('click', loadContentPane);

// ══════════════════════════════════════════════════════════════
// BACKUP & RESTORE PANE
// ══════════════════════════════════════════════════════════════

// Export
$('btn-export').addEventListener('click', async () => {
  const btn = $('btn-export');
  btn.disabled    = true;
  btn.textContent = 'Preparing…';
  try {
    const data    = await exportBackup();
    const json    = JSON.stringify(data, null, 2);
    const blob    = new Blob([json], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `kateringking-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Backup downloaded.', 'success');
  } catch (err) { toast(err.message, 'error'); } finally {
    btn.disabled    = false;
    btn.textContent = '↓ Download JSON';
  }
});

// Copy to clipboard
$('btn-copy-backup').addEventListener('click', async () => {
  try {
    const data = await exportBackup();
    const json = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(json);
    toast('Backup copied to clipboard.', 'success');
  } catch (err) { toast(err.message, 'error'); }
});

// File picker for restore
$('btn-pick-restore').addEventListener('click', () => $('restore-file').click());

$('restore-file').addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (!file) return;
  $('restore-filename').textContent = file.name;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data  = JSON.parse(ev.target.result);
      const check = validateBackup(data);
      const preview = $('restore-preview');
      const val     = $('restore-validation');
      const btn     = $('btn-do-restore');

      // Show preview summary
      preview.textContent =
        `Schema version : ${data._meta?.schemaVersion ?? 'unknown'}\n` +
        `Exported at    : ${data._meta?.exportedAt    ?? 'unknown'}\n` +
        `Categories     : ${data.categories?.length   ?? 0}\n` +
        `Menu items     : ${data.items?.length        ?? 0}\n` +
        `Content docs   : ${data.content?.length      ?? 0}`;
      preview.classList.add('show');

      if (check.valid) {
        val.textContent  = '✓ File validated successfully.';
        val.style.color  = '#81c995';
        val.style.display = 'block';
        show(btn);
        btn.dataset.restoreJson = JSON.stringify(data);
      } else {
        val.textContent  = '✕ ' + check.errors.join(' | ');
        val.style.color  = '#f28b82';
        val.style.display = 'block';
        hide(btn);
      }
    } catch {
      $('restore-preview').textContent = 'Invalid JSON file.';
      $('restore-preview').classList.add('show');
      hide($('btn-do-restore'));
    }
  };
  reader.readAsText(file);
});

// Execute restore
$('btn-do-restore').addEventListener('click', async () => {
  if (!confirm(
    'This will overwrite ALL existing menu data with the backup contents.\n\n' +
    'Uploaded images will NOT be deleted.\n\nContinue?'
  )) return;

  const btn = $('btn-do-restore');
  btn.disabled    = true;
  btn.textContent = 'Restoring…';
  try {
    const data = JSON.parse(btn.dataset.restoreJson);
    await restoreBackup(data);
    // Clear all caches
    Object.keys(_paneCache).forEach(k => delete _paneCache[k]);
    toast('Restore complete.', 'success');
    loadOverviewStats();
  } catch (err) { toast(err.message, 'error'); } finally {
    btn.disabled    = false;
    btn.textContent = 'Restore Now';
  }
});

// Factory reset
$('btn-factory-reset').addEventListener('click', async () => {
  const typed = window.prompt(
    'This permanently deletes all menu items and categories from Firestore.\n\n' +
    'Type  RESET  to confirm:'
  );
  if (typed?.trim().toUpperCase() !== 'RESET') {
    toast('Factory reset cancelled.', '');
    return;
  }

  const btn = $('btn-factory-reset');
  btn.disabled    = true;
  btn.textContent = 'Resetting…';
  try {
    const { getDocs, deleteDoc, collection: col } =
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

    for (const colName of [COL.ITEMS, COL.CATEGORIES]) {
      const snap = await getDocs(col(db, colName));
      for (const d of snap.docs) { await deleteDoc(d.ref); }
    }

    Object.keys(_paneCache).forEach(k => delete _paneCache[k]);
    toast('All content deleted. Run seed.js to restore defaults.', 'error');
    loadOverviewStats();
  } catch (err) { toast(err.message, 'error'); } finally {
    btn.disabled    = false;
    btn.textContent = 'Reset All Content…';
  }
});

// ══════════════════════════════════════════════════════════════
// SETTINGS PANE
// ══════════════════════════════════════════════════════════════
async function loadSettings(user) {
  if (!user) return;
  $('settings-email').textContent = 'Administrator';
  $('settings-uid').textContent   = user.uid   || '';

  // Check admin claim
  try {
    const adminOk = await isAdmin();
    const el = $('settings-admin-claim');
    el.textContent = adminOk ? '✓ Confirmed' : '✕ Not set — run set-admin-claim.js';
    el.style.color = adminOk ? '#81c995' : '#f28b82';
  } catch { $('settings-admin-claim').textContent = 'Could not verify'; }

  // Migration status
  try {
    const migrated = await isMigrated();
    const el = $('settings-migration');
    el.textContent = migrated ? '✓ Seeded (v1)' : '✗ Not seeded — run seed.js';
    el.style.color = migrated ? '#81c995' : '#f28b82';
  } catch { $('settings-migration').textContent = 'Could not check'; }
}

$('btn-send-reset-settings').addEventListener('click', async () => {
  const user = currentUser();
  if (!user?.email) return;
  try {
    await resetPassword(user.email);
    const el = $('settings-reset-msg');
    el.textContent = `Reset email sent to ${user.email}.`;
    show(el);
    toast('Reset email sent.', 'success');
  } catch (err) { toast(err.message, 'error'); }
});

// ══════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUT  Ctrl+Shift+A  (from any page)
// ══════════════════════════════════════════════════════════════
window.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey &&
      (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.location.href = 'admin.html';
  }
});

// ══════════════════════════════════════════════════════════════
// ESCAPE closes modal
// ══════════════════════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dishModal.classList.contains('open')) {
    closeDishModal();
  }
});

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
buildMobileTabs();

// ══════════════════════════════════════════════════════════════
// SAFE HTML ESCAPE
// ══════════════════════════════════════════════════════════════
function _esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
