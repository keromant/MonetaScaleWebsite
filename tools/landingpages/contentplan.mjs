#!/usr/bin/env node
// Erzeugt den geschenkten 30-Tage-Contentplan eines Betriebs: monetascale.de/<slug>/contentplan/
//
// Aufruf (im Repo-Ordner):
//   node tools/landingpages/contentplan.mjs --daten <seite.json>
//
// <seite.json> liegt NICHT im Repo (Repo ist öffentlich): Sie enthält die Seite des Plans, der vorher durch
// Tor 1 (content_pruefen) und den Gutachter ging (Skill contentplan, Gratis-Plan). Farben, Name und Kurzname
// kommen aus der schon gebauten Reels-Seite <slug>/index.html. Darum zuerst build.mjs, dann dieses Skript.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..', '..');
const MARKER = '<!-- lp:generiert';

const i = process.argv.indexOf('--daten');
if (i < 0 || !process.argv[i + 1]) {
  console.error('Aufruf: node tools/landingpages/contentplan.mjs --daten <seite.json>');
  process.exit(1);
}
const s = JSON.parse(await readFile(path.resolve(process.argv[i + 1]), 'utf8'));

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (v) => String(v).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const fehler = (t) => { throw new Error(`${s.slug ?? 'Seite'}: ${t}`); };
const hex = (h) => (typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : null);

// ─── Prüfen ───
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug ?? '')) fehler('slug fehlt oder hat falsche Zeichen');
for (const k of ['intro', 'persona', 'persona_quelle', 'kommentar_wort', 'auswertung_am', 'stand']) if (!s[k] || typeof s[k] !== 'string') fehler(`Feld ${k} fehlt`);
if (!Array.isArray(s.saeulen) || s.saeulen.length !== 5) fehler('genau 5 saeulen');
if (!Array.isArray(s.eintraege) || s.eintraege.length < 20) fehler('eintraege fehlen');
if (!Array.isArray(s.wochen) || s.wochen.length < 1) fehler('wochen fehlen');
const namen = s.saeulen.map((x) => x.name);
const ZIELE = { reichweite: 'Reichweite', vertrauen: 'Vertrauen', anfrage: 'Anfrage' };
for (const e of s.eintraege) {
  const o = `Eintrag ${e.position}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.datum ?? '')) fehler(`${o}: datum`);
  if (!namen.includes(e.saeule)) fehler(`${o}: Säule „${e.saeule}“ unbekannt`);
  if (!Array.isArray(e.hooks) || e.hooks.length !== 3) fehler(`${o}: genau 3 hooks`);
  for (const k of ['titel', 'mit_gesicht', 'ohne_gesicht', 'warum']) if (!e[k]) fehler(`${o}: ${k} fehlt`);
  if (!ZIELE[e.ziel]) fehler(`${o}: ziel`);
}

// ─── Betrieb: aus der gebauten Reels-Seite oder (ohne Reels-Seite, z. B. eine ganze Gruppe) aus „betrieb“ ───
let d, kurzname, farben;
if (s.betrieb) {
  const b = s.betrieb;
  for (const k of ['name', 'kurzname', 'ort']) if (!b[k]) fehler(`betrieb.${k} fehlt`);
  const f1 = hex(b.farben?.primaer) ?? fehler('betrieb.farben.primaer fehlt');
  d = { name: b.name, ort: b.ort, farben: { sekundaer: b.farben?.sekundaer } };
  kurzname = b.kurzname;
  farben = {
    farbe1: f1,
    farbe1_text: hex(b.farben?.primaerText) ?? '#FFFFFF',
    farbe1_dunkel: hex(b.farben?.primaerDunkel) ?? f1,
    farbe1_hell: hex(b.farben?.primaerHell) ?? '#ECF0E8',
  };
} else {
  const reelsSeite = await readFile(path.join(ROOT, s.slug, 'index.html'), 'utf8').catch(() => fehler('Reels-Seite fehlt, zuerst build.mjs'));
  if (!reelsSeite.includes(MARKER)) fehler('Reels-Seite stammt nicht vom Generator');
  d = JSON.parse(reelsSeite.match(/<script type="application\/json" id="lp-daten">([\s\S]*?)<\/script>/)[1]);
  const kurz = reelsSeite.match(/<span class="nav-fuer">Für ([^<]+)<\/span>/);
  kurzname = kurz ? unesc(kurz[1].trim()) : d.name;
  const cssVar = (n) => hex((reelsSeite.match(new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`)) ?? [])[1]);
  farben = {
    farbe1: cssVar('b1') ?? '#2F7A17',
    farbe1_text: cssVar('b1-text') ?? '#FFFFFF',
    farbe1_dunkel: cssVar('b1-dunkel') ?? '#1F5C0C',
    farbe1_hell: cssVar('b1-hell') ?? '#ECF0E8',
  };
}
const farbe2 = hex(d.farben?.sekundaer) ?? '#E0A21B';
// Eine Farbe je Säule: Grün, Betrieb, Zweitfarbe des Betriebs, Grau, Petrol
const SAEULEN_FARBEN = ['#65C83D', farben.farbe1, farbe2, '#8C8C8C', '#1E9AA0'];
const farbeVon = (name) => SAEULEN_FARBEN[namen.indexOf(name)];

