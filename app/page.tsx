import { listTournaments, type TournamentWithTeams } from "../lib/tournaments";
import ContactForm from "./contact-form";
import VisitorTracker from "./visitor-tracker";

export const dynamic = "force-dynamic";

const fallbackEvents: TournamentWithTeams[] = [
  {
    id: 1,
    eventDate: "2026-08-30",
    sport: "Softball",
    division: "9U · B Level",
    status: "Room for one more",
    format: "3-game guarantee · Round robin",
    entryFee: 350,
    registrationUrl: "https://forms.gle/bnM2JpHxX5b4Jff96",
    scheduleKey: null,
    sortOrder: 1,
    games: [],
    teams: [
      { id: 1, tournamentId: 1, name: "CPU Storm 9U B" },
      { id: 2, tournamentId: 1, name: "Lady Expos of Dubuque 9U B" },
      { id: 3, tournamentId: 1, name: "Iowa Kraken 9U B" },
    ],
  },
  {
    id: 2,
    eventDate: "2026-09-12",
    sport: "Baseball",
    division: "12U · AA/AAA",
    status: "Open registration",
    format: "3-game guarantee · Round robin",
    entryFee: 350,
    registrationUrl: "https://forms.gle/bnM2JpHxX5b4Jff96",
    scheduleKey: null,
    sortOrder: 2,
    games: [],
    teams: [{ id: 4, tournamentId: 2, name: "West Delaware" }],
  },
  {
    id: 3,
    eventDate: "2026-09-13",
    sport: "Baseball",
    division: "9U",
    status: "Open registration",
    format: "3-game guarantee · Round robin",
    entryFee: 350,
    registrationUrl: "https://forms.gle/bnM2JpHxX5b4Jff96",
    scheduleKey: null,
    sortOrder: 3,
    games: [],
    teams: [],
  },
  {
    id: 4,
    eventDate: "2026-09-20",
    sport: "Baseball",
    division: "8U · Coach Pitch",
    status: "Open registration",
    format: "3-game guarantee · Round robin",
    entryFee: 350,
    registrationUrl: "https://forms.gle/bnM2JpHxX5b4Jff96",
    scheduleKey: null,
    sortOrder: 4,
    games: [],
    teams: [],
  },
  {
    id: 5,
    eventDate: "2026-10-11",
    sport: "Softball",
    division: "10U · C Level",
    status: "Full",
    format: "3-game guarantee · Round robin",
    entryFee: 350,
    registrationUrl: "https://forms.gle/bnM2JpHxX5b4Jff96",
    scheduleKey: null,
    sortOrder: 5,
    games: [],
    teams: [
      { id: 5, tournamentId: 5, name: "Springville 10U C" },
      { id: 6, tournamentId: 5, name: "Lincoln Highway Devil Dawgs 10U C" },
      { id: 7, tournamentId: 5, name: "Monticello Panther Prospects 10U C" },
      { id: 8, tournamentId: 5, name: "CPU Storm 10U C" },
    ],
  },
];

const galleryPhotos = [
  {
    src: "/gallery/00-simon-diamond-logo.png",
    alt: "Simon Diamond logo",
    logo: true,
  },
  {
    src: "/gallery/01-softball-player.jpg",
    alt: "Softball player at Simon Diamond",
  },
  {
    src: "/gallery/02-night-game.jpg",
    alt: "A night game under the lights at Simon Diamond",
  },
  {
    src: "/gallery/03-team-at-scoreboard.jpg",
    alt: "Youth team gathered at the Simon Diamond scoreboard",
  },
  {
    src: "/gallery/04-day-game.jpg",
    alt: "A daytime tournament game at Simon Diamond",
  },
  {
    src: "/gallery/05-teams-on-field.jpg",
    alt: "Teams gathered together on the field",
  },
  {
    src: "/gallery/06-shirt-winners.jpg",
    alt: "Players with Simon Diamond shirts",
  },
  {
    src: "/gallery/07-player-prize.jpg",
    alt: "Player holding a game ball and Simon Diamond shirt",
  },
  {
    src: "/gallery/08-night-player-prize.jpg",
    alt: "Player with a Simon Diamond shirt and prize under the lights",
  },
  {
    src: "/gallery/09-young-players-prizes.jpg",
    alt: "Young players showing their Simon Diamond prizes",
  },
  {
    src: "/gallery/10-young-player-prize.jpg",
    alt: "Young player holding a Simon Diamond shirt and prize",
  },
];

