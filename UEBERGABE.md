# Übergabe zwischen Sitzungen – monetascale.de

Kurze Notiz für die nächste Sitzung. Neueste oben, höchstens drei Blöcke. Push auf `master` = Live-Deploy (GitHub Pages).

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
