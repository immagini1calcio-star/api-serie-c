const BASE_URL = "https://www.sofascore.com/api/v1";

/*
========================================================
CONFIGURAZIONE SERIE C
========================================================
*/

const COMPETIZIONI = {
  "girone-a": {
    id: 11445,
    nome: "Serie C",
    girone: "Girone A",
    tipo: "campionato"
  },

  "girone-b": {
    id: 11447,
    nome: "Serie C",
    girone: "Girone B",
    tipo: "campionato"
  },

  "girone-c": {
    id: 11446,
    nome: "Serie C",
    girone: "Girone C",
    tipo: "campionato"
  },

  "playoff-nazionali": {
    id: 11452,
    nome: "Serie C",
    girone: "Playoff Nazionali",
    tipo: "playoff"
  }
};


/*
========================================================
FETCH SOFASCORE
========================================================
*/

async function sofascore(endpoint) {

  const url = BASE_URL + endpoint;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Sofascore HTTP ${response.status}: ${endpoint}`
    );
  }

  return await response.json();
}


/*
========================================================
NORMALIZZA TESTO
========================================================
*/

function testo(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}


/*
========================================================
NOME STATO
========================================================
*/

function statoPartita(event) {

  if (!event || !event.status) {
    return "";
  }

  const status = event.status;

  if (
    status.type === "inprogress" ||
    status.type === "live"
  ) {
    return "In corso";
  }

  if (
    status.type === "finished" ||
    status.type === "afterpenalties"
  ) {
    return "Terminata";
  }

  if (
    status.type === "postponed"
  ) {
    return "Rinviata";
  }

  if (
    status.type === "canceled" ||
    status.type === "cancelled"
  ) {
    return "Annullata";
  }

  return (
    status.description ||
    status.name ||
    "In programma"
  );
}


/*
========================================================
DATA
========================================================
*/

function dataPartita(event) {

  if (!event || !event.startTimestamp) {
    return "";
  }

  return new Date(
    event.startTimestamp * 1000
  ).toISOString();
}


/*
========================================================
GIRONE
========================================================
*/

function determinaGirone(event, configurazione) {

  if (
    configurazione &&
    configurazione.tipo === "playoff"
  ) {
    return "Playoff Nazionali";
  }

  if (
    configurazione &&
    configurazione.girone
  ) {
    return configurazione.girone;
  }

  const nome =
    event &&
    event.tournament &&
    event.tournament.name
      ? event.tournament.name
      : "";

  if (
    /girone\s*a/i.test(nome)
  ) {
    return "Girone A";
  }

  if (
    /girone\s*b/i.test(nome)
  ) {
    return "Girone B";
  }

  if (
    /girone\s*c/i.test(nome)
  ) {
    return "Girone C";
  }

  if (
    /play.?off/i.test(nome)
  ) {
    return "Playoff Nazionali";
  }

  return "";
}


/*
========================================================
TURNO
========================================================
*/

function determinaTurno(event, configurazione) {

  /*
   * CAMPIONATO
   */

  if (
    configurazione &&
    configurazione.tipo === "campionato"
  ) {

    if (
      event.roundInfo &&
      event.roundInfo.round !== undefined
    ) {

      return (
        "Giornata " +
        event.roundInfo.round
      );
    }

    if (
      event.roundInfo &&
      event.roundInfo.name
    ) {

      return testo(
        event.roundInfo.name
      );
    }

    if (
      event.roundInfo &&
      event.roundInfo.slug
    ) {

      return testo(
        event.roundInfo.slug
      );
    }

    return "";
  }


  /*
   * PLAYOFF / PLAYOUT
   */

  if (
    event.roundInfo
  ) {

    if (
      event.roundInfo.name
    ) {

      return formattaFase(
        event.roundInfo.name
      );
    }

    if (
      event.roundInfo.slug
    ) {

      return formattaFase(
        event.roundInfo.slug
      );
    }

    if (
      event.roundInfo.round !== undefined
    ) {

      return (
        "Turno " +
        event.roundInfo.round
      );
    }
  }


  /*
   * EVENTUALI INFO DI FASE
   */

  if (
    event.phase
  ) {

    return formattaFase(
      event.phase
    );
  }


  if (
    event.roundInfo
  ) {

    return formattaFase(
      JSON.stringify(
        event.roundInfo
      )
    );
  }


  return "";
}


/*
========================================================
FORMATTA FASE
========================================================
*/

function formattaFase(value) {

  const testoOriginale =
    testo(value);

  const lower =
    testoOriginale.toLowerCase();

  if (
    lower.includes("quarter")
  ) {
    return "Quarti di finale";
  }

  if (
    lower.includes("semi")
  ) {
    return "Semifinale";
  }

  if (
    lower.includes("final")
  ) {
    return "Finale";
  }

  if (
    lower.includes("play.?out") ||
    lower.includes("playout") ||
    lower.includes("relegation")
  ) {
    return "Playout";
  }

  if (
    lower.includes("promotion")
  ) {
    return "Playoff Promozione";
  }

  if (
    lower.includes("round")
  ) {
    return testoOriginale;
  }

  return testoOriginale;
}


/*
========================================================
SQUADRA
========================================================
*/

function squadra(team) {

  if (!team) {
    return {
      id: null,
      nome: "",
      logo: ""
    };
  }

  return {
    id:
      team.id ||
      null,

    nome:
      team.name ||
      team.shortName ||
      "",

    logo:
      team.logo ||
      ""
  };
}


/*
========================================================
NORMALIZZA PARTITA
========================================================
*/

function normalizzaPartita(
  event,
  configurazione
) {

  if (!event) {
    return null;
  }

  const casa =
    squadra(
      event.homeTeam
    );

  const trasferta =
    squadra(
      event.awayTeam
    );

  const girone =
    determinaGirone(
      event,
      configurazione
    );

  const turno =
    determinaTurno(
      event,
      configurazione
    );

  return {

    id: event.id || null,

    external_id:
      String(
        event.id || ""
      ),

    competizione:
      "Serie C",

    girone:
      girone,

    turno:
      turno,

    stagione:
      event.season &&
      event.season.name
        ? event.season.name
        : "",

    data:
      dataPartita(
        event
      ),

    timestamp:
      event.startTimestamp ||
      null,

    stato:
      statoPartita(
        event
      ),

    casa: {
      id: casa.id,
      nome: casa.nome,
      gol:
        event.homeScore &&
        event.homeScore.current !== undefined
          ? event.homeScore.current
          : null,
      logo: casa.logo
    },

    trasferta: {
      id: trasferta.id,
      nome: trasferta.nome,
      gol:
        event.awayScore &&
        event.awayScore.current !== undefined
          ? event.awayScore.current
          : null,
      logo: trasferta.logo
    },

    punteggio: {

      casa:
        event.homeScore &&
        event.homeScore.current !== undefined
          ? event.homeScore.current
          : null,

      trasferta:
        event.awayScore &&
        event.awayScore.current !== undefined
          ? event.awayScore.current
          : null,

      casa_halftime:
        event.homeScore &&
        event.homeScore.period1 !== undefined
          ? event.homeScore.period1
          : null,

      trasferta_halftime:
        event.awayScore &&
        event.awayScore.period1 !== undefined
          ? event.awayScore.period1
          : null,

      casa_extra_time:
        event.homeScore &&
        event.homeScore.extra1 !== undefined
          ? event.homeScore.extra1
          : null,

      trasferta_extra_time:
        event.awayScore &&
        event.awayScore.extra1 !== undefined
          ? event.awayScore.extra1
          : null,

      casa_rigori:
        event.homeScore &&
        event.homeScore.normaltime !== undefined
          ? null
          : null,

      trasferta_rigori:
        event.awayScore &&
        event.awayScore.normaltime !== undefined
          ? null
          : null
    },

    stadio:
      event.venue &&
      event.venue.name
        ? event.venue.name
        : "",

    citta:
      event.venue &&
      event.venue.city
        ? event.venue.city
        : "",

    arbitro:
      null,

    link:
      `https://www.sofascore.com/event/${event.id}`
  };
}


