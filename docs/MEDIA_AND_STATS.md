# Media and Statistics Policy

## Immagini

TheSportsDB è stato verificato sui quattro giocatori campione, ma il campo `strCreativeCommons` risultava vuoto. Queste immagini non sono state importate.

Il primo set curato usa Wikimedia Commons. Ogni record conserva URL, autore, licenza e pagina di attribuzione. La UI mostra l'attribuzione nella scheda e usa un avatar con iniziali quando manca un asset.

Fonti tecniche:

- https://www.mediawiki.org/wiki/API:Imageinfo
- https://www.mediawiki.org/wiki/Extension:CommonsMetadata/en
- https://commons.wikimedia.org/

Le licenze presenti nel set candidato includono CC0, CC BY e CC BY-SA in versioni differenti. “Liberamente riutilizzabile” non significa privo di copyright: attribuzione, eventuale share-alike e revisione dell'identità restano obbligatorie per ogni singolo file.

## Statistiche

La struttura `PlayerSeasonStats` è pronta ma il dataset attuale non contiene statistiche storiche. Prima dell'importazione occorre scegliere un provider con:

- copertura Serie A per stagione;
- identificatori giocatore stabili;
- gol, assist, presenze e minuti;
- condizioni d'uso compatibili con una web app portfolio;
- API documentata, caching e rate limits.

Candidate valutabili:

- football-data.org per dati ufficialmente documentati ma più limitati;
- API-Football per copertura giocatore più completa, subordinata a piano e API key.

Non vengono usati endpoint non documentati di siti terzi e non viene effettuato scraping.
