import { useEffect, useState } from "react";
import type { MediaReviewStatus, PlayerMediaReview } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const labels: Record<MediaReviewStatus, string> = { pending: "PENDING", approved: "APPROVED", rejected: "REJECTED", fallback: "FALLBACK" };

export function MediaReviewPage({ onClose }: { onClose: () => void }) {
  const [records, setRecords] = useState<PlayerMediaReview[]>([]);
  const [filter, setFilter] = useState<MediaReviewStatus | "all">("pending");
  const [error, setError] = useState("");
  useEffect(() => { fetch(`${API_BASE_URL}/admin/media-review`).then((response) => response.ok ? response.json() : Promise.reject()).then(setRecords).catch(() => setError("Media review API non disponibile.")); }, []);
  async function update(playerId: number, action: "approve" | "reject" | "fallback") {
    const response = await fetch(`${API_BASE_URL}/admin/media-review/${playerId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, review_notes: `Decisione manuale: ${action}` }) });
    if (!response.ok) { setError("Impossibile salvare la decisione."); return; }
    const next = await response.json() as PlayerMediaReview;
    setRecords((current) => current.map((record) => record.player_id === playerId ? next : record));
  }
  const visible = records.filter((record) => filter === "all" || record.status === filter);
  return <main className="media-review-page"><header><div><span className="eyebrow">INTERNAL TOOL</span><h1>Media Review</h1><p>Le decisioni vengono salvate separatamente dal dataset normalizzato.</p></div><button className="secondary-action" onClick={onClose}>← TORNA ALL’APP</button></header><nav>{(["pending", "approved", "rejected", "fallback", "all"] as const).map((status) => <button className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)}>{status === "all" ? "TUTTE" : labels[status]}</button>)}</nav>{error && <div className="message-state error-state">{error}</div>}<div className="media-review-grid">{visible.map((record) => <article className="media-review-card" key={record.player_id}><div className="media-candidate">{record.image?.url ? <img src={record.image.thumbnail_url ?? record.image.url} alt={`Candidato per ${record.player_name}`} /> : <div>F7</div>}<span className={`media-status ${record.status}`}>{labels[record.status]}</span></div><div><h2>{record.player_name}</h2><p>{record.team} · ID #{record.player_id}</p><dl><div><dt>Fonte</dt><dd>{record.image?.source ?? "N/D"}</dd></div><div><dt>Autore</dt><dd>{record.image?.author ?? "N/D"}</dd></div><div><dt>Licenza</dt><dd>{record.image?.license ?? "N/D"}</dd></div><div><dt>Confidence</dt><dd>{Math.round(record.identity_confidence * 100)}%</dd></div></dl>{record.image?.source_page || record.image?.attribution_url ? <a href={record.image.source_page ?? record.image.attribution_url ?? "#"} target="_blank" rel="noreferrer">Apri fonte originale ↗</a> : null}<div className="media-actions"><button disabled={!record.image} onClick={() => void update(record.player_id, "approve")}>APPROVE</button><button disabled={!record.image} onClick={() => void update(record.player_id, "reject")}>REJECT</button><button onClick={() => void update(record.player_id, "fallback")}>USE FALLBACK</button></div></div></article>)}</div>{!visible.length && !error && <div className="message-state"><b>Nessun record</b><span>Non ci sono immagini con questo stato.</span></div>}</main>;
}
