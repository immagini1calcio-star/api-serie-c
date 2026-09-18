const BASE_URL = "https://api.sofascore.com/api/v1";

module.exports = async function handler(req, res) {
  try {

    const tournamentId = 11445; // Serie C Girone A

    const response = await fetch(
      `${BASE_URL}/unique-tournament/${tournamentId}/seasons`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    res.status(200).json({
      torneo: tournamentId,
      stagioni: data.seasons || []
    });

  } catch (error) {

    res.status(500).json({
      errore: error.message
    });

  }
};
