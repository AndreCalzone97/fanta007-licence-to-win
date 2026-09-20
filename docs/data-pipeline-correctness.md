# Mission #04 — Data pipeline correctness

## Flow and reproduced defects

Quotation XLSX → `parse_players` → `normalize_dataset` (aliases and existing
images/statistics/external IDs) → candidate audit → candidate JSON.
Historical CSV/XLSX → import → merge by player ID and season → candidate JSON.
`build_diff` produces a review report; `activate_candidate` archives the current
JSON and replaces it with the approved candidate. These are separate commands,
not an automatically orchestrated transaction.

Before the fix, synthetic regressions reproduced:

- Changing only goals from 0 to 1 yielded `changed=0`: the diff excluded nested
  statistics and enrichments.
- Equal-priority corrections were ignored when appearances/completeness did not
  increase, including decreasing appearances and clearing a metric.
- Activation accepted duplicate IDs: Pydantic checked individual values but not
  cross-record uniqueness. Dictionaries used during reconciliation hid duplicates.
- Direct normalization accepted inconsistent quotation deltas even though the
  XLSX parser rejected them. Validation depended on the entry point.
- Historical CSV output retained `active` status instead of becoming a candidate.
- Integer statistics such as 1.5 were silently truncated to 1.

Candidate preparation also wrote the candidate even when its audit was invalid;
it now writes the diagnostic reports and raises without replacing the output.

## Validation boundaries

`app/data/validation.py::validate_dataset` revalidates nested Pydantic values and
checks unique player IDs, player_count, both quotation delta equations and one
statistics record per player/season (the existing merge key). It returns a checked
copy or raises ValueError with the offending invariant/IDs. This also validates
objects created using `model_copy`, which does not validate updates itself.

Normalization and merge validate their inputs and final results. Diff validates
both datasets before constructing ID dictionaries. Activation validates before
creating a backup and again before replacing the active file. CSV import shares
these checks. Dataset audit reuses the validator and retains catalog/hash checks.
Preparation refuses audit-invalid output. The existing active JSON is not rewritten.

Structural validation does not certify sporting accuracy, enforce the complete
team catalog during standalone activation, or prove that an export is authentic.

## Merge contract

- Key: `(player_id, season)`, one selected full season snapshot.
- Source priority remains: Fantacalcio Serie A 300, EuroLeghe 200, other existing
  sources 100. The caller supplies batch priorities in the existing interface.
- Higher priority wins, independent of batch order.
- At equal priority, an incoming snapshot replaces existing values. Later batches
  replace earlier batches. Callers must order batches deliberately; `updated_at`
  is provenance, not an automatically enforced freshness check.
- Replacement is whole-record: lower counts and explicit/missing `null` metrics
  are accepted corrections. Incoming records are full snapshots, not partial PATCH
  payloads. No old values are used to fill holes in a corrected snapshot.
- Players/seasons absent from incoming batches retain their existing records.
- Duplicate keys within one merge batch raise an error, even if values match.
- Export IDs outside the active roster are ignored, as before; the Excel merge
  CLI reports unresolved IDs and CSV import reports unresolved identities.
- Within one XLSX export, the existing parser selects the row with most
  appearances for repeated IDs (first row on a tie). This source-row rule is
  distinct from corrections between successive snapshots and remains unchanged.
- Historical CSV resolves identities as before, uses the common merge and marks
  output `candidate`. Uncertain identities stay in its review report.

Integer fields reject fractions and non-finite values instead of truncating.
XLSX workbooks close in `finally`, including errors and early returns.

## Change detection

All current Player fields except the ID comparison key participate:
`source_name`, `name`, `team`, `team_id`, `role_classic`, `roles_mantra`,
`current_quotation`, `initial_quotation`, `quotation_delta`,
`current_quotation_mantra`, `initial_quotation_mantra`, `quotation_delta_mantra`,
`fvm`, `fvm_mantra`, `aliases`, `image`, `external_ids`, `statistics`.
All nested fields, including provenance, are compared in JSON-compatible form.
The full before/after values appear in JSON; Markdown identifies change categories.

JSON indentation/key ordering and player-list ordering do not produce changes.
List order within a player remains meaningful (notably statistics[0] is used by
the application). Dataset metadata is shown separately in the report; generated_at
alone does not count as a player change. Added/removed IDs retain their categories.

## Verification

From the repository root with the backend dev dependencies installed:

```bash
python -m pytest backend/tests/test_pipeline_correctness.py -q
python -m pytest backend/tests -q -rs
python -m pytest backend/tests/test_media_review.py -q
```

Mission #04 adds 28 self-contained regressions. Validation at completion:
101 passed, 0 failed, 0 errors, 4 skipped (the Mission #03 official export checks).
No tracked dataset or frontend file is generated or changed by these tests.

Remaining limitations: no concurrent-writer locking or multi-file transaction;
activation's optional source checksum does not bind approval to candidate content;
older equal-priority imports must not be submitted as corrections accidentally.
Generated frontend scoring references are still a separately managed artifact.
These fixes do not add ingestion, databases, scheduling or automatic activation.