// ─── Datum ───
const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const dt = (iso) => new Date(`${iso}T12:00:00Z`);
const kurzDatum = (iso) => { const x = dt(iso); return `${x.getUTCDate()}.${x.getUTCMonth() + 1}.`; };
const langDatum = (iso) => { const x = dt(iso); return `${x.getUTCDate()}. ${MONATE[x.getUTCMonth()]}`; };
const eintraege = [...s.eintraege].sort((a, b) => a.position - b.position);
const erster = eintraege[0].datum;
const letzter = eintraege[eintraege.length - 1].datum;
const tagNr = (iso) => Math.round((dt(iso) - dt(erster)) / 86_400_000) + 1;

// ─── Bausteine ───
const pfeil = '<span class="pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>';

const stimmen = (s.stimmen ?? []).map((x) =>
  `            <div class="card stimme"><q>${esc(x.text)}</q><span>${esc(x.wo)}</span></div>`).join('\n');

const saeulen = s.saeulen.map((x, n) =>
  `          <div class="card saeule"><div class="punkt" style="background:${SAEULEN_FARBEN[n]}"></div><h3>${esc(x.name)}</h3><p>${esc(x.satz)}</p></div>`).join('\n');

const legende = s.saeulen.map((x, n) =>
  `          <span><i class="mark"><i style="background:${SAEULEN_FARBEN[n]}"></i>${esc(x.name)}</i></span>`).join('\n');

function video(e, gruppe) {
  const nr = tagNr(e.datum);
  const x = dt(e.datum);
  const check = e.aufruf !== 'kein' ? `<span class="mark mark-check">${esc(s.kommentar_wort)}</span>` : '';
  const warumLink = e.warum_link ? ` <a href="${esc(e.warum_link)}" target="_blank" rel="noopener noreferrer">Beispiel ansehen</a>` : '';
  return `          <details class="card video" name="${gruppe}" data-gruppe="${gruppe}">
            <summary>
              <span class="v-tag"><b>Tag ${nr}</b><span>${TAGE[x.getUTCDay()]} ${kurzDatum(e.datum)}</span></span>
              <span><span class="v-titel">${esc(e.titel)}</span>
                <span class="v-marken"><span class="mark"><i style="background:${farbeVon(e.saeule)}"></i>${esc(e.saeule)}</span><span class="mark">${ZIELE[e.ziel]}</span>${check}</span></span>
              ${pfeil}
            </summary>
            <div class="v-inhalt">
              <div><h4>Ideen für den ersten Satz</h4><ol>${e.hooks.map((h) => `<li>${esc(h)}</li>`).join('')}</ol></div>
              <div class="v-wege">
                <div class="v-weg"><h4>Mit Gesicht</h4><p>${esc(e.mit_gesicht)}</p></div>
                <div class="v-weg"><h4>Ohne Gesicht</h4><p>${esc(e.ohne_gesicht)}</p></div>
              </div>
              ${e.aufruf !== 'kein' && e.aufruf_text ? `<div><h4>Am Ende</h4><p>${esc(e.aufruf_text)}</p></div>` : ''}
              <p class="v-warum"><b>Warum im Plan:</b> ${esc(e.warum)}${warumLink}</p>
            </div>
          </details>`;
}

// Wochen: je 7 Tage ab dem ersten Eintrag
const wochen = [];
for (const e of eintraege) {
  const w = Math.floor((tagNr(e.datum) - 1) / 7);
  (wochen[w] ??= []).push(e);
}
const kalender = wochen.map((liste, w) => {
  const info = s.wochen[w] ?? {};
  const von = tagNr(liste[0].datum);
  const bis = tagNr(liste[liste.length - 1].datum);
  const zeit = `${langDatum(liste[0].datum)} bis ${langDatum(liste[liste.length - 1].datum)}`;
  return `        <div class="woche">
          <div class="woche-kopf"><span class="woche-nr">Woche ${w + 1} · Tag ${von}${bis > von ? ` bis ${bis}` : ''} · ${zeit}</span><h3>${esc(info.titel ?? '')}</h3></div>
          ${info.ziel ? `<p class="woche-ziel">${esc(info.ziel)}</p>` : ''}
          <div class="videos" style="margin-top:14px">
${liste.map((e) => video(e, `woche${w + 1}`)).join('\n')}
          </div>
        </div>`;
}).join('\n');

// Weg zur Anfrage: 4 Schritte (Standard = ein Förder-Check mit dem Namen des Betriebs)
const weg = (s.weg ?? [
  { titel: 'Video ansehen', text: 'Ein Hausbesitzer sieht ein Video und denkt: Das betrifft mich.' },
  { titel: '§WORT§ kommentieren', text: 'Am Ende des Videos steht ein Grund dafür. Ein Wort reicht.' },
  { titel: 'Förder-Check machen', text: `Sofort kommt eine Nachricht mit dem Link. Der Check trägt den Namen von ${kurzname}.` },
  { titel: `${kurzname} meldet sich`, text: 'Wer den Check macht, ist eine echte Anfrage. Mit Haus, Heizung und Förderung schon im Blick.' },
]).map((x, n) => {
  const titel = esc(x.titel).replace('§WORT§', `<span class="wort">${esc(s.kommentar_wort)}</span>`);
  return `          <div class="card"><div class="weg-nr">${n + 1}</div><h3>${titel}</h3><p>${esc(x.text)}</p></div>`;
}).join('\n');

