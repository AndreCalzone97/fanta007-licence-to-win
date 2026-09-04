from fastapi import APIRouter, HTTPException, Request

from app.domain.team import Team


router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[Team])
def list_teams(request: Request) -> list[Team]:
    return request.app.state.team_catalog.all()


@router.get("/{team_id}", response_model=Team)
def get_team(request: Request, team_id: str) -> Team:
    team = request.app.state.team_catalog.get(team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Squadra non trovata")
    return team
