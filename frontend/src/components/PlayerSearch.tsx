import { useEffect, useRef, useState } from "react";
import type { ClassicRole, LeagueConfig, Player, PlayerSort, Team } from "../types";
import { PlayerCompactCard } from "./PlayerCompactCard";
import { PlayerComparisonView } from "./PlayerComparisonView";
import { PlayerCompareTray } from "./PlayerCompareTray";
import { TeamSelector } from "./TeamSelector";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const PAGE_SIZE = 40;
const FILTER_KEY = "fanta007.playerFilters.v1";
const FAVORITES_KEY = "fanta007.playerFavorites.v1";
const roleLabels: Record<ClassicRole, string> = { P: "Portiere", D: "Difensore", C: "Centrocampista", A: "Attaccante" };
const sortOptions: Array<[PlayerSort, string]> = [["fvm_desc", "FVM: alto → basso"], ["fvm_asc", "FVM: basso → alto"], ["name_asc", "Nome: A → Z"], ["name_desc", "Nome: Z → A"], ["qa_desc", "QA: alto → basso"], ["qa_asc", "QA: basso → alto"], ["delta_desc", "Variazione migliore"]];

type PlayerPage = { items: Player[]; total: number; offset: number; limit: number };
type SavedFilters = { query?: string; role?: ClassicRole | ""; team?: string; sort?: PlayerSort };
type Props = { open: boolean; onClose: () => void; onSelect: (player: Player) => void; excludedIds: number[]; config: LeagueConfig; variant?: "sheet" | "page"; initialRole?: ClassicRole };