// Weitere Knöpfe im Schluss (Standard: Fahrplan und Reels-Seite des Betriebs)
const links = (s.links ?? [
  { text: 'So laufen die ersten 30 Tage', href: '../fahrplan/' },
  { text: 'Zu den 3 Reels und dem Förder-Check', href: '../' },
]).map((l) => `          <a class="btn btn-rand nur-bildschirm" href="${esc(l.href)}" data-sweep>${esc(l.text)}</a>`).join('\n');

// Betriebe einer Gruppe (optional): wer den Plan nutzen kann
const betriebeAbschnitt = Array.isArray(s.betriebe) && s.betriebe.length
  ? `    <!-- ══════ BETRIEBE DER GRUPPE ══════ -->
    <section class="s-pad" style="padding-top:0" aria-labelledby="betriebeTitel">
      <div class="s-in">
        <div class="s-kopf">
          <div class="eyebrow">${esc(s.betriebe_eyebrow ?? 'Für jeden Betrieb der Gruppe')}</div>
          <h2 id="betriebeTitel">${esc(s.betriebe_titel ?? 'Ein Plan, viele Orte.')}</h2>
          <p class="intro">${esc(s.betriebe_intro ?? '')}</p>
        </div>
        <div class="betriebe">
${s.betriebe.map((b) => `          <div class="card betrieb"><b>${esc(b.name)}</b><span>${esc(b.ort)}</span>${b.marke ? `<span class="mark">${esc(b.marke)}</span>` : ''}</div>`).join('\n')}
        </div>
        ${s.ort_hinweis ? `<p class="ort-hinweis">${esc(s.ort_hinweis).replace(/\[Ort\]/g, '<code>[Ort]</code>')}</p>` : ''}
      </div>
    </section>
`
  : '';

const quellen = (s.quellen ?? []).map((q) =>
  `            <li>${esc(q.titel)}: <a href="${esc(q.link)}" target="_blank" rel="noopener noreferrer">${esc(q.link.replace(/^https?:\/\/(www\.)?/, ''))}</a></li>`).join('\n');

const aus = dt(s.auswertung_am);
const werte = {
  slug: s.slug,
  name: d.name,
  ort: d.ort,
  kurzname,
  ...farben,
  intro: s.intro,
  anzahl: String(eintraege.length),
  aufrufe: String(eintraege.filter((e) => e.aufruf !== 'kein').length),
  kommentar_wort: s.kommentar_wort,
  h1_vorn: s.h1_vorn ?? '30 Videos für Hausbesitzer in',
  h1_ort: s.h1_ort ?? d.ort,
  schluss_intro: s.schluss_intro ?? `Der Plan gehört ${kurzname}, auch ohne uns. Auf Wunsch setzen wir ihn um: Skripte, Schnitt, Untertitel und Posten. ${kurzname} dreht 30 Minuten pro Woche. Oder gar nicht.`,
  persona: s.persona,
  persona_quelle: s.persona_quelle,
  zeitraum_text: `Beispiel-Start am ${langDatum(erster)}, letztes Video am ${langDatum(letzter)} ${dt(letzter).getUTCFullYear()}. Der Start ist frei wählbar.`,
  zahl_ausreisser: String(s.zahl_ausreisser ?? ''),
  zahl_otoene: String(s.zahl_otoene ?? ''),
  zahl_konten: String(s.zahl_konten ?? ''),
  auswertung_kurz: `${String(aus.getUTCDate()).padStart(2, '0')}.${String(aus.getUTCMonth() + 1).padStart(2, '0')}.`,
  auswertung_jahr: String(aus.getUTCFullYear()),
  stand: s.stand,
};
const roh = { stimmen, saeulen, legende, kalender, quellen, weg, links, betriebe_abschnitt: betriebeAbschnitt };

const vorlage = await readFile(path.join(HIER, 'contentplan-vorlage.html'), 'utf8');
let html = vorlage.replace(/\{\{kurzname_url\}\}/g, encodeURIComponent(kurzname));
html = html.replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => {
  if (!(k in roh)) fehler(`Platzhalter {{{${k}}}} ohne Wert`);
  return roh[k];
});
html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => {
  if (!(k in werte)) fehler(`Platzhalter {{${k}}} ohne Wert`);
  return esc(werte[k]);
});

await mkdir(path.join(ROOT, s.slug, 'contentplan'), { recursive: true });
await writeFile(path.join(ROOT, s.slug, 'contentplan', 'index.html'), html, 'utf8');
console.log(`✓ ${s.slug}/contentplan/  (${kurzname}, ${eintraege.length} Videos, ${werte.aufrufe} mit ${s.kommentar_wort})`);
