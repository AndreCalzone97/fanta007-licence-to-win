from __future__ import annotations

import json
import unicodedata
from pathlib import Path

from app.domain.team import Team, TeamCatalog


class TeamCatalogError(ValueError):
    pass


def _key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char)).casefold().strip()


class TeamCatalogService:
    def __init__(self, catalog: TeamCatalog):
        self.catalog = catalog
        if catalog.metadata.team_count != len(catalog.teams):
            raise TeamCatalogError("team_count non coincide con il numero di squadre.")

        self._by_id: dict[str, Team] = {}
        self._by_alias: dict[str, Team] = {}
        codes: set[str] = set()
        for team in catalog.teams:
            if team.id in self._by_id:
                raise TeamCatalogError(f"Team id duplicato: {team.id}")
            code = team.code.casefold()
            if code in codes:
                raise TeamCatalogError(f"Codice squadra duplicato: {team.code}")
            codes.add(code)
            self._by_id[team.id] = team
            for alias in {team.name, team.official_name, team.code, *team.aliases}:
                alias_key = _key(alias)
                existing = self._by_alias.get(alias_key)
                if existing and existing.id != team.id:
                    raise TeamCatalogError(f"Alias squadra ambiguo: {alias}")
                self._by_alias[alias_key] = team

    @classmethod
    def from_path(cls, path: Path) -> "TeamCatalogService":
        payload = json.loads(Path(path).read_text(encoding="utf-8"))
        return cls(TeamCatalog.model_validate(payload))

    def all(self) -> list[Team]:
        return sorted(self.catalog.teams, key=lambda team: team.name.casefold())

    def get(self, team_id: str) -> Team | None:
        return self._by_id.get(team_id)

    def resolve(self, source_name: str) -> Team | None:
        return self._by_alias.get(_key(source_name))

    def require(self, source_name: str) -> Team:
        team = self.resolve(source_name)
        if team is None:
            raise TeamCatalogError(f"Squadra non presente nel catalogo: {source_name}")
        return team

    def unknown_names(self, names: set[str]) -> list[str]:
        return sorted((name for name in names if self.resolve(name) is None), key=str.casefold)
