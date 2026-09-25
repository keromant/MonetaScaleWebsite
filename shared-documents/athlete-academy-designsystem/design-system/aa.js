/* Athlete Academy – gemeinsames Verhalten (Kit, Muster-Seiten, Prototyp)
   - Theme:  ?theme=light|dark|system  oder localStorage "aa-theme"  -> html[data-theme]
   - Schrift: ?font=a|b|c              oder localStorage "aa-font"   -> html[data-font]
   - Buttons: Sweep läuft vollständig durch, erst danach feuert Link/Submit
   - Burger:  .aa-burger[aria-controls] öffnet/schließt .aa-menu
   Im <head> VOR dem CSS-Rendern einbinden (kein defer), damit nichts flackert. */
(function () {
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var FONTS = ['a', 'b', 'c'];

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = t === 'light' ? 'light' : t === 'dark' ? 'dark' : 'light dark';
  }
  function applyFont(f) { root.setAttribute('data-font', FONTS.indexOf(f) > -1 ? f : 'a'); }

  var theme = params.get('theme') || store('aa-theme') || 'system';
  var font = params.get('font') || store('aa-font') || 'a';
  if (params.get('theme')) store('aa-theme', theme);
  if (params.get('font')) store('aa-font', font);
  applyTheme(theme); applyFont(font);
  if (params.get('shot') !== null) root.setAttribute('data-shot', '');
  // Touch-Geräte (kein Maus-Hover) – für Kit-Beschriftungen und erzwungene Zustände
  if (params.get('touch') !== null || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) root.setAttribute('data-touch', '');

  window.AA = {
    setTheme: function (t) { store('aa-theme', t); applyTheme(t); document.dispatchEvent(new CustomEvent('aa:theme', { detail: t })); },
    setFont: function (f) { store('aa-font', f); applyFont(f); document.dispatchEvent(new CustomEvent('aa:font', { detail: f })); },
    theme: function () { return store('aa-theme') || 'system'; },
    font: function () { return root.getAttribute('data-font'); },
    isDark: function () {
      var t = root.getAttribute('data-theme');
      return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function finishLink(btn) {
    var href = btn.getAttribute('href');
    btn._acting = false; btn.classList.remove('is-activating');
    if (!href) return;
    if (href.indexOf('#/') === 0) { location.hash = href.slice(1); return; }      // Hash-Route (Prototyp)
    if (href.charAt(0) === '#') {
      if (href.length > 1) { var t = null; try { t = document.querySelector(href); } catch (e) {} if (t) t.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' }); }
      return;
    }
    window.location.href = href;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('a.aa-btn, button.aa-btn');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true' || btn.hasAttribute('data-no-sweep')) return;
    var isLink = btn.tagName === 'A';
    if (isLink && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1 || btn.target === '_blank')) return;
    if (!isLink && btn.type !== 'submit' && !btn.hasAttribute('data-sweep')) return;   // reine JS-Buttons nicht verzögern
    if (btn._acting) { e.preventDefault(); return; }
    var form = !isLink ? btn.closest('form') : null;
    if (form && !form.noValidate && !form.checkValidity()) return;                     // Browser-Validierung zuerst
    e.preventDefault(); btn._acting = true;

    var done = false;
    var finish = function () {
      if (done) return; done = true;
      if (isLink) return finishLink(btn);
      btn._acting = false; btn.classList.remove('is-activating');
      if (form) { btn.dispatchEvent(new CustomEvent('aa:submit', { bubbles: true })); if (!form.hasAttribute('data-js')) { form.requestSubmit ? form.requestSubmit(btn) : form.submit(); } }
      else btn.dispatchEvent(new CustomEvent('aa:activate', { bubbles: true }));
    };
    if (reduced.matches) return finish();                                           // ohne Animation sofort
    btn.classList.add('is-activating');
    btn.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 600);
  });

  // Burger-Menü
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-menu-toggle]');
    if (!t) return;
    var menu = document.getElementById(t.getAttribute('data-menu-toggle'));
    if (!menu) return;
    var open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    document.querySelectorAll('[data-menu-toggle="' + menu.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = menu.querySelector('a, button'); if (f) f.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = document.querySelector('.aa-menu.is-open');
    if (m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
  });
})();
