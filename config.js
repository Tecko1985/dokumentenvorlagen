// Dokumentenvorlagen — zentrales Serienbrief-/Vorlagen-Tool.
// Vanilla JS, kein Build-Step. Muster übernommen von E:\Trainerdaten + E:\TrainerCheckliste.

const APP_VERSION = "1.0";

// ─── Zentraler Login-Gateway (ToolsUebersicht) ────────────────────────────────
// Gleiches Token-Muster wie alle Gateway-Apps: Login-Token liegt im localStorage
// der Origin tecko1985.github.io, der landingpage-Worker prüft Token + Tool-
// Sichtbarkeit und greift serverseitig auf Nextcloud zu.
const GATEWAY_URL = "https://landingpage.michel-brunner.workers.dev";
const GATEWAY_APP_ID = "dokumentenvorlagen";

// ─── Admin-Datenzugriff auf Trainerdaten (inkl. IBAN) ─────────────────────────
// Wie der Trainerdaten-Admin: das App-Passwort wird einmal eingegeben (nur in
// IndexedDB gehalten, nie im Code) und trainerdaten.json read-only über denselben
// CORS-Proxy gelesen (der prüft nur das Freigabe-Präfix, nicht den Dateinamen —
// siehe cors-proxy-worker.js in Trainerdaten). Die IBAN bleibt im Browser des
// Admins und läuft nie über das zentrale Gateway.
const TRAINERDATEN_WEBDAV_URL =
  "https://nx88695.your-storageshare.de/remote.php/dav/files/admin/" +
  "05_Nachwuchsbereich/02_F%C3%B6rderung/Tools/Trainerdaten/trainerdaten.json";
const WEBDAV_DEFAULT_USERNAME = "admin";
const CORS_PROXY_DEFAULT_URL = "https://trainerdaten.michel-brunner.workers.dev";

// Größenlimit pro hochgeladener Vorlage (.docx sind klein; großzügig gedeckelt).
const MAX_TEMPLATE_BYTES = 8 * 1024 * 1024; // 8 MB

// Katalog der bekannten Platzhalter. `quelle` steuert nur die Vorschau-Gruppierung
// ("profil" = aus dem zentralen Trainerprofil verfügbar, "trainerdaten" = nur mit
// Admin-Datenzugriff, "auto" = vom Tool selbst gesetzt). Eine Vorlage darf beliebige
// dieser Platzhalter als {{KEY}} enthalten; unbekannte Platzhalter werden beim
// Hochladen erkannt und als "manuell auszufüllen" markiert.
const PLATZHALTER_FELDER = [
  { key: "VORNAME",      label: "Vorname",              quelle: "profil" },
  { key: "NACHNAME",     label: "Nachname",             quelle: "profil" },
  { key: "MANNSCHAFT",   label: "Mannschaft(en)",       quelle: "profil" },
  { key: "LIZENZ",       label: "Lizenz",               quelle: "profil" },
  { key: "GEBURTSDATUM", label: "Geburtsdatum",         quelle: "trainerdaten" },
  { key: "STRASSE",      label: "Straße & Hausnummer",  quelle: "trainerdaten" },
  { key: "PLZ",          label: "PLZ",                  quelle: "trainerdaten" },
  { key: "ORT",          label: "Ort",                  quelle: "trainerdaten" },
  { key: "PLZ_ORT",      label: "PLZ + Ort",            quelle: "trainerdaten" },
  { key: "TELEFON",      label: "Telefon",              quelle: "trainerdaten" },
  { key: "EMAIL",        label: "E-Mail",               quelle: "trainerdaten" },
  { key: "IBAN",         label: "IBAN",                 quelle: "trainerdaten" },
  { key: "BANKNAME",     label: "Bankname",             quelle: "trainerdaten" },
  { key: "BIC",          label: "BIC",                  quelle: "trainerdaten" },
  { key: "PAUSCHALE",    label: "Pauschale (EUR)",      quelle: "trainerdaten" },
  { key: "DATUM",        label: "Datum (heute)",        quelle: "auto" },
  { key: "JAHR",         label: "Jahr (aktuell)",       quelle: "auto" }
];

