# Data Model

## Player

- `id`: identificatore del listone;
- `source_name`: nome esatto nell'Excel;
- `name`: nome visualizzato, eventualmente espanso tramite alias verificato;
- `aliases`: termini aggiuntivi usati dalla ricerca;
- `team`: denominazione leggibile mantenuta per compatibilità;
- `team_id`: identità stabile del catalogo stagionale, opzionale nel dataset attivo legacy;
- `role_classic`;
- `roles_mantra`: array derivato dal separatore `;`;
- quotazioni Classic e Mantra;
- variazioni validate;
- `fvm` e `fvm_mantra`;
- `image`: metadata opzionali di asset licenziato.
- `statistics`: serie stagionali opzionali, sempre associate a fonte e competizione.

Il FVM normalizzato non è memorizzato: dipende dal budget della lega e sarà calcolato dal dominio in Step 2C.

## Image

`url`, `source`, `author`, `license` e `attribution_url` sono tutti opzionali. In assenza di asset, la UI usa iniziali testuali.

## PlayerSeasonStats

La struttura supporta stagione, competizione, presenze, titolarità, minuti, gol, assist, cartellini e rating. Ogni record deve dichiarare `source`; i campi non disponibili rimangono `null` e non vengono stimati.

## Team e TeamAsset

Il catalogo `data/manual/teams.2026-27.json` contiene ID stabile, codice, nome visualizzato, nome ufficiale, alias e stagione. `TeamAsset` conserva stato di revisione, fonte, licenza e attribuzione. In V4.1 tutti gli asset sono intenzionalmente `fallback`: nessun logo viene copiato senza autorizzazione.

## DatasetMetadata

Un candidato può dichiarare `generated_at`, `status: candidate` e `official_source_url`. Il checksum SHA256 continua a identificare esattamente il workbook da cui è stato generato.
