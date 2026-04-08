# Bodenproben Erfassungs-App

Power Apps Canvas App zur Erfassung von Bodenproben im Feldeinsatz.

## Felder

| Feld | Typ | Pflicht |
|---|---|---|
| Labor-Nr. | Text | Ja |
| Projekt-Nr. | Text | Nein |
| Projektname | Text | Nein |
| Entnahmedatum | Datum | Nein (Standard: Heute) |
| Probenbezeichnung | Text | Nein |
| Tiefe von [m] | Zahl | Nein |
| Tiefe bis [m] | Zahl | Nein |
| Bodenart | Dropdown | Nein |
| Verpackung | Dropdown | Nein |
| Probennehmer | Text | Nein |
| Bemerkungen | Mehrzeiliger Text | Nein |

## Screens

- **Übersicht** – Galerie aller erfassten Proben mit Suche, Bearbeiten und Löschen
- **Formular** – Eingabe- / Bearbeitungsmaske für eine Bodenprobe

## Import & Deployment

### Variante A – Power Apps CLI (pac canvas)

```bash
# YAML-Quellen zu einer .msapp-Datei packen
pac canvas pack --sources ./BodenprobenApp/Src --msapp BodenprobenApp.msapp
```

Anschließend die `.msapp`-Datei in [make.powerapps.com](https://make.powerapps.com) importieren:
`Apps > Importieren > Canvas-App aus Datei`

### Variante B – Direkt-Upload

1. [make.powerapps.com](https://make.powerapps.com) öffnen
2. **Apps > + Neue App > Canvas-App hochladen (.msapp)**
3. Gepackte `.msapp`-Datei auswählen

## Datenspeicherung

Aktuell nutzt die App eine **lokale Collection** (`colBodenproben`). Für persistente Speicherung bitte die Datenquelle in Power Apps durch eine der folgenden Optionen ersetzen:

- **SharePoint-Liste** (empfohlen)
- **Dataverse-Tabelle**
- **Excel in OneDrive**

### SharePoint-Anbindung (Kurzanleitung)

1. SharePoint-Liste `Bodenproben` mit den o.g. Spalten anlegen
2. In Power Apps: **Daten > + Datenquelle hinzufügen > SharePoint**
3. `colBodenproben` in allen Formeln durch den SharePoint-Listennamen ersetzen

## Bodenart-Optionen

Kies, Sand, Feinsand, Schluff, Ton, Lehm, Torf, Auffüllung, Fels, Sonstige

## Verpackungs-Optionen

PE-Tüte, Papiertüte, Schraubglas, Metalldose, Probenzylinder, Ringprobe, Sonstige
