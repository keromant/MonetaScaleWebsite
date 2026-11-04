# Übergabe zwischen Sitzungen – monetascale.de

Kurze Notiz für die nächste Sitzung. Neueste oben, höchstens drei Blöcke. Push auf `master` = Live-Deploy (GitHub Pages).

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

## 2026-10-30 – Pakete in einer Kachel, „Partner auf Erfolg“ raus (PC)
**Erledigt:** Sichtbar, Überall und Marktführer nutzen dieselbe breite Kachel (`.pk-card`), je eine pro Zeile: Kopf + Knopf links,
3 innere Kacheln rechts, Liste über die ganze Breite. Nur `.mf-card` hat Petrol, Rahmen-Glanz, Krone und grünen Knopf.
Block „Partner auf Erfolg“ entfernt, „Preis im Gespräch“ steht jetzt an allen drei Kacheln.
**Offene Fäden:** Die Texte der inneren Kacheln von Sichtbar und Überall stammen aus Abschnitt „Zwölf Teile“; neu ist nur das Etikett „Der Einstieg“.
**Fallstricke:** `pk-*` = Bauteile aller Kacheln, `mf-*` = nur die Hervorhebung. `.pk-card` trägt bewusst nicht `.card`, sonst greift das 3D-Kippen (GSAP) und hebelt den Hover aus.
**Wichtige Dateien:** `index.html` (#pakete, CSS „PAKET-KACHELN“).