/*
========================================================
DEDUPLICAZIONE
========================================================
*/

function deduplicaPartite(partite) {

  const mappa =
    new Map();

  for (
    const partita of partite
  ) {

    if (
      partita &&
      partita.id
    ) {

      mappa.set(
        String(partita.id),
        partita
      );
    }
  }

  return Array.from(
    mappa.values()
  );
}


/*
========================================================
STAGIONE ATTIVA
========================================================
*/

async function trovaStagioneAttiva(
  tournamentId
) {

  const data =
    await sofascore(
      `/unique-tournament/${tournamentId}/seasons`
    );

  const stagioni =
    data.seasons || [];

  if (
    stagioni.length === 0
  ) {
    throw new Error(
      "Nessuna stagione trovata"
    );
  }

  /*
   * Prima cerchiamo 2026/27
   */

  const stagione2627 =
    stagioni.find(
      stagione =>
        String(
          stagione.name || ""
        ).includes("26/27")
    );

  if (stagione2627) {
    return stagione2627;
  }

  /*
   * Poi cerchiamo 2026-27
   */

  const stagione202627 =
    stagioni.find(
      stagione =>
        String(
          stagione.name || ""
        ).includes("2026/27")
    );

  if (stagione202627) {
    return stagione202627;
  }

  /*
   * Altrimenti prendiamo
   * la prima stagione disponibile.
   */

  return stagioni[0];
}


