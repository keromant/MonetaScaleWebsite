# Übergabe zwischen Sitzungen – monetascale.de

Kurze Notiz für die nächste Sitzung. Neueste oben, höchstens drei Blöcke. Push auf `master` = Live-Deploy (GitHub Pages).

## 2026-11-04 – 15 neue Dream-100-Seiten per Knopf (PC)
**Erledigt:** 15 persönliche Seiten samt Fahrplan live (Commit 25ae556), gebaut von `neue-seiten.mjs` im Repo monetascale-videos
(Skill `ulas:dream100-seiten`). Links stehen im Dashboard. Danach Ort auf 5 Seiten wie im Video gekürzt (b77b9e5).
**Offene Fäden:** 12 der 27 Betriebe vom 02.11. haben Videos im Netz, aber noch keine Seite. Der nächste Knopfdruck nimmt sie zuerst.
**Nächster Schritt:** Anschreiben über den Versand-Ordner (`versand-ordner.mjs --probe` zeigt die 15). Neue Seiten nur noch über den Knopf.
**Fallstricke:** Der Knopf committet nur die neuen Ordner und pusht auf master. Fremde, nicht gepushte Commits im Klon halten ihn an.
**Wichtige Dateien:** `tools/landingpages/build.mjs`, `tools/landingpages/fahrplan.mjs`, im Video-Repo `akquise/dream100/src/dream100/neue-seiten.mjs`.

## 2026-11-04 – 30-Tage-Fahrplan Paket Überall je Betrieb (Laptop)
**Erledigt:** Neue Seite `/<slug>/fahrplan/` für alle 10 Dream-100-Betriebe + Muster. Angebot 500 € Startgebühr, Monat 1
geschenkt, Wochenkalender Tag 1–30 (Wir / Ihr Team / Live), Stichtag 01.02.2027, Garantie Start in 7 Tagen, Druck als PDF.
**Offene Fäden:** Laufzeit und Preis ab Monat 2 stehen bewusst nicht drin (Kerem klärt im Gespräch). Druckansicht nicht
mit Screenshot geprüft. Aufrufe zählen über `lp-tracking.js` unter dem Slug der Reels-Seite (nicht getrennt).
**Nächster Schritt:** Für neue Betriebe nach `build.mjs` auch `node tools/landingpages/fahrplan.mjs` (`--nur <slug>`).
**Fallstricke:** `fahrplan.mjs` liest Name, Kurzname und Farben aus der gebauten `<slug>/index.html` (lp-daten + „Für …“).
**Wichtige Dateien:** `tools/landingpages/fahrplan-vorlage.html`, `tools/landingpages/fahrplan.mjs`.

## 2026-11-03 – Link-Vorschau „Reels für <Betrieb>“ (PC)
**Erledigt:** `og:title` der persönlichen Seiten = „Reels für <Name>“ statt „Ihre Förder-Reels und Ihr Förder-Check“,
`<title>` = „Reels für <Name> · MonetaScale“. Vorlage + `build.mjs` geändert, die 10 Seiten + Muster per Ersetzung nachgezogen
(gleiche zwei Zeilen wie ein Neubau, an `muster-waermepumpe` geprüft). `build.mjs` liest `mail-foerder-check.md` jetzt auch mit CRLF.
**Offene Fäden:** Schon verschickte Links behalten in DMs meist die alte Vorschau (Instagram/WhatsApp speichern sie zwischen).
**Nächster Schritt:** Seiten der 27 neuen Betriebe (Videos in `C:\Website-Business\Akquise\Dream100-neue-Videos`) mit `build.mjs --daten` bauen.
**Fallstricke:** Ohne die CRLF-Zeile scheiterte `build.mjs` am PC mit „Abschnitt ## Betreff fehlt“ (core.autocrlf=true).
**Wichtige Dateien:** `tools/landingpages/vorlage.html` (Kopf), `tools/landingpages/build.mjs` (`titel`).
