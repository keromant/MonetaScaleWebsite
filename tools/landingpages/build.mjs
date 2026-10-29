#!/usr/bin/env node
// Erzeugt persönliche Landingpages für Wärmepumpen-Betriebe: monetascale.de/<slug>/
//
// Aufruf (im Repo-Ordner):
//   node tools/landingpages/build.mjs                       liest tools/landingpages/betriebe.json
//   node tools/landingpages/build.mjs --daten <pfad.json>   liest eine Liste außerhalb des Repos
//   node tools/landingpages/build.mjs --nur <slug>          baut nur diesen Betrieb
//
// Ohne Abhängigkeiten. Jede Seite enthält nur die Daten ihres eigenen Betriebs.
// Das Repo ist öffentlich: echte Listen gehören nicht in dieses Repo (siehe --daten).

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..', '..');
const MARKER = '<!-- lp:generiert';
const PDF_LIB = '../assets/lp/jspdf-4.2.1.umd.min.js';
// Telefon für Rückruf, tel:-Links und vCard auf den persönlichen Seiten (Impressum bleibt vorerst wie es ist)
const TELEFON = { link: '+491763209802', text: '+49 176 3209802' };

const REELS = [
  { titel: 'Tankfüllung', text: 'Heizöl kostet fast 75 Prozent mehr als vor einem Jahr. Das Reel rechnet in drei Zahlen nach.' },
  { titel: 'Lohnt sich das?', text: 'Eine Beispielrechnung Schritt für Schritt: Preis, Förderung bis 80 %, wann das Geld wieder drin ist.' },
  { titel: 'Ab Februar', text: 'Am 1. Februar 2027 sinkt die Förderung. Das Reel zeigt den Unterschied in Euro.' },
];

// ─── Argumente ───
function arg(name) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
}
const datenPfad = path.resolve(arg('--daten') || path.join(HIER, 'betriebe.json'));
const nur = arg('--nur');

