#!/usr/bin/env node
// Erzeugt den 30-Tage-Fahrplan (Paket Überall) je Betrieb: monetascale.de/<slug>/fahrplan/
//
// Aufruf (im Repo-Ordner):
//   node tools/landingpages/fahrplan.mjs              alle gebauten Seiten
//   node tools/landingpages/fahrplan.mjs --nur <slug> nur dieser Betrieb
//
// Die Daten (Name, Kurzname, Farben) kommen aus der schon gebauten Seite <slug>/index.html
// (Block lp-daten und „Für <Kurzname>“ in der Leiste). Darum zuerst build.mjs, dann dieses Skript.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..', '..');
const MARKER = '<!-- lp:generiert';

const i = process.argv.indexOf('--nur');
const nur = i > -1 ? process.argv[i + 1] : undefined;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const farbe = (h, ersatz) => (typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : ersatz);

const vorlage = await readFile(path.join(HIER, 'fahrplan-vorlage.html'), 'utf8');
const ordner = (await readdir(ROOT, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);

let anzahl = 0;
for (const slug of ordner) {
  if (nur && slug !== nur) continue;
  let html;
  try { html = await readFile(path.join(ROOT, slug, 'index.html'), 'utf8'); } catch { continue; }
  if (!html.includes(MARKER)) continue;
  const roh = html.match(/<script type="application\/json" id="lp-daten">([\s\S]*?)<\/script>/);
  if (!roh) continue;
  const d = JSON.parse(roh[1]);
  const kurz = html.match(/<span class="nav-fuer">Für ([^<]+)<\/span>/);
  const kurzname = kurz ? unesc(kurz[1].trim()) : d.name;
  const f = d.farben || {};
  const werte = {
    slug: d.slug || slug,
    name: d.name,
    kurzname,
    farbe1: farbe(f.primaer, '#2F7A17'),
    farbe1_text: farbe(f.primaerText, '#FFFFFF'),
    farbe1_hell: farbe(f.primaerHell, '#ECF0E8'),
  };
  let aus = vorlage.replace(/\{\{kurzname_url\}\}/g, encodeURIComponent(kurzname));
  aus = aus.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in werte)) throw new Error(`${slug}: Platzhalter {{${k}}} ohne Wert`);
    return esc(werte[k]);
  });
  await mkdir(path.join(ROOT, slug, 'fahrplan'), { recursive: true });
  await writeFile(path.join(ROOT, slug, 'fahrplan', 'index.html'), aus, 'utf8');
  console.log(`✓ ${slug}/fahrplan/  (${kurzname})`);
  anzahl++;
}
if (!anzahl) { console.error(nur ? `Keine gebaute Seite „${nur}“ gefunden.` : 'Keine gebauten Seiten gefunden.'); process.exit(1); }
console.log(`${anzahl} Fahrpläne geschrieben.`);
