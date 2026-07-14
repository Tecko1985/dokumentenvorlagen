# Dokumentenvorlagen

Vanilla-JS-Web-App (kein Build-Step) — zentrales Serienbrief-/Vorlagen-Tool: EINE Word-
`.docx`-Vorlage mit `{{PLATZHALTER}}` × beliebig viele Datensätze → gefüllte `.docx` als
ZIP; layout-treues PDF über einen lokalen Word-Lauf. Verallgemeinert den bisher nur für
den Trainervertrag existierenden Weg (`E:\Trainerdaten` `generiereVertragDocx()` +
`generate-pdfs.ps1`) auf beliebige Dokumenttypen.

Live https://tecko1985.github.io/dokumentenvorlagen/, Repo
https://github.com/Tecko1985/dokumentenvorlagen, GitHub Pages (Auto-Rebuild bei Push).
Dev-Server Port **8789** (`E:\.claude\launch.json`, MIME-Map enthält `.docx`).

## Zwei Auth-Ebenen (bewusst getrennt, wie in Trainerdaten)

- **Gateway-Login (Eintritt + Vorlagen-Katalog):** zentrales ToolsUebersicht-Konto
  (`landingpage`-Worker). Trägt den Vorlagen-Katalog (unsensibel).
- **Admin-WebDAV (App-Passwort, nur für IBAN):** liest `trainerdaten.json` read-only über
  den bestehenden Trainerdaten-CORS-Proxy (`trainerdaten.michel-brunner.workers.dev`, prüft
  nur das Freigabe-Präfix, nicht den Dateinamen). App-Passwort liegt nur in IndexedDB, nie
  im Code/in der Cloud. **Die IBAN läuft nie über das zentrale Gateway** — respektiert die
  flottenweite PII-Grenze (`personalakte-overview` schließt IBAN überall aus).

## Datensicherheitsprinzip

Das Tool **speichert keine ausgefüllten Dokumente in der Cloud**. In Nextcloud liegt nur
der Katalog (leere Templates + Metadaten). Die IBAN wird gelesen → im Browser in die
`.docx` gefüllt → als ZIP heruntergeladen. Nie serverseitig persistiert.

## Dateien

- `index.html` / `style.css` — UI im Flotten-Look (CSS-Variablen aus der Flotte).
- `config.js` — `APP_VERSION`, `GATEWAY_APP_ID="dokumentenvorlagen"`, Worker-/WebDAV-URLs,
  `PLATZHALTER_FELDER` (key/label/quelle: profil|trainerdaten|auto), `APP_CHANGELOG`.
- `db.js` — Gateway (`dav-load`/`dav-save` Katalog, `dav-file-put`/`-get`/`-delete` für die
  `.docx`-Binaries, `fetchTrainerProfiles`, `fetchMe`) **und** Admin-WebDAV
  (`davReadFile`/`fetchTrainerdaten` über den CORS-Proxy). `FileStore` = IndexedDB fürs
  App-Passwort.
- `docx-fill.js` — Kern (`DocxFill`): `analyzeTemplate` (erkannt/ersetzbar/gesplittet),
  `fillToBlob`, `buildZip`. Aus `Trainerdaten/pdf-utils.js` `generiereVertragDocx()`
  extrahiert + generalisiert. Verarbeitet `word/document.xml` + `header*/footer*.xml`.
- `app.js` — UI-Logik (Katalog-Verwaltung, Empfängerauswahl + Profil/Trainerdaten-Merge,
  Vorschau, Erzeugen, Admin-Connect).
- `docx-zu-pdf.ps1` — lokaler Ordner-`.docx`→PDF-Konverter via Word-COM. **UTF-8 MIT BOM.**

## Datenmodell (Katalog, `dokumentenvorlagen.json` via Gateway)

`{ vorlagen: [{ id, name, beschreibung, fileId, dateiName, ersetzbar[], erkannt[],
gesplittet[], erstelltAm }] }`. Die `.docx` selbst liegt im offenen Gateway-Dateikanal
(`dateien/<fileId>`), abrufbar per `dav-file-get`.

## Platzhalter-Erkennung (Split-Runs)

Word kann einen am Stück getippten Platzhalter über mehrere `<w:t>`-Runs verteilen; eine
solche `{{...}}`-Sequenz ist per String-Ersetzung nicht treffbar. `analyzeTemplate` trennt
darum **ersetzbar** (raw, am Stück) von **gesplittet** (nur nach Tag-Strip gefunden) und
warnt beim Hochladen. Bewusst KEIN heimliches Reparieren der Runs (Korruptionsrisiko) — der
Nutzer tippt den Platzhalter im Word neu.

## Serverseitige Anbindung (ToolsUebersicht `admin-worker.js` — Redeploy nötig)

- `DAV_APPS["dokumentenvorlagen"]` → `.../Tools/Dokumentenvorlagen/dokumentenvorlagen.json`.
- `ALLOWED_ORIGINS` += `http://localhost:8789`.
- NICHT in `WRITE_REQUIRES_EDIT_PERMISSION` — wer das (streng gegatete) Tool sehen darf,
  darf den Katalog auch pflegen.
- Der Trainerdaten-CORS-Proxy bleibt **unverändert** (Zweitverwendung, kein Redeploy dort).

## Sichtbarkeit

Streng auf die Geschäftsstelle/Führung gaten (wie Personalakte) — PII-Massendokumente. Wird
im ToolsUebersicht-Admin-Panel gesetzt („Nur bestimmte Gruppen").

## PDF-Weg (bewusst zweistufig)

Tool → gefüllte `.docx` (ZIP). Lokal → `docx-zu-pdf.ps1` (Word-COM). Das Skript nutzt das
`Start-Job`-Muster: `ExportAsFixedFormat` hängt auf dieser Maschine, wenn es im Haupt-
prozess läuft (siehe Flotten-Doku Word-COM). Kein Datenzugriff/keine IBAN im Skript.

## Gotchas

- `docx-zu-pdf.ps1` nach jedem Edit UTF-8 **mit** BOM zurückschreiben (PS 5.1 `-File` sonst
  Parser-Fehler bei Umlauten).
- Cache-Busting: bei JS/CSS-Änderungen `APP_VERSION` **und** die `?v=`-Query-Strings in
  `index.html` bumpen.
- Lokaler Test des IBAN-Pfads: der Trainerdaten-CORS-Proxy erlaubt evtl. nur
  `tecko1985.github.io` als Origin — live funktioniert es (geteilte Origin), lokal ggf. nicht.

## Verifikation (Stand Release 1.0)

Headless getestet (`javascript_tool`, gemocktes Gateway): Platzhalter-/Split-Erkennung,
Füllung, XML-Escaping, Massen-ZIP, kompletter UI-Flow (Katalog→Vorlage→Profil-Empfänger→ZIP
mit korrektem Inhalt/Dateinamen). `docx-zu-pdf.ps1` real durchlaufen (2× valides 318-KB-PDF,
kein Hänger). `admin-worker.js`/`config.js` per Blob-import/`new Function` syntaxgeprüft.
**Offen:** echter Login-E2E-Test (Gateway/IBAN sind auth-gated, aus dem Dev-Server nicht
beweisbar), Worker-Redeploy durch Michel, Sichtbarkeitsgruppe setzen, echte Start-Vorlagen.
