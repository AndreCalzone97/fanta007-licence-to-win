# Fanta007 data sources

## Responsabilità

| Dominio | Fonte | Regola |
| --- | --- | --- |
| Identità fantasy corrente | Excel Fantacalcio 2026/27 | Source of truth del listone |
| Squadre 2026/27 | Lega Serie A + Fantacalcio | Catalogo manuale verificato, nessun logo copiato automaticamente |
| Statistiche storiche | Export autorizzato delle pagine Fantacalcio | Import offline, mai dal frontend |
| Foto giocatori | Wikimedia Commons | Licenza controllata per singolo file |
| Dati calcistici futuri | API-Football | Provider opzionale dietro backend |

La categoria Commons usata come punto di scoperta è `Category:Players of Serie A (association football, Italy)`.

La categoria non è considerata completa e non garantisce la licenza di ogni file. Il provider interroga `imageinfo/extmetadata` e accetta soltanto CC0, CC BY, CC BY-SA o pubblico dominio verificato. File senza licenza leggibile, non-free o candidati alla cancellazione vengono scartati.

## Import statistiche storiche

Preparare un CSV ottenuto con modalità autorizzata e poi eseguire:

```powershell
.\.venv\Scripts\python.exe .\backend\scripts\import_historical_stats.py `
  --dataset .\data\normalized\players.json `
  --csv .\data\source\historical\fantacalcio_2025_26.csv `
  --season "2025/26" `
  --source-url "https://www.fantacalcio.it/statistiche-serie-a/2025-26" `
  --output .\data\candidates\players.with-stats.candidate.json
```

L'import storico non deve sovrascrivere direttamente il dataset attivo: il risultato va sottoposto allo stesso audit e diff del listone.

I record con confidence inferiore a `0.95` non vengono associati automaticamente e finiscono in `data/reports/unmatched_players.json`.

## Cache immagini Wikimedia

Il comando seguente controlla un numero limitato di giocatori senza sovrascrivere il file sorgente Excel:

```powershell
.\.venv\Scripts\python.exe .\backend\scripts\cache_wikimedia_images.py `
  --dataset .\data\normalized\players.json `
  --output .\data\normalized\players.with-media.json `
  --limit 10
```

La cache registra la fonte di scoperta, la data del controllo e anche i risultati negativi. Le nuove immagini vengono salvate con `portrait_approved: false`: prima di mostrarle bisogna revisionare visivamente identità, ritaglio e attribuzione e approvarle esplicitamente.
