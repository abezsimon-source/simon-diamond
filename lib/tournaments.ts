import { asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { games, teams, tournaments } from "../db/schema";

export type TournamentWithTeams = typeof tournaments.$inferSelect & {
  teams: (typeof teams.$inferSelect)[];
  games: (typeof games.$inferSelect)[];
};

export async function listTournaments(): Promise<TournamentWithTeams[]> {
  const db = await getDb();
  const events = await db.select().from(tournaments).orderBy(asc(tournaments.eventDate), asc(tournaments.sortOrder));
  const allTeams = await db.select().from(teams).orderBy(asc(teams.id));
  const allGames = await db.select().from(games).orderBy(asc(games.id));
  return events.map((event) => ({
    ...event,
    teams: allTeams.filter((team) => team.tournamentId === event.id),
    games: allGames.filter((game) => game.tournamentId === event.id),
  }));
}

export async function listTeamsForTournament(tournamentId: number) {
  return (await getDb()).select().from(teams).where(eq(teams.tournamentId, tournamentId)).orderBy(asc(teams.id));
}
