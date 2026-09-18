const BASE_URL = "https://api.sofascore.com/api/v1";

const TIMEZONE = "Europe/Rome";

/*
========================================================
TORNEI SERIE C
========================================================
*/

const TORNEI_SERIE_C = {
  11445: {
    competizione: "Serie C",
    girone: "Girone A",
    tipo: "campionato"
  },

  11447: {
    competizione: "Serie C",
    girone: "Girone B",
    tipo: "campionato"
  },

  11446: {
    competizione: "Serie C",
    girone: "Girone C",
    tipo: "campionato"
  },

  11452: {
    competizione: "Serie C",
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

  const response = await fetch(
    BASE_URL + endpoint,
    {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    }
  );

  if (!response.ok) {

    throw new Error(
      `Sofascore HTTP ${response.status}: ${endpoint}`
    );

  }

  return await response.json();
}


/*
========================================================
DATA ITALIANA
========================================================
*/

function dataItalia(date) {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(date);

}


/*
========================================================
LUNEDÌ DELLA SETTIMANA
========================================================
*/

function lunediSettimana() {

  const adesso = new Date();

  const parti =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short"
      }
    ).formatToParts(adesso);

  const anno = Number(
    parti.find(
      p => p.type === "year"
    ).value
  );

  const mese = Number(
    parti.find(
      p => p.type === "month"
    ).value
  );

  const giorno = Number(
    parti.find(
      p => p.type === "day"
    ).value
  );

  const giornoSettimana =
    parti.find(
      p => p.type === "weekday"
    ).value;

  const giorni = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  const indice =
    giorni[giornoSettimana];

  const data =
    new Date(
      Date.UTC(
        anno,
        mese - 1,
        giorno
      )
    );

  const differenza =
    indice === 0
      ? 6
      : indice - 1;

  data.setUTCDate(
    data.getUTCDate() - differenza
  );

  return data;
}


/*
========================================================
DOMENICA DELLA SETTIMANA
========================================================
*/

function domenicaSettimana() {

  const lunedi =
    lunediSettimana();

  const domenica =
    new Date(
      lunedi.getTime()
    );

  domenica.setUTCDate(
    domenica.getUTCDate() + 6
  );

  return domenica;
}


/*
========================================================
DATE DELLA SETTIMANA
========================================================
*/

function dateSettimana() {

  const lunedi =
    lunediSettimana();

  const date = [];

  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const giorno =
      new Date(
        lunedi.getTime()
      );

    giorno.setUTCDate(
      giorno.getUTCDate() + i
    );

    date.push(
      dataItalia(giorno)
    );

  }

  return date;
}


/*
========================================================
STATO PARTITA
========================================================
*/

