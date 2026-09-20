import { useEffect, useRef, useState } from "react";
import type { ClassicRole, LeagueConfig, Player, PlayerSort, Team } from "../types";
import { PlayerCompactCard } from "./PlayerCompactCard";
import { PlayerComparisonView } from "./PlayerComparisonView";
import { PlayerCompareTray } from "./PlayerCompareTray";
import { StudioIcon } from "./StudioIcon";
import { ParticleInterlockLoader } from "./ui/ReferenceComponents";
import { TeamSelector } from "./TeamSelector";
import { API_BASE_URL } from "../lib/api";
const PAGE_SIZE = 40;
const FILTER_KEY = "fanta007.playerFilters.v1";
const FAVORITES_KEY = "fanta007.playerFavorites.v1";
const roleLabels: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };
const sortOptions: Array<[PlayerSort, string]> = [["fvm_desc", "FVM: alto → basso"], ["fvm_asc", "FVM: basso → alto"], ["name_asc", "Nome: A → Z"], ["name_desc", "Nome: Z → A"], ["qa_desc", "QA: alto → basso"], ["qa_asc", "QA: basso → alto"], ["delta_desc", "Variazione migliore"]];
type PlayerPage = { items: Player[]; total: number; offset: number; limit: number };
type SavedFilters = { query?: string; role?: ClassicRole | ""; team?: string; sort?: PlayerSort };
type Props = { open: boolean; onClose: () => void; onSelect: (player: Player) => void; excludedIds: number[]; config: LeagueConfig; variant?: "sheet" | "page"; initialRole?: ClassicRole };
function savedFilters(): SavedFilters { try { return JSON.parse(sessionStorage.getItem(FILTER_KEY) ?? "{}") ?? {}; } catch { return {}; } }
function savedFavorites(): number[] { try { const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"); return Array.isArray(value) ? value.filter(Number.isInteger) : []; } catch { return []; } }

export function PlayerSearch({ open, onClose, onSelect, excludedIds, config, variant = "sheet", initialRole }: Props) {
  const [saved] = useState(savedFilters);
  const [query, setQuery] = useState(initialRole ? "" : saved.query ?? "");
  const [role, setRole] = useState<ClassicRole | "">(initialRole ?? saved.role ?? "");
  const [team, setTeam] = useState(initialRole ? "" : saved.team ?? "");
  const [sort, setSort] = useState<PlayerSort>(saved.sort ?? "fvm_desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(savedFavorites);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [teamsError, setTeamsError] = useState("");
  const [preferenceError, setPreferenceError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const excluded = new Set(excludedIds);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilterCount = Number(Boolean(team)) + Number(Boolean(role)) + Number(sort !== "fvm_desc");

  useEffect(() => { try { sessionStorage.setItem(FILTER_KEY, JSON.stringify({ query, role, team, sort })); } catch { setPreferenceError("Il browser non consente di salvare le preferenze. Filtri e preferiti restano disponibili finché questa pagina è aperta."); } }, [query, role, team, sort]);
  useEffect(() => { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch { setPreferenceError("Il browser non consente di salvare le preferenze. Filtri e preferiti restano disponibili finché questa pagina è aperta."); } }, [favorites]);
  useEffect(() => {
    if (!open) return;
    if (variant === "sheet") inputRef.current?.focus();
    const keys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.defaultPrevented || document.querySelector('[aria-modal="true"]') || target.closest('input,select,textarea,[contenteditable="true"]')) return;
      if (event.key === "/") { event.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [open, variant]);
  useEffect(() => {
    if (!open || teams.length) return;
    const controller = new AbortController();
    setTeamsError("");
    fetch(`${API_BASE_URL}/teams`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(setTeams)
      .catch(() => { if (!controller.signal.aborted) setTeamsError("Il filtro squadra non è disponibile. Puoi cercare per nome o ruolo."); });
    return () => controller.abort();
  }, [open, teams.length, retry]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true); setError("");
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(pageIndex * PAGE_SIZE), sort });
        if (query.trim()) params.set("q", query.trim());
        if (role) params.set("role", role);
        if (team) params.set("team", team);
        const response = await fetch(`${API_BASE_URL}/players?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const page = await response.json() as PlayerPage;
        if (controller.signal.aborted) return;
        setPlayers(page.items); setTotal(page.total);
      } catch {
        if (!controller.signal.aborted) setError("Collegamento dati non disponibile. Verifica che l’API sia attiva e riprova.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, query.trim() ? 220 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [open, query, role, team, sort, retry, pageIndex]);

  function toggleCompare(player: Player) { setSelected(current => current.some(item => item.id === player.id) ? current.filter(item => item.id !== player.id) : current.length < 3 ? [...current, player] : current); }
  function toggleFavorite(id: number) { setFavorites(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]); }
  function resetFilters() { setRole(""); setTeam(""); setSort("fvm_desc"); setPageIndex(0); }
  function changePage(index: number) { setPageIndex(index); listRef.current?.scrollIntoView({ block: "start", behavior: "instant" }); listRef.current?.focus({ preventScroll: true }); }

  if (!open) return null;
  const content = <section className="ops-market" aria-labelledby="search-title">
    {compareOpen ? <PlayerComparisonView players={selected} config={config} onBack={() => setCompareOpen(false)} onOpen={onSelect} /> : <>
      <header className="ops-page-heading"><div>{variant === "page" ? <h1 id="search-title">Il mercato giocatori</h1> : <h2 id="search-title">Il mercato giocatori</h2>}<p>Cerca il profilo. Confronta il valore. Scegli il prezzo.</p></div><span className="ops-market-context">{config.mode} <b>{excludedIds.length}/25 in rosa</b></span>{variant === "sheet" && <button className="icon-button" aria-label="Chiudi Listone" onClick={onClose}>×</button>}</header>
      {teamsError && <div className="message-state error-state" role="alert"><span>{teamsError}</span><button className="secondary-action" onClick={() => setRetry(value => value + 1)}>Riprova filtro squadra</button></div>}
      {preferenceError && <p className="ops-caption" role="status">{preferenceError}</p>}
      <div className="ops-market-tools">
        <div className="ops-search-line"><label className="ops-search"><StudioIcon name="search" /><input ref={inputRef} aria-label="Cerca giocatore" value={query} onChange={event => { setQuery(event.target.value); setPageIndex(0); }} placeholder="Cerca un nome, una certezza, una scommessa…" /><kbd aria-hidden="true">/</kbd></label>{query && <button className="ops-clear-search" aria-label="Cancella ricerca" onClick={() => { setQuery(""); setPageIndex(0); inputRef.current?.focus(); }}>×</button>}<button className="ops-filter-toggle" aria-expanded={filtersOpen} aria-controls="market-filters" onClick={() => setFiltersOpen(value => !value)}><StudioIcon name="settings" />Filtri{activeFilterCount ? ` (${activeFilterCount})` : ""}</button></div>
        <div className="ops-role-selector" aria-label="Filtro ruolo"><button aria-pressed={!role} onClick={() => { setRole(""); setPageIndex(0); }}>Tutti</button>{(Object.keys(roleLabels) as ClassicRole[]).map(value => <button aria-label={roleLabels[value]} aria-pressed={role === value} key={value} onClick={() => { setRole(value); setPageIndex(0); }}><b>{value}</b><span>{roleLabels[value]}</span></button>)}</div>
        <div id="market-filters" className={`ops-extra-filters ${filtersOpen ? "open" : ""}`}>
          <div><label id="club-filter-label">Squadra</label><TeamSelector teams={teams} value={team} onChange={value => { setTeam(value); setPageIndex(0); }} /></div>
          <label>Ordina per<select aria-label="Ordina giocatori" value={sort} onChange={event => { setSort(event.target.value as PlayerSort); setPageIndex(0); }}>{sortOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          {activeFilterCount > 0 && <button className="text-action" onClick={resetFilters}>Azzera filtri</button>}
        </div>
      </div>
      <div className="ops-results-bar"><p role="status">{loading ? "Aggiornamento del Listone…" : `${total} giocatori${team ? " · " + team : ""}`}</p><span>Valori {config.mode} · budget {config.budget} cr.</span></div>
      <div className="ops-market-list" ref={listRef} tabIndex={-1} aria-busy={loading}>
        <div className="ops-list-columns" aria-hidden="true"><span /><span><b>Giocatore</b><b>Appetibilità</b><b>QA</b><b>FVM / 1000</b><b>FVM lega</b><b>Δ quota</b><b>Stato</b></span><StudioIcon name="compare" /></div>
        {error ? <div className="ops-empty" role="alert"><h2>Giocatori non disponibili</h2><p>{error}</p><button className="secondary-action" onClick={() => setRetry(value => value + 1)}>Riprova</button></div> : loading ? <div className="ops-list-loading" aria-label="Caricamento giocatori"><ParticleInterlockLoader label="Aggiorno il Listone…" />{Array.from({ length: 6 }, (_, index) => <div key={index}><i /><span /><b /><b /><b /></div>)}</div> : !players.length ? <div className="ops-empty"><StudioIcon name="search" /><h2>Nessun giocatore trovato</h2><p>Prova un altro nome o amplia squadra e ruolo.</p><button className="secondary-action" onClick={() => { setQuery(""); resetFilters(); }}>Azzera ricerca e filtri</button></div> : players.map(player => <PlayerCompactCard key={player.id} player={player} config={config} owned={excluded.has(player.id)} favorite={favorites.includes(player.id)} compared={selected.some(item => item.id === player.id)} compareDisabled={selected.length >= 3} onOpen={() => onSelect(player)} onToggleCompare={() => toggleCompare(player)} onToggleFavorite={() => toggleFavorite(player.id)} />)}
      </div>
      {!error && total > 0 && <nav className="ops-pagination" aria-label="Pagine del Listone"><span>{pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, total)} di {total}</span><div><button className="secondary-action" disabled={loading || pageIndex === 0} onClick={() => changePage(pageIndex - 1)}>← Precedente</button><span>Pagina {pageIndex + 1} / {pageCount}</span><button className="secondary-action" disabled={loading || pageIndex + 1 >= pageCount} onClick={() => changePage(pageIndex + 1)}>Successiva →</button></div></nav>}
      <p className="ops-caption">QA: quotazione attuale · FVM: valore di mercato · Δ: variazione dalla quotazione iniziale. FVM lega rapportato ai tuoi {config.budget} crediti.</p>
      <p className="ops-caption">QI · QA · FVM dal Listone Fantacalcio 2026/27 normalizzato nel progetto.</p>
      <PlayerCompareTray players={selected} onRemove={id => setSelected(current => current.filter(player => player.id !== id))} onCompare={() => { setCompareOpen(true); window.scrollTo({ top: 0, behavior: "instant" }); }} />
    </>}
  </section>;
  return variant === "sheet" ? <div className="sheet-backdrop" onMouseDown={onClose}><div onMouseDown={event => event.stopPropagation()}>{content}</div></div> : <main id="studio-content" tabIndex={-1} className="ops-content">{content}</main>;
}
