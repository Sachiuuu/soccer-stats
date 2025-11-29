import { useState } from "react";

export default function SquadDataEntry() {
  const [season, setSeason] = useState("2023");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState([
    { fullName: "", position: [], kitNumber: "", minutesPlayed: "" },
  ]);
  const [allData, setAllData] = useState({ seasons: [] });
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  const addPlayer = () => {
    setPlayers([
      ...players,
      { fullName: "", position: [], kitNumber: "", minutesPlayed: "" },
    ]);
  };

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index, field, value) => {
    const updated = [...players];
    if (field === "position") {
      // Handle multiple positions as comma-separated
      updated[index][field] = value
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    } else {
      updated[index][field] = value;
    }
    setPlayers(updated);
  };

  const saveTeam = () => {
    if (!teamName || players.length < 11) {
      alert("Please enter team name and at least 11 players");
      return;
    }

    // Convert string numbers to integers
    const processedPlayers = players
      .map((p) => ({
        fullName: p.fullName,
        position: p.position,
        kitNumber: parseInt(p.kitNumber) || 0,
        minutesPlayed: parseInt(p.minutesPlayed) || 0,
      }))
      .filter((p) => p.fullName); // Remove empty entries

    // Find or create season
    let seasonData = allData.seasons.find((s) => s.season === parseInt(season));
    if (!seasonData) {
      seasonData = { season: parseInt(season), teams: [] };
      allData.seasons.push(seasonData);
    }

    // Add team
    seasonData.teams.push({
      teamName,
      players: processedPlayers,
    });

    setAllData({ ...allData });

    // Reset form
    setTeamName("");
    setPlayers([
      { fullName: "", position: [], kitNumber: "", minutesPlayed: "" },
    ]);
    setCurrentTeamIndex(currentTeamIndex + 1);

    alert(`✅ ${teamName} saved! Total teams: ${seasonData.teams.length}`);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "premier_league_squads.json";
    link.click();
  };

  const quickFill11 = () => {
    setPlayers(
      Array(11)
        .fill(null)
        .map(() => ({
          fullName: "",
          position: [],
          kitNumber: "",
          minutesPlayed: "",
        }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          ⚽ Squad Data Entry Tool
        </h1>

        {/* Season & Team Info */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option value="2023">2023/2024</option>
                <option value="2024">2024/2025</option>
                <option value="2025">2025/2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
                placeholder="e.g., Liverpool"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={quickFill11}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
            >
              Create 11 Player Slots
            </button>
            <button
              onClick={addPlayer}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Player
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Players ({players.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {players.map((player, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={player.fullName}
                    onChange={(e) =>
                      updatePlayer(idx, "fullName", e.target.value)
                    }
                    className="w-full bg-gray-600 p-2 rounded mb-2 text-sm"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Position(s) CB,RB"
                      value={player.position.join(", ")}
                      onChange={(e) =>
                        updatePlayer(idx, "position", e.target.value)
                      }
                      className="bg-gray-600 p-2 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Kit #"
                      value={player.kitNumber}
                      onChange={(e) =>
                        updatePlayer(idx, "kitNumber", e.target.value)
                      }
                      className="bg-gray-600 p-2 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Minutes"
                      value={player.minutesPlayed}
                      onChange={(e) =>
                        updatePlayer(idx, "minutesPlayed", e.target.value)
                      }
                      className="bg-gray-600 p-2 rounded text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removePlayer(idx)}
                  className="bg-red-600 px-3 rounded hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={saveTeam}
            className="flex-1 bg-blue-600 py-3 rounded font-semibold hover:bg-blue-700"
          >
            ✅ Save Team
          </button>
          <button
            onClick={downloadJSON}
            className="flex-1 bg-green-600 py-3 rounded font-semibold hover:bg-green-700"
          >
            💾 Download JSON
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Progress:</h3>
          {allData.seasons.map((s) => (
            <div key={s.season} className="mb-2">
              <span className="text-blue-400">Season {s.season}:</span>{" "}
              {s.teams.length} teams saved
              <div className="text-sm text-gray-400 ml-4">
                {s.teams.map((t) => t.teamName).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
