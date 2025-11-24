import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTeamInfo, fetchTeamMatches } from "../api/soccerApi";

export default function ClubPage() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [season, setSeason] = useState(null);

  // Fetch team info from football-data.org
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const teamData = await fetchTeamInfo(id);
        setTeam(teamData);
        console.log("✅ Team loaded:", teamData.name);
      } catch (err) {
        console.error("Failed to fetch team info:", err);
      } finally {
        setLoadingTeam(false);
      }
    };
    loadTeam();
  }, [id]);

  // Load season data
  useEffect(() => {
    if (!season || !team) return;

    const loadSeasonData = async () => {
      setLoadingSeason(true);
      try {
        // Fetch matches from football-data.org for display
        const matchesData = await fetchTeamMatches(id, season);
        const games = matchesData.matches || [];
        setMatches(games);
        console.log(`✅ Loaded ${games.length} matches from football-data.org`);
      } catch (err) {
        console.error("Failed to fetch season data:", err);
      } finally {
        setLoadingSeason(false);
      }
    };

    loadSeasonData();
  }, [id, season, team]);

  if (loadingTeam) {
    return <p className="text-center text-white mt-10">Loading club info...</p>;
  }

  if (!team) {
    return (
      <p className="text-center text-white mt-10">No team data found 😕</p>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* Club Header */}
      <div className="flex items-center gap-6 mb-8">
        <img src={team.crest} alt={team.name} className="h-24" />
        <div>
          <h1 className="text-4xl font-bold text-white-400">{team.name}</h1>
          <p className="text-gray-300">
            🏙️ {team.address || "Unknown City"} | 🏟️ {team.venue}
          </p>
          <p className="text-gray-400">Founded: {team.founded || "N/A"}</p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="mb-8">
        <label className="mr-3 text-lg">Select Season:</label>
        <select
          className="bg-gray-800 text-white p-2 rounded"
          value={season || ""}
          onChange={(e) => setSeason(e.target.value)}
        >
          <option value="">-- Select a Season --</option>
          {Array.from({ length: 3 }, (_, i) => 2025 - i).map((year) => (
            <option key={year} value={year}>
              {year}/{year + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Matches section */}
      {season && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            Fixtures ({+season}/{+season + 1})
          </h2>

          {loadingSeason ? (
            <p>Loading season data...</p>
          ) : matches.length > 0 ? (
            <div className="space-y-2">
              {matches.map((m) => {
                const homeScore = m.score.fullTime.home;
                const awayScore = m.score.fullTime.away;

                const homeWon = homeScore > awayScore;
                const awayWon = awayScore > homeScore;

                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-4 p-2 rounded-lg"
                  >
                    {/* Competition */}
                    <span className="font-medium w-40">
                      {m.competition.name}
                    </span>

                    {/* Home team */}
                    <span
                      className={`px-2 py-1 rounded ${
                        homeWon
                          ? "bg-green-700"
                          : awayWon
                          ? "bg-red-700"
                          : "bg-gray-700"
                      }`}
                    >
                      {m.homeTeam.name}
                    </span>

                    {/* Score */}
                    <span className="text-lg font-semibold">
                      {homeScore} - {awayScore}
                    </span>

                    {/* Away team */}
                    <span
                      className={`px-2 py-1 rounded ${
                        awayWon
                          ? "bg-green-700"
                          : homeWon
                          ? "bg-red-700"
                          : "bg-gray-700"
                      }`}
                    >
                      {m.awayTeam.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No season data loaded.</p>
          )}
        </div>
      )}
    </div>
  );
}