function statoPartita(event) {

  if (
    !event ||
    !event.status
  ) {

    return "In programma";

  }

  const status =
    event.status;

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
SQUADRA
========================================================
*/

function datiSquadra(team) {

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
FORMATTA TURNO
========================================================
*/

function formattaTurno(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  const testo =
    String(value).trim();

  if (!testo) {
    return "";
  }

  const lower =
    testo.toLowerCase();


  if (
    lower.includes("quarter") ||
    lower.includes("quarti")
  ) {

    return "Quarti di finale";

  }


  if (
    lower.includes("semi")
  ) {

    return "Semifinale";

  }


  if (
    lower === "final" ||
    lower === "finale" ||
    lower.includes(" final")
  ) {

    return "Finale";

  }


  if (
    lower.includes("playout") ||
    lower.includes("play-out") ||
    lower.includes("relegation")
  ) {

    return "Playout";

  }


  if (
    lower.includes("promotion")
  ) {

    return "Playoff Promozione";

  }


  return testo;

}


/*
========================================================
DETERMINA GIRONE
========================================================
*/

function determinaGirone(event) {

  if (!event) {
    return "";
  }

  const tournament =
    event.tournament || {};

  const uniqueTournament =
    tournament.uniqueTournament || {};

  const tournamentId =
    Number(
      uniqueTournament.id ||
      tournament.id ||
      0
    );

  const configurazione =
    TORNEI_SERIE_C[
      tournamentId
    ];

  if (configurazione) {

    return configurazione.girone;

  }


  const nome =
    String(
      uniqueTournament.name ||
      tournament.name ||
      ""
    );


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
DETERMINA TURNO
========================================================
*/

function determinaTurno(event) {

  if (!event) {
    return "";
  }

  const girone =
    determinaGirone(event);

  const tournament =
    event.tournament || {};

  const uniqueTournament =
    tournament.uniqueTournament || {};

  const tournamentId =
    Number(
      uniqueTournament.id ||
      tournament.id ||
      0
    );


  /*
  ------------------------------------------------------
  CAMPIONATO
  ------------------------------------------------------
  */

  if (
    tournamentId === 11445 ||
    tournamentId === 11447 ||
    tournamentId === 11446
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

      return formattaTurno(
        event.roundInfo.name
      );

    }

  }


  /*
  ------------------------------------------------------
  PLAYOFF NAZIONALI
  ------------------------------------------------------
  */

  if (
    tournamentId === 11452 ||
    girone === "Playoff Nazionali"
  ) {

    if (
      event.roundInfo &&
      event.roundInfo.name
    ) {

      return formattaTurno(
        event.roundInfo.name
      );

    }

    if (
      event.roundInfo &&
      event.roundInfo.slug
    ) {

      return formattaTurno(
        event.roundInfo.slug
      );

    }

    if (
      event.phase &&
      event.phase.name
    ) {

      return formattaTurno(
        event.phase.name
      );

    }

    if (
      event.phase &&
      event.phase.slug
    ) {

      return formattaTurno(
        event.phase.slug
      );

    }

  }


  /*
  ------------------------------------------------------
  FALLBACK
  ------------------------------------------------------
  */

  if (
    event.roundInfo &&
    event.roundInfo.name
  ) {

    return formattaTurno(
      event.roundInfo.name
    );

  }

  if (
    event.roundInfo &&
    event.roundInfo.slug
  ) {

    return formattaTurno(
      event.roundInfo.slug
    );

  }

  return "";

}


/*
========================================================
DATA / ORA PARTITA
========================================================
*/

function datiDataOra(event) {

  if (
    !event ||
    !event.startTimestamp
  ) {

    return {
      data: "",
      ora: "",
      timestamp: null
    };

  }

  const date =
    new Date(
      event.startTimestamp * 1000
    );

  const data =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(date);

  const ora =
    new Intl.DateTimeFormat(
      "it-IT",
      {
        timeZone: TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    ).format(date);

  return {

    data,
    ora,
    timestamp:
      event.startTimestamp

  };

}


/*
========================================================
PARTITA NORMALIZZATA
========================================================
*/

function normalizzaPartita(event) {

  if (!event) {
    return null;
  }

  const casa =
    datiSquadra(
      event.homeTeam
    );

  const trasferta =
    datiSquadra(
      event.awayTeam
    );

  const dataOra =
    datiDataOra(
      event
    );

  const homeScore =
    event.homeScore || {};

  const awayScore =
    event.awayScore || {};


  return {

    id:
      event.id ||
      null,

    external_id:
      String(
        event.id ||
        ""
      ),

    competizione:
      "Serie C",

    girone:
      determinaGirone(
        event
      ),

    turno:
      determinaTurno(
        event
      ),

    data:
      dataOra.data,

    ora:
      dataOra.ora,

    timestamp:
      dataOra.timestamp,

    stato:
      statoPartita(
        event
      ),

    casa: {

      id:
        casa.id,

      nome:
        casa.nome,

      logo:
        casa.logo,

      gol:
        homeScore.current !== undefined
          ? homeScore.current
          : null

    },

    trasferta: {

      id:
        trasferta.id,

      nome:
        trasferta.nome,

      logo:
        trasferta.logo,

      gol:
        awayScore.current !== undefined
          ? awayScore.current
          : null

    },

    punteggio: {

      casa:
        homeScore.current !== undefined
          ? homeScore.current
          : null,

      trasferta:
        awayScore.current !== undefined
          ? awayScore.current
          : null,

      casa_primo_tempo:
        homeScore.period1 !== undefined
          ? homeScore.period1
          : null,

      trasferta_primo_tempo:
        awayScore.period1 !== undefined
          ? awayScore.period1
          : null,

      casa_extra_time:
        homeScore.extra1 !== undefined
          ? homeScore.extra1
          : null,

      trasferta_extra_time:
        awayScore.extra1 !== undefined
          ? awayScore.extra1
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
      event.id
        ? `https://www.sofascore.com/event/${event.id}`
        : ""

  };

}


/*
========================================================
RECUPERA PARTITE DI UN GIORNO
========================================================
*/

async function recuperaPartiteGiorno(
  data
) {

  try {

    const risultato =
      await sofascore(
        `/sport/football/scheduled-events/${data}`
      );

    if (
      !risultato ||
      !Array.isArray(
        risultato.events
      )
    ) {

      return [];

    }


    return risultato.events.filter(
      event => {

        const tournament =
          event.tournament || {};

        const uniqueTournament =
          tournament.uniqueTournament || {};

        const tournamentId =
          Number(
            uniqueTournament.id ||
            0
          );

        return Boolean(
          TORNEI_SERIE_C[
            tournamentId
          ]
        );

      }
    );

  } catch (error) {

    console.log(
      "Errore recupero data " +
      data +
      ": " +
      error.message
    );

    return [];

  }

}


/*
========================================================
RECUPERA TUTTA LA SETTIMANA
========================================================
*/

async function recuperaSettimana() {

  const date =
    dateSettimana();

  const risultati = [];

  for (
    const data of date
  ) {

    const partite =
      await recuperaPartiteGiorno(
        data
      );

    risultati.push(
      ...partite
    );

  }


  /*
  ------------------------------------------------------
  DEDUPLICAZIONE
  ------------------------------------------------------
  */

  const mappa =
    new Map();

  for (
    const event of risultati
  ) {

    if (
      event &&
      event.id
    ) {

      mappa.set(
        String(event.id),
        event
      );

    }

  }


  const normalizzate =
    Array.from(
      mappa.values()
    ).map(
      event =>
        normalizzaPartita(
          event
        )
    );


  normalizzate.sort(
    (a, b) => {

      return (
        (a.timestamp || 0) -
        (b.timestamp || 0)
      );

    }
  );


  return normalizzate;

}


/*
========================================================
RECUPERA PARTITA SINGOLA
========================================================
*/

async function recuperaPartita(
  eventId
) {

  const data =
    await sofascore(
      `/event/${eventId}`
    );

  return (
    data.event ||
    data
  );

}


/*
========================================================
STATISTICHE
========================================================
*/

async function recuperaStatistiche(
  eventId
) {

  return await sofascore(
    `/event/${eventId}/statistics`
  );

}


/*
========================================================
EVENTI
========================================================
*/

async function recuperaEventi(
  eventId
) {

  return await sofascore(
    `/event/${eventId}/incidents`
  );

}


/*
========================================================
FORMAZIONI
========================================================
*/

async function recuperaFormazioni(
  eventId
) {

  return await sofascore(
    `/event/${eventId}/lineups`
  );

}


/*
========================================================
SQUADRA
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
JSON
========================================================
*/

function rispostaJson(
  response,
  status,
  dati
) {

  response.statusCode =
    status;

  response.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  response.end(
    JSON.stringify(
      dati,
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

module.exports =
async function handler(
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

      return rispostaJson(
        response,
        200,
        {

          api:
            "API Serie C Italia",

          fonte:
            "Sofascore",

          stato:
            "online",

          timezone:
            TIMEZONE,

          settimana:
            {
              da:
                dataItalia(
                  lunediSettimana()
                ),

              a:
                dataItalia(
                  domenicaSettimana()
                )
            },

          competizioni: [

            {
              id:
                11445,

              competizione:
                "Serie C",

              girone:
                "Girone A"
            },

            {
              id:
                11447,

              competizione:
                "Serie C",

              girone:
                "Girone B"
            },

            {
              id:
                11446,

              competizione:
                "Serie C",

              girone:
                "Girone C"
            },

            {
              id:
                11452,

              competizione:
                "Serie C",

              girone:
                "Playoff Nazionali"
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
      pathname ===
      "/api/health"
    ) {

      return rispostaJson(
        response,
        200,
        {

          status:
            "ok",

          api:
            "Serie C",

          fonte:
            "Sofascore",

          timezone:
            TIMEZONE

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

      return rispostaJson(
        response,
        200,
        {

          competizioni: [

            {
              id:
                11445,

              competizione:
                "Serie C",

              girone:
                "Girone A"
            },

            {
              id:
                11447,

              competizione:
                "Serie C",

              girone:
                "Girone B"
            },

            {
              id:
                11446,

              competizione:
                "Serie C",

              girone:
                "Girone C"
            },

            {
              id:
                11452,

              competizione:
                "Serie C",

              girone:
                "Playoff Nazionali"
            }

          ]

        }
      );

    }


    /*
    ====================================================
    PARTITE DELLA SETTIMANA
    ====================================================
    */

    if (
      pathname ===
      "/api/partite"
    ) {

      const partite =
        await recuperaSettimana();


      return rispostaJson(
        response,
        200,
        {

          competizione:
            "Serie C",

          settimana: {

            da:
              dataItalia(
                lunediSettimana()
              ),

            a:
              dataItalia(
                domenicaSettimana()
              )

          },

          totale:
            partite.length,

          partite:
            partite

        }
      );

    }


    /*
    ====================================================
    PARTITE SOLO GIRONE A
    ====================================================
    */

    if (
      pathname ===
      "/api/partite/girone-a"
    ) {

      const partite =
        await recuperaSettimana();

      return rispostaJson(
        response,
        200,
        {

          competizione:
            "Serie C",

          girone:
            "Girone A",

          partite:
            partite.filter(
              p =>
                p.girone ===
                "Girone A"
            )

        }
      );

    }


    /*
    ====================================================
    PARTITE SOLO GIRONE B
    ====================================================
    */

    if (
      pathname ===
      "/api/partite/girone-b"
    ) {

      const partite =
        await recuperaSettimana();

      return rispostaJson(
        response,
        200,
        {

          competizione:
            "Serie C",

          girone:
            "Girone B",

          partite:
            partite.filter(
              p =>
                p.girone ===
                "Girone B"
            )

        }
      );

    }


    /*
    ====================================================
    PARTITE SOLO GIRONE C
    ====================================================
    */

    if (
      pathname ===
      "/api/partite/girone-c"
    ) {

      const partite =
        await recuperaSettimana();

      return rispostaJson(
        response,
        200,
        {

          competizione:
            "Serie C",

          girone:
            "Girone C",

          partite:
            partite.filter(
              p =>
                p.girone ===
                "Girone C"
            )

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

      const partite =
        await recuperaSettimana();

      return rispostaJson(
        response,
        200,
        {

          competizione:
            "Serie C",

          girone:
            "Playoff Nazionali",

          partite:
            partite.filter(
              p =>
                p.girone ===
                "Playoff Nazionali"
            )

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

      return rispostaJson(
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
    STATISTICHE
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

      return rispostaJson(
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
    EVENTI / CRONACA
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

      return rispostaJson(
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

      return rispostaJson(
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

      return rispostaJson(
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
    ROSA
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

      return rispostaJson(
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

    return rispostaJson(
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

    return rispostaJson(
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
