# Dokumentenvorlagen

Serienbrief-Tool für den 1. SC 1911 e.V. Heilbad Heiligenstadt: Word-Vorlagen (`.docx`)
mit Platzhaltern zentral verwalten und in einem Rutsch für beliebig viele Empfänger
befüllen — z. B. Trainerverträge, Anfragen für ein erweitertes Führungszeugnis oder
Bescheinigungen.

**Live:** https://tecko1985.github.io/dokumentenvorlagen/ (Anmeldung über die
[Tools-Übersicht](https://tecko1985.github.io/ToolsUebersicht/) erforderlich).

## Was es macht

1. **Vorlagen verwalten** — eine Word-Datei mit Platzhaltern wie `{{VORNAME}}`,
   `{{NACHNAME}}`, `{{STRASSE}}`, `{{IBAN}}` hochladen, benennen und beschreiben. Das
   Tool erkennt beim Hochladen automatisch, welche Platzhalter enthalten sind.
2. **Empfänger wählen** — aus dem zentralen Trainerprofil (Name, Lizenz, Mannschaft)
   oder, mit einmaliger App-Passwort-Eingabe, aus den Trainerdaten inklusive Adresse
   und Bankverbindung.
3. **Erzeugen** — pro Empfänger ein gefülltes Word-Dokument, alle zusammen als ZIP.

Die ausgefüllten Dokumente werden **rein lokal im Browser** erzeugt und heruntergeladen;
Bankdaten verlassen den Rechner nicht und werden nie in der Cloud gespeichert.

## Platzhalter

`{{VORNAME}}` `{{NACHNAME}}` `{{MANNSCHAFT}}` `{{LIZENZ}}` `{{GEBURTSDATUM}}`
`{{STRASSE}}` `{{PLZ}}` `{{ORT}}` `{{PLZ_ORT}}` `{{TELEFON}}` `{{EMAIL}}` `{{IBAN}}`
`{{BANKNAME}}` `{{BIC}}` `{{PAUSCHALE}}` `{{DATUM}}` `{{JAHR}}`

Tipp: Platzhalter im Word **am Stück** eintippen (nicht mitten im Platzhalter die
Formatierung wechseln), sonst werden sie durch Word intern zerteilt und nicht ersetzt.
Das Tool warnt beim Hochladen, wenn ein Platzhalter zerteilt ist.

## PDF erzeugen

Das Tool erzeugt Word-Dokumente. Für **originalgetreue PDFs** das erzeugte ZIP
entpacken und im Ordner das mitgelieferte Skript ausführen (benötigt Microsoft Word):

```powershell
.\docx-zu-pdf.ps1
```

Es exportiert jede `.docx` im Ordner über Word als PDF — rein lokal, kein Internet.

## Technik

Vanilla JS, kein Build-Step. Persistenz + Login über den zentralen ToolsUebersicht-
Gateway (Cloudflare Worker); die Trainerdaten (inkl. IBAN) werden read-only über den
bestehenden Trainerdaten-CORS-Proxy gelesen. Deployed via GitHub Pages.