function savedFilters(): SavedFilters { try { return JSON.parse(sessionStorage.getItem(FILTER_KEY) ?? "{}"); } catch { return {}; } }
function savedFavorites(): number[] { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"); } catch { return []; } }

export function PlayerSearch({ open, onClose, onSelect, excludedIds, config, variant = "sheet", initialRole }: Props) {
  const saved = useRef(savedFilters());
  const [query, setQuery] = useState(initialRole ? "" : saved.current.query ?? "");
  const [role, setRole] = useState<ClassicRole | "">(initialRole ?? saved.current.role ?? "");
  const [team, setTeam] = useState(initialRole ? "" : saved.current.team ?? "");
  const [sort, setSort] = useState<PlayerSort>(saved.current.sort ?? "fvm_desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(savedFavorites);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const excluded = new Set(excludedIds);
  const visiblePlayers = players;
  const canLoadMore = players.length < total;
  const activeFilterCount = Number(Boolean(team)) + Number(Boolean(role)) + Number(sort !== "fvm_desc");

  useEffect(() => { sessionStorage.setItem(FILTER_KEY, JSON.stringify({ query, role, team, sort })); }, [query, role, team, sort]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => {
    if (!open) return;
    if (variant === "sheet") inputRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose, variant]);
  useEffect(() => {
    if (!open || teams.length) return;
    fetch(`${API_BASE_URL}/teams`).then((response) => response.ok ? response.json() : Promise.reject()).then(setTeams).catch(() => setError("Impossibile caricare le squadre."));
  }, [open, teams.length]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), sort });
        if (query.trim()) params.set("q", query.trim());
        if (role) params.set("role", role);
        if (team) params.set("team", team);
        const response = await fetch(`${API_BASE_URL}/players?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const page = await response.json() as PlayerPage;
        setPlayers(page.items); setTotal(page.total);
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") setError("Collegamento dati non disponibile. Verifica che l’API sia attiva.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, query.trim() ? 220 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [open, query, role, team, sort]);

  async function loadMore() {
    setLoadingMore(true); setError("");
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(players.length), sort });
      if (query.trim()) params.set("q", query.trim());
      if (role) params.set("role", role);
      if (team) params.set("team", team);
      const response = await fetch(`${API_BASE_URL}/players?${params}`);
      if (!response.ok) throw new Error();
      const page = await response.json() as PlayerPage;
      setPlayers((current) => [...current, ...page.items]); setTotal(page.total);
    } catch { setError("Non è stato possibile caricare altri giocatori."); }
    finally { setLoadingMore(false); }
  }
  function toggleCompare(player: Player) {
    setSelected((current) => current.some((item) => item.id === player.id) ? current.filter((item) => item.id !== player.id) : current.length < 3 ? [...current, player] : current);
  }
  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }
  function resetFilters() { setRole(""); setTeam(""); setSort("fvm_desc"); }

  if (!open) return null;
  const content = <section className={`search-sheet ${variant === "page" ? "search-page-surface" : ""}`} role={variant === "sheet" ? "dialog" : undefined} aria-modal={variant === "sheet" ? "true" : undefined} aria-labelledby="search-title" onMouseDown={(event) => event.stopPropagation()}>
    {compareOpen ? <PlayerComparisonView players={selected} config={config} onBack={() => setCompareOpen(false)} onOpen={onSelect} /> : <>
      {variant === "sheet" && <div className="sheet-handle" />}
      <header className="sheet-header"><div><span className="eyebrow">LISTONE UFFICIALE</span><h2 id="search-title">Mercato giocatori</h2><p>Cerca, filtra per squadra e ruolo, poi valuta il prezzo prima di acquistare.</p></div>{variant === "sheet" && <button className="icon-button" aria-label="Chiudi Listone" onClick={onClose}>×</button>}</header>
      <div className="sticky-player-filters">
        <div className="autocomplete-box"><span aria-hidden="true">⌕</span><input ref={inputRef} aria-label="Cerca giocatore" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nome, cognome o alias..." /><span>{loading ? "…" : ""}</span></div>
        <button className="filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}><span>FILTRI {activeFilterCount ? `(${activeFilterCount})` : ""}</span><b>{filtersOpen ? "−" : "+"}</b></button>
        <div className={`player-filters ${filtersOpen ? "open" : ""}`}>
          <div className="team-filter"><span>Squadra</span><TeamSelector teams={teams} value={team} onChange={setTeam} /></div>
          <div><span>Ruolo</span><div className="role-chips" aria-label="Filtro ruolo"><button className={!role ? "active" : ""} onClick={() => setRole("")}>Tutti</button>{(Object.keys(roleLabels) as ClassicRole[]).map((value) => <button title={roleLabels[value]} className={role === value ? "active" : ""} key={value} onClick={() => setRole(value)}>{value}</button>)}</div></div>
          <label><span>Ordina</span><select aria-label="Ordina giocatori" value={sort} onChange={(event) => setSort(event.target.value as PlayerSort)}>{sortOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          {activeFilterCount > 0 && <button className="clear-filters" onClick={resetFilters}>AZZERA FILTRI</button>}
        </div>
      </div>
      <div className="listone-summary"><b>{query.trim() ? "Risultati ricerca" : "Listone"}</b><span>{loading ? "Aggiornamento…" : `${visiblePlayers.length} di ${total} · ${excludedIds.length} in rosa`}</span></div>
      {error && <div className="message-state error-state"><b>Data link non disponibile</b><span>{error}</span></div>}
      {!error && !loading && !visiblePlayers.length && <div className="message-state"><b>Nessun profilo corrisponde all’identikit.</b><span>Modifica nome, squadra o ruolo per ampliare la selezione.</span></div>}
      <div className="compact-player-list">{visiblePlayers.map((player) => <PlayerCompactCard key={player.id} player={player} config={config} owned={excluded.has(player.id)} favorite={favorites.includes(player.id)} compared={selected.some((item) => item.id === player.id)} compareDisabled={selected.length >= 3} onOpen={() => onSelect(player)} onToggleCompare={() => toggleCompare(player)} onToggleFavorite={() => toggleFavorite(player.id)} />)}</div>
      {canLoadMore && <button className="load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "CARICAMENTO…" : `MOSTRA ALTRI (${total - players.length})`}</button>}
      <p className="listone-credit">QI · QA · FVM dal listone Fantacalcio 2026/27 normalizzato nel progetto</p><PlayerCompareTray players={selected} onRemove={(id) => setSelected((current) => current.filter((player) => player.id !== id))} onCompare={() => setCompareOpen(true)} />
    </>}
  </section>;
  return variant === "sheet" ? <div className="sheet-backdrop" onMouseDown={onClose}>{content}</div> : <main className="listone-page">{content}</main>;
}
