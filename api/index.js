const BASE_URL = "https://api.sofascore.com/api/v1";

module.exports = async function handler(req, res) {
  try {

    const date = "2026-09-14";

    const response = await fetch(
      `${BASE_URL}/sport/football/scheduled-events/${date}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    const eventi = data.events || [];

    const serieC = eventi.filter(event => {

      const torneo = event.tournament || {};
      const unique = torneo.uniqueTournament || {};

      return (
        String(unique.name || "")
          .toLowerCase()
          .includes("serie c") ||
        String(torneo.name || "")
          .toLowerCase()
          .includes("serie c")
      );

    });

    res.status(200).json({
      data: date,
      totale_eventi_sofascore: eventi.length,
      totale_serie_c: serieC.length,

      serie_c: serieC.map(event => ({
        id: event.id,

        torneo:
          event.tournament?.name || "",

        unique_tournament:
          event.tournament?.uniqueTournament?.name || "",

        unique_tournament_id:
          event.tournament?.uniqueTournament?.id || null,

        home:
          event.homeTeam?.name || "",

        away:
          event.awayTeam?.name || "",

        startTimestamp:
          event.startTimestamp || null,

        roundInfo:
          event.roundInfo || null
      }))
    });

  } catch (error) {

    res.status(500).json({
      errore: error.message
    });

  }
};