function dateParts(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return {
    day: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date),
    month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
    number: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date),
    long: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(date),
  };
}

function statusLabel(status: string) {
  if (status === "1 team needed") return "Room for one more";
  if (status === "2 teams needed") return "Room for two more";
  if (status === "3 teams needed") return "Room for three more";
  if (status === "4 teams needed") return "Room for four more";
  return status;
}

function scoreData(tournament: TournamentWithTeams) {
  const rows = tournament.teams.map((team) => ({
    id: team.id,
    name: team.name,
    wins: 0,
    losses: 0,
    ties: 0,
    countedGames: 0,
    runsFor: 0,
    runsAgainst: 0,
    runDifferential: 0,
  }));
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const game of tournament.games) {
    const home = byId.get(game.homeTeamId);
    const away = byId.get(game.awayTeamId);
    if (!home || !away) continue;
    if (game.homeCounts) {
      home.countedGames++;
      home.runsFor += game.homeScore;
      home.runsAgainst += game.awayScore;
    }
    if (game.awayCounts) {
      away.countedGames++;
      away.runsFor += game.awayScore;
      away.runsAgainst += game.homeScore;
    }
    const margin = Math.min(8, Math.abs(game.homeScore - game.awayScore));
    if (game.homeScore > game.awayScore) {
      if (game.homeCounts) {
        home.wins++;
        home.runDifferential += margin;
      }
      if (game.awayCounts) {
        away.losses++;
        away.runDifferential -= margin;
      }
    } else if (game.awayScore > game.homeScore) {
      if (game.awayCounts) {
        away.wins++;
        away.runDifferential += margin;
      }
      if (game.homeCounts) {
        home.losses++;
        home.runDifferential -= margin;
      }
    } else {
      if (game.homeCounts) home.ties++;
      if (game.awayCounts) away.ties++;
    }
  }
  rows.sort((a, b) => {
    const aPct =
      (a.wins + a.ties * 0.5) / Math.max(1, a.wins + a.losses + a.ties);
    const bPct =
      (b.wins + b.ties * 0.5) / Math.max(1, b.wins + b.losses + b.ties);
    if (bPct !== aPct) return bPct - aPct;
    const meetings = tournament.games.filter(
      (game) =>
        game.homeCounts &&
        game.awayCounts &&
        ((game.homeTeamId === a.id && game.awayTeamId === b.id) ||
          (game.homeTeamId === b.id && game.awayTeamId === a.id)),
    );
    let headToHead = 0;
    for (const game of meetings) {
      const aScore = game.homeTeamId === a.id ? game.homeScore : game.awayScore;
      const bScore = game.homeTeamId === b.id ? game.homeScore : game.awayScore;
      headToHead += aScore > bScore ? 1 : aScore < bScore ? -1 : 0;
    }
    if (headToHead) return -headToHead;
    const aAverageRunsAllowed = a.runsAgainst / Math.max(1, a.countedGames);
    const bAverageRunsAllowed = b.runsAgainst / Math.max(1, b.countedGames);
    const aAverageDifferential =
      a.runDifferential / Math.max(1, a.countedGames);
    const bAverageDifferential =
      b.runDifferential / Math.max(1, b.countedGames);
    return (
      aAverageRunsAllowed - bAverageRunsAllowed ||
      bAverageDifferential - aAverageDifferential ||
      a.name.localeCompare(b.name)
    );
  });
  return {
    rows,
    teamNames: new Map(tournament.teams.map((team) => [team.id, team.name])),
  };
}

