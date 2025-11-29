import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLeagues, fetchTeamsByLeague } from "../api/soccerApi";

export default function Home() {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const navigate = useNavigate();

  // Load leagues when the page loads
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const data = await fetchLeagues();
        // filter out non-main leagues if you want (optional)
        const mainLeagues = data.filter((l) =>
          ["PL", "PD", "SA", "BL1", "FL1"].includes(l.code)
        );
        setLeagues(mainLeagues);
      } catch (err) {
        console.error(err);
      }
    };
    loadLeagues();
  }, []);

  // When a league is selected, fetch its teams
  const handleLeagueSelect = async (leagueCode) => {
    setSelectedLeague(leagueCode);
    try {
      const data = await fetchTeamsByLeague(leagueCode);
      setTeams(data);
    } catch (err) {
      console.error(err);
    }
  };

  // When a team is clicked, go to /club/:id
  const handleTeamClick = (id) => {
    navigate(`/club/${id}`);
  };

  return (
    <div className="p-6 text-center text-white">
      <h1 className="text-2xl tinos-font text-white-400 mb-6">
        Welcome to Futboliro! This app is designed for all those futbol fans
        around the world who appreciate the history of their favorites clubs.
        Feel free to search the respective league to find your team.
      </h1>

      {/* League selector */}
      <div className="mb-6">
        <label className="mr-3 text-lg">Select League:</label>
        <select
          className="bg-slate-950 text-white p-2 rounded"
          onChange={(e) => handleLeagueSelect(e.target.value)}
          value={selectedLeague}
        >
          <option value="">-- Choose a League --</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.code}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      {/* Team grid */}
      {teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="cursor-pointer bg-slate-950 p-4 rounded-lg hover:bg-indigo-400 transition"
            >
              <img
                src={team.crest}
                alt={team.name}
                className="h-16 mx-auto mb-2"
              />
              <p className="text-sm font-semibold">{team.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