// ─── Farben ───
function hex(h, feld) {
  if (typeof h !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(h)) throw new Error(`${feld}: Farbe als #RRGGBB angeben, nicht „${h}“`);
  return h.toUpperCase();
}
const zuRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const zuHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
function helligkeit(h) {
  const [r, g, b] = zuRgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function kontrast(a, b) {
  const [x, y] = [helligkeit(a), helligkeit(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const textAuf = (h) => (kontrast(h, '#FFFFFF') >= kontrast(h, '#0A0A0A') ? '#FFFFFF' : '#0A0A0A');
const mische = (h, mit, anteil) => {
  const a = zuRgb(h), b = zuRgb(mit);
  return zuHex(a.map((v, i) => v + (b[i] - v) * anteil));
};

// ─── Hilfen ───
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = new RegExp('[' + String.fromCharCode(0x2028, 0x2029) + ']', 'g');
const BS = String.fromCharCode(92); // Backslash
const sicheresJson = (o) => JSON.stringify(o).replace(/</g, BS + 'u003c').replace(LS, (c) => BS + 'u' + c.charCodeAt(0).toString(16));

const RECHTSFORMEN = /^(gmbh|mbh|kg|ag|ug|ohg|gbr|e\.?k\.?|e\.?v\.?|co\.?|&|und|haftungsbeschränkt|\(haftungsbeschränkt\))$/i;
function initialen(name) {
  const w = name.split(/\s+/).filter((t) => t && !RECHTSFORMEN.test(t));
  return ((w[0]?.[0] || '') + (w[1]?.[0] || '')).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function render(vorlage, werte) {
  // Abschnitte {{#feld}}…{{/feld}} so oft auflösen, bis keine mehr da sind (auch verschachtelt)
  let out = vorlage, vorher;
  do {
    vorher = out;
    out = out.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, k, inner) => (werte[k] ? inner : ''));
  } while (out !== vorher);
  out = out.replace(/\{\{(\{?)(\w+)\}?\}\}/g, (m, roh, k) => {
    if (!(k in werte)) throw new Error(`Platzhalter {{${k}}} hat keinen Wert`);
    return roh ? String(werte[k]) : esc(werte[k]);
  });
  return out;
}

function mailBloecke(md) {
  const block = (titel) => {
    const re = new RegExp(`^## ${titel}\\s*\\n+\`\`\`[a-z]*\\n([\\s\\S]*?)\\n\`\`\``, 'm');
    const m = md.match(re);
    if (!m) throw new Error(`mail-foerder-check.md: Abschnitt „## ${titel}“ mit Code-Block fehlt`);
    return m[1];
  };
  return { betreff: block('Betreff').trim(), vorschau: block('Vorschautext').trim(), text: block('Text'), html: block('HTML') };
}

// Titelbild für ein Reel (SVG), solange es kein eigenes gibt
function titelbild(nr, titel, b) {
  // Titel auf höchstens zwei Zeilen verteilen (SVG bricht nicht selbst um)
  const woerter = titel.split(' ');
  let zeilen = [titel];
  if (titel.length > 11 && woerter.length > 1) {
    let best = 1, diff = Infinity;
    for (let i = 1; i < woerter.length; i++) {
      const d = Math.abs(woerter.slice(0, i).join(' ').length - woerter.slice(i).join(' ').length);
      if (d < diff) { diff = d; best = i; }
    }
    zeilen = [woerter.slice(0, best).join(' '), woerter.slice(best).join(' ')];
  }
  const laengste = Math.max(...zeilen.map((z) => z.length));
  const groesse = Math.min(64, Math.floor(444 / (laengste * 0.62)));
  const titelSvg = zeilen.map((z, i) => `<text x="48" y="${250 + i * groesse * 1.1}" font-family="Arial, Helvetica, sans-serif" font-size="${groesse}" font-weight="800" fill="${b.f1t}">${esc(z)}</text>`).join('');
  const strichY = 250 + (zeilen.length - 1) * groesse * 1.1 + 34;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.f1}"/><stop offset="1" stop-color="${b.f1d}"/></linearGradient></defs>
<rect width="540" height="960" fill="url(#g)"/>
<circle cx="480" cy="760" r="240" fill="${b.f2}" opacity=".14"/>
<text x="48" y="96" font-family="Arial, Helvetica, sans-serif" font-size="${Math.min(24, Math.floor(444 / ((b.name.length + 2) * 0.6)))}" font-weight="700" fill="${b.f1t}" opacity=".9">(${esc(b.name)})</text>
<text x="48" y="176" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${b.f2}">Reel ${nr}</text>
${titelSvg}
<rect x="48" y="${strichY}" width="120" height="8" rx="4" fill="${b.f2}"/>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function reelsHtml(betrieb, farben) {
  return betrieb.videos.map((v, i) => {
    const eintrag = typeof v === 'string' ? { url: v } : v || {};
    if (!eintrag.url || !/^https:\/\//.test(eintrag.url)) throw new Error(`${betrieb.slug}: videos[${i}] braucht eine https-Adresse`);
    const reel = REELS[i];
    const titel = eintrag.titel || reel.titel;
    const poster = eintrag.poster || titelbild(i + 1, titel, { ...farben, name: betrieb.name });
    // Platzhalter-Adressen (example.com usw.) laden nichts, die Seite zeigt „Das Video folgt“
    const platzhalter = /(^|\.)example\.(com|org|net)$/i.test(new URL(eintrag.url).hostname);
    const quelle = platzhalter ? ` data-platzhalter="${esc(eintrag.url)}"` : ` src="${esc(eintrag.url)}"`;
    return `          <article class="card reel">
            <div class="reel-video${platzhalter ? ' ist-leer' : ''}">
              <video controls playsinline preload="metadata" poster="${esc(poster)}"${quelle} aria-label="Reel ${i + 1}: ${esc(titel)}"></video>
              <p class="reel-leer">Das Video folgt in Kürze.</p>
            </div>
            <div class="card-num">Reel ${i + 1}</div>
            <h3>${esc(titel)}</h3>
            <p>${esc(eintrag.text || reel.text)}</p>
          </article>`;
  }).join('\n');
}

// ─── Prüfen ───
const VERBOTEN = [/90\s*(%|Prozent)\s*(sind\s*)?förderberechtigt/i, /CO2-Preis steigt/i, /Pflicht zum (Heizungs)?tausch/i, /15\s*(%|Prozent)[^.<]{0,80}\bEU\b/];

async function existiert(p) {
  try { return await stat(p); } catch { return null; }
}

async function main() {
  const vorlage = await readFile(path.join(HIER, 'vorlage.html'), 'utf8');
  const mail = mailBloecke(await readFile(path.join(HIER, 'mail-foerder-check.md'), 'utf8'));
  const liste = JSON.parse(await readFile(datenPfad, 'utf8'));
  if (!Array.isArray(liste)) throw new Error('Die Datendatei muss eine Liste sein');

  const oberste = new Set((await readdir(ROOT)).map((n) => n.toLowerCase()));
  const geschrieben = [];
  const slugs = new Set();

  for (const b of liste) {
    if (nur && b.slug !== nur) continue;
    const f = `Betrieb „${b?.slug}“`;
    if (!b || typeof b.slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug)) throw new Error(`${f}: slug nur aus a–z, 0–9 und Bindestrich`);
    if (slugs.has(b.slug)) throw new Error(`${f}: slug doppelt`);
    slugs.add(b.slug);
    for (const k of ['name', 'ort']) if (!b[k] || typeof b[k] !== 'string') throw new Error(`${f}: Feld ${k} fehlt`);
    // Kurzname für Kopf und Aufruf (voller Name bleibt im Förder-Check, im PDF und in der Mail)
    const kurzname = (b.kurzname ?? b.name).trim();
    if (!kurzname || kurzname.length > 24) throw new Error(`${f}: kurzname höchstens 24 Zeichen („${kurzname}“ hat ${kurzname.length})`);
    if (!Array.isArray(b.videos) || b.videos.length !== 3) throw new Error(`${f}: genau 3 videos angeben`);
    if (b.reportLink && !/^https:\/\//.test(b.reportLink)) throw new Error(`${f}: reportLink muss mit https:// beginnen`);

    // Nichts überschreiben, was nicht von hier stammt
    const ziel = path.join(ROOT, b.slug);
    const zielDatei = path.join(ziel, 'index.html');
    if (oberste.has(b.slug.toLowerCase())) {
      const alt = await existiert(zielDatei);
      const inhalt = alt ? await readFile(zielDatei, 'utf8') : '';
      if (!inhalt.includes(MARKER)) throw new Error(`${f}: Ordner /${b.slug}/ gibt es schon und stammt nicht vom Generator`);
    }

    const f1 = hex(b.farben?.primaer, `${f} farben.primaer`);
    const f2 = hex(b.farben?.sekundaer, `${f} farben.sekundaer`);
    const farben = { f1, f1t: textAuf(f1), f1d: mische(f1, '#000000', 0.28), f1h: mische(f1, '#FFFFFF', 0.9), f2, f2t: textAuf(f2) };

    // Sterne nur ab 4,5 (und ab 20 Bewertungen, wenn die Zahl mitkommt)
    const sterne = Number(b.sterne);
    const sterneOk = sterne >= 4.5 && sterne <= 5 && (b.bewertungen == null || Number(b.bewertungen) >= 20);
    const sterneText = sterneOk
      ? `${sterne.toFixed(1).replace('.', ',')} Sterne bei Google` + (b.bewertungen ? ` · ${b.bewertungen} Bewertungen` : '')
      : '';

    const daten = {
      slug: b.slug,
      name: b.name,
      ort: b.ort,
      telefon: b.telefon || '',
      initialen: initialen(b.name),
      farben: { primaer: f1, primaerText: farben.f1t, primaerHell: farben.f1h, sekundaer: f2, sekundaerText: farben.f2t },
      mail,
      pdfLib: PDF_LIB,
      telText: TELEFON.text,
      telLink: TELEFON.link,
      kurzname,
      fotoUrl: '../assets/lp/kerem-ulas.jpg',
    };

    const html = render(vorlage, {
      titel: `Förder-Reels für ${b.name} · MonetaScale`,
      og_url: `https://monetascale.de/${b.slug}/`,
      name: b.name,
      ort: b.ort,
      initialen: daten.initialen,
      kurzname,
      farbe1: f1, farbe1_text: farben.f1t, farbe1_dunkel: farben.f1d, farbe1_hell: farben.f1h,
      farbe2: f2, farbe2_text: farben.f2t,
      sterne: sterneOk, sterne_text: sterneText,
      report: Boolean(b.reportLink), report_link: b.reportLink || '',
      chips: sterneOk || Boolean(b.reportLink),
      tel_link: TELEFON.link, tel_text: TELEFON.text,
      quelle: `Förder-Landingpage: ${b.name} (${b.slug})`,
      // Kundenbeispiel erst zeigen, wenn es echte Daten gibt: "beispiel": { "wer": "...", "text": "...", "quelle": "..." }
      beispiel: Boolean(b.beispiel?.text),
      beispiel_wer: b.beispiel?.wer || '',
      beispiel_text: b.beispiel?.text || '',
      beispiel_quelle: b.beispiel?.quelle || '',
      reels: reelsHtml(b, farben),
      daten_json: sicheresJson(daten),
    });

    for (const re of VERBOTEN) if (re.test(html)) throw new Error(`${f}: verbotene Aussage gefunden (${re})`);
    for (const fremd of liste) {
      if (fremd !== b && fremd?.name && html.includes(fremd.name)) throw new Error(`${f}: Name eines anderen Betriebs auf der Seite`);
    }

    await mkdir(ziel, { recursive: true });
    await writeFile(zielDatei, html, 'utf8');
    geschrieben.push(`/${b.slug}/index.html`);
  }

  if (nur && !geschrieben.length) throw new Error(`slug „${nur}“ nicht in ${datenPfad}`);
  console.log(`Fertig: ${geschrieben.length} Seite(n)`);
  for (const g of geschrieben) console.log('  ' + g);
}

main().catch((e) => {
  console.error('Fehler: ' + e.message);
  process.exit(1);
});