function PastTournamentCard({ tournament }: { tournament: TournamentWithTeams }) {
  const date = dateParts(tournament.eventDate);
  const scores = scoreData(tournament);
  return (
    <details className="tournament-card completed">
      <summary>
        <div className="date-block"><strong>{date.number}</strong><span>{date.month}</span></div>
        <div className="event-title"><small>{date.day} · {tournament.sport}</small><h3>{tournament.division}</h3><span className="status full">Completed</span></div>
        <span className="expand">+</span>
      </summary>
      <div className="card-details">
        <div><p className="detail-label">Who played</p>{tournament.teams.length ? <ul>{tournament.teams.map(team => <li key={team.id}><span>✓</span>{team.name}</li>)}</ul> : <p className="empty">No teams listed.</p>}</div>
        <div className="event-facts"><p><strong>Format</strong><span>{tournament.format}</span></p><p><strong>Entry</strong><span>${tournament.entryFee} per team</span></p></div>
        {tournament.games.length > 0 && <section className="scores-standings">
          <div><p className="detail-label">Final standings</p><div className="standings-table"><div className="standings-head"><span>Team</span><span>W</span><span>L</span><span>T</span><span>RA/G</span><span>Diff/G</span></div>{scores.rows.map((row, index) => <div key={row.id}><strong>{index + 1}. {row.name}</strong><span>{row.wins}</span><span>{row.losses}</span><span>{row.ties}</span><span>{(row.runsAgainst / Math.max(1, row.countedGames)).toFixed(2)}</span><span>{row.runDifferential / Math.max(1, row.countedGames) > 0 ? "+" : ""}{(row.runDifferential / Math.max(1, row.countedGames)).toFixed(2)}</span></div>)}</div><small className="tiebreak-note">Order: record, head-to-head, average runs allowed, then average run differential capped at 8 per game.</small></div>
          <div><p className="detail-label">Final scores</p><div className="public-score-list">{tournament.games.map(game => <p key={game.id}><small>{game.gameLabel || "Final"}</small><strong>{scores.teamNames.get(game.homeTeamId)} <b>{game.homeScore}</b> – <b>{game.awayScore}</b> {scores.teamNames.get(game.awayTeamId)}</strong></p>)}</div></div>
        </section>}
        {tournament.scheduleKey && <a className="schedule-graphic" href={`/api/tournaments/${tournament.id}/schedule`} target="_blank" rel="noopener noreferrer"><p className="detail-label">Game-day schedule</p><img src={`/api/tournaments/${tournament.id}/schedule`} alt={`${tournament.division} game-day schedule`} /></a>}
      </div>
    </details>
  );
}