// Schnell-Lookup key -> Felddefinition.
const PLATZHALTER_MAP = Object.fromEntries(PLATZHALTER_FELDER.map(f => [f.key, f]));

const APP_CHANGELOG = [
  {
    version: "1.0",
    groups: [
      {
        title: "Serienbrief aus Word-Vorlagen",
        items: [
          "Vorlagen-Katalog: Word-Dokumente (.docx) mit Platzhaltern wie {{VORNAME}} hochladen, benennen, beschreiben und wieder löschen — zentral gespeichert, für alle Berechtigten dieselbe Auswahl.",
          "Beim Hochladen erkennt das Tool automatisch, welche Platzhalter eine Vorlage enthält.",
          "Eine Vorlage mit beliebig vielen Empfängern befüllen und alle fertigen Dokumente auf einmal als ZIP herunterladen (Serienbrief).",
          "Empfänger wahlweise aus dem zentralen Trainerprofil (Name, Lizenz, Mannschaft) oder — mit Admin-Datenzugriff — aus den Trainerdaten inklusive Adresse und Bankverbindung.",
          "Bankdaten bleiben im Browser: die ausgefüllten Dokumente werden lokal erzeugt und heruntergeladen, nie in der Cloud gespeichert.",
          "Für originalgetreue PDFs liegt das Skript docx-zu-pdf.ps1 bei, das einen Ordner voller erzeugter .docx lokal über Microsoft Word als PDF exportiert."
        ]
      },
      {
        title: "Platzhalter-Referenz",
        items: [
          "Im Tab „Vorlagen“ gibt es eine Übersicht aller verfügbaren Platzhalter, gruppiert nach Datenquelle (Trainerprofil, Trainerdaten, automatisch).",
          "Ein Klick auf einen Platzhalter kopiert ihn in die Zwischenablage — so lässt er sich direkt in die Word-Vorlage einfügen."
        ]
      },
      {
        title: "Adresse & Bankverbindung sofort da",
        items: [
          "Ist der Trainerdaten-Zugriff einmal verbunden, wird beim Öffnen automatisch diese Datenquelle verwendet — Straße, PLZ/Ort und Bankverbindung sind sofort verfügbar, ohne die Quelle manuell umschalten zu müssen."
        ]
      },
      {
        title: "Empfänger filtern",
        items: [
          "Über der Empfängerliste stehen vier Filter: Mannschaft, Lizenz, Vertrag und Führungszeugnis — damit lässt sich eine Vorlage gezielt nur an die Personen ausgeben, die sie wirklich brauchen.",
          "Beispiel Übungsleitervertrag: Filter „Vertrag = Noch keiner bereitgestellt“ zeigt genau die, die noch keinen bekommen haben.",
          "Beispiel Führungszeugnis: Filter „Noch keins hinterlegt“ überspringt alle, die ihr erweitertes Führungszeugnis bereits eingereicht haben.",
          "Filter lassen sich kombinieren und zusammen mit dem Suchfeld verwenden; „Alle“ wählt dann nur die gerade angezeigten Empfänger aus.",
          "Mannschaft und Lizenz werden automatisch aus den geladenen Daten befüllt, inklusive der Auswahl „ohne Mannschaft“ bzw. „ohne Lizenz“.",
          "Vertrags- und Führungszeugnis-Status stammen aus den Trainerdaten und stehen deshalb nur bei der Datenquelle „Trainerdaten“ zur Verfügung.",
          "Bleiben ausgewählte Empfänger durch einen Filter ausgeblendet, weist die Zeile unter der Liste ausdrücklich darauf hin — sie bekommen trotzdem ein Dokument."
        ]
      }
    ]
  }
];
