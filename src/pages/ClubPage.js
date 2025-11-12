import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTeamInfo, fetchTeamMatches } from "../api/soccerApi";

export default function ClubPage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamData = await fetchTeamInfo(id);
        const matchesData = await fetchTeamMatches(id, 2022); // example season
        setTeam(teamData);
        setMatches(matchesData.matches);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-400">{team.name}</h1>
      <p className="text-gray-300 mb-4">{team.venue}</p>

      <h2 className="text-2xl font-semibold text-white mt-6 mb-2">Matches (Sample Season)</h2>
      <ul>
        {matches.map((m) => (
          <li key={m.id} className="mb-2 text-gray-200">
            {m.competition.name}: {m.homeTeam.name} {m.score.fullTime.home} - {m.score.fullTime.away} {m.awayTeam.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
