# Mail-Vorlage: Förder-Check als PDF

Diese Mail bekommt der Hausbesitzer nach dem Förder-Check. Sie geht im Namen des Betriebs raus.
Das PDF mit dem Ergebnis hängt an. Anrede: Sie. Ton: kurz und freundlich. Am Ende steht der nächste Schritt.

Die Landingpage `monetascale.de/<slug>/` zeigt diese Mail als Vorschau. `build.mjs` liest die Blöcke unten
(je der erste Code-Block unter `## Betreff`, `## Vorschautext`, `## Text`, `## HTML`). Die Seite setzt die
Platzhalter beim Ausfüllen ein. Es geht keine Mail raus.

## Platzhalter

| Platzhalter | Inhalt | Beispiel |
|---|---|---|
| `{{betrieb}}` | Name des Betriebs | Muster Wärmepumpen GmbH |
| `{{ort}}` | Ort des Betriebs | Musterstadt |
| `{{email}}` | Adresse des Hausbesitzers | name@beispiel.de |
| `{{bundesland}}` | Bundesland des Hauses | Nordrhein-Westfalen |
| `{{prozent_bis}}` / `{{euro_bis}}` | Ergebnis bei Antrag bis 31.01.2027 | 46 % / 12.880 € |
| `{{prozent_ab}}` / `{{euro_ab}}` | Ergebnis bei Antrag ab 01.02.2027 | 42 % / 11.445 € |
| `{{basis_bis}}` / `{{basis_ab}}` | Förderfähige Kosten, auf die sich der Prozentwert bezieht | 28.000 € / 27.250 € |
| `{{unterschied_satz}}` | Satz zum Unterschied, fertig formuliert | Ein Antrag bis 31.01.2027 bringt rund 1.435 € mehr. |
| `{{telefon_satz}}` | „Oder rufen Sie uns an: …“, leer ohne Telefon | Oder rufen Sie uns an: 01234 56789. |
| `{{farbe}}` / `{{farbe_text}}` | Hauptfarbe des Betriebs und Schrift darauf | #0B5CAD / #FFFFFF |
| `{{dateiname}}` | Name des PDF-Anhangs | Foerder-Check-muster-waermepumpe.pdf |

Für den echten Versand fehlt noch: Fußzeile mit den Pflichtangaben des Betriebs (Firma, Anschrift, bei einer GmbH
auch Registergericht und Geschäftsführer) und ein Hinweis zum Datenschutz.

## Betreff

```text
Ihr Förder-Check für die Wärmepumpe
```

## Vorschautext

```text
Ihre Zahlen: {{euro_bis}} bei Antrag bis 31.01.2027. Das PDF hängt an.
```

## Text

```text
Guten Tag,

danke für Ihren Förder-Check für Ihr Haus in {{bundesland}}. Ihr Ergebnis hängt als PDF an dieser Mail.

Ihre Zahlen auf einen Blick:
- Antrag bis 31.01.2027: {{prozent_bis}} von {{basis_bis}}, also {{euro_bis}}
- Antrag ab 01.02.2027: {{prozent_ab}} von {{basis_ab}}, also {{euro_ab}}
{{unterschied_satz}}

Es zählt der Tag des Antrags. Das Ergebnis ist eine Schätzung, keine Zusage. Die KfW entscheidet.

Der nächste Schritt: Wir schauen uns Ihr Haus vor Ort an. Dann wissen Sie, welche Wärmepumpe passt und was sie kostet.
Antworten Sie einfach auf diese Mail. Wir melden uns für einen Termin.
{{telefon_satz}}

Viele Grüße
Ihr Team von {{betrieb}}
{{ort}}
```

## HTML

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ihr Förder-Check für die Wärmepumpe</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;color:#1F2933;">
<div style="display:none;max-height:0;overflow:hidden;">Ihre Zahlen: {{euro_bis}} bei Antrag bis 31.01.2027. Das PDF hängt an.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
<tr><td style="background:{{farbe}};color:{{farbe_text}};padding:20px 28px;font-size:18px;font-weight:bold;">{{betrieb}}<div style="font-size:13px;font-weight:normal;opacity:.85;margin-top:4px;">Förder-Check Wärmepumpe · {{ort}}</div></td></tr>
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:1.6;">
<p style="margin:0 0 14px;">Guten Tag,</p>
<p style="margin:0 0 18px;">danke für Ihren Förder-Check für Ihr Haus in {{bundesland}}. Ihr Ergebnis hängt als PDF an dieser Mail.</p>
</td></tr>
<tr><td style="padding:0 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:10px;">
<tr>
<td style="padding:16px;border-right:1px solid #E5E7EB;width:50%;vertical-align:top;"><div style="font-size:12px;color:#6B7280;">Antrag bis 31.01.2027</div><div style="font-size:22px;font-weight:bold;color:{{farbe}};margin-top:4px;">{{euro_bis}}</div><div style="font-size:13px;color:#374151;">{{prozent_bis}} von {{basis_bis}}</div></td>
<td style="padding:16px;width:50%;vertical-align:top;"><div style="font-size:12px;color:#6B7280;">Antrag ab 01.02.2027</div><div style="font-size:22px;font-weight:bold;color:#374151;margin-top:4px;">{{euro_ab}}</div><div style="font-size:13px;color:#374151;">{{prozent_ab}} von {{basis_ab}}</div></td>
</tr>
</table>
<p style="margin:14px 0 0;font-size:15px;line-height:1.6;">{{unterschied_satz}}</p>
<p style="margin:10px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">Es zählt der Tag des Antrags. Das Ergebnis ist eine Schätzung, keine Zusage. Die KfW entscheidet.</p>
</td></tr>
<tr><td style="padding:22px 28px 8px;">
<div style="background:#F9FAFB;border-left:4px solid {{farbe}};border-radius:6px;padding:14px 16px;font-size:15px;line-height:1.6;">
<strong>Der nächste Schritt:</strong> Wir schauen uns Ihr Haus vor Ort an. Dann wissen Sie, welche Wärmepumpe passt und was sie kostet. Antworten Sie einfach auf diese Mail. Wir melden uns für einen Termin. {{telefon_satz}}
</div>
</td></tr>
<tr><td style="padding:18px 28px 28px;font-size:15px;line-height:1.6;">Viele Grüße<br>Ihr Team von {{betrieb}}<br>{{ort}}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```
