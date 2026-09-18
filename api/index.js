const BASE_URL = "https://api.sofascore.com/api/v1";

module.exports = async function handler(req, res) {
  try {

    const tournamentId = 11445;

    const url =
      `${BASE_URL}/unique-tournament/${tournamentId}/events/last/0`;

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.sofascore.com/",
        "Origin": "https://www.sofascore.com",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        risposta_testo: text
      };
    }

    res.status(200).json({

      url: url,

      successo: response.ok,

      status_http: response.status,

      totale:
        Array.isArray(data.events)
          ? data.events.length
          : 0,

      eventi:
        Array.isArray(data.events)
          ? data.events.slice(0, 10).map(event => ({

              id: event.id,

              torneo:
                event.tournament?.name || "",

              torneo_id:
                event.tournament?.uniqueTournament?.id ||
                event.tournament?.id ||
                null,

              stagione:
                event.season?.name || "",

              stagione_id:
                event.season?.id || null,

              casa:
                event.homeTeam?.name || "",

              trasferta:
                event.awayTeam?.name || "",

              data:
                event.startTimestamp
                  ? new Date(
                      event.startTimestamp * 1000
                    ).toISOString()
                  : null,

              roundInfo:
                event.roundInfo || null,

              stato:
                event.status?.description ||
                event.status?.type ||
                "",

              gol_casa:
                event.homeScore?.current ?? null,

              gol_trasferta:
                event.awayScore?.current ?? null

            }))
          : [],

      errore_api:
        !response.ok
          ? data
          : null

    });

  } catch (error) {

    res.status(500).json({
      successo: false,
      errore: error.message
    });

  }
};
