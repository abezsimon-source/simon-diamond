"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Team = { id: number; tournamentId: number; name: string };
type Game = {
  id: number;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  homeCounts: boolean;
  awayCounts: boolean;
  gameLabel: string;
};
type Tournament = {
  id: number;
  eventDate: string;
  sport: string;
  division: string;
  status: string;
  format: string;
  entryFee: number;
  registrationUrl: string;
  scheduleKey: string | null;
  teams: Team[];
  games: Game[];
};

const statuses = [
  "Open registration",
  "Room for one more",
  "Room for two more",
  "Room for three more",
  "Room for four more",
  "Registration Closed",
  "Completed",
  "Full",
  "Canceled",
];

function currentStatus(status: string) {
  if (status === "1 team needed") return "Room for one more";
  if (status === "2 teams needed") return "Room for two more";
  if (status === "3 teams needed") return "Room for three more";
  if (status === "4 teams needed") return "Room for four more";
  return status;
}

async function prepareScheduleImage(file: File) {
  const maximumUploadSize = 750 * 1024;
  if (file.size <= maximumUploadSize) return file;

  const image = await createImageBitmap(file);
  const longestSide = Math.max(image.width, image.height);
  const scale = Math.min(1, 1800 / longestSide);
  let width = Math.max(1, Math.round(image.width * scale));
  let height = Math.max(1, Math.round(image.height * scale));
  let quality = 0.88;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the image.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) throw new Error("This browser could not prepare the image.");
    if (blob.size <= maximumUploadSize) {
      image.close();
      return new File([blob], "game-day-schedule.jpg", { type: "image/jpeg" });
    }
    quality = Math.max(0.58, quality - 0.08);
    width = Math.max(1, Math.round(width * 0.88));
    height = Math.max(1, Math.round(height * 0.88));
  }

  image.close();
  throw new Error("The image is too large. Please use a smaller image.");
}

export default function ManageTournaments() {
  const [events, setEvents] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/tournaments", { cache: "no-store" });
    const data = await response.json();
    setEvents(data.tournaments || []);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function request(url: string, options: RequestInit) {
    setMessage("Saving…");
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Something went wrong.");
      return false;
    }
    await load();
    setMessage("Saved. The public website is updated.");
    return true;
  }

  async function createTournament(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await request("/api/tournaments", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (ok) {
      event.currentTarget.reset();
      setShowNew(false);
    }
  }

  if (loading) return <p className="manage-loading">Loading tournaments…</p>;

  return (
    <>
      <div className="manage-actions">
        <button className="manage-primary" onClick={() => setShowNew(!showNew)}>
          {showNew ? "Cancel" : "+ Add tournament"}
        </button>
        <span aria-live="polite">{message}</span>
      </div>
      {showNew && (
        <form className="new-event-form" onSubmit={createTournament}>
          <label>
            Date
            <input required type="date" name="eventDate" />
          </label>
          <label>
            Sport
            <select name="sport">
              <option>Baseball</option>
              <option>Softball</option>
            </select>
          </label>
          <label>
            Division
            <input
              required
              name="division"
              placeholder="Example: 10U · C Level"
            />
          </label>
          <label>
            Status
            <select name="status">
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Entry fee
            <input type="number" name="entryFee" defaultValue="350" />
          </label>
          <label className="wide">
            Format
            <input
              name="format"
              defaultValue="3-game guarantee · Round robin"
            />
          </label>
          <label className="wide">
            Registration link
            <input
              type="url"
              name="registrationUrl"
              placeholder="Paste a Google Form link"
            />
          </label>
          <button className="manage-primary" type="submit">
            Create tournament
          </button>
        </form>
      )}
      <div className="manage-list">
        {events.map((event) => (
          <TournamentEditor
            key={event.id}
            event={event}
            request={request}
            reload={load}
          />
        ))}
      </div>
    </>
  );
}