export default async function Home() {
  let tournaments = fallbackEvents;
  try {
    const saved = await listTournaments();
    if (saved.length) tournaments = saved;
  } catch {
    /* Database is provisioned during deployment. */
  }
  const displayedTournaments = tournaments.filter(tournament => tournament.status !== "Completed").sort((a, b) => a.sortOrder - b.sortOrder);
  const pastTournaments = tournaments.filter(tournament => tournament.status === "Completed").sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  return (
    <main>
      <VisitorTracker />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Simon Diamond home">
          <img
            className="brand-logo"
            src="/gallery/00-simon-diamond-logo.png"
            alt="Simon Diamond"
          />
          <span>
            <strong>SIMON DIAMOND</strong>
            <small>Center Point, Iowa</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#tournaments">Tournaments</a>
          {pastTournaments.length > 0 && (
            <a href="#past-tournaments">Past Tournaments</a>
          )}
          <a href="#experience">The Experience</a>
          <a href="#gallery">Photos</a>
          <a className="manage-nav-button" href="/manage">
            Manage Website
          </a>
          <a className="nav-button contact-button" href="#contact">
            Contact Us
          </a>
        </nav>
      </header>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Youth baseball &amp; softball on the farm</p>
          <h1>
            More than a tournament.
            <br />
            <em>It’s a day at the Diamond.</em>
          </h1>
          <p className="hero-text">
            Competitive games, a relaxed farm atmosphere, tailgating, and room
            for families to settle in and enjoy the day.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#tournaments">
              Find a tournament <span>↓</span>
            </a>
            <a className="text-link" href="#experience">
              What it’s like to play here →
            </a>
          </div>
        </div>
        <div className="scoreboard" aria-label="Tournament highlights">
          <p>SIMON DIAMOND</p>
          <div>
            <span>3</span>
            <small>
              GAMES
              <br />
              GUARANTEED
            </small>
          </div>
          <div>
            <span>$350</span>
            <small>
              TEAM
              <br />
              ENTRY
            </small>
          </div>
          <footer>NO GATE FEE · FOOD TRUCK · TAILGATING WELCOME</footer>
        </div>
      </section>
      <section className="tournament-section" id="tournaments">
        <div className="section-heading">
          <div>
            <p className="eyebrow red">2026 schedule</p>
            <h2>Upcoming tournaments</h2>
          </div>
          <p>Click any event to see who’s coming and claim an opening.</p>
        </div>
        <div className="tournament-grid">
          {displayedTournaments.map((tournament, index) => {
            const date = dateParts(tournament.eventDate);
            const displayStatus = statusLabel(tournament.status);
            const registrationOpen =
              tournament.status !== "Full" &&
              tournament.status !== "Canceled" &&
              tournament.status !== "Registration Closed" &&
              tournament.status !== "Completed" &&
              Boolean(tournament.registrationUrl);
            const scores = scoreData(tournament);
            return (
              <details className="tournament-card" key={tournament.id} open={index === 0}>
                  <summary>
                    <div className="date-block">
                      <strong>{date.number}</strong>
                      <span>{date.month}</span>
                    </div>
                    <div className="event-title">
                      <small>
                        {date.day} · {tournament.sport}
                      </small>
                      <h3>{tournament.division}</h3>
                      <span
                        className={
                          displayStatus.startsWith("Room for")
                            ? "status urgent"
                            : displayStatus === "Full" ||
                                displayStatus === "Registration Closed" ||
                                displayStatus === "Completed"
                              ? "status full"
                              : "status"
                        }
                      >
                        {displayStatus}
                      </span>
                    </div>
                    <span className="expand">+</span>
                  </summary>
                  <div className="card-details">
                    <div>
                    <p className="detail-label">
                      {tournament.status === "Completed" ? "Who played" : "Who’s coming"}
                    </p>
                      {tournament.teams.length ? (
                        <ul>
                          {tournament.teams.map((team) => (
                            <li key={team.id}>
                              <span>✓</span>
                              {team.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty">No teams listed.</p>
                      )}
                    </div>
                    <div className="event-facts">
                      <p>
                        <strong>Format</strong>
                        <span>{tournament.format}</span>
                      </p>
                      <p>
                        <strong>Entry</strong>
                        <span>${tournament.entryFee} per team</span>
                      </p>
                      <div className="registration-actions">
                        {registrationOpen && (
                          <a
                            className="register-button"
                            href={tournament.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Register Here →
                          </a>
                        )}
                        {tournament.status !== "Completed" && (
                          <a className="contact-link" href="#contact">
                            Ask a question
                          </a>
                        )}
                      </div>
                    </div>
                    {tournament.games.length > 0 && (
                      <section className="scores-standings">
                        <div>
                          <p className="detail-label">
                            {tournament.status === "Completed"
                              ? "Final standings"
                              : "Current standings"}
                          </p>
                          <div className="standings-table">
                            <div className="standings-head">
                              <span>Team</span>
                              <span>W</span>
                              <span>L</span>
                              <span>T</span>
                              <span>RA/G</span>
                              <span>Diff/G</span>
                            </div>
                            {scores.rows.map((row, standingIndex) => (
                              <div key={row.id}>
                                <strong>
                                  {standingIndex + 1}. {row.name}
                                </strong>
                                <span>{row.wins}</span>
                                <span>{row.losses}</span>
                                <span>{row.ties}</span>
                                <span>
                                  {(
                                    row.runsAgainst /
                                    Math.max(1, row.countedGames)
                                  ).toFixed(2)}
                                </span>
                                <span>
                                  {row.runDifferential /
                                    Math.max(1, row.countedGames) >
                                  0
                                    ? "+"
                                    : ""}
                                  {(
                                    row.runDifferential /
                                    Math.max(1, row.countedGames)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <small className="tiebreak-note">
                            Order: record, head-to-head, average runs allowed,
                            then average run differential capped at 8 per game.
                          </small>
                        </div>
                        <div>
                          <p className="detail-label">Final scores</p>
                          <div className="public-score-list">
                            {tournament.games.map((game) => (
                              <p key={game.id}>
                                <small>{game.gameLabel || "Final"}</small>
                                <strong>
                                  {scores.teamNames.get(game.homeTeamId)}{" "}
                                  <b>{game.homeScore}</b> –{" "}
                                  <b>{game.awayScore}</b>{" "}
                                  {scores.teamNames.get(game.awayTeamId)}
                                </strong>
                              </p>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                    {tournament.scheduleKey && (
                      <a
                        className="schedule-graphic"
                        href={`/api/tournaments/${tournament.id}/schedule`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open the ${tournament.division} game-day schedule larger`}
                      >
                        <p className="detail-label">Game-day schedule</p>
                        <img
                          src={`/api/tournaments/${tournament.id}/schedule`}
                          alt={`${tournament.division} game-day schedule`}
                        />
                      </a>
                    )}
                  </div>
              </details>
            );
          })}
        </div>
      </section>
      <section className="experience" id="experience">
        <div>
          <p className="eyebrow">The Simon Diamond experience</p>
          <h2>
            Ball on the field.
            <br />
            Good times beyond it.
          </h2>
        </div>
        <div className="experience-grid">
          <article>
            <span>01</span>
            <h3>Play on the farm</h3>
            <p>
              A private, lighted field surrounded by open Iowa countryside—not
              another crowded sports complex.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Settle in for the day</h3>
            <p>
              Bring the chairs and the cooler. Tailgating is welcome, and the
              food truck keeps everybody fed.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Keep it simple</h3>
            <p>
              No gate fee, no surprise charges, and no administration fee when
              weather cancels the day.
            </p>
          </article>
        </div>
      </section>
      <section className="gallery-section" id="gallery">
        <div className="gallery-heading">
          <div>
            <p className="eyebrow red">Life at the Diamond</p>
            <h2>Photos from the field</h2>
          </div>
          <p>Great games, good people, and memories made on the farm.</p>
        </div>
        <div className="photo-grid">
          {galleryPhotos.map((photo, index) => (
            <a
              className={photo.logo ? "photo-card logo-card" : "photo-card"}
              href={photo.src}
              target="_blank"
              rel="noopener noreferrer"
              key={photo.src}
              aria-label={`Open photo ${index + 1} larger`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading={index > 3 ? "lazy" : "eager"}
              />
            </a>
          ))}
        </div>
      </section>
      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <p className="eyebrow">Questions?</p>
          <h2>Contact Simon Diamond</h2>
          <p>
            Ask about a tournament, registration, or what it’s like to play
            here. Your message will go directly to the tournament manager.
          </p>
        </div>
        <ContactForm
          tournamentOptions={tournaments
            .filter((tournament) => tournament.status !== "Completed")
            .map((tournament) => {
              const date = dateParts(tournament.eventDate);
              return `${date.long} — ${tournament.division} ${tournament.sport}`;
            })}
        />
      </section>
      {pastTournaments.length > 0 && <section className="tournament-section past-tournaments-section" id="past-tournaments">
        <div className="section-heading"><div><p className="eyebrow red">Tournament archive</p><h2>Past tournaments</h2></div><p>Open an event to see its final scores, standings, teams, and schedule.</p></div>
        <div className="tournament-grid">{pastTournaments.map(tournament => <PastTournamentCard key={tournament.id} tournament={tournament} />)}</div>
      </section>}
      <footer className="footer">
        <div className="brand">
          <img
            className="brand-logo"
            src="/gallery/00-simon-diamond-logo.png"
            alt="Simon Diamond"
          />
          <span>
            <strong>SIMON DIAMOND</strong>
            <small>Center Point, Iowa</small>
          </span>
        </div>
        <p>Baseball, softball, and a day your team will remember.</p>
        <a href="#contact">Contact Simon Diamond →</a>
      </footer>
    </main>
  );
}
