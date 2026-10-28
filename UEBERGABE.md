# Übergabe zwischen Sitzungen – monetascale.de

Kurze Notiz für die nächste Sitzung. Neueste oben, höchstens drei Blöcke. Push auf `master` = Live-Deploy (GitHub Pages).

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