function TournamentEditor({
  event,
  request,
  reload,
}: {
  event: Tournament;
  request: (url: string, options: RequestInit) => Promise<boolean>;
  reload: () => Promise<void>;
}) {
  const [teamName, setTeamName] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [uploadingSchedule, setUploadingSchedule] = useState(false);
  async function save(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    await request(`/api/tournaments/${event.id}`, {
      method: "PATCH",
      body: JSON.stringify(Object.fromEntries(form)),
    });
  }
  async function addTeam(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!teamName.trim()) return;
    const ok = await request(`/api/tournaments/${event.id}/teams`, {
      method: "POST",
      body: JSON.stringify({ name: teamName }),
    });
    if (ok) setTeamName("");
  }
  async function addScore(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    const ok = await request(`/api/tournaments/${event.id}/games`, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (ok) formEvent.currentTarget.reset();
  }
  const teamNameById = new Map(event.teams.map((team) => [team.id, team.name]));
  async function removeTournament() {
    if (!confirm(`Delete ${event.division} on ${event.eventDate}?`)) return;
    await request(`/api/tournaments/${event.id}`, { method: "DELETE" });
  }
  async function uploadSchedule(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formElement = formEvent.currentTarget;
    const selectedFile = new FormData(formElement).get("schedule");
    const file = selectedFile;
    if (!(file instanceof File) || !file.size) return;
    setUploadingSchedule(true);
    setScheduleMessage(
      file.size > 750 * 1024 ? "Preparing image…" : "Uploading…",
    );
    try {
      const preparedFile = await prepareScheduleImage(file);
      const form = new FormData();
      form.set("schedule", preparedFile);
      setScheduleMessage("Uploading…");
      const response = await fetch(`/api/tournaments/${event.id}/schedule`, {
        method: "POST",
        body: form,
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || "The schedule could not be uploaded.");
      formElement.reset();
      setScheduleMessage("Schedule uploaded.");
      await reload();
    } catch (error) {
      setScheduleMessage(
        error instanceof Error
          ? error.message
          : "The schedule could not be uploaded. Please try again.",
      );
    } finally {
      setUploadingSchedule(false);
    }
  }
  async function removeSchedule() {
    setScheduleMessage("Removing…");
    const response = await fetch(`/api/tournaments/${event.id}/schedule`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok)
      setScheduleMessage(data.error || "The schedule could not be removed.");
    else {
      setScheduleMessage("Schedule removed.");
      await reload();
    }
  }
  return (
    <article className="manage-card">
      <div className="event-edit-container">
        <form className="event-edit-form" onSubmit={save}>
          <div className="manage-card-heading">
            <h2>
              {event.division} {event.sport}
            </h2>
            <button
              type="button"
              className="delete-link"
              onClick={removeTournament}
            >
              Delete tournament
            </button>
          </div>
          <div className="edit-grid">
            <label>
              Date
              <input
                type="date"
                name="eventDate"
                defaultValue={event.eventDate}
              />
            </label>
            <label>
              Sport
              <select name="sport" defaultValue={event.sport}>
                <option>Baseball</option>
                <option>Softball</option>
              </select>
            </label>
            <label>
              Division
              <input name="division" defaultValue={event.division} />
            </label>
            <label>
              Status / section
              <select name="status" defaultValue={currentStatus(event.status)}>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <small>
                Choose Completed to move this event into Past Tournaments.
              </small>
            </label>
            <label>
              Entry fee
              <input
                type="number"
                name="entryFee"
                defaultValue={event.entryFee}
              />
            </label>
            <label>
              Format
              <input name="format" defaultValue={event.format} />
            </label>
            <label className="registration-link-field">
              Registration link
              <input
                type="url"
                name="registrationUrl"
                defaultValue={event.registrationUrl}
                placeholder="Leave blank to hide the button"
              />
              <small>
                Leave this blank if you do not want a Register Here button for
                this tournament.
              </small>
            </label>
          </div>
          <button className="save-button" type="submit">
            Save tournament details
          </button>
        </form>
        <div className="schedule-manager">
          <h3>Game-Day Schedule</h3>
          {event.scheduleKey && (
            <a
              className="schedule-preview-link"
              href={`/api/tournaments/${event.id}/schedule`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View current schedule
            </a>
          )}
          <form onSubmit={uploadSchedule}>
            <label>
              {event.scheduleKey
                ? "Replace schedule graphic"
                : "Upload schedule graphic"}
              <input
                required
                type="file"
                name="schedule"
                accept="image/png,image/jpeg,image/webp"
              />
            </label>
            <button
              className="manage-primary"
              type="submit"
              disabled={uploadingSchedule}
            >
              {uploadingSchedule
                ? "Uploading…"
                : event.scheduleKey
                  ? "Replace schedule"
                  : "Upload schedule"}
            </button>
          </form>
          {event.scheduleKey && (
            <button
              className="delete-link"
              type="button"
              onClick={removeSchedule}
            >
              Remove schedule
            </button>
          )}
          <p aria-live="polite">{scheduleMessage}</p>
          <small>Use a JPG, PNG, or WebP image. Maximum size: 8 MB.</small>
        </div>
      </div>
      <section className="team-manager">
        <h3>Who’s Coming</h3>
        {event.teams.length ? (
          <ul>
            {event.teams.map((team) => (
              <li key={team.id}>
                <span>{team.name}</span>
                <button
                  onClick={() =>
                    request(`/api/tournaments/${event.id}/teams/${team.id}`, {
                      method: "DELETE",
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No teams listed yet.</p>
        )}
        <form onSubmit={addTeam}>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            aria-label="Team name"
          />
          <button className="manage-primary" type="submit">
            Add team
          </button>
        </form>
      </section>
      <section className="score-manager">
        <h3>Scores &amp; Standings</h3>
        {event.teams.length < 2 ? (
          <p>Add at least two teams before entering scores.</p>
        ) : (
          <form className="score-entry-form" onSubmit={addScore}>
            <label>
              Game time or number
              <input
                name="gameLabel"
                placeholder="Example: 9:00 AM or Game 1"
              />
            </label>
            <label>
              Team 1
              <select required name="homeTeamId" defaultValue="">
                <option value="" disabled>
                  Choose team
                </option>
                {event.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Score
              <input required min="0" type="number" name="homeScore" />
            </label>
            <label className="counts-check">
              <input type="checkbox" name="homeCounts" defaultChecked /> Count
              for Team 1
            </label>
            <label>
              Team 2
              <select required name="awayTeamId" defaultValue="">
                <option value="" disabled>
                  Choose team
                </option>
                {event.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Score
              <input required min="0" type="number" name="awayScore" />
            </label>
            <label className="counts-check">
              <input type="checkbox" name="awayCounts" defaultChecked /> Count
              for Team 2
            </label>
            <button className="manage-primary" type="submit">
              Add final score
            </button>
          </form>
        )}
        {event.games.length > 0 && (
          <div className="saved-scores">
            <h4>Posted scores</h4>
            {event.games.map((game) => (
              <div key={game.id} className="saved-score">
                <span>{game.gameLabel || "Final"}</span>
                <strong>
                  {teamNameById.get(game.homeTeamId)} {game.homeScore} –{" "}
                  {game.awayScore} {teamNameById.get(game.awayTeamId)}
                  <small>
                    {!game.homeCounts &&
                      `Does not count for ${teamNameById.get(game.homeTeamId)}`}
                    {!game.homeCounts && !game.awayCounts && " · "}
                    {!game.awayCounts &&
                      `Does not count for ${teamNameById.get(game.awayTeamId)}`}
                  </small>
                </strong>
                <button
                  type="button"
                  onClick={() =>
                    request(`/api/tournaments/${event.id}/games/${game.id}`, {
                      method: "DELETE",
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
