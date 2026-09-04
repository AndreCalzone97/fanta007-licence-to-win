# Architecture

## Step 2A

Fanta007 separa cinque responsabilità:

1. **Source data** — workbook originale immutato.
2. **Parsing** — lettura e validazione strutturale del foglio `Tutti`.
3. **Normalization** — modello Player, ruoli Mantra, alias e metadata.
4. **Application logic** — repository e ricerca deterministica.
5. **Delivery** — FastAPI e frontend React.

```text
data/source/*.xlsx (immutabile)
  → parser rigoroso
  → normalizzazione + catalogo squadre + arricchimenti esistenti
  → data/candidates/*.json
  → audit + diff pending_manual_approval
  → approvazione umana
  → data/normalized/players.json
  → JsonPlayerRepository
  → PlayerSearchService
  → /api/v1/players
  → React
```

Il frontend non legge Excel o JSON direttamente. L'AI non è coinvolta nel parsing, nella ricerca o nei calcoli.

## Player Intelligence upgrade

- `/players` unifica query, squadra, ruolo, sorting e paginazione.
- `PlayerBenchmarkService` calcola rank e percentile esclusivamente dal dataset attivo.
- Le soglie di intelligence sono centralizzate e mostrate nella UI.
- Le decisioni sulle immagini sono conservate in `data/manual/player_media_reviews.json`, separate dal JSON generato.
- `diff_player_datasets.py` produce soltanto un report `pending_manual_approval`: non sostituisce mai il dataset attivo.
- `TeamCatalogService` risolve nomi, alias e codici delle 20 squadre e blocca cataloghi ambigui.
- `prepare_dataset_candidate.py` conserva media, ID esterni e statistiche già presenti quando ricompone il listone.
- I loghi restano fallback finché fonte, licenza e revisione non sono esplicitamente documentate.

## Decisioni

- JSON è sufficiente per gli attuali 533 record e mantiene Step 2A trasparente.
- SQLite verrà valutato con la persistenza della rosa o degli account.
- Il listone usa `Id` come identità canonica.
- Gli alias sono dati manuali verificabili, separati dalla fonte ufficiale.
- Le immagini sono progressive enhancement e restano `null` in questa fase.
