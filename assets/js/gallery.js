/**
 * gallery.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Lightweight vanilla-JS lightbox for the gallery feature.
 * No dependencies. ~5 KB unminified.
 *
 * How to include:
 *   Copy this file to:  static/js/gallery.js
 *   Then add ONE of the following to your site:
 *
 *   Option A – in layouts/gallery/single.html, add before {{ end }}:
 *     <script src="/js/gallery.js" defer></script>
 *
 *   Option B – add to your site-wide footer partial if you prefer it global.
 * ──────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /** Collect all .gallery-item anchors on the page */
  function getItems() {
    return Array.from(document.querySelectorAll('.gallery-item'));
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let items = [];
  let currentIndex = 0;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const lightbox        = document.getElementById('gallery-lightbox');
  const lightboxImg     = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const btnClose        = document.getElementById('lightbox-close');
  const btnPrev         = document.getElementById('lightbox-prev');
  const btnNext         = document.getElementById('lightbox-next');

  if (!lightbox) return; // no gallery on this page

  // ── Open / close ───────────────────────────────────────────────────────────
  function open(index) {
    items = getItems();
    currentIndex = index;
    show(currentIndex, false);
    lightbox.removeAttribute('hidden');
    // rAF lets the browser paint the hidden→flex change before we add is-open
    requestAnimationFrame(() => {
      requestAnimationFrame(() => lightbox.classList.add('is-open'));
    });
    document.body.style.overflow = 'hidden';
    trapFocus(lightbox);
    btnClose.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.addEventListener('transitionend', function handler() {
      lightbox.setAttribute('hidden', '');
      lightbox.removeEventListener('transitionend', handler);
    });
    document.body.style.overflow = '';
    // Return focus to the item that opened the lightbox
    if (items[currentIndex]) items[currentIndex].focus();
  }

  // ── Show a specific image ──────────────────────────────────────────────────
  function show(index, animate) {
    const item = items[index];
    if (!item) return;

    const src     = item.getAttribute('href');
    const caption = item.dataset.caption || item.querySelector('img')?.alt || '';

    if (animate) {
      lightboxImg.classList.add('is-animating');
      setTimeout(() => {
        lightboxImg.src = src;
        lightboxImg.alt = caption;
        lightboxCaption.textContent = caption;
        lightboxImg.classList.remove('is-animating');
      }, 180);
    } else {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
      lightboxCaption.textContent = caption;
    }

    // Show/hide prev & next buttons at the edges
    btnPrev.style.visibility = index > 0              ? 'visible' : 'hidden';
    btnNext.style.visibility = index < items.length-1 ? 'visible' : 'hidden';
  }

  function prev() {
    if (currentIndex > 0) { currentIndex--; show(currentIndex, true); }
  }

  function next() {
    if (currentIndex < items.length - 1) { currentIndex++; show(currentIndex, true); }
  }

  // ── Touch / swipe support ──────────────────────────────────────────────────
  let touchStartX = null;

  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) { diff < 0 ? next() : prev(); }
    touchStartX = null;
  }, { passive: true });

  // ── Keyboard navigation ────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    switch (e.key) {
      case 'Escape':    close();  break;
      case 'ArrowLeft': prev();   break;
      case 'ArrowRight':next();   break;
    }
  });

  // ── Click outside image closes lightbox ───────────────────────────────────
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  // ── Button events ──────────────────────────────────────────────────────────
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  prev);
  btnNext.addEventListener('click',  next);

  // ── Attach click handlers to all gallery items ────────────────────────────
  document.addEventListener('click', e => {
    const anchor = e.target.closest('.gallery-item');
    if (!anchor) return;
    e.preventDefault();
    items = getItems();
    const index = parseInt(anchor.dataset.index ?? '0', 10);
    open(isNaN(index) ? 0 : index);
  });

  // ── Focus trap (accessibility) ─────────────────────────────────────────────
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    container.addEventListener('keydown', function trap(e) {
      if (e.key !== 'Tab') return;
      if (!lightbox.classList.contains('is-open')) {
        container.removeEventListener('keydown', trap);
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  }

})();
