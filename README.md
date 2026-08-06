# 📄 Dokumentenvorlagen

Word-Vorlagen (Trainervertrag, Anfragen, Bescheinigungen) mit Platzhaltern zentral verwalten und in einem Rutsch für viele Empfänger befüllen — Daten aus dem Trainerprofil oder, mit der Stufe „Administrieren“ für Trainerdaten, inkl. Adresse und Bankverbindung; Ausgabe als Word-Dokumente, originalgetreue PDFs über ein beiliegendes Skript (nur für berechtigte Gruppe).

**➡️ [Dokumentenvorlagen öffnen](https://sc1911heiligenstadt.github.io/dokumentenvorlagen/)**

## Zugang

Die Anmeldung läuft über die [Tools-Übersicht](https://sc1911heiligenstadt.github.io/ToolsUebersicht/) — dort einmal anmelden, danach ist dieses Werkzeug offen.

Die Rechte gelten in drei Stufen: **Sehen** (nur ansehen), **Bearbeiten** (Einträge pflegen) und **Administrieren** (Einstellungen und Verwaltung). Wer welche Stufe hat, legt die Tools-Übersicht fest.

## Lokal starten

Über den Eintrag `dokumentenvorlagen` in `E:\.claude\launch.json` — der Server läuft dann auf `http://localhost:8789/`.

## Technik

Vanilla JavaScript ohne Build-Schritt — die Dateien werden so ausgeliefert, wie sie im Repo liegen. Veröffentlicht über GitHub Pages. Die Daten liegen in der Vereins-Nextcloud; der Zugriff läuft ausschließlich über den Login-Worker der Tools-Übersicht, nie mit Zugangsdaten im Browser.

---

Ein Werkzeug des 1. SC 1911 Heiligenstadt. Alle Werkzeuge auf einen Blick: [Tools-Übersicht](https://sc1911heiligenstadt.github.io/ToolsUebersicht/) · Erklärungen im [Toolbox Wiki](https://sc1911heiligenstadt.github.io/Vereinswiki/).
