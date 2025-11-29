import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTeamInfo, fetchTeamMatches } from "../api/soccerApi";
import squadData from "../data/premier_league_squads-23-24.json";

export default function ClubPage() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [lineup, setLineup] = useState([]);
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

  // Load season data and lineup
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

        // Load lineup from JSON data for 2023 season
        if (season === "2023") {
          const seasonData = squadData.seasons.find((s) => s.season === 2023);
          if (seasonData) {
            const teamData = seasonData.teams.find(
              (t) =>
                t.teamName.toLowerCase() === team.name.toLowerCase() ||
                t.teamName
                  .toLowerCase()
                  .includes(team.shortName?.toLowerCase()) ||
                team.name.toLowerCase().includes(t.teamName.toLowerCase())
            );

            if (teamData) {
              // Organize players by position
              const allPlayers = teamData.players;

              // Helper function to check if player plays a position
              const playsPosition = (player, positions) => {
                return player.position.some((pos) =>
                  positions.some((p) => pos.toUpperCase().includes(p))
                );
              };

              // Sort function by minutes
              const sortByMinutes = (players) =>
                [...players].sort((a, b) => b.minutesPlayed - a.minutesPlayed);

              // Get best player for each position based on minutes
              const gk = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["GK"]))
              )[0];

              const lb = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["LB", "LWB"]))
              )[0];
              const cb1 = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["CB"]))
              )[0];
              const cb2 = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["CB"]))
              )[1];
              const rb = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["RB", "RWB"]))
              )[0];

              // Get all midfielders (anyone with C position - CM, CDM, CAM)
              const allMidfielders = sortByMinutes(
                allPlayers.filter((p) =>
                  playsPosition(p, ["CM", "CDM", "CAM", "DM", "AM"])
                )
              ).slice(0, 3); // Get top 3 by minutes

              // Categorize the 3 midfielders by their specific role
              const categorized = allMidfielders.map((player) => {
                let role = "CM"; // Default
                if (playsPosition(player, ["CAM", "AM"])) role = "CAM";
                else if (playsPosition(player, ["CDM", "DM"])) role = "CDM";
                return { player, role };
              });

              // Count roles
              const roleCounts = categorized.reduce((acc, { role }) => {
                acc[role] = (acc[role] || 0) + 1;
                return acc;
              }, {});

              console.log(
                "Midfield roles:",
                categorized.map((c) => `${c.player.fullName} (${c.role})`)
              );
              console.log("Role counts:", roleCounts);

              // Find the "odd one out" - the role that appears only once
              const oddRole = Object.keys(roleCounts).find(
                (role) => roleCounts[role] === 1
              );

              // Arrange: put odd one in middle, others on sides
              let cm1, cam, cm2;

              if (oddRole) {
                // Find the odd player
                const oddPlayer = categorized.find(
                  (c) => c.role === oddRole
                ).player;
                // Find the two same-role players
                const sameRolePlayers = categorized
                  .filter((c) => c.role !== oddRole)
                  .map((c) => c.player);

                cm1 = sameRolePlayers[0];
                cam = oddPlayer; // Middle position
                cm2 = sameRolePlayers[1];
              } else {
                // All same role (e.g., 3 CMs) - just use order by minutes
                cm1 = categorized[0]?.player;
                cam = categorized[1]?.player;
                cm2 = categorized[2]?.player;
              }

              const lw = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["LW", "LM"]))
              )[0];
              const st = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["ST", "CF", "FW"]))
              )[0];
              const rw = sortByMinutes(
                allPlayers.filter((p) => playsPosition(p, ["RW", "RM"]))
              )[0];

              // Build 4-3-3 lineup in order: [LW, ST, RW, CM, CAM, CM, LB, CB, CB, RB, GK]
              const formationLineup = [
                lw,
                st,
                rw,
                cm1,
                cam,
                cm2,
                lb,
                cb1,
                cb2,
                rb,
                gk,
              ].filter(Boolean);

              console.log("Final midfield arrangement:", {
                left: cm1?.fullName,
                middle: cam?.fullName,
                right: cm2?.fullName,
              });

              if (formationLineup.length === 11) {
                setLineup(formationLineup);
                console.log(
                  "✅ Lineup loaded with proper positions:",
                  teamData.teamName
                );
              } else {
                console.log(
                  "⚠️ Could not fill all positions. Found:",
                  formationLineup.length
                );
                setLineup([]);
              }
            } else {
              console.log("⚠️ No lineup data for this team");
              setLineup([]);
            }
          }
        } else {
          setLineup([]);
        }
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
    <div className="flex gap-4 items-center p-6 text-white">
      {/* Main content area */}
      <div className="max-w-4xl w-full">
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

      {/* Lineup section - 4-3-3 Formation */}
      {season === "2023" && lineup.length === 11 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-6">
            Most Used XI (2023/24 Season)
          </h2>

          <div className="relative bg-gradient-to-b from-green-700 to-green-900 rounded-3xl p-8 max-w-4xl mx-auto shadow-xl border-4 border-green-500">
            <div className="space-y-12">
              {/* Forwards - LW, ST, RW */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    LW
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[0].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[0].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[0].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[0].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    ST
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[1].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[1].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[1].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[1].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    RW
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[2].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[2].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[2].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[2].minutesPlayed}' played
                  </div>
                </div>
              </div>

              {/* Midfielders - CM, CAM, CM */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    CM/CDM
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[3].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[3].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[3].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[3].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    CAM/CM
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[4].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[4].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[4].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[4].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    CM/CDM
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[5].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[5].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[5].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[5].minutesPlayed}' played
                  </div>
                </div>
              </div>

              {/* Defenders - LB, CB, CB, RB */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    LB
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[6].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[6].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[6].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[6].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    CB
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[7].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[7].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[7].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[7].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    CB
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[8].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[8].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[8].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[8].minutesPlayed}' played
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    RB
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[9].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[9].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[9].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[9].minutesPlayed}' played
                  </div>
                </div>
              </div>

              {/* Goalkeeper */}
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border-2 border-white/30 w-48">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    GK
                  </div>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {lineup[10].kitNumber}
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {lineup[10].fullName}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {lineup[10].position.join(", ")}
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {lineup[10].minutesPlayed}' played
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