/*
========================================================
PARTITE DI UNA GIORNATA
========================================================
*/

async function recuperaGiornata(
  tournamentId,
  seasonId,
  round
) {

  try {

    const data =
      await sofascore(
        `/unique-tournament/${tournamentId}/season/${seasonId}/events/round/${round}`
      );

    return (
      data.events ||
      []
    );

  } catch (error) {

    return [];
  }
}


/*
========================================================
TUTTE LE GIORNATE CAMPIONATO
========================================================
*/

async function recuperaTutteLeGiornate(
  tournamentId,
  seasonId
) {

  const partite = [];

  /*
   * Serie C normalmente ha
   * 38 giornate.
   *
   * Facciamo 40 tentativi
   * per non perdere eventuali
   * modifiche del calendario.
   */

  for (
    let round = 1;
    round <= 40;
    round++
  ) {

    const eventi =
      await recuperaGiornata(
        tournamentId,
        seasonId,
        round
      );

    if (
      eventi.length > 0
    ) {

      partite.push(
        ...eventi
      );
    }
  }

  return deduplicaPartite(
    partite.map(
      event =>
        normalizzaPartita(
          event,
          {
            tipo: "campionato",
            girone:
              trovaGironeDaTournamentId(
                tournamentId
              )
          }
        )
    )
  );
}


/*
========================================================
TROVA GIRONE DA ID
========================================================
*/

function trovaGironeDaTournamentId(
  tournamentId
) {

  if (
    Number(tournamentId) === 11445
  ) {
    return "Girone A";
  }

  if (
    Number(tournamentId) === 11447
  ) {
    return "Girone B";
  }

  if (
    Number(tournamentId) === 11446
  ) {
    return "Girone C";
  }

  return "";
}


/*
========================================================
PLAYOFF
========================================================
*/

async function recuperaPlayoff(
  seasonId
) {

  const partite = [];

  /*
   * Proviamo le giornate/round
   * disponibili nel torneo playoff.
   */

  for (
    let round = 1;
    round <= 15;
    round++
  ) {

    try {

      const data =
        await sofascore(
          `/unique-tournament/11452/season/${seasonId}/events/round/${round}`
        );

      if (
        data &&
        data.events
      ) {

        for (
          const event of data.events
        ) {

          partite.push(
            normalizzaPartita(
              event,
              {
                tipo: "playoff",
                girone:
                  "Playoff Nazionali"
              }
            )
          );
        }
      }

    } catch (error) {

      /*
       * Se un round non esiste,
       * continuiamo con il successivo.
       */

    }
  }

  return deduplicaPartite(
    partite
  );
}


