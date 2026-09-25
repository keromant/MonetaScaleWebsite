/* Athlete Academy – Camp-Prototyp
   Klickbarer Demo-Ablauf ohne Server: Daten liegen nur im localStorage dieses Browsers
   (Namensraum "aa-proto-v1:"). Keine echten Zahlungen, keine echten Nachrichten. */
(function () {
  'use strict';

  // ------------------------------------------------------------------ Grundlagen
  var ICONS = '../design-system/icons.svg';
  var LOGO_PNG = '../assets/logo/png/athlete-academy-horizontal-gold.png';
  var NS = 'aa-proto-v1:';
  var app = document.getElementById('app');

  function ic(n, cls) { return '<svg class="aa-ico ' + (cls || '') + '" aria-hidden="true"><use href="' + ICONS + '#' + n + '"/></svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function now() { return window.__AA_NOW__ ? new Date(window.__AA_NOW__) : new Date(); }
  function load(k, d) { try { var v = localStorage.getItem(NS + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { /* privat/gesperrt: Demo läuft im Speicher weiter */ } }
  function drop(k) { try { localStorage.removeItem(NS + k); } catch (e) {} }

  // ------------------------------------------------------------------ Formate
  var MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  function d(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
  function fmtDate(s) { var x = d(s); return String(x.getDate()).padStart(2, '0') + '.' + String(x.getMonth() + 1).padStart(2, '0') + '.' + x.getFullYear(); }
  function fmtShort(s) { var x = d(s); return x.getDate() + '.' + (x.getMonth() + 1) + '.'; }
  function fmtRange(a, b) {
    var x = d(a), y = d(b);
    if (a === b) return fmtDate(a);
    if (x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear()) return x.getDate() + '.–' + fmtDate(b);
    return fmtShort(a) + '–' + fmtDate(b);
  }
  function badgeDate(c) {
    var x = d(c.from), y = d(c.to);
    var b = x.getDate() === y.getDate() && c.from === c.to ? String(x.getDate()) : x.getDate() + '–' + y.getDate();
    var m = x.getMonth() === y.getMonth() ? MON[x.getMonth()] : MON[x.getMonth()] + '/' + MON[y.getMonth()];
    return { b: b, m: m };
  }
  function days(c) { return Math.round((d(c.to) - d(c.from)) / 864e5) + 1; }
  function euro(n, cents) { return Number(n).toLocaleString('de-DE', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 }) + ' €'; }
  function ago(ts) {
    var m = Math.round((now() - new Date(ts)) / 6e4);
    if (m < 1) return 'gerade eben'; if (m < 60) return 'vor ' + m + ' Min.';
    var h = Math.round(m / 60); if (h < 24) return 'vor ' + h + ' Std.';
    var t = Math.round(h / 24); return t === 1 ? 'gestern' : 'vor ' + t + ' Tagen';
  }
  function clock(ts) { var x = new Date(ts); return String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0'); }
  function initials(a, b) { return ((a || '?')[0] + (b || '')[0]).toUpperCase(); }
  function slug(s) { return String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'camp'; }

  // ------------------------------------------------------------------ Beispieldaten
  var KIDS = ['Leon', 'Mika', 'Emil', 'Noah', 'Paul', 'Ben', 'Finn', 'Elias', 'Jonas', 'Luis', 'Felix', 'Lina', 'Emma', 'Mia', 'Hannah', 'Ella', 'Lea', 'Maja', 'Tom', 'Anton', 'Moritz', 'Jakob', 'Luca', 'Theo', 'Henry', 'Matteo', 'Nele', 'Clara', 'Ida', 'Oskar', 'Karl', 'Samuel', 'Levi', 'Jonah', 'Ole', 'Frieda'];
  var PARENTS = ['Sandra', 'Thomas', 'Julia', 'Michael', 'Katrin', 'Stefan', 'Anna', 'Daniel', 'Nicole', 'Markus', 'Sabine', 'Christian', 'Melanie', 'Andreas'];
  var LAST = ['Kühn', 'Maier', 'Schulz', 'Wagner', 'Becker', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Hartmann', 'Lange', 'Krause', 'Werner', 'Lehmann', 'Walter'];
  var HEALTH = ['', '', '', 'Heuschnupfen', '', 'Asthma-Spray im Rucksack', '', '', 'Laktoseintoleranz', ''];

  function seed() {
    var camps = [
      { id: 'herbst-technik', title: 'Herbstcamp Technik', from: '2026-10-13', to: '2026-10-15', t1: '09:30', t2: '15:00',
        place: 'Sportanlage Süd', meet: 'Haupteingang, 15 Minuten vor Beginn', y1: 2012, y2: 2015, cap: 16, price: 189, early: 169, earlyUntil: '2026-09-30',
        sibling: 10, deadline: '2026-10-06', art: 'a', status: 'online', waitlist: true, online: true, invoice: true,
        text: 'Drei Tage mit einem klaren Schwerpunkt: Ballannahme, Passspiel und Dribbling unter Druck. Jeden Tag eine Technikeinheit am Vormittag, am Nachmittag Spielformen in kleinen Teams. Am letzten Tag spielen alle ein Abschlussturnier.',
        incl: ['Trikot und Trinkflasche', 'Mittagessen, Obst und Wasser', 'Abschlussturnier mit Urkunde', 'Kurzer Bericht für die Eltern'],
        bring: ['Fußballschuhe für Kunstrasen', 'Schienbeinschoner', 'Wetterfeste Kleidung', 'Sonnencreme oder Mütze'] },
      { id: 'speed-dribbling', title: 'Speed & Dribbling', from: '2026-10-27', to: '2026-10-30', t1: '10:00', t2: '15:30',
        place: 'Kunstrasen am Stadtpark', meet: 'Vereinsheim, Eingang Parkseite', y1: 2010, y2: 2013, cap: 16, price: 229, early: null, earlyUntil: null,
        sibling: 10, deadline: '2026-10-20', art: 'b', status: 'online', waitlist: true, online: true, invoice: true,
        text: 'Vier Tage Tempo: Antritt, Richtungswechsel und Eins-gegen-eins. Mit Zeitmessung am ersten und letzten Tag, damit jedes Kind seinen Fortschritt sieht.',
        incl: ['Trikot und Trinkflasche', 'Mittagessen, Obst und Wasser', 'Sprintmessung am ersten und letzten Tag', 'Abschlussturnier mit Urkunde'],
        bring: ['Fußballschuhe für Kunstrasen', 'Schienbeinschoner', 'Wechselkleidung'] },
      { id: 'winter-torabschluss', title: 'Wintercamp Torabschluss', from: '2026-12-22', to: '2026-12-23', t1: '10:00', t2: '14:00',
        place: 'Soccerhalle West', meet: 'Foyer der Halle', y1: 2011, y2: 2016, cap: 12, price: 119, early: null, earlyUntil: null,
        sibling: 10, deadline: '2026-12-15', art: 'c', status: 'online', waitlist: true, online: true, invoice: true,
        text: 'Zwei Tage in der Halle, alles rund ums Tor: Schusstechnik mit beiden Füßen, Abschluss nach Dribbling und Kopfball. In kleinen Gruppen mit viel Wiederholung.',
        incl: ['Trikot', 'Mittagssnack und Wasser', 'Torschuss-Challenge mit Urkunde'], bring: ['Hallenschuhe', 'Schienbeinschoner', 'Trinkflasche'] },
      { id: 'ostercamp-2027', title: 'Ostercamp Allround', from: '2027-03-29', to: '2027-04-01', t1: '09:30', t2: '15:00',
        place: 'Sportanlage Süd', meet: 'Haupteingang', y1: 2011, y2: 2017, cap: 20, price: 199, early: 179, earlyUntil: '2027-02-28',
        sibling: 10, deadline: '2027-03-20', art: 'a', status: 'draft', waitlist: true, online: true, invoice: true,
        text: 'Vier Tage mit allem, was ein Fußballtag braucht.', incl: ['Trikot', 'Mittagessen'], bring: ['Fußballschuhe'] }
    ];
    var regs = [], k = 0, t0 = now().getTime();
    function add(campId, n, statuses) {
      var c = camps.filter(function (x) { return x.id === campId; })[0];
      for (var i = 0; i < n; i++) {
        var kid = KIDS[k % KIDS.length], last = LAST[(k * 7) % LAST.length], par = PARENTS[(k * 5) % PARENTS.length];
        var year = c.y1 + (k % (c.y2 - c.y1 + 1));
        var st = statuses[i] || 'paid';
        regs.push({ id: 's' + k, campId: campId, status: st, pay: st === 'open' ? 'invoice' : 'online',
          child: { first: kid, last: last, birth: year + '-0' + (1 + (k % 9)) + '-1' + (k % 9), club: k % 3 ? 'TSV Beispielstadt' : '', shirt: ['128', '140', '152', '164'][k % 4], health: HEALTH[k % HEALTH.length], sibling: false },
          parent: { first: par, last: last, email: par.toLowerCase() + '.' + slug(last) + '@beispiel.de', phone: '0151 ' + String(2000000 + k * 7919).slice(0, 7) },
          consent: { terms: true, health: !!HEALTH[k % HEALTH.length], photo: k % 2 === 0, whatsapp: k % 3 !== 1 },
          price: c.early || c.price, invoiceNo: 'AA-2026-' + String(10 + k).padStart(4, '0'),
          created: new Date(t0 - (k * 5 + 2) * 36e5 * 3.3).toISOString() });
        k++;
      }
    }
    add('herbst-technik', 7, ['paid', 'paid', 'open', 'paid', 'paid', 'open', 'paid']);
    add('speed-dribbling', 14, ['paid', 'paid', 'paid', 'open', 'paid', 'paid', 'paid', 'paid', 'open', 'paid', 'paid', 'processing', 'paid', 'paid']);
    add('winter-torabschluss', 14, ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'waitlist', 'waitlist']);
    regs.sort(function (a, b) { return a.created < b.created ? 1 : -1; });
    var msgs = [];
    var r0 = regs[0], c0 = camps.filter(function (x) { return x.id === r0.campId; })[0];
    msgs.push({ id: 'm-seed1', to: 'trainer', ch: 'mail', at: r0.created, read: true, regId: r0.id,
      subject: 'Neue Anmeldung: ' + r0.child.first + ' ' + r0.child.last[0] + '. – ' + c0.title, kind: 'trainer-new' });
    return { v: 1, camps: camps, regs: regs, msgs: msgs, nextInvoice: 42 };
  }

  var db = load('db', null);
  if (!db || db.v !== 1) { db = seed(); save('db', db); }
  function persist() { save('db', db); }
  function camp(id) { return db.camps.filter(function (c) { return c.id === id; })[0]; }
  function reg(id) { return db.regs.filter(function (r) { return r.id === id; })[0]; }
  function regsOf(id) { return db.regs.filter(function (r) { return r.campId === id; }); }
  var HOLDS = ['paid', 'open', 'processing', 'pending'];
  function taken(c) { return regsOf(c.id).filter(function (r) { return HOLDS.indexOf(r.status) > -1; }).length; }
  function free(c) { return Math.max(0, c.cap - taken(c)); }
  function isEarly(c) { return c.early && c.earlyUntil && iso(now()) <= c.earlyUntil; }
  function basePrice(c) { return isEarly(c) ? c.early : c.price; }
  function state(c) {
    if (c.status === 'draft') return 'draft';
    if (iso(now()) > c.to) return 'ended';
    if (free(c) === 0) return 'full';
    if (c.deadline && iso(now()) > c.deadline) return 'closed';
    return free(c) <= 3 ? 'few' : 'free';
  }
  var STATE = { free: ['free', 'Plätze frei'], few: ['few', 'Fast voll'], full: ['full', 'Ausgebucht'], closed: ['draft', 'Anmeldeschluss vorbei'], ended: ['draft', 'Beendet'], draft: ['draft', 'Entwurf'] };
  var PAY = { paid: ['paid', 'Bezahlt'], open: ['open', 'Zahlung offen'], processing: ['open', 'Zahlung läuft'], pending: ['open', 'Zahlung läuft'], waitlist: ['wait', 'Warteliste'], cancelled: ['draft', 'Storniert'] };
  function seatsLabel(c) {
    var f = free(c);
    if (f === 0) return 'Alle ' + c.cap + ' Plätze vergeben';
    return f === 1 ? 'Noch 1 Platz frei' : 'Noch ' + f + ' von ' + c.cap + ' Plätzen';
  }
  function price(c, r) {
    var base = basePrice(c), sib = r && r.child && r.child.sibling ? Math.round(base * (c.sibling || 0)) / 100 : 0;
    return { regular: c.price, base: base, early: isEarly(c) ? c.price - c.early : 0, sibling: sib, total: base - sib };
  }

  // ------------------------------------------------------------------ Grafiken
  var ART = {
    a: '<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#C4AC74" stroke-opacity=".38" stroke-width="1.4"><path d="M200 0v225"/><circle cx="200" cy="112" r="48"/><circle cx="200" cy="112" r="2.6" fill="#C4AC74"/><path d="M0 44h64v137H0M0 80h22v65H0M400 44h-64v137h64M400 80h-22v65h22"/><path d="M64 88a28 28 0 0 1 0 49M336 88a28 28 0 0 0 0 49"/></svg>',
    b: '<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#C4AC74" stroke-opacity=".42" stroke-width="1.4"><path d="M30 190C110 150 150 60 230 70s120 90 150 40" stroke-dasharray="4 7"/><g fill="#C4AC74" fill-opacity=".55" stroke="none"><path d="M70 170l9-22 9 22z"/><path d="M140 118l9-22 9 22z"/><path d="M215 86l9-22 9 22z"/><path d="M290 112l9-22 9 22z"/><path d="M350 100l9-22 9 22z"/></g><circle cx="42" cy="186" r="10"/></svg>',
    c: '<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#C4AC74" stroke-opacity=".4" stroke-width="1.4"><path d="M110 225V70h180v155"/><path d="M110 70l-30 30v125M290 70l30 30v125M80 100h240" stroke-opacity=".25"/><path d="M130 70v155M150 70v155M170 70v155M190 70v155M210 70v155M230 70v155M250 70v155M270 70v155M110 95h180M110 120h180M110 145h180M110 170h180M110 195h180" stroke-opacity=".16"/></svg>'
  };
  function art(k) { return '<div class="aa-art' + (k === 'b' ? ' aa-art--b' : k === 'c' ? ' aa-art--c' : '') + '">' + (ART[k] || ART.a) + '</div>'; }

  // ------------------------------------------------------------------ Bausteine
  function campCard(c, opts) {
    opts = opts || {};
    var st = state(c), s = STATE[st], bd = badgeDate(c), t = taken(c), p = basePrice(c);
    var btn;
    if (opts.preview) btn = '<span class="aa-btn aa-btn--gold" aria-hidden="true">Platz sichern</span>';
    else if (st === 'full' && c.waitlist) btn = '<a class="aa-btn aa-btn--ghost" href="#/camps/' + c.id + '">Auf die Warteliste</a>';
    else if (st === 'full' || st === 'closed' || st === 'ended') btn = '<a class="aa-btn aa-btn--ghost" aria-disabled="true">' + (st === 'full' ? 'Ausgebucht' : 'Anmeldung geschlossen') + '</a>';
    else btn = '<a class="aa-btn aa-btn--gold" href="#/camps/' + c.id + '">Platz sichern</a>';
    return '<article class="aa-card aa-camp">' +
      '<div class="aa-camp__media">' + art(c.art) + '<div class="aa-camp__date"><b>' + bd.b + '</b><span>' + bd.m + '</span></div>' +
      '<span class="aa-camp__status aa-badge aa-badge--' + s[0] + '">' + s[1] + '</span></div>' +
      '<div class="aa-camp__body"><span class="aa-kicker" style="margin:0">Jahrgänge ' + c.y1 + '–' + c.y2 + '</span>' +
      '<h3>' + esc(c.title || 'Neues Camp') + '</h3>' +
      '<ul class="aa-facts"><li>' + ic('clock') + days(c) + (days(c) === 1 ? ' Tag' : ' Tage') + ' · ' + esc(c.t1) + '–' + esc(c.t2) + ' Uhr</li><li>' + ic('pin') + esc(c.place || 'Ort folgt') + '</li></ul>' +
      '<div class="aa-price"><span class="aa-price__n">' + (p ? euro(p) : '– €') + '</span>' + (isEarly(c) ? '<span class="aa-price__old">' + euro(c.price) + '</span><span class="aa-price__note">Frühbucher bis ' + fmtShort(c.earlyUntil) + '</span>' : c.sibling ? '<span class="aa-price__note">Geschwister −' + c.sibling + ' %</span>' : '') + '</div>' +
      '<div class="aa-seats"><div class="aa-seats__bar"><i style="width:' + Math.min(100, Math.round(t / c.cap * 100)) + '%"></i></div><div class="aa-seats__label"><span>' + seatsLabel(c) + '</span></div></div>' +
      btn + '</div></article>';
  }
  function campMini(c) {
    return '<div class="p-camp-mini"><div class="p-camp-mini__img">' + art(c.art) + '</div><div><b>' + esc(c.title) + '</b><span>' + fmtRange(c.from, c.to) + ' · ' + esc(c.place) + '</span></div></div>';
  }
  function field(o) {
    var id = o.id, req = o.req ? ' required' : '', v = o.value == null ? '' : o.value;
    var control;
    if (o.type === 'select') control = '<select class="aa-select" id="' + id + '" name="' + id + '"' + req + '>' + o.options.map(function (x) { return '<option' + (String(x) === String(v) ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select>';
    else if (o.type === 'textarea') control = '<textarea class="aa-textarea" id="' + id + '" name="' + id + '"' + req + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>' + esc(v) + '</textarea>';
    else control = '<input class="aa-input" id="' + id + '" name="' + id + '" type="' + (o.type || 'text') + '"' + req + ' value="' + esc(v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + (o.attrs || '') + '>';
    return '<div class="aa-field' + (o.cls ? ' ' + o.cls : '') + '"><label for="' + id + '">' + o.label + (o.req ? ' <span class="aa-req">*</span>' : '') + '</label>' + control +
      (o.hint ? '<span class="aa-hint">' + o.hint + '</span>' : '') + '<span class="aa-error" id="' + id + '-e" hidden>' + ic('alert') + '<span></span></span></div>';
  }
  function check(id, label, checked, req) {
    return '<div class="aa-field"><label class="aa-check"><input type="checkbox" id="' + id + '" name="' + id + '"' + (checked ? ' checked' : '') + (req ? ' required' : '') + '> <span>' + label + (req ? ' <span class="aa-req">*</span>' : '') + '</span></label>' +
      '<span class="aa-error" id="' + id + '-e" hidden>' + ic('alert') + '<span></span></span></div>';
  }

  // ------------------------------------------------------------------ Rahmen
  function demoBar(admin) {
    var unread = db.msgs.filter(function (m) { return !m.read; }).length;
    var f = AA.font(), t = AA.theme();
    function seg(group, items, cur) { return '<div class="demo-seg" role="group">' + items.map(function (i) { return '<button type="button" data-action="' + group + '" data-v="' + i[0] + '" aria-pressed="' + (i[0] === cur) + '">' + i[1] + '</button>'; }).join('') + '</div>'; }
    return '<div class="demo-bar" role="region" aria-label="Demo-Steuerung"><div class="demo-bar__in">' +
      '<div class="demo-bar__group"><span class="demo-bar__tag">Demo</span>' + seg('role', [['eltern', 'Eltern'], ['trainer', 'Trainer']], admin ? 'trainer' : 'eltern') +
      '<button type="button" class="demo-bar__link" data-action="inbox">Postfach' + (unread ? '<span class="demo-count">' + unread + '</span>' : '') + '</button></div>' +
      '<div class="demo-bar__group">' + seg('font', [['a', 'A'], ['b', 'B'], ['c', 'C']], f) + seg('theme', [['system', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']], t) +
      '<button type="button" class="demo-bar__link" data-action="reset">Zurücksetzen</button></div>' +
      '<span class="demo-bar__note">Klick-Prototyp · Daten bleiben nur in diesem Browser · keine echten Zahlungen oder Nachrichten</span></div></div>';
  }
  function siteHeader() {
    return '<header class="aa-header"><div class="aa-container aa-header__bar">' +
      '<a class="aa-header__brand" href="../pages/home.html" aria-label="Athlete Academy – Startseite"><span class="aa-logo aa-logo--h"></span></a>' +
      '<nav class="aa-nav" aria-label="Hauptnavigation"><ul class="aa-nav__list"><li><a href="../pages/home.html#training">Training</a></li><li><a href="#/camps" aria-current="page">Camps</a></li><li><a href="../pages/home.html#academy">Über uns</a></li><li><a href="../pages/home.html#kontakt">Kontakt</a></li></ul>' +
      '<a class="aa-btn aa-btn--gold aa-btn--sm" href="../pages/home.html#kontakt" style="margin-left:14px">Probetraining</a></nav>' +
      '<button class="aa-burger" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="menu" data-menu-toggle="menu">' + ic('menu') + '</button></div></header>' +
      '<div class="aa-menu" id="menu" role="dialog" aria-modal="true" aria-label="Menü"><div class="aa-menu__top"><span class="aa-logo aa-logo--h" style="--logo-h:34px"></span>' +
      '<button class="aa-burger" type="button" aria-label="Menü schließen" style="display:inline-flex" data-menu-toggle="menu">' + ic('x') + '</button></div>' +
      '<ul class="aa-menu__list"><li><a href="../pages/home.html#training">Training ' + ic('chevron-right') + '</a></li><li><a href="#/camps" data-menu-toggle="menu" aria-current="page">Camps ' + ic('chevron-right') + '</a></li><li><a href="../pages/home.html#academy">Über uns ' + ic('chevron-right') + '</a></li><li><a href="../pages/home.html#kontakt">Kontakt ' + ic('chevron-right') + '</a></li></ul>' +
      '<div class="aa-menu__foot"><a class="aa-btn aa-btn--gold aa-btn--block" href="../pages/home.html#kontakt">Probetraining anfragen</a></div></div>';
  }
  function siteFooter() {
    return '<footer class="aa-footer"><div class="aa-container"><div class="aa-footer__bottom" style="margin-top:0;border-top:0;padding-top:0"><span class="aa-logo aa-logo--h" style="--logo-h:30px"></span>' +
      '<span><a href="#/camps">Camps</a> · <a href="../pages/home.html#fragen">Fragen</a> · <a href="#/camps">Teilnahmebedingungen</a> · <a href="#/camps">Datenschutz</a></span></div></div></footer>';
  }
  var ADMIN_TABS = [['/admin', 'grid', 'Übersicht'], ['/admin/camps', 'calendar', 'Camps'], ['/admin/camps/neu', 'plus', 'Neues Camp'], ['/postfach/trainer', 'bell', 'Nachrichten']];
  function adminCurrent(path) {
    if (path === '/admin') return '/admin';
    if (path === '/admin/camps/neu') return '/admin/camps/neu';
    if (path.indexOf('/admin/camps') === 0) return '/admin/camps';
    if (path.indexOf('/postfach/trainer') === 0) return '/postfach/trainer';
    return '';
  }
  function adminTop(path) {
    var cur = adminCurrent(path);
    return '<header class="a-top"><div class="aa-container a-top__bar"><a class="a-brand" href="#/admin"><span class="aa-logo aa-logo--h"></span><small>Verwaltung</small></a>' +
      '<nav class="a-tabs" aria-label="Verwaltung">' + ADMIN_TABS.map(function (t) { return '<a href="#' + t[0] + '"' + (cur === t[0] ? ' aria-current="page"' : '') + '>' + ic(t[1]) + t[2] + '</a>'; }).join('') + '</nav>' +
      '<div class="a-user"><span>Trainer</span><span class="aa-avatar" style="width:34px;height:34px;font-size:.75rem">AA</span></div></div></header>';
  }
  function adminTabbar(path) {
    var cur = adminCurrent(path);
    return '<nav class="a-tabbar" aria-label="Verwaltung">' + ADMIN_TABS.map(function (t) { return '<a href="#' + t[0] + '"' + (cur === t[0] ? ' aria-current="page"' : '') + '>' + ic(t[1]) + t[2] + '</a>'; }).join('') + '</nav>';
  }

  // ------------------------------------------------------------------ Eltern: Camps
  var filter = 'alle';
  var FILTERS = [['alle', 'Alle', 0, 9999], ['a', '2010–2012', 2010, 2012], ['b', '2013–2015', 2013, 2015], ['c', '2016+', 2016, 9999]];
  function vCamps() {
    var f = FILTERS.filter(function (x) { return x[0] === filter; })[0];
    var list = db.camps.filter(function (c) { return c.status === 'online' && state(c) !== 'ended' && c.y2 >= f[2] && c.y1 <= f[3]; })
      .sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    return '<div class="aa-container p-page"><div class="p-head"><div><span class="aa-kicker">Ferien-Camps ' + now().getFullYear() + '</span><h1 tabindex="-1">Camps</h1></div>' +
      '<p class="aa-lead" style="margin:0;max-width:44ch">Feste Gruppen, klare Trainingsziele und ein Turnier am letzten Tag. Anmeldung in drei Schritten.</p></div>' +
      '<div class="p-filter" role="group" aria-label="Nach Jahrgang filtern">' + FILTERS.map(function (x) { return '<button type="button" class="aa-chip" data-action="filter" data-v="' + x[0] + '" aria-pressed="' + (x[0] === filter) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      (list.length ? '<div class="aa-grid aa-grid--3">' + list.map(function (c) { return campCard(c); }).join('') + '</div>' : '<div class="p-empty">Für diese Jahrgänge ist gerade kein Camp geplant. Schauen Sie bald wieder vorbei.</div>') +
      '</div>';
  }
  function vCamp(id) {
    var c = camp(id); if (!c || c.status !== 'online') return notFound();
    var st = state(c), p = basePrice(c), s = STATE[st];
    var cta = st === 'full' ? (c.waitlist ? ['Auf die Warteliste', 'aa-btn--ghost', '#/anmeldung/' + c.id + '/1'] : ['Ausgebucht', 'aa-btn--ghost', '']) :
      (st === 'closed' ? ['Anmeldung geschlossen', 'aa-btn--ghost', ''] : ['Jetzt anmelden', 'aa-btn--gold', '#/anmeldung/' + c.id + '/1']);
    var btn = function (extra) { return '<a class="aa-btn ' + cta[1] + ' ' + (extra || '') + '"' + (cta[2] ? ' href="' + cta[2] + '"' : ' aria-disabled="true"') + '>' + cta[0] + '</a>'; };
    var pays = [c.online ? 'online' : '', c.invoice ? 'per Rechnung' : ''].filter(Boolean).join(' oder ');
    return '<section class="p-detail-hero">' + art(c.art) + '<div class="aa-container p-detail-hero__in">' +
      '<a class="p-back" href="#/camps">' + ic('arrow-left') + 'Alle Camps</a><br><span class="aa-kicker">Jahrgänge ' + c.y1 + '–' + c.y2 + '</span>' +
      '<h1 tabindex="-1">' + esc(c.title) + '</h1><div class="p-hero-facts"><span>' + ic('calendar') + fmtRange(c.from, c.to) + '</span><span>' + ic('clock') + c.t1 + '–' + c.t2 + ' Uhr</span><span>' + ic('pin') + esc(c.place) + '</span></div></div></section>' +
      '<div class="aa-container p-page"><div class="p-detail"><div>' +
      '<span class="aa-kicker">Das erwartet Ihr Kind</span><p class="aa-lead" style="color:var(--text)">' + esc(c.text) + '</p>' +
      '<div class="p-facts-grid"><div class="p-fact"><small>Dauer</small><b>' + days(c) + ' Tage</b></div><div class="p-fact"><small>Gruppe</small><b>max. ' + c.cap + ' Kinder</b></div>' +
      '<div class="p-fact"><small>Treffpunkt</small><b>' + esc(c.meet) + '</b></div><div class="p-fact"><small>Anmeldeschluss</small><b>' + fmtDate(c.deadline) + '</b></div></div>' +
      '<h2>Im Preis enthalten</h2><ul class="p-list-check">' + c.incl.map(function (x) { return '<li>' + ic('check') + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<h2>Bitte mitbringen</h2><ul class="p-list-check">' + c.bring.map(function (x) { return '<li>' + ic('check') + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<div class="aa-alert aa-alert--info">' + ic('info') + '<b>Bei schlechtem Wetter</b><p>Wir trainieren draußen, solange es sicher ist. Bei Gewitter weichen wir in die Halle aus und informieren alle Familien per Nachricht.</p></div>' +
      '</div><aside><div class="aa-card p-box"><span class="aa-badge aa-badge--' + s[0] + '" style="align-self:flex-start">' + s[1] + '</span>' +
      '<div class="aa-price"><span class="aa-price__n">' + (p ? euro(p) : '– €') + '</span>' + (isEarly(c) ? '<span class="aa-price__old">' + euro(c.price) + '</span>' : '') + '</div>' +
      (isEarly(c) ? '<span class="aa-price__note">Frühbucherpreis bis ' + fmtDate(c.earlyUntil) + '</span>' : '') +
      '<div class="aa-seats" style="margin-top:14px"><div class="aa-seats__bar"><i style="width:' + Math.round(taken(c) / c.cap * 100) + '%"></i></div><div class="aa-seats__label"><span>' + seatsLabel(c) + '</span></div></div>' +
      btn('aa-btn--block') + '<div class="p-box__rows"><div><span>Bezahlen</span><span>' + pays + '</span></div>' + (c.sibling ? '<div><span>Geschwister</span><span>−' + c.sibling + ' %</span></div>' : '') +
      '<div><span>Rücktritt</span><span>bis 14 Tage vorher kostenlos</span></div></div></div></aside></div></div>' +
      '<div class="p-sticky-cta"><div><span class="aa-price__n">' + euro(p) + '</span><small>' + seatsLabel(c) + '</small></div>' + btn() + '</div>';
  }

  // ------------------------------------------------------------------ Eltern: Anmeldung
  function draftKey(id) { return 'draft-' + id; }
  function getDraft(id) { return load(draftKey(id), { child: {}, parent: {}, consent: {}, pay: 'online' }); }
  function steps(n) { return '<ol class="aa-steps">' + ['Kind', 'Eltern', 'Zahlung'].map(function (l, i) { return '<li class="' + (i + 1 < n ? 'is-done' : i + 1 === n ? 'is-current' : '') + '"' + (i + 1 === n ? ' aria-current="step"' : '') + '>' + l + '</li>'; }).join('') + '</ol>'; }
  function vFlow(id, n) {
    var c = camp(id); if (!c || c.status !== 'online') return notFound();
    n = +n; var dr = getDraft(id), full = state(c) === 'full';
    if (n > 1 && !dr.child.first) { setTimeout(function () { go('/anmeldung/' + id + '/1'); }); return ''; }
    if (n > 2 && !dr.parent.email) { setTimeout(function () { go('/anmeldung/' + id + '/2'); }); return ''; }
    var head = '<div class="aa-container p-page"><div class="p-flow"><a class="p-back" href="#/camps/' + id + '">' + ic('arrow-left') + 'Zum Camp</a>' + campMini(c) + steps(n);
    var foot = '</div></div>';
    if (n === 1) {
      var ch = dr.child;
      return head + '<h1 tabindex="-1">Wer kommt mit?</h1><p class="p-sub">Angaben zu Ihrem Kind. Pflichtfelder sind mit * markiert.</p>' +
        '<form class="aa-form" id="flow1" data-js novalidate><div class="aa-form__row">' +
        field({ id: 'first', label: 'Vorname', req: true, value: ch.first, ac: 'off' }) + field({ id: 'last', label: 'Nachname', req: true, value: ch.last, ac: 'off' }) + '</div>' +
        '<div class="aa-form__row">' + field({ id: 'birth', label: 'Geburtsdatum', type: 'date', req: true, value: ch.birth, hint: 'Das Camp ist für die Jahrgänge ' + c.y1 + '–' + c.y2 + ' gedacht.' }) +
        field({ id: 'shirt', label: 'Trikotgröße', type: 'select', value: ch.shirt || '140', options: ['116', '128', '140', '152', '164', 'S', 'M'] }) + '</div>' +
        field({ id: 'club', label: 'Verein (optional)', value: ch.club, ph: 'z. B. TSV Beispielstadt' }) +
        field({ id: 'health', label: 'Hinweise zu Gesundheit (optional)', type: 'textarea', value: ch.health, ph: 'z. B. Allergien, Asthma-Spray, Medikamente', hint: 'Nur für die Trainer vor Ort. Wird nach dem Camp gelöscht.' }) +
        (c.sibling ? check('sibling', 'Ein Geschwisterkind ist für dieses Camp ebenfalls angemeldet (−' + c.sibling + ' %).', ch.sibling) : '') +
        '<div class="p-actions"><a class="aa-btn aa-btn--ghost" href="#/camps/' + id + '">Abbrechen</a><button class="aa-btn aa-btn--gold" type="submit">Weiter ' + ic('arrow-right') + '</button></div></form>' + foot;
    }
    if (n === 2) {
      var pa = dr.parent, co = dr.consent;
      return head + '<h1 tabindex="-1">Ihre Kontaktdaten</h1><p class="p-sub">Dorthin schicken wir Bestätigung, Rechnung und Infos zum Camp.</p>' +
        '<form class="aa-form" id="flow2" data-js novalidate><div class="aa-form__row">' +
        field({ id: 'pfirst', label: 'Vorname', req: true, value: pa.first, ac: 'given-name' }) + field({ id: 'plast', label: 'Nachname', req: true, value: pa.last, ac: 'family-name' }) + '</div>' +
        '<div class="aa-form__row">' + field({ id: 'email', label: 'E-Mail', type: 'email', req: true, value: pa.email, ac: 'email', ph: 'name@beispiel.de' }) +
        field({ id: 'phone', label: 'Mobilnummer', type: 'tel', req: true, value: pa.phone, ac: 'tel', hint: 'Für Rückfragen und Notfälle während des Camps.' }) + '</div>' +
        '<fieldset class="aa-fieldset" style="margin-top:6px"><legend class="aa-label">Einwilligungen</legend>' +
        check('terms', 'Ich habe die <a class="aa-link" href="#/camps">Teilnahmebedingungen</a> gelesen und akzeptiere sie.', co.terms, true) +
        (dr.child.health ? check('chealth', 'Die Gesundheitshinweise dürfen für die Betreuung im Camp verwendet werden.', co.health, true) : '') +
        check('photo', 'Fotos meines Kindes dürfen auf der Website und bei Instagram erscheinen (freiwillig).', co.photo) +
        check('whatsapp', 'Bestätigung und Erinnerungen zusätzlich per WhatsApp an diese Nummer (freiwillig, jederzeit abbestellbar).', co.whatsapp) +
        '</fieldset><div class="p-actions"><a class="aa-btn aa-btn--ghost" href="#/anmeldung/' + id + '/1">' + ic('arrow-left') + 'Zurück</a><button class="aa-btn aa-btn--gold" type="submit">Weiter ' + ic('arrow-right') + '</button></div></form>' + foot;
    }
    var pr = price(c, dr);
    var sum = '<div class="aa-card" style="margin-bottom:24px"><div class="p-sum"><div><span>Camp</span><span>' + esc(c.title) + '</span></div><div><span>Termin</span><span>' + fmtRange(c.from, c.to) + '</span></div>' +
      '<div><span>Teilnehmer</span><span>' + esc(dr.child.first + ' ' + dr.child.last) + '</span></div><div><span>Preis</span><span>' + euro(pr.regular, true) + '</span></div>' +
      (pr.early ? '<div><span>Frühbucher</span><span>−' + euro(pr.early, true) + '</span></div>' : '') + (pr.sibling ? '<div><span>Geschwister (−' + c.sibling + ' %)</span><span>−' + euro(pr.sibling, true) + '</span></div>' : '') +
      '<div class="p-total"><span>' + (full ? 'Preis bei Nachrücken' : 'Gesamt') + '</span><span>' + euro(pr.total, true) + '</span></div></div></div>';
    if (full) {
      return head + '<h1 tabindex="-1">Warteliste</h1><p class="p-sub">Das Camp ist gerade voll. Wird ein Platz frei, bekommen Sie sofort Bescheid und haben 48 Stunden Zeit zum Buchen.</p>' + sum +
        '<form id="flow3" data-js novalidate><div class="p-actions"><a class="aa-btn aa-btn--ghost" href="#/anmeldung/' + id + '/2">' + ic('arrow-left') + 'Zurück</a><button class="aa-btn aa-btn--gold aa-btn--lg" type="submit">Auf die Warteliste setzen</button></div>' +
        '<p class="p-legal">Kostenlos und unverbindlich. Sie zahlen erst, wenn Sie einen frei gewordenen Platz annehmen.</p></form>' + foot;
    }
    var methods = [];
    if (c.online) methods.push('<label class="aa-choice"><input type="radio" name="pay" value="online"' + (dr.pay !== 'invoice' ? ' checked' : '') + '><span class="aa-choice__dot"></span><span class="aa-choice__title">' + ic('card') + 'Jetzt online bezahlen</span><span class="aa-choice__text">Platz sofort fest gebucht. Die Rechnung kommt per E-Mail.</span><span class="aa-choice__tags"><span>Karte</span><span>PayPal</span><span>Apple Pay</span><span>Google Pay</span><span>Lastschrift</span></span></label>');
    if (c.invoice) methods.push('<label class="aa-choice"><input type="radio" name="pay" value="invoice"' + (dr.pay === 'invoice' || !c.online ? ' checked' : '') + '><span class="aa-choice__dot"></span><span class="aa-choice__title">' + ic('invoice') + 'Rechnung per E-Mail</span><span class="aa-choice__text">Überweisung innerhalb von 7 Tagen. Der Platz ist bis dahin reserviert.</span></label>');
    return head + '<h1 tabindex="-1">Bezahlen &amp; anmelden</h1><p class="p-sub">Bitte prüfen Sie die Angaben und wählen Sie, wie Sie bezahlen möchten.</p>' + sum +
      '<form id="flow3" data-js novalidate><fieldset class="aa-fieldset"><legend class="aa-label">Wie möchten Sie bezahlen?</legend><div class="aa-choices">' + methods.join('') + '</div></fieldset>' +
      '<div class="p-actions" style="margin-top:24px"><a class="aa-btn aa-btn--ghost" href="#/anmeldung/' + id + '/2">' + ic('arrow-left') + 'Zurück</a><button class="aa-btn aa-btn--gold aa-btn--lg" type="submit">Zahlungspflichtig anmelden</button></div>' +
      '<p class="p-legal">Mit dem Klick melden Sie Ihr Kind verbindlich an. Es gelten die Teilnahmebedingungen. Die Rechnung kommt in beiden Fällen per E-Mail.</p></form>' + foot;
  }

  // ------------------------------------------------------------------ Checkout & Danke
  var method = 'card';
  function vCheckout(rid) {
    var r = reg(rid); if (!r) return notFound(); var c = camp(r.campId);
    if (r.status !== 'pending') { setTimeout(function () { go('/danke/' + rid); }); return ''; }
    var M = [['card', 'card', 'Karte'], ['paypal', 'euro', 'PayPal'], ['wallet', 'phone', 'Apple / Google Pay'], ['sepa', 'invoice', 'Lastschrift']];
    return '<div class="aa-container p-page"><div class="p-checkout"><div class="p-checkout__card">' +
      '<div class="p-checkout__top"><span>' + ic('lock', 'aa-ico--sm') + 'Sichere Zahlung</span><span>Athlete Academy</span></div>' +
      '<h1 class="p-checkout__amount" tabindex="-1">' + euro(r.price, true) + '</h1><p class="aa-meta" style="margin:0">' + esc(c.title) + ' · ' + esc(r.child.first + ' ' + r.child.last) + '</p>' +
      '<div class="p-methods" role="group" aria-label="Zahlart">' + M.map(function (m) { return '<button type="button" data-action="method" data-v="' + m[0] + '" aria-pressed="' + (method === m[0]) + '">' + ic(m[1]) + m[2] + '</button>'; }).join('') + '</div>' +
      (method === 'card' ? '<div class="aa-form">' + field({ id: 'cc', label: 'Kartennummer', value: '4242 4242 4242 4242', attrs: ' inputmode="numeric"' }) + '<div class="aa-form__row" style="grid-template-columns:1fr 1fr">' + field({ id: 'exp', label: 'Gültig bis', value: '12 / 28' }) + field({ id: 'cvc', label: 'Prüfnummer', value: '123' }) + '</div></div>'
        : '<div class="aa-alert aa-alert--info">' + ic('info') + '<b>Weiterleitung</b><p>In der echten Version öffnet sich hier ' + (method === 'paypal' ? 'PayPal' : method === 'wallet' ? 'Apple Pay oder Google Pay' : 'das Lastschrift-Formular') + '.</p></div>') +
      '<button class="aa-btn aa-btn--gold aa-btn--lg aa-btn--block" type="button" data-sweep data-action="pay" data-v="' + rid + '" style="margin-top:22px"><span class="aa-btn__label">' + euro(r.price, true) + ' bezahlen</span><span class="aa-spinner" aria-hidden="true"></span></button>' +
      '<p class="p-note-demo">' + ic('shield', 'aa-ico--sm') + 'Demo: Es wird nichts abgebucht.</p></div>' +
      '<p style="text-align:center;margin-top:18px"><button type="button" class="demo-bar__link" style="color:var(--text-muted)" data-action="cancel-pay" data-v="' + rid + '">Abbrechen und zurück</button></p></div></div>';
  }
  function vThanks(rid) {
    var r = reg(rid); if (!r) return notFound(); var c = camp(r.campId);
    var wa = r.consent.whatsapp, due = new Date(new Date(r.created).getTime() + 7 * 864e5);
    var T = {
      paid: ['Platz gebucht!', 'Die Zahlung ist eingegangen. ' + esc(r.child.first) + ' ist beim ' + esc(c.title) + ' dabei.', 'check'],
      open: ['Platz reserviert', 'Die Rechnung ist unterwegs an ' + esc(r.parent.email) + '. Nach Zahlungseingang ist der Platz fest gebucht.', 'check'],
      waitlist: ['Auf der Warteliste', esc(r.child.first) + ' steht auf der Warteliste. Wird ein Platz frei, melden wir uns sofort.', 'hourglass']
    }[r.status] || ['Anmeldung eingegangen', '', 'check'];
    var tl;
    if (r.status === 'paid') tl = [[1, 'Zahlung eingegangen', euro(r.price, true) + ' · Rechnung ' + r.invoiceNo], [1, 'Bestätigung per E-Mail', 'mit Rechnung und Kalendereintrag an ' + esc(r.parent.email)], wa ? [1, 'Nachricht per WhatsApp', 'kurze Bestätigung an ' + esc(r.parent.phone)] : null, [0, 'Erinnerung mit Packliste', '3 Tage vor Beginn, am ' + fmtDate(iso(new Date(d(c.from).getTime() - 3 * 864e5)))]];
    else if (r.status === 'open') tl = [[1, 'Rechnung per E-Mail', r.invoiceNo + ' über ' + euro(r.price, true)], wa ? [1, 'Nachricht per WhatsApp', 'mit Betrag und Zahlungsziel'] : null, [0, 'Überweisung bis ' + fmtDate(iso(due)), 'Verwendungszweck steht auf der Rechnung'], [0, 'Bestätigung nach Zahlungseingang', 'kommt automatisch per E-Mail' + (wa ? ' und WhatsApp' : '')], [0, 'Erinnerung mit Packliste', '3 Tage vor Beginn']];
    else tl = [[1, 'Bestätigung per E-Mail', 'Sie stehen auf Platz ' + (regsOf(c.id).filter(function (x) { return x.status === 'waitlist'; }).indexOf(r) + 1) + ' der Warteliste'], [0, 'Platz wird frei', 'Sie bekommen sofort Bescheid' + (wa ? ' – per E-Mail und WhatsApp' : '')], [0, '48 Stunden zum Buchen', 'danach rückt die nächste Familie nach']];
    return '<div class="aa-container p-page"><div class="p-thanks"><div class="p-thanks__icon' + (r.status === 'waitlist' ? ' p-thanks__icon--wait' : '') + '">' + ic(T[2]) + '</div>' +
      '<h1 tabindex="-1">' + T[0] + '</h1><p class="aa-lead" style="margin-inline:auto">' + T[1] + '</p>' +
      '<div class="aa-card"><span class="aa-kicker">So geht es weiter</span><ol class="p-timeline">' + tl.filter(Boolean).map(function (x) { return '<li class="' + (x[0] ? 'is-done' : '') + '"><span class="p-dot">' + ic(x[0] ? 'check' : 'clock') + '</span><span><b>' + x[1] + '</b><span>' + x[2] + '</span></span></li>'; }).join('') + '</ol></div>' +
      '<div class="aa-btn-row"><a class="aa-btn aa-btn--gold" href="#/postfach/familie">Nachrichten ansehen (Demo)</a>' + (r.status !== 'waitlist' ? '<button class="aa-btn aa-btn--ghost" type="button" data-action="ics" data-v="' + c.id + '">' + ic('calendar') + 'In den Kalender</button>' : '') + '</div>' +
      '<p style="margin-top:22px"><a class="aa-link-arrow" href="#/camps">Weitere Camps ' + ic('arrow-right') + '</a></p></div></div>';
  }

  // ------------------------------------------------------------------ Nachrichten
  function addMsg(m) { m.id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); m.at = now().toISOString(); m.read = false; db.msgs.unshift(m); }
  function notify(kind, r) {
    var c = camp(r.campId);
    addMsg({ to: 'familie', ch: 'mail', kind: kind, regId: r.id, subject: mailSubject(kind, r, c) });
    if (r.consent.whatsapp && kind !== 'waitlist') addMsg({ to: 'familie', ch: 'chat', kind: kind, regId: r.id, subject: 'WhatsApp · ' + mailSubject(kind, r, c) });
    if (kind === 'booked' || kind === 'invoice' || kind === 'waitlist') addMsg({ to: 'trainer', ch: 'mail', kind: 'trainer-new', regId: r.id, subject: 'Neue Anmeldung: ' + r.child.first + ' ' + r.child.last[0] + '. – ' + c.title });
    if (kind === 'paid-later') addMsg({ to: 'trainer', ch: 'mail', kind: 'trainer-paid', regId: r.id, subject: 'Zahlung verbucht: ' + r.child.first + ' ' + r.child.last[0] + '. – ' + c.title });
  }
  function mailSubject(kind, r, c) {
    return {
      booked: 'Anmeldung bestätigt: ' + c.title + ' (' + fmtRange(c.from, c.to) + ')',
      invoice: 'Platz reserviert – Rechnung ' + r.invoiceNo,
      'paid-later': 'Zahlung eingegangen – Platz fest gebucht',
      reminder: 'Erinnerung: Rechnung ' + r.invoiceNo + ' ist noch offen',
      waitlist: 'Sie stehen auf der Warteliste: ' + c.title,
      promoted: 'Ein Platz ist frei: ' + c.title,
      broadcast: 'Info zum ' + c.title
    }[kind] || c.title;
  }
  function row(k, v) { return '<div class="m__row"><span>' + k + '</span><span>' + v + '</span></div>'; }
  function qr(seed) {
    var n = 25, cells = '', s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    function rnd() { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var fin = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
      var on = fin ? ((x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5)) || (x > n - 8 && ((x - (n - 7)) % 6 === 0 || y % 6 === 0 || (x > n - 6 && x < n - 2 && y > 1 && y < 5))) || (y > n - 8 && (x % 6 === 0 || (y - (n - 7)) % 6 === 0 || (x > 1 && x < 5 && y > n - 6 && y < n - 2)))) : rnd() > .55;
      if (fin && !((x < 7 && y < 7 && (x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5))) || (x > n - 8 && y < 7 && ((x === n - 7 || x === n - 1) || y % 6 === 0 || (x > n - 6 && x < n - 2 && y > 1 && y < 5))) || (x < 7 && y > n - 8 && (x % 6 === 0 || (y === n - 7 || y === n - 1) || (x > 1 && x < 5 && y > n - 6 && y < n - 2))))) on = false;
      if (on) cells += 'M' + x + ' ' + y + 'h1v1h-1z';
    }
    return '<svg viewBox="-1 -1 ' + (n + 2) + ' ' + (n + 2) + '" aria-label="GiroCode (Beispiel)"><rect x="-1" y="-1" width="' + (n + 2) + '" height="' + (n + 2) + '" fill="#fff"/><path d="' + cells + '" fill="#16140F"/></svg>';
  }
  function mailHtml(m) {
    var r = reg(m.regId), c = r ? camp(r.campId) : null;
    if (!r || !c) return '<div class="m"><div class="m__body"><p>Nachricht nicht mehr verfügbar.</p></div></div>';
    var hi = 'Hallo ' + esc(r.parent.first) + ' ' + esc(r.parent.last) + ',';
    var det = '<div class="m__box">' + row('Camp', esc(c.title)) + row('Termin', fmtRange(c.from, c.to) + ', ' + c.t1 + '–' + c.t2 + ' Uhr') + row('Ort', esc(c.place)) + row('Treffpunkt', esc(c.meet)) + row('Teilnehmer', esc(r.child.first + ' ' + r.child.last)) + '</div>';
    var body, eyebrow = 'Camp-Anmeldung', head;
    if (m.kind === 'booked' || m.kind === 'paid-later') {
      head = m.kind === 'booked' ? 'Platz gebucht – wir freuen uns auf ' + esc(r.child.first) + '!' : 'Zahlung eingegangen';
      body = '<p>' + hi + '</p><p>' + (m.kind === 'booked' ? 'vielen Dank für die Anmeldung. Die Zahlung über ' + euro(r.price, true) + ' ist eingegangen, der Platz ist fest gebucht.' : 'Ihre Überweisung über ' + euro(r.price, true) + ' ist angekommen. Der Platz von ' + esc(r.child.first) + ' ist jetzt fest gebucht.') + '</p>' + det +
        '<p><b>Bitte mitbringen:</b> ' + c.bring.map(esc).join(', ') + '.</p><p>Die Rechnung ' + r.invoiceNo + ' und ein Kalendereintrag hängen an dieser E-Mail. Drei Tage vor Beginn schicken wir eine kurze Erinnerung.</p>';
    } else if (m.kind === 'invoice' || m.kind === 'reminder') {
      var due = fmtDate(iso(new Date(new Date(r.created).getTime() + 7 * 864e5)));
      head = m.kind === 'invoice' ? 'Platz reserviert – bitte bis ' + due + ' überweisen' : 'Kurze Erinnerung zur Rechnung';
      eyebrow = 'Rechnung ' + r.invoiceNo;
      body = '<p>' + hi + '</p><p>' + (m.kind === 'invoice' ? 'vielen Dank für die Anmeldung von ' + esc(r.child.first) + '. Der Platz ist bis zum Zahlungseingang für Sie reserviert.' : 'für die Anmeldung von ' + esc(r.child.first) + ' ist die Rechnung noch offen. Falls Sie schon überwiesen haben, ist diese E-Mail erledigt.') + '</p>' +
        '<div class="m__box">' + row('Betrag', euro(r.price, true)) + row('Zahlbar bis', due) + row('Empfänger', 'Athlete Academy') + row('IBAN', 'DE00 0000 0000 0000 0000 00 (Beispiel)') + row('Verwendungszweck', r.invoiceNo + ' ' + esc(r.child.first + ' ' + r.child.last)) + '</div>' +
        '<div class="m__qr">' + qr(r.invoiceNo) + '<p style="margin:0;font-size:13px;color:#5E5A52">Mit der Banking-App scannen: Betrag und Verwendungszweck sind dann schon eingetragen.</p></div>' + det;
    } else if (m.kind === 'waitlist' || m.kind === 'promoted') {
      head = m.kind === 'waitlist' ? esc(r.child.first) + ' steht auf der Warteliste' : 'Ein Platz ist frei geworden';
      body = '<p>' + hi + '</p><p>' + (m.kind === 'waitlist' ? 'das ' + esc(c.title) + ' ist gerade ausgebucht. Wird ein Platz frei, bekommen Sie sofort Bescheid und haben dann 48 Stunden Zeit zum Buchen.' : 'für das ' + esc(c.title) + ' ist ein Platz frei geworden. Er ist 48 Stunden für ' + esc(r.child.first) + ' reserviert.') + '</p>' + det +
        (m.kind === 'promoted' ? '<a class="m__btn" href="#/camps/' + c.id + '">Platz jetzt buchen</a>' : '');
    } else if (m.kind === 'broadcast') {
      head = 'Info zum ' + esc(c.title); body = '<p>' + hi + '</p><p>' + esc(m.text || '') + '</p>' + det;
    } else if (m.kind === 'trainer-new' || m.kind === 'trainer-paid') {
      eyebrow = m.kind === 'trainer-new' ? 'Neue Anmeldung' : 'Zahlung verbucht';
      head = esc(r.child.first + ' ' + r.child.last) + ' – ' + esc(c.title);
      body = '<p>' + (m.kind === 'trainer-new' ? 'Gerade ist eine neue Anmeldung eingegangen.' : 'Die Zahlung wurde verbucht, die Familie ist informiert.') + '</p><div class="m__box">' +
        row('Kind', esc(r.child.first + ' ' + r.child.last) + ' (' + r.child.birth.slice(0, 4) + ')') + row('Eltern', esc(r.parent.first + ' ' + r.parent.last)) + row('Zahlung', PAY[r.status][1] + (r.status !== 'waitlist' ? ' · ' + euro(r.price, true) : '')) +
        row('Belegung', taken(c) + ' von ' + c.cap + ' Plätzen') + (r.child.health ? row('Gesundheit', 'Hinweis vorhanden') : '') + '</div><a class="m__btn" href="#/admin/camps/' + c.id + '">Teilnehmerliste öffnen</a>';
    }
    return '<div class="m"><div class="m__band"><img src="' + LOGO_PNG + '" alt="Athlete Academy"></div><div class="m__body"><p class="m__eyebrow">' + eyebrow + '</p><h2 class="m__h">' + head + '</h2>' + body +
      '<p>Sportliche Grüße<br>Ihr Team der Athlete Academy</p></div><div class="m__foot">Athlete Academy · Fragen? Einfach auf diese E-Mail antworten.<br>Sie erhalten diese Nachricht, weil Sie ein Camp gebucht haben.</div></div>';
  }
  function chatText(m) {
    var r = reg(m.regId), c = r ? camp(r.campId) : null; if (!r || !c) return '';
    var n = r.parent.first;
    return {
      booked: 'Hallo ' + n + ', die Anmeldung von ' + r.child.first + ' für das ' + c.title + ' (' + fmtRange(c.from, c.to) + ') ist bestätigt und bezahlt. ✅\nAlle Infos und die Rechnung stehen in der E-Mail.\nBis bald – Athlete Academy',
      invoice: 'Hallo ' + n + ', der Platz für ' + r.child.first + ' im ' + c.title + ' ist reserviert. Bitte überweisen Sie ' + euro(r.price, true) + ' bis ' + fmtDate(iso(new Date(new Date(r.created).getTime() + 7 * 864e5))) + ' (Rechnung ' + r.invoiceNo + ' per E-Mail).',
      'paid-later': 'Hallo ' + n + ', Ihre Zahlung ist angekommen. ' + r.child.first + ' ist beim ' + c.title + ' fest dabei. ⚽',
      reminder: 'Hallo ' + n + ', kurze Erinnerung: Die Rechnung ' + r.invoiceNo + ' über ' + euro(r.price, true) + ' ist noch offen. Falls schon überwiesen – alles gut!',
      promoted: 'Hallo ' + n + ', gute Nachricht: Im ' + c.title + ' ist ein Platz frei geworden. Er ist 48 Stunden für ' + r.child.first + ' reserviert. Details in der E-Mail.',
      broadcast: 'Hallo ' + n + ', ' + (m.text || '')
    }[m.kind] || '';
  }
  var inboxTab = 'familie';
  function vInbox(tab, mid) {
    tab = tab || 'familie'; inboxTab = tab;
    var list = db.msgs.filter(function (m) { return m.to === tab; });
    var open = mid ? db.msgs.filter(function (m) { return m.id === mid; })[0] : null;
    if (open && !open.read) { open.read = true; persist(); }
    var counts = { familie: db.msgs.filter(function (m) { return m.to === 'familie'; }).length, trainer: db.msgs.filter(function (m) { return m.to === 'trainer'; }).length };
    var view;
    if (open) {
      var r = reg(open.regId);
      if (open.ch === 'mail') {
        var att = (open.kind === 'booked' || open.kind === 'paid-later') ? '<div class="p-attach"><span>' + ic('invoice') + 'Rechnung-' + (r ? r.invoiceNo : '') + '.pdf</span><span>' + ic('calendar') + 'Camp.ics</span></div>' : open.kind === 'invoice' ? '<div class="p-attach"><span>' + ic('invoice') + 'Rechnung-' + (r ? r.invoiceNo : '') + '.pdf</span></div>' : '';
        view = '<div class="p-mail"><div class="p-mail__meta"><b>' + esc(open.subject) + '</b><span>Von: Athlete Academy &lt;camps@ihre-domain.de&gt; · An: ' + esc(tab === 'trainer' ? 'Trainer' : r ? r.parent.email : '') + ' · ' + clock(open.at) + ' Uhr</span>' + att + '</div><div class="p-mail__canvas">' + mailHtml(open) + '</div></div>';
      } else {
        view = '<div class="p-chat"><div class="p-chat__top"><span class="aa-avatar">AA</span><span><b>Athlete Academy</b><small>Geschäftskonto · automatische Nachricht</small></span></div><div class="p-chat__body"><span class="p-chat__day">Heute</span>' +
          '<div class="p-bubble">' + esc(chatText(open)) + '<time>' + clock(open.at) + '</time></div>' + (open.kind === 'booked' ? '<div class="p-bubble p-bubble--me">Super, danke! 🙌<time>' + clock(new Date(new Date(open.at).getTime() + 6e4 * 3)) + '</time></div>' : '') +
          '</div><div class="p-chat__note">Vorschau einer WhatsApp-Nachricht. Wird nur mit Einwilligung verschickt.</div></div>';
      }
    } else view = '<p class="aa-meta" style="text-align:center">' + (list.length ? 'Nachricht auswählen' : '') + '</p>';
    return '<div class="aa-container p-page"><div class="p-head"><div><span class="aa-kicker">Demo</span><h1 tabindex="-1">Postfach</h1></div>' +
      '<p class="aa-lead" style="margin:0;max-width:46ch">Diese Nachrichten verschickt das System von selbst – an die Familie und an den Trainer.</p></div>' +
      '<div class="p-inbox__tabs"><a class="aa-chip" href="#/postfach/familie" aria-pressed="' + (tab === 'familie') + '">An die Familie (' + counts.familie + ')</a><a class="aa-chip" href="#/postfach/trainer" aria-pressed="' + (tab === 'trainer') + '">An den Trainer (' + counts.trainer + ')</a></div>' +
      '<div class="p-inbox' + (open ? ' has-open' : '') + '"><div class="p-inbox__list">' +
      (list.length ? list.map(function (m) { return '<a class="p-msg' + (m.read ? '' : ' is-unread') + '" href="#/postfach/' + tab + '/' + m.id + '"' + (open && open.id === m.id ? ' aria-current="true"' : '') + '><span class="p-msg__ico' + (m.ch === 'chat' ? ' p-msg__ico--chat' : '') + '">' + ic(m.ch === 'chat' ? 'chat' : 'mail') + '</span><b>' + esc(m.subject) + '</b><small>' + (m.ch === 'chat' ? 'WhatsApp' : 'E-Mail') + ' · ' + ago(m.at) + '</small></a>'; }).join('')
        : '<div class="p-empty">Noch keine Nachrichten. Melden Sie ein Kind für ein Camp an – dann erscheinen hier E-Mail und WhatsApp.</div>') +
      '</div><div class="p-inbox__view">' + (open ? '<a class="p-back" href="#/postfach/' + tab + '">' + ic('arrow-left') + 'Alle Nachrichten</a>' : '') + view + '</div></div></div>';
  }

  // ------------------------------------------------------------------ Verwaltung
  function sum(list) { return list.reduce(function (a, r) { return a + (r.price || 0); }, 0); }
  function vAdmin() {
    var active = db.camps.filter(function (c) { return c.status === 'online' && state(c) !== 'ended'; });
    var regs = db.regs.filter(function (r) { return active.some(function (c) { return c.id === r.campId; }); });
    var paid = regs.filter(function (r) { return r.status === 'paid'; }), open = regs.filter(function (r) { return r.status === 'open'; });
    var freeSeats = active.reduce(function (a, c) { return a + free(c); }, 0);
    var kpi = function (icon, label, val, sub) { return '<div class="aa-card a-kpi aa-card--sm"><small>' + ic(icon) + label + '</small><b>' + val + '</b><span>' + sub + '</span></div>'; };
    var latest = db.regs.slice().sort(function (a, b) { return a.created < b.created ? 1 : -1; }).slice(0, 6);
    return '<div class="aa-container p-page"><div class="p-head"><div><span class="aa-kicker">Guten Tag</span><h1 tabindex="-1">Übersicht</h1></div><a class="aa-btn aa-btn--gold" href="#/admin/camps/neu">' + ic('plus') + 'Neues Camp</a></div>' +
      '<div class="a-kpis">' + kpi('users', 'Anmeldungen', regs.filter(function (r) { return r.status !== 'waitlist'; }).length, 'in ' + active.length + ' laufenden Camps') + kpi('euro', 'Bezahlt', euro(sum(paid)), paid.length + ' Zahlungen') +
      kpi('hourglass', 'Offen', euro(sum(open)), open.length + ' Rechnungen') + kpi('tag', 'Freie Plätze', freeSeats, 'über alle Camps') + '</div>' +
      '<div class="a-cols"><section class="a-panel"><div class="a-panel__head"><h2>Nächste Camps</h2><a class="aa-link-arrow" href="#/admin/camps">Alle ' + ic('arrow-right') + '</a></div>' +
      active.sort(function (a, b) { return a.from < b.from ? -1 : 1; }).map(function (c) {
        var o = regsOf(c.id).filter(function (r) { return r.status === 'open'; }).length, s = STATE[state(c)];
        return '<a class="a-row" href="#/admin/camps/' + c.id + '"><span><b>' + esc(c.title) + '</b><small>' + fmtRange(c.from, c.to) + ' · ' + esc(c.place) + '</small></span><span class="a-row__right">' + (o ? '<span class="aa-badge aa-badge--open">' + o + ' offen</span>' : '') + '<span class="aa-badge aa-badge--' + s[0] + '">' + s[1] + '</span></span>' +
          '<div class="aa-seats"><div class="aa-seats__bar"><i style="width:' + Math.round(taken(c) / c.cap * 100) + '%"></i></div><div class="aa-seats__label"><span>' + taken(c) + ' von ' + c.cap + ' Plätzen belegt</span><span>' + euro(sum(regsOf(c.id).filter(function (r) { return r.status === 'paid'; }))) + ' bezahlt</span></div></div></a>';
      }).join('') + '</section>' +
      '<section class="a-panel"><div class="a-panel__head"><h2>Neueste Anmeldungen</h2></div>' + latest.map(function (r) {
        var c = camp(r.campId), p = PAY[r.status];
        return '<a class="a-row" href="#/admin/camps/' + c.id + '"><span><b>' + esc(r.child.first + ' ' + r.child.last) + '</b><small>' + esc(c.title) + ' · ' + ago(r.created) + '</small></span><span class="aa-badge aa-badge--' + p[0] + '">' + p[1] + '</span></a>';
      }).join('') + '</section></div></div>';
  }
  function vAdminCamps() {
    var list = db.camps.slice().sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    return '<div class="aa-container p-page"><div class="p-head"><div><span class="aa-kicker">Verwaltung</span><h1 tabindex="-1">Camps</h1></div><a class="aa-btn aa-btn--gold" href="#/admin/camps/neu">' + ic('plus') + 'Neues Camp</a></div>' +
      '<section class="a-panel">' + list.map(function (c) {
        var s = STATE[state(c)], bd = badgeDate(c);
        return '<div class="a-camp-row"><div class="a-camp-row__img">' + art(c.art) + '<div class="aa-camp__date"><b>' + bd.b + '</b><span>' + bd.m + '</span></div></div>' +
          '<div><h3>' + esc(c.title) + '</h3><small class="aa-meta">' + fmtRange(c.from, c.to) + ' · ' + esc(c.place) + ' · Jg. ' + c.y1 + '–' + c.y2 + '</small>' +
          '<div class="aa-seats"><div class="aa-seats__bar"><i style="width:' + Math.round(taken(c) / c.cap * 100) + '%"></i></div><div class="aa-seats__label"><span>' + taken(c) + ' von ' + c.cap + ' belegt</span><span class="aa-badge aa-badge--' + s[0] + '">' + s[1] + '</span></div></div></div>' +
          '<div class="a-row__right"><a class="a-mini" href="#/admin/camps/' + c.id + '">' + ic('users') + 'Teilnehmer</a><a class="a-iconbtn" href="#/admin/camps/' + c.id + '/bearbeiten" aria-label="Bearbeiten" title="Bearbeiten">' + ic('edit') + '</a>' +
          '<button class="a-iconbtn" type="button" data-action="duplicate" data-v="' + c.id + '" aria-label="Kopieren" title="Als Vorlage kopieren">' + ic('copy') + '</button>' + (c.status === 'online' ? '<a class="a-iconbtn" href="#/camps/' + c.id + '" aria-label="Auf der Seite ansehen" title="Auf der Seite ansehen">' + ic('eye') + '</a>' : '') + '</div></div>';
      }).join('') + '</section></div>';
  }
  var EMPTY = { id: '', title: '', from: '', to: '', t1: '10:00', t2: '15:00', place: '', meet: '', y1: 2012, y2: 2015, cap: 16, price: '', early: '', earlyUntil: '', sibling: 10, deadline: '', art: 'a', status: 'draft', waitlist: true, online: true, invoice: true, text: '', incl: [], bring: ['Fußballschuhe', 'Schienbeinschoner', 'Trinkflasche'] };
  function vEditor(id) {
    var c = id ? camp(id) : Object.assign({}, EMPTY);
    if (!c) return notFound();
    var isNew = !id;
    return '<div class="aa-container p-page"><a class="p-back" href="#/admin/camps">' + ic('arrow-left') + 'Alle Camps</a><div class="p-head"><div><span class="aa-kicker">' + (isNew ? 'Neu anlegen' : 'Bearbeiten') + '</span><h1 tabindex="-1">' + (isNew ? 'Neues Camp' : esc(c.title)) + '</h1></div></div>' +
      '<form id="editor" data-js novalidate data-id="' + (id || '') + '"><div class="a-editor"><div style="display:grid;gap:20px">' +
      '<section class="a-section"><h2>' + ic('edit') + 'Grunddaten</h2>' + field({ id: 'title', label: 'Titel', req: true, value: c.title, ph: 'z. B. Sommercamp Allround' }) +
      field({ id: 'text', label: 'Beschreibung', type: 'textarea', value: c.text, ph: 'Was erwartet die Kinder? Zwei, drei Sätze reichen.' }) +
      '<div class="aa-form__row">' + field({ id: 'y1', label: 'Jahrgang von', type: 'number', req: true, value: c.y1 }) + field({ id: 'y2', label: 'Jahrgang bis', type: 'number', req: true, value: c.y2 }) + field({ id: 'cap', label: 'Plätze', type: 'number', req: true, value: c.cap }) + '</div></section>' +
      '<section class="a-section"><h2>' + ic('calendar') + 'Termin &amp; Ort</h2><div class="aa-form__row">' + field({ id: 'from', label: 'Erster Tag', type: 'date', req: true, value: c.from }) + field({ id: 'to', label: 'Letzter Tag', type: 'date', req: true, value: c.to }) + '</div>' +
      '<div class="aa-form__row">' + field({ id: 't1', label: 'Beginn', type: 'time', value: c.t1 }) + field({ id: 't2', label: 'Ende', type: 'time', value: c.t2 }) + '</div>' +
      '<div class="aa-form__row">' + field({ id: 'place', label: 'Ort', req: true, value: c.place, ph: 'z. B. Sportanlage Süd' }) + field({ id: 'meet', label: 'Treffpunkt', value: c.meet, ph: 'z. B. Haupteingang' }) + '</div></section>' +
      '<section class="a-section"><h2>' + ic('euro') + 'Preis &amp; Anmeldung</h2><div class="aa-form__row">' + field({ id: 'price', label: 'Preis (€)', type: 'number', req: true, value: c.price }) + field({ id: 'early', label: 'Frühbucherpreis (€)', type: 'number', value: c.early || '' }) + field({ id: 'earlyUntil', label: 'Frühbucher bis', type: 'date', value: c.earlyUntil || '' }) + '</div>' +
      '<div class="aa-form__row">' + field({ id: 'sibling', label: 'Geschwisterrabatt (%)', type: 'number', value: c.sibling }) + field({ id: 'deadline', label: 'Anmeldeschluss', type: 'date', value: c.deadline }) + '</div>' +
      '<fieldset class="aa-fieldset"><legend class="aa-label">Zahlarten für Eltern</legend>' + check('online', 'Online bezahlen (Karte, PayPal, Apple Pay, Google Pay, Lastschrift)', c.online) + check('invoice', 'Rechnung per E-Mail (Überweisung in 7 Tagen)', c.invoice) + '</fieldset>' +
      check('waitlist', 'Warteliste öffnen, wenn das Camp voll ist', c.waitlist) + '</section>' +
      '<section class="a-section"><h2>' + ic('list') + 'Leistungen</h2>' + field({ id: 'incl', label: 'Im Preis enthalten', type: 'textarea', value: (c.incl || []).join('\n'), hint: 'Eine Leistung pro Zeile.' }) + field({ id: 'bring', label: 'Bitte mitbringen', type: 'textarea', value: (c.bring || []).join('\n'), hint: 'Eine Sache pro Zeile. Steht auch in der Erinnerung.' }) + '</section>' +
      '<section class="a-section"><h2>' + ic('image') + 'Bild</h2><div class="a-art-pick" role="radiogroup" aria-label="Motiv">' + ['a', 'b', 'c'].map(function (k, i) { return '<label><input type="radio" name="art" value="' + k + '"' + (c.art === k ? ' checked' : '') + ' aria-label="Motiv ' + (i + 1) + '">' + art(k) + '</label>'; }).join('') + '</div>' +
      '<div class="a-upload">' + ic('image') + 'Eigenes Foto hochladen – in der echten Version</div></section>' +
      '<div class="a-editor__bar"><span class="aa-meta">Eltern sehen das Camp erst nach „Veröffentlichen“.</span><button class="aa-btn aa-btn--ghost" type="submit" value="draft">Als Entwurf speichern</button><button class="aa-btn aa-btn--gold" type="submit" value="online">Veröffentlichen</button></div>' +
      '</div><aside class="a-editor__preview"><small>' + ic('eye', 'aa-ico--sm') + 'So sehen Eltern die Karte</small><div id="preview">' + campCard(previewCamp(c), { preview: true }) + '</div></aside></div></form></div>';
  }
  function previewCamp(c) {
    var p = Object.assign({}, c);
    p.id = p.id || '__preview'; p.status = 'online';
    if (!p.from) p.from = iso(new Date(now().getTime() + 30 * 864e5));
    if (!p.to || p.to < p.from) p.to = p.from;
    p.price = Number(p.price) || 0; p.early = Number(p.early) || null; p.cap = Math.max(1, Number(p.cap) || 1);
    p.y1 = Number(p.y1) || 2012; p.y2 = Number(p.y2) || p.y1; p.sibling = Number(p.sibling) || 0;
    return p;
  }
  function readEditor(form) {
    var g = function (n) { var el = form.elements[n]; return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
    var lines = function (n) { return g(n).split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
    var artEl = form.querySelector('input[name="art"]:checked');
    return { title: g('title'), text: g('text'), y1: Number(g('y1')), y2: Number(g('y2')), cap: Number(g('cap')), from: g('from'), to: g('to'), t1: g('t1'), t2: g('t2'),
      place: g('place'), meet: g('meet'), price: Number(g('price')), early: g('early') ? Number(g('early')) : null, earlyUntil: g('earlyUntil') || null,
      sibling: Number(g('sibling')) || 0, deadline: g('deadline') || g('from'), online: g('online'), invoice: g('invoice'), waitlist: g('waitlist'),
      incl: lines('incl'), bring: lines('bring'), art: artEl ? artEl.value : 'a' };
  }
  var peopleFilter = 'alle';
  function vPeople(id) {
    var c = camp(id); if (!c) return notFound();
    var all = regsOf(id), F = { alle: function () { return true; }, paid: function (r) { return r.status === 'paid'; }, open: function (r) { return r.status === 'open' || r.status === 'processing' || r.status === 'pending'; }, wait: function (r) { return r.status === 'waitlist'; } };
    var list = all.filter(F[peopleFilter] || F.alle).sort(function (a, b) { return a.child.last.localeCompare(b.child.last, 'de'); });
    var paid = all.filter(F.paid), open = all.filter(F.open), wait = all.filter(F.wait);
    var kpi = function (label, val, sub) { return '<div class="aa-card a-kpi aa-card--sm"><small>' + label + '</small><b>' + val + '</b><span>' + sub + '</span></div>'; };
    return '<div class="aa-container p-page"><a class="p-back" href="#/admin/camps">' + ic('arrow-left') + 'Alle Camps</a>' +
      '<div class="p-head"><div><span class="aa-kicker">' + fmtRange(c.from, c.to) + ' · ' + esc(c.place) + '</span><h1 tabindex="-1">' + esc(c.title) + '</h1></div><a class="aa-btn aa-btn--ghost aa-btn--sm" href="#/admin/camps/' + id + '/bearbeiten">' + ic('edit') + 'Bearbeiten</a></div>' +
      '<div class="a-kpis">' + kpi('Belegt', taken(c) + ' / ' + c.cap, free(c) + ' Plätze frei') + kpi('Bezahlt', euro(sum(paid)), paid.length + ' Familien') + kpi('Offen', euro(sum(open)), open.length + ' Rechnungen') + kpi('Warteliste', wait.length, wait.length === 1 ? 'Familie wartet' : 'Familien warten') + '</div>' +
      '<div class="a-toolbar"><div class="p-filter" style="margin:0" role="group" aria-label="Filter">' + [['alle', 'Alle (' + all.length + ')'], ['paid', 'Bezahlt'], ['open', 'Offen'], ['wait', 'Warteliste']].map(function (x) { return '<button type="button" class="aa-chip" data-action="pfilter" data-v="' + x[0] + '" aria-pressed="' + (peopleFilter === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<div class="a-row__right"><button class="a-mini" type="button" data-action="broadcast" data-v="' + id + '">' + ic('chat') + 'Nachricht an alle</button><button class="a-mini" type="button" data-action="csv" data-v="' + id + '">' + ic('download') + 'CSV</button><a class="a-mini" href="#/admin/camps/' + id + '/liste">' + ic('list') + 'Anwesenheitsliste</a></div></div>' +
      '<section class="a-panel a-people">' + (list.length ? list.map(function (r) {
        var p = PAY[r.status], acts = '';
        if (r.status === 'open') acts = '<button class="a-mini a-mini--gold" type="button" data-action="markpaid" data-v="' + r.id + '">' + ic('check') + 'Zahlung erhalten</button><button class="a-mini" type="button" data-action="remind" data-v="' + r.id + '">' + ic('bell') + 'Erinnern</button>';
        else if (r.status === 'waitlist' && free(c) > 0) acts = '<button class="a-mini a-mini--gold" type="button" data-action="promote" data-v="' + r.id + '">' + ic('arrow-right') + 'Platz anbieten</button>';
        return '<div class="a-person"><span class="aa-avatar">' + initials(r.child.first, r.child.last) + '</span><span><b>' + esc(r.child.first + ' ' + r.child.last) + ' <small style="display:inline">Jg. ' + r.child.birth.slice(0, 4) + '</small>' + (r.child.health ? '<span class="a-health" title="' + esc(r.child.health) + '">' + ic('alert') + 'Gesundheit</span>' : '') + '</b>' +
          '<small>' + esc(r.parent.first + ' ' + r.parent.last) + ' · ' + esc(r.parent.phone) + (r.consent.whatsapp ? ' · WhatsApp ok' : '') + '</small></span>' +
          '<span class="a-row__right"><span class="aa-badge aa-badge--' + p[0] + '">' + p[1] + '</span>' + acts + '</span></div>';
      }).join('') : '<div class="p-empty" style="margin:18px">Keine Anmeldungen in dieser Ansicht.</div>') + '</section></div>' +
      '<dialog class="p-dialog" id="dlg"><form id="bcast" data-js novalidate data-id="' + id + '"><h2>Nachricht an alle Familien</h2><p class="aa-meta" style="margin:0">Geht an ' + all.filter(function (r) { return r.status !== 'waitlist'; }).length + ' Familien per E-Mail, an ' + all.filter(function (r) { return r.status !== 'waitlist' && r.consent.whatsapp; }).length + ' zusätzlich per WhatsApp.</p>' +
      field({ id: 'btext', label: 'Nachricht', type: 'textarea', req: true, value: 'am Dienstag starten wir wegen Regen in der Soccerhalle West. Beginn bleibt ' + c.t1 + ' Uhr.' }) +
      '<div class="p-actions"><button class="aa-btn aa-btn--ghost" type="button" data-action="dlg-close">Abbrechen</button><button class="aa-btn aa-btn--gold" type="submit">Senden</button></div></form></dialog>';
  }
  function vPrint(id) {
    var c = camp(id); if (!c) return notFound();
    var list = regsOf(id).filter(function (r) { return HOLDS.indexOf(r.status) > -1; }).sort(function (a, b) { return a.child.last.localeCompare(b.child.last, 'de'); });
    var dcount = days(c), dh = ''; for (var i = 0; i < dcount; i++) dh += '<th>' + WD[new Date(d(c.from).getTime() + i * 864e5).getDay()] + '</th>';
    return '<div class="aa-container p-page a-print"><div class="a-noprint"><a class="p-back" href="#/admin/camps/' + id + '">' + ic('arrow-left') + 'Zur Teilnehmerliste</a></div>' +
      '<div class="p-head"><div><span class="aa-kicker">Anwesenheitsliste</span><h1 tabindex="-1">' + esc(c.title) + '</h1><p class="aa-meta" style="margin:0">' + fmtRange(c.from, c.to) + ' · ' + esc(c.place) + ' · ' + list.length + ' Kinder</p></div>' +
      '<button class="aa-btn aa-btn--gold a-noprint" type="button" data-action="print">' + ic('download') + 'Drucken / PDF</button></div>' +
      '<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Kind</th><th>Jg.</th><th>Notfall-Nr.</th><th>Hinweise</th><th>Bezahlt</th>' + dh + '</tr></thead><tbody>' +
      list.map(function (r, i) { var cells = ''; for (var k = 0; k < dcount; k++) cells += '<td><span class="a-box"></span></td>'; return '<tr><td>' + (i + 1) + '</td><td><b>' + esc(r.child.last + ', ' + r.child.first) + '</b></td><td>' + r.child.birth.slice(0, 4) + '</td><td>' + esc(r.parent.phone) + '</td><td>' + esc(r.child.health || '–') + '</td><td>' + (r.status === 'paid' ? '✓' : 'offen') + '</td>' + cells + '</tr>'; }).join('') +
      '</tbody></table></div></div>';
  }
  function notFound() { return '<div class="aa-container p-page"><div class="p-empty"><h1 tabindex="-1" class="aa-h3">Nicht gefunden</h1><p style="margin:0 auto 16px">Diese Seite gibt es im Prototyp nicht (mehr).</p><a class="aa-btn aa-btn--gold" href="#/camps">Zu den Camps</a></div></div>'; }

  // ------------------------------------------------------------------ Router
  var ROUTES = [
    [/^\/camps$/, vCamps], [/^\/camps\/([\w-]+)$/, vCamp], [/^\/anmeldung\/([\w-]+)\/([123])$/, vFlow],
    [/^\/zahlung\/([\w-]+)$/, vCheckout], [/^\/danke\/([\w-]+)$/, vThanks],
    [/^\/postfach(?:\/(familie|trainer))?(?:\/([\w-]+))?$/, vInbox],
    [/^\/admin$/, vAdmin], [/^\/admin\/camps$/, vAdminCamps], [/^\/admin\/camps\/neu$/, function () { return vEditor(null); }],
    [/^\/admin\/camps\/([\w-]+)\/bearbeiten$/, vEditor], [/^\/admin\/camps\/([\w-]+)\/liste$/, vPrint], [/^\/admin\/camps\/([\w-]+)$/, vPeople]
  ];
  var lastPath = null;
  function go(p) { location.hash = '#' + p; }
  function path() { return (location.hash.replace(/^#/, '') || '/camps').split('?')[0]; }
  function render() {
    var p = path(), html = null;
    for (var i = 0; i < ROUTES.length; i++) { var m = p.match(ROUTES[i][0]); if (m) { html = ROUTES[i][1].apply(null, m.slice(1)); break; } }
    if (html === null) { go('/camps'); return; }
    var admin = p.indexOf('/admin') === 0 || p.indexOf('/postfach/trainer') === 0;
    app.innerHTML = demoBar(admin) + (admin ? adminTop(p) : siteHeader()) + '<main class="p-main" id="main">' + html + '</main>' + (admin ? adminTabbar(p) : siteFooter()) +
      '<div class="aa-toast p-toast" id="toast" role="status" aria-live="polite">' + ic('check-circle') + '<span></span></div><div class="p-live" id="live" aria-live="assertive"></div>';
    document.body.classList.toggle('has-tabbar', admin);
    document.body.style.overflow = '';
    if (p !== lastPath) {
      window.scrollTo(0, 0);
      var h = app.querySelector('main h1');
      if (h && lastPath !== null) h.focus({ preventScroll: true });
    }
    lastPath = p;
    if (pendingToast) { toast(pendingToast); pendingToast = null; }
  }
  var pendingToast = null, toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast'); if (!t) return;
    t.querySelector('span').textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 4000);
  }
  function toastAfter(msg) { pendingToast = msg; }

  // ------------------------------------------------------------------ Validierung
  function validate(form) {
    var bad = [];
    form.querySelectorAll('[required], input[type="email"]').forEach(function (el) {
      var msg = '';
      if (el.type === 'checkbox') { if (el.required && !el.checked) msg = 'Bitte bestätigen.'; }
      else if (el.required && !el.value.trim()) msg = 'Bitte ausfüllen.';
      else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim())) msg = 'Bitte eine gültige E-Mail-Adresse eingeben.';
      else if (el.type === 'tel' && el.value && el.value.replace(/\D/g, '').length < 8) msg = 'Bitte eine vollständige Nummer eingeben.';
      var err = document.getElementById(el.id + '-e');
      if (msg) bad.push(el);
      if (el.type !== 'checkbox') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.hidden = !msg; err.querySelector('span').textContent = msg; if (msg) el.setAttribute('aria-describedby', el.id + '-e'); }
    });
    if (bad.length) { bad[0].focus(); var l = document.getElementById('live'); if (l) l.textContent = bad.length === 1 ? 'Bitte eine Angabe prüfen.' : 'Bitte ' + bad.length + ' Angaben prüfen.'; }
    return !bad.length;
  }

  // ------------------------------------------------------------------ Aktionen
  function nextInvoice() { var n = db.nextInvoice++; return 'AA-2026-' + String(n).padStart(4, '0'); }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function ics(c) {
    var p = function (s) { return s.replace(/-/g, ''); }, t = function (s) { return s.replace(':', '') + '00'; };
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Athlete Academy//Camp-Prototyp//DE', 'BEGIN:VEVENT', 'UID:' + c.id + '@athlete-academy-demo',
      'DTSTAMP:' + now().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', 'DTSTART;TZID=Europe/Berlin:' + p(c.from) + 'T' + t(c.t1), 'DTEND;TZID=Europe/Berlin:' + p(c.from) + 'T' + t(c.t2),
      'RRULE:FREQ=DAILY;COUNT=' + days(c), 'SUMMARY:' + c.title + ' (Athlete Academy)', 'LOCATION:' + c.place, 'DESCRIPTION:Treffpunkt: ' + c.meet + '. Mitbringen: ' + c.bring.join(', '), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function csv(c) {
    var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var rows = [['Nachname', 'Vorname', 'Geburtsdatum', 'Trikot', 'Verein', 'Gesundheit', 'Eltern', 'E-Mail', 'Telefon', 'Status', 'Betrag', 'Rechnung', 'Fotos', 'WhatsApp']];
    regsOf(c.id).forEach(function (r) { rows.push([r.child.last, r.child.first, r.child.birth, r.child.shirt, r.child.club, r.child.health, r.parent.first + ' ' + r.parent.last, r.parent.email, r.parent.phone, PAY[r.status][1], String(r.price).replace('.', ','), r.invoiceNo, r.consent.photo ? 'ja' : 'nein', r.consent.whatsapp ? 'ja' : 'nein']); });
    return '﻿' + rows.map(function (r) { return r.map(q).join(';'); }).join('\r\n');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]'); if (!b) return;
    var a = b.getAttribute('data-action'), v = b.getAttribute('data-v');
    if (a === 'pay') return;                                          // läuft über aa:activate (nach dem Sweep)
    if (a === 'role') { go(v === 'trainer' ? '/admin' : '/camps'); return; }
    if (a === 'inbox') { go('/postfach/' + (path().indexOf('/admin') === 0 ? 'trainer' : inboxTab)); return; }
    if (a === 'font') { AA.setFont(v); render(); return; }
    if (a === 'theme') { AA.setTheme(v); render(); return; }
    if (a === 'reset') { if (!confirm('Demo auf den Anfangszustand zurücksetzen?')) return; db = seed(); persist(); Object.keys(localStorage).forEach(function (k) { if (k.indexOf(NS + 'draft-') === 0) localStorage.removeItem(k); }); filter = 'alle'; peopleFilter = 'alle'; toastAfter('Demo zurückgesetzt'); go('/camps'); render(); return; }
    if (a === 'filter') { filter = v; render(); return; }
    if (a === 'pfilter') { peopleFilter = v; render(); return; }
    if (a === 'method') { method = v; render(); return; }
    if (a === 'cancel-pay') { var rr = reg(v); if (rr && rr.status === 'pending') { db.regs = db.regs.filter(function (x) { return x.id !== v; }); persist(); } go('/anmeldung/' + (rr ? rr.campId : '') + '/3'); return; }
    if (a === 'ics') { var cc = camp(v); download(slug(cc.title) + '.ics', ics(cc), 'text/calendar'); return; }
    if (a === 'csv') { var c2 = camp(v); download('teilnehmer-' + slug(c2.title) + '.csv', csv(c2), 'text/csv'); toast('CSV-Datei heruntergeladen'); return; }
    if (a === 'print') { window.print(); return; }
    if (a === 'duplicate') {
      var src = camp(v), cp = JSON.parse(JSON.stringify(src)); cp.title = src.title + ' (Kopie)'; cp.status = 'draft';
      cp.id = slug(cp.title) + '-' + Date.now().toString(36).slice(-4); db.camps.push(cp); persist(); toastAfter('Kopie angelegt – Termine anpassen und veröffentlichen'); go('/admin/camps/' + cp.id + '/bearbeiten'); return;
    }
    if (a === 'markpaid') { var r1 = reg(v); r1.status = 'paid'; r1.paidAt = now().toISOString(); notify('paid-later', r1); persist(); toastAfter('Zahlung verbucht – Familie ist informiert'); render(); return; }
    if (a === 'remind') { var r2 = reg(v); notify('reminder', r2); persist(); toastAfter('Erinnerung verschickt'); render(); return; }
    if (a === 'promote') { var r3 = reg(v); r3.status = 'open'; r3.pay = 'invoice'; r3.invoiceNo = nextInvoice(); r3.created = now().toISOString(); notify('promoted', r3); persist(); toastAfter('Platz angeboten – Familie hat 48 Stunden Zeit'); render(); return; }
    if (a === 'broadcast') { var dlg = document.getElementById('dlg'); if (dlg && dlg.showModal) dlg.showModal(); return; }
    if (a === 'dlg-close') { var dl = document.getElementById('dlg'); if (dl) dl.close(); return; }
  });

  // Formulare: aa.js löst "aa:submit" erst nach dem Sweep aus
  document.addEventListener('submit', function (e) { if (e.target.hasAttribute('data-js')) e.preventDefault(); });
  document.addEventListener('aa:submit', function (e) {
    var form = e.target.closest('form'); if (!form) return;
    var id = form.id, p = path(), m;
    if (id === 'flow1' || id === 'flow2') {
      if (!validate(form)) return;
      m = p.match(/^\/anmeldung\/([\w-]+)\//); var cid = m[1], dr = getDraft(cid), g = function (n) { var el = form.elements[n]; return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : undefined; };
      if (id === 'flow1') dr.child = { first: g('first'), last: g('last'), birth: g('birth'), shirt: g('shirt'), club: g('club'), health: g('health'), sibling: !!g('sibling') };
      else { dr.parent = { first: g('pfirst'), last: g('plast'), email: g('email'), phone: g('phone') }; dr.consent = { terms: g('terms'), health: !!g('chealth'), photo: g('photo'), whatsapp: g('whatsapp') }; }
      save(draftKey(cid), dr); go('/anmeldung/' + cid + '/' + (id === 'flow1' ? 2 : 3)); return;
    }
    if (id === 'flow3') {
      m = p.match(/^\/anmeldung\/([\w-]+)\//); var c = camp(m[1]), d0 = getDraft(c.id), full = state(c) === 'full';
      var sel = form.querySelector('input[name="pay"]:checked'), pay = sel ? sel.value : 'invoice';
      var r = { id: 'r' + Date.now().toString(36), campId: c.id, child: d0.child, parent: d0.parent, consent: d0.consent, pay: pay,
        price: price(c, d0).total, invoiceNo: full ? '' : nextInvoice(), created: now().toISOString(),
        status: full ? 'waitlist' : pay === 'online' ? 'pending' : 'open' };
      db.regs.unshift(r); drop(draftKey(c.id));
      if (full) notify('waitlist', r); else if (pay === 'invoice') notify('invoice', r);
      persist(); go(pay === 'online' && !full ? '/zahlung/' + r.id : '/danke/' + r.id); return;
    }
    if (id === 'editor') {
      if (!validate(form)) return;
      var data = readEditor(form), status = e.target.value === 'online' ? 'online' : 'draft', eid = form.getAttribute('data-id');
      if (data.to < data.from) data.to = data.from;
      if (eid) { Object.assign(camp(eid), data, { status: status }); }
      else { var nid = slug(data.title), n = 2; while (camp(nid)) nid = slug(data.title) + '-' + n++; data.id = nid; data.status = status; data.meet = data.meet || 'wird noch bekanntgegeben'; db.camps.push(data); }
      persist(); toastAfter(status === 'online' ? 'Camp veröffentlicht – jetzt auf der Seite sichtbar' : 'Als Entwurf gespeichert'); go('/admin/camps'); return;
    }
    if (id === 'bcast') {
      if (!validate(form)) return;
      var c3 = camp(form.getAttribute('data-id')), txt = form.elements.btext.value.trim(), sent = 0;
      regsOf(c3.id).filter(function (x) { return x.status !== 'waitlist'; }).forEach(function (x, i) { if (i === 0) { addMsg({ to: 'familie', ch: 'mail', kind: 'broadcast', regId: x.id, text: txt, subject: mailSubject('broadcast', x, c3) }); if (x.consent.whatsapp) addMsg({ to: 'familie', ch: 'chat', kind: 'broadcast', regId: x.id, text: txt, subject: 'WhatsApp · ' + mailSubject('broadcast', x, c3) }); } sent++; });
      persist(); document.getElementById('dlg').close(); toastAfter('Nachricht an ' + sent + ' Familien verschickt'); render();
    }
  });
  document.addEventListener('aa:activate', function (e) {
    var b = e.target.closest('[data-action="pay"]'); if (!b) return;
    b.classList.add('is-loading');
    setTimeout(function () {
      var r = reg(b.getAttribute('data-v')); if (!r) return;
      r.status = 'paid'; r.paidAt = now().toISOString(); notify('booked', r); persist(); go('/danke/' + r.id);
    }, 1100);
  });
  // Live-Vorschau im Camp-Formular
  document.addEventListener('input', function (e) {
    var form = e.target.closest('#editor'); if (!form) return;
    var pv = document.getElementById('preview'); if (!pv) return;
    var c = previewCamp(Object.assign({}, EMPTY, readEditor(form), { id: '__preview' }));
    pv.innerHTML = campCard(c, { preview: true });
  });

  window.addEventListener('hashchange', render);
  document.addEventListener('aa:font', function () { });
  window.AAProto = { reset: function () { db = seed(); persist(); }, db: function () { return db; } };
  render();
})();
