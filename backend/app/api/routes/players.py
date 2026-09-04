from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Query, Request

from app.domain.player import ClassicRole, Player
from app.domain.benchmark import PlayerBenchmark
from app.domain.search import PlayerListResponse, PlayerSearchResult
from app.services.player_search import PlayerSearchService
from app.services.player_benchmark import PlayerBenchmarkService


router = APIRouter(prefix="/players", tags=["players"])
PlayerSort = Literal["name_asc", "name_desc", "qa_asc", "qa_desc", "fvm_asc", "fvm_desc", "delta_desc"]


def _sort_players(players: list[Player], sort: PlayerSort) -> None:
    keys = {
        "name_asc": lambda player: (player.name.casefold(), player.id),
        "name_desc": lambda player: (player.name.casefold(), player.id),
        "qa_asc": lambda player: (player.current_quotation, player.name.casefold()),
        "qa_desc": lambda player: (-player.current_quotation, player.name.casefold()),
        "fvm_asc": lambda player: (player.fvm, player.name.casefold()),
        "fvm_desc": lambda player: (-player.fvm, player.name.casefold()),
        "delta_desc": lambda player: (-player.quotation_delta, player.name.casefold()),
    }
    players.sort(key=keys[sort], reverse=sort == "name_desc")


def _with_media_review(request: Request, players: list[Player]) -> list[Player]:
    return [request.app.state.media_review_repository.apply(player) for player in players]


@router.get("", response_model=PlayerListResponse)
def list_players(
    request: Request,
    q: Annotated[str | None, Query(min_length=1, max_length=80)] = None,
    team: str | None = None,
    role: ClassicRole | None = None,
    sort: PlayerSort = "fvm_desc",
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 40,
) -> PlayerListResponse:
    if q:
        search_limit = len(request.app.state.player_repository.all())
        players = [result.player for result in PlayerSearchService(request.app.state.player_repository).search(q, role=role, team=team, limit=search_limit)]
    else:
        players = request.app.state.player_repository.all()
    if team:
        players = [player for player in players if player.team.casefold() == team.casefold()]
    if role:
        players = [player for player in players if player.role_classic == role]
    _sort_players(players, sort)
    players = _with_media_review(request, players)
    return PlayerListResponse(
        items=players[offset : offset + limit],
        total=len(players),
        offset=offset,
        limit=limit,
    )


@router.get("/teams", response_model=list[str])
def list_teams(request: Request) -> list[str]:
    return sorted(
        {player.team for player in request.app.state.player_repository.all()},
        key=str.casefold,
    )


@router.get("/search", response_model=list[PlayerSearchResult])
def search_players(
    request: Request,
    q: Annotated[str, Query(min_length=1, max_length=80)],
    role: ClassicRole | None = None,
    team: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
) -> list[PlayerSearchResult]:
    service = PlayerSearchService(request.app.state.player_repository)
    results = service.search(q, role=role, team=team, limit=limit)
    return [result.model_copy(update={"player": request.app.state.media_review_repository.apply(result.player)}) for result in results]


@router.get("/{player_id}/benchmark", response_model=PlayerBenchmark)
def get_player_benchmark(request: Request, player_id: int) -> PlayerBenchmark:
    player = request.app.state.player_repository.get(player_id)
    if player is None:
        raise HTTPException(status_code=404, detail="Giocatore non trovato")
    return PlayerBenchmarkService(request.app.state.player_repository).for_player(player)


@router.get("/{player_id}", response_model=Player)
def get_player(request: Request, player_id: int) -> Player:
    player = request.app.state.player_repository.get(player_id)
    if player is None:
        raise HTTPException(status_code=404, detail="Giocatore non trovato")
    return request.app.state.media_review_repository.apply(player)