/*
========================================================
TUTTE LE PARTITE
========================================================
*/

async function recuperaTutteLePartite() {

  const risultati = [];

  /*
   * GIRONE A
   */

  const stagioneA =
    await trovaStagioneAttiva(
      11445
    );

  const partiteA =
    await recuperaTutteLeGiornate(
      11445,
      stagioneA.id
    );

  risultati.push(
    ...partiteA
  );


  /*
   * GIRONE B
   */

  const stagioneB =
    await trovaStagioneAttiva(
      11447
    );

  const partiteB =
    await recuperaTutteLeGiornate(
      11447,
      stagioneB.id
    );

  risultati.push(
    ...partiteB
  );


  /*
   * GIRONE C
   */

  const stagioneC =
    await trovaStagioneAttiva(
      11446
    );

  const partiteC =
    await recuperaTutteLeGiornate(
      11446,
      stagioneC.id
    );

  risultati.push(
    ...partiteC
  );


  /*
   * PLAYOFF NAZIONALI
   */

  try {

    const stagionePlayoff =
      await trovaStagioneAttiva(
        11452
      );

    const playoff =
      await recuperaPlayoff(
        stagionePlayoff.id
      );

    risultati.push(
      ...playoff
    );

  } catch (error) {

    /*
     * I playoff potrebbero
     * non essere ancora presenti
     * nella stagione.
     */

  }


  return deduplicaPartite(
    risultati
  );
}


/*
========================================================
EVENTO SINGOLO
========================================================
*/

async function recuperaPartita(
  eventId
) {

  const data =
    await sofascore(
      `/event/${eventId}`
    );

  return data.event || data;
}


/*
========================================================
STATISTICHE
========================================================
*/

async function recuperaStatistiche(
  eventId
) {

  const data =
    await sofascore(
      `/event/${eventId}/statistics`
    );

  return data;
}


/*
========================================================
EVENTI / CRONACA
========================================================
*/

async function recuperaEventi(
  eventId
) {

  const data =
    await sofascore(
      `/event/${eventId}/incidents`
    );

  return data;
}


/*
========================================================
FORMAZIONI
========================================================
*/

async function recuperaFormazioni(
  eventId
) {

  const data =
    await sofascore(
      `/event/${eventId}/lineups`
    );

  return data;
}


/*
========================================================
SQUADRE
========================================================
*/

async function recuperaSquadra(
  teamId
) {

  return await sofascore(
    `/team/${teamId}`
  );
}


/*
========================================================
ROSA
========================================================
*/

async function recuperaRosa(
  teamId
) {

  return await sofascore(
    `/team/${teamId}/players`
  );
}


/*
========================================================
CLASSIFICA
========================================================
*/

async function recuperaClassifica(
  tournamentId,
  seasonId
) {

  return await sofascore(
    `/unique-tournament/${tournamentId}/season/${seasonId}/standings/total`
  );
}


/*
========================================================
JSON RESPONSE
========================================================
*/

function json(
  response,
  status,
  data
) {

  response.statusCode =
    status;

  response.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  response.end(
    JSON.stringify(
      data,
      null,
      2
    )
  );
}


/*
========================================================
HANDLER VERCEL
========================================================
*/

