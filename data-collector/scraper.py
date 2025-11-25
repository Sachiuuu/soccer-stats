import json
import re
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# --- CONFIGURATION ---

TEAMS = [
    # name, TM team id (verein id)
    ("Arsenal", 11),
    ("Aston Villa", 405),
    ("Chelsea", 631),
    ("Everton", 29),
    ("Fulham", 320),
    ("Liverpool", 31),
    ("Manchester City", 281),
    ("Manchester United", 985),
    ("Newcastle United", 762),
    ("Sunderland", 975),  # Note: they might not be in PL certain seasons — check
    ("Tottenham Hotspur", 148),
    ("Wolverhampton", 543),
    ("Burnley", 483),
    ("Leeds United", 341),
    ("Nottingham Forest", 703),
    ("Crystal Palace", 873),
    ("Brighton & Hove Albion", 1311),
    ("Brentford", 1277),
    ("West Ham United", 379),
    ("Bournemouth", 883),
]

# TM uses saison_id = starting year of season: 2023 => 23/24, etc.
SEASONS = [2023, 2024, 2025]

BASE_TM_URL = "https://www.transfermarkt.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

# Define your position buckets and how many you want per “XI”
POSITION_BUCKETS = {
    "GK": 1,
    "RB": 1,
    "LB": 1,
    "CB": 2,
    "CM": 3,
    "LW": 1,
    "RW": 1,
    "ST": 1,
}

# Map Transfermarkt position strings to your buckets
# This is approximate: TM may list "Centre-Back", "RB / RWB", "CM / DM", etc.
POSITION_MAPPING = {
    "Goalkeeper": "GK",
    "Centre-Back": "CB",
    "Right-Back": "RB",
    "Left-Back": "LB",
    "Defensive Midfield": "CM",
    "Central Midfield": "CM",
    "Attacking Midfield": "CM",
    "Left Midfield": "CM",  # or LM if you care
    "Right Midfield": "CM",  # or RM
    "Left Winger": "LW",
    "Right Winger": "RW",
    "Second Striker": "ST",
    "Centre-Forward": "ST",
    # add more if needed
}

# --- FUNCTIONS ---


def get_soup(url):
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "lxml")


def parse_squad_stats(team_id, season):
    """
    Scrape squad performance data (minutes, appearances, positions) for a team-season.
    """
    saison_id = season
    url = f"{BASE_TM_URL}/verein/leistungsdaten/verein/{team_id}/plus/0?saison_id={saison_id}"
    # Actually, the correct path is /leistungsdaten/verein/{id}/plus/0?saison_id=X
    # Example: https://www.transfermarkt.com/fc-arsenal/leistungsdaten/verein/11/plus/0?saison_id=2024
    page = get_soup(url)
    table = page.find("table", {"class": "items"})
    if not table:
        print(
            f"⚠️ Could not find squad table for team_id={team_id}, season={season}")
        return []

    players = []
    for row in table.tbody.find_all("tr", recursive=False):
        cols = row.find_all("td")
        if not cols or len(cols) < 5:
            continue

        # columns: position, name, appearances, goals, minutes, etc.
        # exact index depends on page structure
        name_cell = cols[1]
        name = name_cell.get_text(strip=True)
        profile_link = name_cell.find("a", href=True)
        profile_url = urljoin(
            BASE_TM_URL, profile_link["href"]) if profile_link else None

        pos = cols[0].get_text(strip=True)
        # sometimes there are multiple position strings
        pos_list = [p.strip() for p in pos.split("/")]

        # appearances
        apps_text = cols[4].get_text(strip=True)
        try:
            appearances = int(apps_text)
        except:
            appearances = None

        # minutes
        minutes_text = cols[5].get_text(strip=True).replace(".", "")
        try:
            minutes = int(minutes_text)
        except:
            minutes = 0

        players.append({
            "name": name,
            "profile_url": profile_url,
            "positions": pos_list,
            "appearances": appearances,
            "minutes": minutes,
        })
    return players


def assign_bucket(player):
    """
    Given a player's TM positions, decide which of our buckets they belong to.
    If multiple map to different buckets, pick the one with highest minute potential.
    """
    buckets = []
    for p in player["positions"]:
        if p in POSITION_MAPPING:
            buckets.append(POSITION_MAPPING[p])
    # Remove duplicates
    return list(set(buckets))


def infer_xi(players):
    """
    Given list of player dicts for a season, infer the XI by position buckets + minutes.
    Returns a list of player entries for XI.
    """
    # Build bucket → list of players
    bucket_players = {bucket: [] for bucket in POSITION_BUCKETS}

    for pl in players:
        buckets = assign_bucket(pl)
        for b in buckets:
            if b in bucket_players:
                bucket_players[b].append(pl)

    # For each bucket, sort players by minutes descending, pick top N
    xi = []
    for bucket, count in POSITION_BUCKETS.items():
        cands = bucket_players.get(bucket, [])
        # sort
        cands_sorted = sorted(cands, key=lambda p: p["minutes"], reverse=True)
        chosen = cands_sorted[:count]
        for pl in chosen:
            xi.append({
                "name": pl["name"],
                "positions": pl["positions"],
                "minutes": pl["minutes"]
            })
    return xi

# --- MAIN SCRAPER / AGGREGATOR ---


def run():
    result = {}

    for team_name, team_id in TEAMS:
        result[team_name] = {}
        for season in SEASONS:
            print(f"Scraping {team_name} for season {season}/{season+1}")
            players = parse_squad_stats(team_id, season)
            if not players:
                print(f"  → no data for {team_name} in {season}")
                continue
            xi = infer_xi(players)
            result[team_name][f"{season}_{season+1}"] = {
                "players": players,
                "inferred_xi": xi
            }

    # Write JSON
    out = Path(__file__).parent / "output" / "pl_most_used_xi.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print("Wrote", out)


if __name__ == "__main__":
    run()
# --- END OF FILE ---
