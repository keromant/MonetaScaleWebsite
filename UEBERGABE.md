# Übergabe zwischen Sitzungen – monetascale.de

Kurze Notiz für die nächste Sitzung. Neueste oben, höchstens drei Blöcke. Push auf `master` = Live-Deploy (GitHub Pages).

## 2026-10-29 – 10 persönliche Seiten live, Tracking, Datenschutz (PC)
**Erledigt:** `foerder/landingpages` nach `master` gemergt: 10 Seiten `/<slug>/` (Dream 100 Wärmepumpe), Videos und
Vorschaubilder von `media.ulas.systems/wp/<slug>/` (R2-Bucket `dream100-videos`, EU), `assets/lp-tracking.js`
(meldet an dashboard.ulas.systems/api/lp/ereignis), Datenschutz Abschnitt 8 „Nutzung der persönlichen Seiten“.
**Offene Fäden:** `paket/marktfuehrer` war schon in `master`. Kein Hell/Dunkel-Umschalter auf der Hauptseite (eigene Aufgabe).
**Nächster Schritt:** Weitere Betriebe: Daten-JSON außerhalb des Repos (Vorlage `tools/landingpages/betriebe.json`,
Feld `videos: [{url, poster}]`), `node tools/landingpages/build.mjs --daten <pfad>`, nur die neuen Ordner committen.
**Fallstricke:** Eigene Besuche und Prüfungen der echten Seiten immer mit `?intern=1`, sonst landen sie beim Lead im
Dashboard und Johann meldet „Seite geöffnet“. Links in Mails/DMs mit `?q=mail` bzw. `?q=dm`. Listen echter Betriebe nie
einchecken (Repo öffentlich). Datenschutz ist 381 px breit bei 375 px (schon vorher so, kein sichtbares Element).
**Wichtige Dateien:** `tools/landingpages/vorlage.html`, `assets/lp-tracking.js`, `datenschutz.html`.

## 2026-10-28 – Neue Telefonnummer, Marktführer und persönliche Seiten in Arbeit (PC)
**Erledigt:** Impressum und Datenschutz nennen jetzt +49 176 3209802 (vorher +49 176 70368821), live über `master`.
**Offene Fäden:** Zwei Zweige, noch nicht in `master`:
- `paket/marktfuehrer` (Worktree `C:\Website-Business\ms-paket`): drittes Paket „Marktführer“ statt „Allgegenwärtig“,
  Abschnitt „Elf Teile“, Paket-Auswahl im Formular. Fertig geprüft, wartet auf Kerems Ja zum Livegang.
- `foerder/landingpages` (Worktree `C:\Website-Business\ms-foerder`): Generator `tools/landingpages/` für persönliche
  Seiten `/<slug>/` der Dream-100-Betriebe (Wärmepumpe), Musterseite `muster-waermepumpe/`, Ergänzung `datenschutz.html`
  (Formspree, Cloudflare R2). Ändert ebenfalls `datenschutz.html` – beim Zusammenführen auf Konflikt achten.
**Nächster Schritt:** Nach Kerems Abnahme beide Zweige nach `master` mergen, echte Betriebe nur über
`node tools/landingpages/build.mjs --daten <pfad außerhalb des Repos>` erzeugen (Repo ist öffentlich).
**Fallstricke:** Das Repo ist öffentlich: keine Listen echter Betriebe einchecken, nur die erzeugten Seiten der
tatsächlich angeschriebenen Betriebe. monetascale.de hat keinen Hell/Dunkel-Umschalter (eigene Aufgabe).
**Wichtige Dateien:** `index.html` (#pakete, Formular), `impressum.html`, `datenschutz.html`, `tools/landingpages/`.