module.exports = async function handler(
  request,
  response
) {

  try {

    const url =
      new URL(
        request.url,
        `https://${request.headers.host || "localhost"}`
      );

    const pathname =
      url.pathname;


    /*
    ====================================================
    HOME
    ====================================================
    */

    if (
      pathname === "/"
    ) {

      return json(
        response,
        200,
        {
          api:
            "API Serie C Italia",

          fonte:
            "Sofascore",

          stato:
            "online",

          competizioni: [
            {
              id: "girone-a",
              nome: "Serie C",
              girone: "Girone A",
              sofascore_id: 11445
            },
            {
              id: "girone-b",
              nome: "Serie C",
              girone: "Girone B",
              sofascore_id: 11447
            },
            {
              id: "girone-c",
              nome: "Serie C",
              girone: "Girone C",
              sofascore_id: 11446
            },
            {
              id: "playoff-nazionali",
              nome: "Serie C",
              girone: "Playoff Nazionali",
              sofascore_id: 11452
            }
          ]
        }
      );
    }


    /*
    ====================================================
    HEALTH
    ====================================================
    */

    if (
      pathname === "/api/health"
    ) {

      return json(
        response,
        200,
        {
          status: "ok",
          api: "Serie C",
          fonte: "Sofascore"
        }
      );
    }


    /*
    ====================================================
    COMPETIZIONI
    ====================================================
    */

    if (
      pathname ===
      "/api/competizioni"
    ) {

      return json(
        response,
        200,
        {
          competizioni: [
            {
              id: "girone-a",
              competizione: "Serie C",
              girone: "Girone A",
              sofascore_id: 11445
            },
            {
              id: "girone-b",
              competizione: "Serie C",
              girone: "Girone B",
              sofascore_id: 11447
            },
            {
              id: "girone-c",
              competizione: "Serie C",
              girone: "Girone C",
              sofascore_id: 11446
            },
            {
              id: "playoff-nazionali",
              competizione: "Serie C",
              girone: "Playoff Nazionali",
              sofascore_id: 11452
            }
          ]
        }
      );
    }


    /*
    ====================================================
    TUTTE LE PARTITE
    ====================================================
    */

    if (
      pathname ===
      "/api/partite"
    ) {

      const partite =
        await recuperaTutteLePartite();

      return json(
        response,
        200,
        {
          competizione:
            "Serie C",

          totale:
            partite.length,

          partite:
            partite
        }
      );
    }


    /*
    ====================================================
    PARTITE DI UN GIRONE
    ====================================================
    */

    const matchGirone =
      pathname.match(
        /^\/api\/partite\/(girone-a|girone-b|girone-c)$/
      );

    if (
      matchGirone
    ) {

      const chiave =
        matchGirone[1];

      const configurazione =
        COMPETIZIONI[
          chiave
        ];

      const stagione =
        await trovaStagioneAttiva(
          configurazione.id
        );

      const partite =
        await recuperaTutteLeGiornate(
          configurazione.id,
          stagione.id
        );

      return json(
        response,
        200,
        {
          competizione:
            "Serie C",

          girone:
            configurazione.girone,

          stagione:
            stagione.name,

          totale:
            partite.length,

          partite:
            partite
        }
      );
    }


    /*
    ====================================================
    PLAYOFF NAZIONALI
    ====================================================
    */

    if (
      pathname ===
      "/api/partite/playoff-nazionali"
    ) {

      const stagione =
        await trovaStagioneAttiva(
          11452
        );

      const partite =
        await recuperaPlayoff(
          stagione.id
        );

      return json(
        response,
        200,
        {
          competizione:
            "Serie C",

          girone:
            "Playoff Nazionali",

          stagione:
            stagione.name,

          totale:
            partite.length,

          partite:
            partite
        }
      );
    }


    /*
    ====================================================
    STAGIONI
    ====================================================
    */

    const matchStagioni =
      pathname.match(
        /^\/api\/stagioni\/(girone-a|girone-b|girone-c|playoff-nazionali)$/
      );

    if (
      matchStagioni
    ) {

      const chiave =
        matchStagioni[1];

      const configurazione =
        COMPETIZIONI[
          chiave
        ];

      const data =
        await sofascore(
          `/unique-tournament/${configurazione.id}/seasons`
        );

      return json(
        response,
        200,
        {
          competizione:
            "Serie C",

          girone:
            configurazione.girone,

          stagioni:
            data.seasons ||
            []
        }
      );
    }


    /*
    ====================================================
    CLASSIFICA
    ====================================================
    */

    const matchClassifica =
      pathname.match(
        /^\/api\/classifica\/(girone-a|girone-b|girone-c)$/
      );

    if (
      matchClassifica
    ) {

      const chiave =
        matchClassifica[1];

      const configurazione =
        COMPETIZIONI[
          chiave
        ];

      const stagione =
        await trovaStagioneAttiva(
          configurazione.id
        );

      const classifica =
        await recuperaClassifica(
          configurazione.id,
          stagione.id
        );

      return json(
        response,
        200,
        {
          competizione:
            "Serie C",

          girone:
            configurazione.girone,

          stagione:
            stagione.name,

          classifica:
            classifica
        }
      );
    }


    /*
    ====================================================
    PARTITA SINGOLA
    ====================================================
    */

    const matchPartita =
      pathname.match(
        /^\/api\/partita\/([0-9]+)$/
      );

    if (
      matchPartita
    ) {

      const eventId =
        matchPartita[1];

      const partita =
        await recuperaPartita(
          eventId
        );

      return json(
        response,
        200,
        {
          partita:
            partita
        }
      );
    }


    /*
    ====================================================
    STATISTICHE PARTITA
    ====================================================
    */

    const matchStatistiche =
      pathname.match(
        /^\/api\/partita\/([0-9]+)\/statistiche$/
      );

    if (
      matchStatistiche
    ) {

      const eventId =
        matchStatistiche[1];

      const statistiche =
        await recuperaStatistiche(
          eventId
        );

      return json(
        response,
        200,
        {
          id_partita:
            eventId,

          statistiche:
            statistiche
        }
      );
    }


    /*
    ====================================================
    EVENTI PARTITA
    ====================================================
    */

    const matchEventi =
      pathname.match(
        /^\/api\/partita\/([0-9]+)\/eventi$/
      );

    if (
      matchEventi
    ) {

      const eventId =
        matchEventi[1];

      const eventi =
        await recuperaEventi(
          eventId
        );

      return json(
        response,
        200,
        {
          id_partita:
            eventId,

          eventi:
            eventi
        }
      );
    }


    /*
    ====================================================
    FORMAZIONI
    ====================================================
    */

    const matchFormazioni =
      pathname.match(
        /^\/api\/partita\/([0-9]+)\/formazioni$/
      );

    if (
      matchFormazioni
    ) {

      const eventId =
        matchFormazioni[1];

      const formazioni =
        await recuperaFormazioni(
          eventId
        );

      return json(
        response,
        200,
        {
          id_partita:
            eventId,

          formazioni:
            formazioni
        }
      );
    }


    /*
    ====================================================
    SQUADRA
    ====================================================
    */

    const matchSquadra =
      pathname.match(
        /^\/api\/squadra\/([0-9]+)$/
      );

    if (
      matchSquadra
    ) {

      const teamId =
        matchSquadra[1];

      const squadra =
        await recuperaSquadra(
          teamId
        );

      return json(
        response,
        200,
        {
          squadra:
            squadra
        }
      );
    }


    /*
    ====================================================
    ROSA SQUADRA
    ====================================================
    */

    const matchRosa =
      pathname.match(
        /^\/api\/squadra\/([0-9]+)\/giocatori$/
      );

    if (
      matchRosa
    ) {

      const teamId =
        matchRosa[1];

      const rosa =
        await recuperaRosa(
          teamId
        );

      return json(
        response,
        200,
        {
          squadra:
            teamId,

          giocatori:
            rosa
        }
      );
    }


    /*
    ====================================================
    ENDPOINT NON TROVATO
    ====================================================
    */

    return json(
      response,
      404,
      {
        errore:
          "Endpoint non trovato",

        endpoint:
          pathname
      }
    );

  } catch (error) {

    console.error(
      error
    );

    return json(
      response,
      500,
      {
        errore:
          error.message ||
          "Errore interno API"
      }
    );
  }
};
