/**
 * KateringKing — Menu Renderer
 *
 * Reads published menu data from Firestore and renders it into the
 * existing tab panels using the exact same CSS classes already defined
 * in styles.css.  If Firestore is unreachable the hardcoded HTML that
 * already exists in index.html stays visible as a fallback.
 *
 * Called once on DOMContentLoaded from the <script type="module"> block
 * added to index.html.
 */

import {
  getPublishedItems,
  getCategories,
  TABS,
} from './cms.js';

// ─── Entry point ─────────────────────────────────────────────
export async function renderAllMenus() {
  await Promise.allSettled([
    renderNonVeg(),
    renderVeg(),
    renderSignature(),
  ]);
}

// ══════════════════════════════════════════════════════════════
// NON-VEG & VEG  (mc-grid layout — category cards with dish lists)
// ══════════════════════════════════════════════════════════════

async function renderNonVeg() {
  await renderCategoryGrid(TABS.NONVEG, 'tab-nonveg');
}

async function renderVeg() {
  await renderCategoryGrid(TABS.VEG, 'tab-veg');
}

/**
 * Generic renderer for the mc-grid / mc-category / mc-list pattern
 * used by both Veg and Non-Veg tabs.
 */
async function renderCategoryGrid(tabId, panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const grid = panel.querySelector('.mc-grid');
  if (!grid) return;

  let categories, items;
  try {
    [categories, items] = await Promise.all([
      getCategories(tabId),
      getPublishedItems(tabId),
    ]);
  } catch (err) {
    console.warn(`[menu-renderer] Firestore unavailable for ${tabId}, keeping static HTML.`, err);
    return;        // fall back to hardcoded HTML
  }

  if (!categories.length && !items.length) return; // nothing seeded yet

  // Group items by categoryId
  const byCategory = {};
  for (const item of items) {
    const cid = item.categoryId || '__uncategorised__';
    if (!byCategory[cid]) byCategory[cid] = [];
    byCategory[cid].push(item);
  }

  const html = categories.map(cat => {
    const dishes = byCategory[cat.id] || [];
    const liHtml = dishes
      .map(d => `<li>${_esc(d.name)}</li>`)
      .join('');
    return `
      <div class="mc-category reveal-up">
        <h3 class="mc-cat-title">${_esc(cat.name)}</h3>
        <ul class="mc-list">${liHtml || '<li><em>No dishes yet.</em></li>'}</ul>
      </div>`;
  }).join('');

  grid.innerHTML = html;

  // Re-trigger scroll-reveal for newly injected elements
  _triggerReveal(grid);
}

// ══════════════════════════════════════════════════════════════
// SIGNATURE RESERVE  (heritage-course / sig-dish layout)
// ══════════════════════════════════════════════════════════════

async function renderSignature() {
  const panel = document.getElementById('tab-signature');
  if (!panel) return;

  let categories, items;
  try {
    [categories, items] = await Promise.all([
      getCategories(TABS.SIGNATURE),
      getPublishedItems(TABS.SIGNATURE),
    ]);
  } catch (err) {
    console.warn('[menu-renderer] Firestore unavailable for signature, keeping static HTML.', err);
    return;
  }

  if (!categories.length && !items.length) return;

  // Remove existing hardcoded heritage-course blocks
  panel.querySelectorAll('.heritage-course').forEach(el => el.remove());

  // Group items by categoryId, preserving category order
  const byCategory = {};
  for (const item of items) {
    const cid = item.categoryId || '__uncategorised__';
    if (!byCategory[cid]) byCategory[cid] = [];
    byCategory[cid].push(item);
  }

  const romanNumerals = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

  const courseBlocks = categories.map((cat, idx) => {
    const dishes = byCategory[cat.id] || [];
    const numeral = romanNumerals[idx] || String(idx + 1);

    // Decide layout modifier based on dish count
    const listClass = dishes.length === 1
      ? 'sig-dish-list sig-dish-list--single'
      : 'sig-dish-list';

    const dishCards = dishes.map(dish => _sigDishCard(dish)).join('');

    return `
      <div class="heritage-course reveal-up">
        <div class="course-header">
          <span class="course-number">${numeral}</span>
          <div>
            <h3 class="course-title">${_esc(cat.name)}</h3>
            ${cat.subtitle ? `<p class="course-subtitle">${_esc(cat.subtitle)}</p>` : ''}
          </div>
        </div>
        <div class="${listClass}">
          ${dishCards || '<p style="color:var(--text-dim);padding:1rem">No dishes yet.</p>'}
        </div>
      </div>`;
  }).join('');

  // Insert after .tab-intro
  const tabIntro = panel.querySelector('.tab-intro');
  if (tabIntro) {
    tabIntro.insertAdjacentHTML('afterend', courseBlocks);
  } else {
    panel.insertAdjacentHTML('beforeend', courseBlocks);
  }

  _triggerReveal(panel);
}

/**
 * Render a single sig-dish card with image + text body.
 * Mirrors the exact HTML structure used in the original index.html.
 */
function _sigDishCard(dish) {
  const imgSrc = _esc(dish.imageUrl || '');
  const imgAlt = _esc(`${dish.name}${dish.variant ? ' ' + dish.variant : ''}`);

  const imageBlock = imgSrc
    ? `<div class="sig-dish-img-wrap">
         <img
           src="${imgSrc}"
           alt="${imgAlt}"
           class="sig-dish-img"
           loading="lazy"
           onerror="this.closest('.sig-dish-img-wrap').classList.add('img-placeholder')"
         />
         <div class="sig-dish-img-overlay" aria-hidden="true"></div>
       </div>`
    : `<div class="sig-dish-img-wrap img-placeholder"></div>`;

  const variantHtml = dish.variant
    ? ` <span class="sig-dish-variant">${_esc(dish.variant)}</span>`
    : '';

  const priceHtml = dish.price
    ? `<p class="sig-dish-price">${_esc(dish.price)}</p>`
    : '';

  return `
    <div class="sig-dish reveal-up">
      ${imageBlock}
      <div class="sig-dish-body">
        <h4 class="sig-dish-name">${_esc(dish.name)}${variantHtml}</h4>
        ${dish.description ? `<p class="sig-dish-note">${_esc(dish.description)}</p>` : ''}
        ${priceHtml}
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Safely escape user-entered text for insertion into HTML.
 * Uses the browser's built-in escaping — never calls innerHTML
 * with untrusted data directly.
 */
function _esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Trigger IntersectionObserver-based reveal animations on
 * newly injected elements, mirroring what main.js does on load.
 */
function _triggerReveal(container) {
  // Give the browser one paint tick to register the new nodes
  requestAnimationFrame(() => {
    const els = container.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => {
      el.classList.remove('is-visible');
      observer.observe(el);
    });
  });
}
