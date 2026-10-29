/*
 * MonetaScale – Nutzung der persönlichen Seiten (monetascale.de/<seite>/)
 *
 * Zählt, was auf der Seite passiert: Aufruf, Zeit, gesehene Abschnitte,
 * Videos, Förder-Check, Gespräch, Kacheln. Ohne Cookies, ohne Speicher im
 * Browser, ohne Geräte-Merkmale. Gesendet werden nur: Seite, Ereignis, Ziel,
 * Wert, grobe Herkunft und eine Besuchs-Kennung, die nur im Arbeitsspeicher
 * dieser geöffneten Seite lebt. Mit ?intern=1 in der Adresse wird nichts
 * gesendet (eigene Besuche, Prüfungen).
 *
 * Eigene Stellen der Seite melden sich über window.msLp(art, ziel, wert).
 */
(function () {
  'use strict';
  var skript = document.currentScript;
  var ZIEL = (skript && skript.getAttribute('data-ziel')) || 'https://dashboard.ulas.systems/api/lp/ereignis';
  var leer = function () {};
  var p;
  try { p = new URLSearchParams(location.search); } catch { window.msLp = leer; return; }
  var slug = (location.pathname.split('/')[1] || '').toLowerCase();
  if (p.get('intern') === '1' || !/^[a-z0-9-]{1,80}$/.test(slug) || !window.JSON) { window.msLp = leer; return; }

  function norm(t) {
    return String(t || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  // Besuchs-Kennung: zufällig, nur im Arbeitsspeicher (nicht gespeichert).
  var besuch = '';
  var zeichen = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var zufall = new Uint8Array(12);
  (window.crypto || window.msCrypto).getRandomValues(zufall);
  for (var i = 0; i < zufall.length; i++) besuch += zeichen.charAt(zufall[i] % zeichen.length);

  // Grobe Herkunft: ?q=mail|dm|… aus dem Link, sonst die Domain der Vorseite.
  function herkunft() {
    var q = norm(p.get('q'));
    if (q) return q;
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch { /* still */ }
    if (!ref || ref === location.hostname) return 'direkt';
    if (/(^|\.)instagram\.com$/.test(ref)) return 'instagram';
    if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(ref)) return 'facebook';
    if (/(^|\.)(linkedin\.com|lnkd\.in)$/.test(ref)) return 'linkedin';
    if (/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|web\.de|gmx\.(de|net)|t-online\.de)$/.test(ref)) return 'mail';
    if (/(^|\.)google\./.test(ref)) return 'google';
    return ref.replace(/^www\./, '').replace(/[^a-z0-9.-]/g, '').slice(0, 60) || 'direkt';
  }

  var schlange = [];
  var plan = null;
  function senden() {
    clearTimeout(plan);
    plan = null;
    while (schlange.length) {
      var text = JSON.stringify({ e: schlange.splice(0, 20) });
      var ok = false;
      try { ok = navigator.sendBeacon && navigator.sendBeacon(ZIEL, text); } catch { /* still */ }
      if (!ok) {
        try { fetch(ZIEL, { method: 'POST', body: text, keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } }).catch(leer); } catch { /* still */ }
      }
    }
  }
  var gemeldet = {};
  function msLp(art, ziel, wert, einmal) {
    var schluessel = art + '|' + (ziel || '') + '|' + (wert == null ? '' : wert);
    if (einmal !== false && gemeldet[schluessel]) return;
    gemeldet[schluessel] = 1;
    var e = { s: slug, a: art, b: besuch };
    if (ziel) e.z = norm(ziel);
    if (typeof wert === 'number' && isFinite(wert)) e.w = Math.round(wert);
    if (art === 'aufruf') e.h = herkunft();
    schlange.push(e);
    if (art === 'aufruf' || art === 'gespraech' || (art === 'check' && e.z === 'ergebnis')) senden();
    else if (!plan) plan = setTimeout(senden, 1500);
  }
  window.msLp = msLp;
  window.addEventListener('pagehide', senden);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') senden(); });

  msLp('aufruf');

  // Zeit auf der Seite (nur sichtbar): 10 s, 30 s, 2 min.
  var sekunden = 0;
  var marken = [10, 30, 120];
  var uhr = setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    sekunden++;
    if (sekunden === marken[0]) { msLp('zeit', null, marken.shift()); if (!marken.length) clearInterval(uhr); }
  }, 1000);

  function bereit(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  bereit(function () {
    // Abschnitte gesehen
    var abschnitte = { reels: 'videos', strategie: 'strategie', check: 'foerdercheck', weiter: 'paket' };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (eintraege) {
        eintraege.forEach(function (en) {
          if (en.isIntersecting) { msLp('abschnitt', abschnitte[en.target.id]); io.unobserve(en.target); }
        });
      }, { threshold: 0.35 });
      Object.keys(abschnitte).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }

    // Videos: gestartet, 25/50/75/100 %
    Array.prototype.forEach.call(document.querySelectorAll('.reel-video video, video[data-lp]'), function (v, n) {
      var name = v.getAttribute('data-lp') || 'reel-' + (n + 1);
      v.addEventListener('play', function () { msLp('video', name, 0); });
      v.addEventListener('timeupdate', function () {
        if (!v.duration || !isFinite(v.duration)) return;
        var anteil = (v.currentTime / v.duration) * 100;
        [25, 50, 75].forEach(function (m) { if (anteil >= m) msLp('video', name, m); });
        if (anteil >= 97) msLp('video', name, 100);
      });
      v.addEventListener('ended', function () { msLp('video', name, 100); });
    });

    // Klicks (ein Lauscher für alles)
    document.addEventListener('click', function (ev) {
      var el = ev.target && ev.target.closest ? ev.target : null;
      if (!el) return;
      var t;
      if ((t = el.closest('a[href^="tel:"]'))) msLp('gespraech', 'tel');
      else if ((t = el.closest('#rrVcard'))) msLp('gespraech', 'vcard');
      else if ((t = el.closest('[data-rr-wahl]'))) msLp('gespraech', 'rueckruf-' + t.getAttribute('data-rr-wahl'));
      else if ((t = el.closest('[data-rueckruf]'))) msLp('gespraech', 'aufgeklappt');
      else if ((t = el.closest('#gsKnopf'))) msLp('geschenkt', 'aufgeklappt');
      else if ((t = el.closest('[data-aktion="pdf"]'))) msLp('pdf', null, null, false);
      else if ((t = el.closest('.lk-knopf'))) {
        var titel = t.querySelector('h3, h4, strong, .lk-titel');
        msLp('kachel', (titel && titel.textContent) || t.getAttribute('aria-controls'));
      } else if ((t = el.closest('.pakete-link a'))) msLp('pakete');
      else if ((t = el.closest('#modusKnopf'))) {
        setTimeout(function () { msLp('modus', document.documentElement.classList.contains('dunkel') || t.getAttribute('aria-pressed') === 'true' ? 'dunkel' : 'hell', null, false); }, 0);
      }
    }, true);

    // Formulare: Gespräch Schritt 2, Förder-Check geschenkt abgeschickt
    document.addEventListener('submit', function (ev) {
      var f = ev.target;
      if (!f || !f.id) return;
      if (f.id === 'rrForm') msLp('gespraech', 'schritt-2');
      if (f.id === 'gsForm') msLp('geschenkt', 'abgeschickt');
    }, true);
  });
})();
