const BASE_URL = "https://api.football-data.org/v4";

export const fetchTeamMatches = async (teamId, season) => {
  const res = await fetch(`${BASE_URL}/teams/${teamId}/matches?season=${season}`, {
    headers: {
      "X-Auth-Token": process.env.REACT_APP_API_KEY
    }
  });
  if (!res.ok) throw new Error("Failed to fetch team matches");
  return res.json();
};

export const fetchTeamInfo = async (teamId) => {
  const res = await fetch(`${BASE_URL}/teams/${teamId}`, {
    headers: {
      "X-Auth-Token": process.env.REACT_APP_API_KEY
    }
  });
  if (!res.ok) throw new Error("Failed to fetch team info");
  return res.json();
};
