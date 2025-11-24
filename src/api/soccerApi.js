const BASE_URL = "/v4";

// 🏆 Fetch all leagues/competitions
export const fetchLeagues = async () => {
  const res = await fetch(`${BASE_URL}/competitions`, {
    headers: {
      "X-Auth-Token": process.env.REACT_APP_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch leagues");
  const data = await res.json();
  return data.competitions.filter(
    (c) => c.plan === "TIER_ONE" || c.type === "LEAGUE"
  );
};

// 🧢 Fetch teams by league
export const fetchTeamsByLeague = async (leagueCode) => {
  const res = await fetch(`${BASE_URL}/competitions/${leagueCode}/teams`, {
    headers: {
      "X-Auth-Token": process.env.REACT_APP_API_KEY,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch teams");
  const data = await res.json();
  return data.teams;
};

// 📅 Fetch team matches for a season
export const fetchTeamMatches = async (teamId, season) => {
  const res = await fetch(
    `${BASE_URL}/teams/${teamId}/matches?season=${season}`,
    {
      headers: {
        "X-Auth-Token": process.env.REACT_APP_API_KEY,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch team matches");
  return res.json();
};

// ℹ️ Fetch team info and squad
export const fetchTeamInfo = async (teamId) => {
  const res = await fetch(`${BASE_URL}/teams/${teamId}`, {
    headers: {
      "X-Auth-Token": process.env.REACT_APP_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch team info");
  return res.json();
};

// 👥 Fetch team squad (NEW - for Option 1)
export const fetchTeamSquad = async (teamId) => {
  const res = await fetch(`${BASE_URL}/teams/${teamId}`, {
    headers: {
      "X-Auth-Token": process.env.REACT_APP_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch team squad");
  const data = await res.json();
  return data.squad; // Returns array of players
};
