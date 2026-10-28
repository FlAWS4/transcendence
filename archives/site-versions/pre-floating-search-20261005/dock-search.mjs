/**
 * Search inside the existing navigation dock without replacing its menu buttons.
 * search(query, {offset, limit}) returns an array or {results, total, hasMore}.
 * Array responses are treated as complete local results; every result is
 * passed unchanged to onSelect. The controller owns data, routing and the map.
 */
export function mountDockSearch({nav, getLocale = () => 'fr', search, onSelect, onLayout = () => {}}) {
  if (!nav || typeof search !== 'function' || typeof onSelect !== 'function') {
    throw new TypeError('mountDockSearch needs nav, search and onSelect.');
  }
  const copy = {
    fr: {
      open: 'Rechercher dans Horizon', close: 'Fermer la recherche',
      label: 'Rechercher un campus ou un contenu', placeholder: 'Un campus, un projet, une histoire…',
      empty: 'Cherche un campus, un projet, un parcours ou un article.',
      scope: 'Dans tout Horizon', none: 'Aucun résultat. Essaie un autre mot.',
      error: 'La recherche est momentanément indisponible.',
      results: n => n + ' résultat' + (n === 1 ? '' : 's'),
      more: (n, total) => n + ' résultats sur ' + total,
      showMore: 'Voir plus', loadingMore: 'Chargement…',
      type: {campus: 'Campus', project: 'Projet', people: 'Parcours', journal: 'Journal'},
    },
    en: {
      open: 'Search Horizon', close: 'Close search',
      label: 'Search for a campus or story', placeholder: 'A campus, a project, a story…',
      empty: 'Find a campus, project, journey or journal story.',
      scope: 'Across all of Horizon', none: 'No results. Try another word.',
      error: 'Search is temporarily unavailable.',
      results: n => n + ' result' + (n === 1 ? '' : 's'),
      more: (n, total) => n + ' of ' + total + ' results',
      showMore: 'Show more', loadingMore: 'Loading…',
      type: {campus: 'Campus', project: 'Project', people: 'Journey', journal: 'Journal'},
    },
    ar: {
      open: 'البحث في أفق', close: 'إغلاق البحث',
      label: 'البحث عن حرم أو محتوى', placeholder: 'حرم أو مشروع أو حكاية…',
      empty: 'ابحث عن حرم أو مشروع أو مسار أو مقال.',
      scope: 'في أفق بالكامل', none: 'لا توجد نتائج. جرّب كلمة أخرى.',
      error: 'البحث غير متاح مؤقتًا.',
      results: n => 'عدد النتائج: ' + n,
      more: (n, total) => n + ' نتائج من أصل ' + total,
      showMore: 'عرض المزيد', loadingMore: 'جارٍ التحميل…',
      type: {campus: 'حرم', project: 'مشروع', people: 'مسار', journal: 'مجلة'},
    },
  };
  const doc = nav.ownerDocument;
  const win = doc.defaultView;
  const abort = new win.AbortController();
  const signal = abort.signal;
  const menus = [...nav.children].filter(node => node.matches('button[data-section]'));
  const originals = menus.map(button => ({
    button, inert: button.inert, hidden: button.getAttribute('aria-hidden'),
    order: button.style.getPropertyValue('--dock-menu-order'),
  }));
  const prefix = (nav.id || 'horizon-navigation') + '-search';
  let opened = false, destroyed = false, active = -1, results = [], total = 0;
  let renderedQuery = '';
  let hasMore = false, nextOffset = 0, paging = false, pendingSearch = false;
  const viewport = win.visualViewport;
  let layoutFrame = 0, queryFrame = 0, requestId = 0;
  let scrollFrame = 0, scrollIdleTimer = 0;
  let lastDocumentScroll = Number(win.scrollY) || 0;
  let scrollSuspended = false, scrollSuspension = 0;

  function text(name) { return (copy[getLocale()] || copy.fr)[name]; }
  function element(tag, className, value) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function icon(kind) {
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (kind === 'search') {
      const circle = doc.createElementNS(svg.namespaceURI, 'circle');
      circle.setAttribute('cx', '10.5'); circle.setAttribute('cy', '10.5'); circle.setAttribute('r', '6.5');
      svg.append(circle);
    }
    const path = doc.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', kind === 'search' ? 'm16 16 4.5 4.5' : 'm6 6 12 12M6 18 18 6');
    svg.append(path);
    return svg;
  }

  const toggle = element('button', 'dock-search-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', prefix + '-form');
  toggle.append(icon('search'));
  const form = element('form', 'dock-search-form');
  form.id = prefix + '-form';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-hidden', 'true');
  form.inert = true;
  const searchIcon = element('span', 'dock-search-form-icon');
  searchIcon.setAttribute('aria-hidden', 'true');
  searchIcon.append(icon('search'));
  const input = element('input', 'dock-search-input');
  input.type = 'search';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.enterKeyHint = 'search';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', prefix + '-results');
  const closeButton = element('button', 'dock-search-close');
  closeButton.type = 'button';
  closeButton.append(icon('close'));
  form.append(searchIcon, input, closeButton);

  const panel = element('section', 'dock-search-panel');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  const heading = element('div', 'dock-search-panel-heading');
  const scopeLabel = element('p', 'dock-search-scope');
  const status = element('p', 'dock-search-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  heading.append(scopeLabel, status);
  const helper = element('p', 'dock-search-helper');
  const list = element('div', 'dock-search-results');
  list.id = prefix + '-results';
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  const moreButton = element('button', 'dock-search-more');
  moreButton.type = 'button';
  moreButton.hidden = true;
  panel.append(heading, helper, list, moreButton);

  const shell = element('div', 'dock-shell');
  if (!nav.parentNode) throw new TypeError('The search dock needs a mounted navigation.');
  nav.parentNode.insertBefore(shell, nav);
  shell.append(nav, toggle);
  shell.dataset.searchOpen = 'false';
  nav.classList.add('has-dock-search');
  nav.dataset.searchOpen = 'false';
  menus.forEach((button, index) => button.style.setProperty('--dock-menu-order', String(index)));
  nav.append(form, panel);

  function layout() {
    if (destroyed) return;
    win.cancelAnimationFrame(layoutFrame);
    layoutFrame = win.requestAnimationFrame(() => { layoutFrame = 0; if (!destroyed) onLayout(); });
  }
  function updateViewport() {
    if (destroyed) return;
    const height = viewport?.height || win.innerHeight;
    const offset = opened && viewport ? Math.max(0, win.innerHeight - height - viewport.offsetTop) : 0;
    shell.style.setProperty('--dock-keyboard-offset', offset + 'px');
    shell.style.setProperty('--dock-search-viewport-height', height + 'px');
    layout();
  }
  // Routing can clamp the old scroll offset while replacing the document,
  // then restore its destination on the next frame. Keep the dock visible for
  // that entire transaction and sample the actual position before listening again.
  function suspendDocumentScroll() {
    const suspension = ++scrollSuspension;
    scrollSuspended = true;
    win.cancelAnimationFrame(scrollFrame);
    win.clearTimeout(scrollIdleTimer);
    scrollFrame = 0; scrollIdleTimer = 0;
    delete shell.dataset.documentScrolling;
    return () => {
      if (destroyed || suspension !== scrollSuspension) return;
      lastDocumentScroll = Number(win.scrollY) || 0;
      scrollSuspended = false;
    };
  }
  // Only real document movement changes the glass; map gestures and nested
  // result scrolling never enter this handler through event capture. A short
  // pause between wheel/touch bursts keeps the glass in the same state.
  function documentScrolled(event) {
    if (destroyed || (event.target !== doc && event.target !== win)) return;
    const position = Number(win.scrollY) || 0;
    if (position === lastDocumentScroll) return;
    lastDocumentScroll = position;
    if (scrollSuspended) return;
    win.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = win.setTimeout(() => {
      scrollIdleTimer = 0;
      win.cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      if (!destroyed) delete shell.dataset.documentScrolling;
    }, 400);
    if (!scrollFrame) scrollFrame = win.requestAnimationFrame(() => {
      scrollFrame = 0;
      if (!destroyed && scrollIdleTimer) shell.dataset.documentScrolling = 'true';
    });
  }
  function restoreMenus() {
    for (const item of originals) {
      item.button.inert = item.inert;
      if (item.hidden === null) item.button.removeAttribute('aria-hidden');
      else item.button.setAttribute('aria-hidden', item.hidden);
    }
  }
  function setActive(next, scroll = true) {
    active = next >= 0 && next < results.length ? next : -1;
    [...list.children].forEach((node, index) => node.setAttribute('aria-selected', String(index === active)));
    if (active >= 0) {
      const option = list.children[active];
      input.setAttribute('aria-activedescendant', option.id);
      if (scroll) option.scrollIntoView({block: 'nearest', inline: 'nearest'});
    } else input.removeAttribute('aria-activedescendant');
  }
  function render(payload, query, {append = false, offset = 0} = {}) {
    renderedQuery = query;
    const all = Array.isArray(payload);
    const raw = all ? payload : payload?.results || [];
    const page = (all ? raw.slice(offset, offset + 8) : raw.slice(0, 8));
    const valid = page.filter(result => result && typeof result.title === 'string');
    const previousCount = results.length;
    const previousActive = active;
    const focusNewPage = append && doc.activeElement === moreButton;
    if (focusNewPage) input.focus({preventScroll: true});
    const key = result => result.id || [result.type, result.section, result.entryId, result.campusId, result.title].join('|');
    const seen = new Set();
    results = (append ? [...results, ...valid] : valid).filter(result => {
      const id = key(result);
      if (seen.has(id)) return false;
      seen.add(id); return true;
    });
    nextOffset = offset + page.length;
    total = all ? raw.length : Math.max(Number(payload?.total) || results.length, results.length);
    const remaining = !all && typeof payload?.hasMore === 'boolean' ? payload.hasMore : nextOffset < total;
    hasMore = Boolean(query && remaining && page.length);
    paging = false; pendingSearch = false;
    moreButton.hidden = !hasMore;
    moreButton.disabled = false;
    moreButton.textContent = text('showMore');
    list.replaceChildren();
    active = -1;
    input.removeAttribute('aria-activedescendant');
    input.setAttribute('aria-expanded', String(opened && results.length > 0));
    helper.hidden = results.length > 0;
    list.hidden = results.length === 0;
    if (!query) {
      status.textContent = '';
      helper.textContent = text('empty');
      return;
    }
    status.textContent = total > results.length ? text('more')(results.length, total) : text('results')(total);
    helper.textContent = text('none');
    for (const [index, result] of results.entries()) {
      const option = element('button', 'dock-search-result');
      option.type = 'button';
      option.id = prefix + '-option-' + index;
      option.dataset.resultIndex = String(index);
      option.tabIndex = -1;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      const content = element('span', 'dock-search-result-copy');
      const title = element('span', 'dock-search-result-title', result.title);
      title.dir = 'auto';
      content.append(title);
      if (result.subtitle) {
        const subtitle = element('span', 'dock-search-result-subtitle', result.subtitle);
        subtitle.dir = 'auto';
        content.append(subtitle);
      }
      const type = element('span', 'dock-search-result-type', text('type')[result.type] || '');
      option.append(content, type);
      list.append(option);
    }
    if (append) setActive(focusNewPage ? Math.min(previousCount, results.length - 1) : previousActive, focusNewPage);
  }
  async function refresh() {
    const id = ++requestId;
    if (!opened || destroyed) return false;
    const query = input.value.trim();
    paging = false; pendingSearch = true;
    moreButton.disabled = true;
    nav.dataset.searchQuery = String(Boolean(query));
    if (!query) { render([], query); return true; }
    try {
      const payload = await search(query, {offset: 0, limit: 8});
      if (id === requestId && opened && !destroyed && input.value.trim() === query) {
        render(payload, query);
        return true;
      }
    } catch {
      if (id !== requestId || !opened || destroyed) return false;
      results = []; total = 0; hasMore = false; nextOffset = 0;
      paging = false; pendingSearch = false;
      list.replaceChildren(); list.hidden = true; moreButton.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      status.textContent = '';
      helper.hidden = false;
      helper.textContent = text('error');
    }
    return false;
  }
  async function loadMore() {
    if (!opened || destroyed || paging || pendingSearch || !hasMore || input.value.trim() !== renderedQuery) return;
    const id = ++requestId;
    const query = renderedQuery, offset = nextOffset;
    paging = true;
    moreButton.disabled = true;
    moreButton.textContent = text('loadingMore');
    try {
      const payload = await search(query, {offset, limit: 8});
      if (id === requestId && opened && !destroyed && input.value.trim() === query) render(payload, query, {append: true, offset});
    } catch {
      if (id !== requestId || !opened || destroyed) return;
      status.textContent = text('error');
    } finally {
      if (id === requestId && opened && !destroyed) {
        paging = false;
        moreButton.disabled = false;
        moreButton.textContent = text('showMore');
      }
    }
  }
  function queueRefresh() {
    requestId++;
    pendingSearch = true;
    moreButton.disabled = true;
    setActive(-1, false);
    win.cancelAnimationFrame(queryFrame);
    queryFrame = win.requestAnimationFrame(() => { queryFrame = 0; refresh(); });
  }
  function open() {
    if (opened || destroyed) return;
    opened = true;
    nav.dataset.searchOpen = 'true';
    shell.dataset.searchOpen = 'true';
    updateViewport();
    toggle.setAttribute('aria-expanded', 'true');
    form.inert = false;
    form.setAttribute('aria-hidden', 'false');
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    refresh();
    input.focus({preventScroll: true});
    toggle.inert = true;
    toggle.setAttribute('aria-hidden', 'true');
    for (const button of menus) { button.inert = true; button.setAttribute('aria-hidden', 'true'); }
    layout();
  }
  function close({restoreFocus = true} = {}) {
    if (!opened || destroyed) return;
    opened = false;
    requestId++;
    paging = false; pendingSearch = false;
    nav.dataset.searchOpen = 'false';
    shell.dataset.searchOpen = 'false';
    updateViewport();
    toggle.inert = false;
    toggle.removeAttribute('aria-hidden');
    toggle.setAttribute('aria-expanded', 'false');
    form.inert = true;
    form.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    restoreMenus();
    if (restoreFocus) toggle.focus({preventScroll: true});
    layout();
  }
  function choose(index) {
    if (!opened || destroyed) return;
    if (input.value.trim() !== renderedQuery) { refresh(); return; }
    const result = results[index];
    if (!result) return;
    close({restoreFocus: false});
    onSelect(result);
  }
  function localize() {
    toggle.setAttribute('aria-label', text('open'));
    toggle.title = text('open');
    closeButton.setAttribute('aria-label', text('close'));
    closeButton.title = text('close');
    form.setAttribute('aria-label', text('open'));
    input.setAttribute('aria-label', text('label'));
    input.placeholder = text('placeholder');
    list.setAttribute('aria-label', text('label'));
    panel.setAttribute('aria-label', text('open'));
    scopeLabel.textContent = text('scope');
    helper.textContent = text('empty');
    moreButton.textContent = text('showMore');
    if (opened) refresh();
    layout();
  }
  function resultOption(event) {
    const option = event.target.closest?.('.dock-search-result');
    return option && list.contains(option) ? option : null;
  }
  list.addEventListener('pointermove', event => {
    const option = resultOption(event);
    if (option) setActive(Number(option.dataset.resultIndex), false);
  }, {signal});
  list.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && resultOption(event)) event.preventDefault();
  }, {signal});
  list.addEventListener('click', event => {
    const option = resultOption(event);
    if (option) choose(Number(option.dataset.resultIndex));
  }, {signal});
  moreButton.addEventListener('click', loadMore, {signal});
  toggle.addEventListener('click', open, {signal});
  closeButton.addEventListener('click', () => close(), {signal});
  input.addEventListener('input', event => { if (!event.isComposing) queueRefresh(); }, {signal});
  input.addEventListener('compositionend', queueRefresh, {signal});
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (input.value.trim() !== renderedQuery) {
      win.cancelAnimationFrame(queryFrame); queryFrame = 0;
      const pending = refresh();
      const submittedRequest = requestId;
      const applied = await pending;
      if (!applied || submittedRequest !== requestId) return;
    }
    if (opened && input.value.trim() === renderedQuery) choose(active < 0 ? 0 : active);
  }, {signal});
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!results.length) return;
      event.preventDefault();
      const next = active < 0 ? (event.key === 'ArrowDown' ? 0 : results.length - 1)
        : (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      setActive(next);
    }
  }, {signal});
  shell.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  }, {signal});
  doc.addEventListener('pointerdown', event => {
    if (opened && !shell.contains(event.target)) close({restoreFocus: false});
  }, {signal});
  doc.addEventListener('focusin', event => {
    if (opened && !shell.contains(event.target)) close({restoreFocus: false});
  }, {signal});
  shell.addEventListener('transitionend', event => {
    if ((event.target === nav || event.target === shell) && event.propertyName === 'width') layout();
  }, {signal});
  viewport?.addEventListener('resize', updateViewport, {signal});
  viewport?.addEventListener('scroll', updateViewport, {signal});
  win.addEventListener('resize', updateViewport, {signal});
  win.addEventListener('scroll', documentScrolled, {passive: true, signal});
  const observer = new win.ResizeObserver(layout);
  observer.observe(nav);
  observer.observe(shell);
  updateViewport();
  localize();

  function destroy() {
    if (destroyed) return;
    close({restoreFocus: false});
    destroyed = true;
    abort.abort(); observer.disconnect(); requestId++;
    win.cancelAnimationFrame(layoutFrame); win.cancelAnimationFrame(queryFrame);
    win.cancelAnimationFrame(scrollFrame); win.clearTimeout(scrollIdleTimer);
    scrollFrame = 0; scrollIdleTimer = 0;
    delete shell.dataset.documentScrolling;
    restoreMenus();
    for (const item of originals) {
      if (item.order) item.button.style.setProperty('--dock-menu-order', item.order);
      else item.button.style.removeProperty('--dock-menu-order');
    }
    toggle.remove(); form.remove(); panel.remove();
    if (shell.parentNode) shell.parentNode.insertBefore(nav, shell);
    shell.remove();
    nav.classList.remove('has-dock-search');
    delete nav.dataset.searchOpen; delete nav.dataset.searchQuery;
    shell.style.removeProperty('--dock-keyboard-offset');
    shell.style.removeProperty('--dock-search-viewport-height');
    onLayout();
  }
  return {localize, refresh, close, suspendDocumentScroll, destroy};
}
