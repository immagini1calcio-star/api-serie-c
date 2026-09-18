const BASE_URL = "https://api.sofascore.com/api/v1";

module.exports = async function handler(req, res) {
  try {

    const url =
      `${BASE_URL}/unique-tournament/11445/events/last/0`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    res.status(200).json({
      url,
      success: response.ok,
      status_http: response.status,
      totale: data.events ? data.events.length : 0,
      eventi: (data.events || []).slice(0, 10).map(event => ({
        id: event.id,
        torneo: event.tournament?.name || "",
        stagione: event.season?.name || "",
        stagione_id: event.season?.id || null,
        casa: event.homeTeam?.name || "",
        trasferta: event.awayTeam?.name || "",
        data: event.startTimestamp
          ? new Date(event.startTimestamp * 1000).toISOString()
          : null,
        roundInfo: event.roundInfo || null
      }))
    });

  } catch (error) {

    res.status(500).json({
      errore: error.message
    });

  }
};
