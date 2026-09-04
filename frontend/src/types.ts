export type ClassicRole = "P" | "D" | "C" | "A";

export type PlayerImage = {
  url?: string | null;
  thumbnail_url?: string | null;
  source?: string | null;
  author?: string | null;
  license?: string | null;
  attribution_url?: string | null;
  source_page?: string | null;
  attribution_text?: string | null;
  portrait_approved?: boolean;
  identity_confidence?: number | null;
  status?: MediaReviewStatus;
  review_notes?: string | null;
  reviewed_at?: string | null;
};

export type MediaReviewStatus = "pending" | "approved" | "rejected" | "fallback";

export type Player = {
  id: number;
  source_name: string;
  name: string;
  aliases: string[];
  team: string;
  team_id?: string | null;
  role_classic: ClassicRole;
  roles_mantra: string[];
  current_quotation: number;
  initial_quotation: number;
  quotation_delta: number;
  current_quotation_mantra: number;
  initial_quotation_mantra: number;
  quotation_delta_mantra: number;
  fvm: number;
  fvm_mantra: number;
  image?: PlayerImage | null;
  statistics: PlayerSeasonStats[];
  external_ids?: ExternalIds;
};

export type ExternalIds = {
  fantacalcio?: string | null;
  api_football?: number | null;
  wikidata?: string | null;
};

export type PlayerSeasonStats = {
  season: string;
  competition: string;
  club?: string | null;
  source: string;
  source_url?: string | null;
  updated_at?: string | null;
  confidence?: "HIGH" | "MEDIUM" | "LOW" | null;
  appearances?: number | null;
  starts?: number | null;
  minutes?: number | null;
  goals?: number | null;
  assists?: number | null;
  yellow_cards?: number | null;
  red_cards?: number | null;
  average_rating?: number | null;
  fantasy_average?: number | null;
  goals_conceded?: number | null;
  penalties_taken?: number | null;
  penalties_scored?: number | null;
  penalties_missed?: number | null;
  penalties_saved?: number | null;
  own_goals?: number | null;
};

export type LeagueMode = "Classic" | "Mantra" | "Classic con Trequartisti";
export type LeagueGoal =
  | "Vincere e umiliare tutti"
  | "Arrivare almeno in Top 3"
  | "Fare una stagione dignitosa"
  | "Non arrivare ultimo";

export type LeagueConfig = {
  teamName: string;
  participants: number;
  mode: LeagueMode;
  budget: number;
  goal: LeagueGoal;
};

export type PlayerSearchResult = {
  player: Player;
  score: number;
  matched_on: string;
};

export type PlayerSort = "name_asc" | "name_desc" | "qa_asc" | "qa_desc" | "fvm_asc" | "fvm_desc" | "delta_desc";

export type PlayerBenchmark = {
  player_id: number;
  role: ClassicRole;
  role_total: number;
  fvm_rank: number;
  fvm_percentile: number;
  fvm_top_percent: number;
  qa_rank: number;
  qa_percentile: number;
  qa_top_percent: number;
  methodology: string;
};

export type AgentInsight = {
  type: "ADVICE" | "WARNING" | "RISK";
  title: string;
  verdict: string;
  evidence: string[];
  threshold: string;
  nextAction: string;
  recommendedRole?: ClassicRole;
};

export type PlayerCurrentForm = { playerId: number; matches: number; averageRating?: number | null; fantasyAverage?: number | null; source: string; updatedAt: string };
export type PlayerAvailability = { playerId: number; status: "available" | "doubtful" | "unavailable" | "unknown"; source: string; updatedAt: string };
export type Fixture = { id: string; homeTeam: string; awayTeam: string; kickoffAt: string; source: string; updatedAt: string };
export type FixtureDifficulty = { fixtureId: string; team: string; value?: number | null; methodology?: string | null; source: string; updatedAt: string };

export type PlayerMediaReview = {
  player_id: number;
  player_name: string;
  team: string;
  image?: PlayerImage | null;
  status: MediaReviewStatus;
  identity_confidence: number;
  review_notes?: string | null;
  reviewed_at?: string | null;
};

export type SquadPlayer = {
  player: Player;
  paidPrice: number;
  addedAt: string;
};

export type TeamAsset = {
  url?: string | null;
  source_page?: string | null;
  license?: string | null;
  status?: string | null;
};

export type Team = {
  id: string;
  name: string;
  aliases: string[];
  colors: string[];
  asset?: TeamAsset | null;
};

export type AppSection = "home" | "squad" | "evaluation";
export type NavigationSection = AppSection | "listone";
