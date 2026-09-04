export type TeamCrestRecord = {
  id: string;
  name: string;
  src: string;
  sourcePage: string;
  license: "public-domain" | "fair-use";
  aliases: string[];
};

export const TEAM_CRESTS: TeamCrestRecord[] = [
  { id: "atalanta", name: "Atalanta", src: "https://upload.wikimedia.org/wikipedia/en/f/f2/Atalanta_BC_new_logo.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Atalanta_BC_new_logo.svg", aliases: [] },
  { id: "bologna", name: "Bologna", src: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Bologna_F.C._1909_logo.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Bologna_F.C._1909_logo.svg", aliases: [] },
  { id: "cagliari", name: "Cagliari", src: "https://upload.wikimedia.org/wikipedia/en/6/61/Cagliari_Calcio_1920.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Cagliari_Calcio_1920.svg", aliases: [] },
  { id: "como", name: "Como", src: "https://upload.wikimedia.org/wikipedia/commons/9/99/Calcio_Como_-_logo_%28Italy%2C_2019-%29.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Calcio_Como_-_logo_(Italy,_2019-).svg", aliases: ["Como 1907"] },
  { id: "fiorentina", name: "Fiorentina", src: "https://upload.wikimedia.org/wikipedia/commons/8/8c/ACF_Fiorentina_-_logo_%28Italy%2C_2022%29.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:ACF_Fiorentina_-_logo_(Italy,_2022).svg", aliases: ["ACF Fiorentina"] },
  { id: "frosinone", name: "Frosinone", src: "https://upload.wikimedia.org/wikipedia/en/0/0b/Frosinone_Calcio_logo.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Frosinone_Calcio_logo.svg", aliases: [] },
  { id: "genoa", name: "Genoa", src: "https://upload.wikimedia.org/wikipedia/en/2/2c/Genoa_CFC_crest.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Genoa_CFC_crest.svg", aliases: ["Genoa CFC"] },
  { id: "inter", name: "Inter", src: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:FC_Internazionale_Milano_2021.svg", aliases: ["Internazionale"] },
  { id: "juventus", name: "Juventus", src: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Juventus_FC_-_logo_black_%28Italy%2C_2020%29.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Juventus_FC_-_logo_black_(Italy,_2020).svg", aliases: [] },
  { id: "lazio", name: "Lazio", src: "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:S.S._Lazio_badge.svg", aliases: ["SS Lazio"] },
  { id: "lecce", name: "Lecce", src: "https://upload.wikimedia.org/wikipedia/en/2/23/US_Lecce_crest.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:US_Lecce_crest.svg", aliases: [] },
  { id: "milan", name: "Milan", src: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Logo_of_AC_Milan.svg", aliases: ["AC Milan"] },
  { id: "monza", name: "Monza", src: "https://upload.wikimedia.org/wikipedia/en/a/a7/AC_Monza_logo_%282021%29.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:AC_Monza_logo_(2021).svg", aliases: ["AC Monza"] },
  { id: "napoli", name: "Napoli", src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/SSC_Napoli_2025_%28white_and_azure%29.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:SSC_Napoli_2025_(white_and_azure).svg", aliases: ["SSC Napoli"] },
  { id: "parma", name: "Parma", src: "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_Parma_Calcio_1913_%28adozione_2016%29.svg", license: "public-domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Logo_Parma_Calcio_1913_(adozione_2016).svg", aliases: ["Parma Calcio"] },
  { id: "roma", name: "Roma", src: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:AS_Roma_logo_(2017).svg", aliases: ["AS Roma"] },
  { id: "sassuolo", name: "Sassuolo", src: "https://upload.wikimedia.org/wikipedia/en/1/1c/US_Sassuolo_Calcio_logo.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:US_Sassuolo_Calcio_logo.svg", aliases: [] },
  { id: "torino", name: "Torino", src: "https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Torino_FC_Logo.svg", aliases: ["Torino FC"] },
  { id: "udinese", name: "Udinese", src: "https://upload.wikimedia.org/wikipedia/en/c/ce/Udinese_Calcio_logo.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Udinese_Calcio_logo.svg", aliases: [] },
  { id: "venezia", name: "Venezia", src: "https://upload.wikimedia.org/wikipedia/en/3/39/Venezia_FC_crest.svg", license: "fair-use", sourcePage: "https://en.wikipedia.org/wiki/File:Venezia_FC_crest.svg", aliases: ["Venezia FC"] },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findTeamCrest(team?: string | null, teamId?: string | null) {
  const id = normalize(teamId ?? "");
  const name = normalize(team ?? "");
  return TEAM_CRESTS.find((entry) => normalize(entry.id) === id || normalize(entry.name) === name || entry.aliases.some((alias) => normalize(alias) === name));
}
