export interface SportChannel {
  id: string;
  name: string;
  category: string;
  logo?: string;
  embedUrls: string[];
  season?: string;
}

function getCurrentSeason(months: number[]): boolean {
  const m = new Date().getMonth();
  return months.includes(m);
}

function isNFLSeason(): boolean {
  return getCurrentSeason([8, 9, 10, 11, 0, 1]); // Sep-Feb
}

function isNBASeason(): boolean {
  return getCurrentSeason([9, 10, 11, 0, 1, 2, 3, 4, 5]); // Oct-Jun
}

function isMLBSeason(): boolean {
  return getCurrentSeason([2, 3, 4, 5, 6, 7, 8, 9]); // Mar-Oct
}

function isNHLSeason(): boolean {
  return getCurrentSeason([9, 10, 11, 0, 1, 2, 3, 4, 5]); // Oct-Jun
}

function isCollegeFBSeason(): boolean {
  return getCurrentSeason([7, 8, 9, 10, 11, 0]); // Aug-Jan
}

function isCollegeBBSeason(): boolean {
  return getCurrentSeason([10, 11, 0, 1, 2, 3]); // Nov-Apr
}

function isSoccerSeason(): boolean {
  return true; // Soccer runs year-round
}

function isTennisSeason(): boolean {
  return getCurrentSeason([0, 1, 2, 3, 4, 5, 6, 7, 8]); // Jan-Sep (major tournaments)
}

function isMotorsportSeason(): boolean {
  return getCurrentSeason([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]); // Mar-Dec
}

function isUFCSeason(): boolean {
  return true; // UFC runs year-round
}

export function isSportInSeason(categoryId: string): boolean {
  switch (categoryId) {
    case "nfl": return isNFLSeason();
    case "nba": return isNBASeason();
    case "mlb": return isMLBSeason();
    case "nhl": return isNHLSeason();
    case "ufc": return isUFCSeason();
    case "soccer": return isSoccerSeason();
    case "f1": return isMotorsportSeason();
    case "tennis": return isTennisSeason();
    case "college": return isCollegeFBSeason() || isCollegeBBSeason();
    case "other": return true;
    default: return true;
  }
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
}

export const SPORT_CATEGORIES: SportCategory[] = [
  { id: "nfl", name: "NFL", icon: "🏈" },
  { id: "nba", name: "NBA", icon: "🏀" },
  { id: "mlb", name: "MLB", icon: "⚾" },
  { id: "nhl", name: "NHL", icon: "🏒" },
  { id: "ufc", name: "UFC/Boxing", icon: "🥊" },
  { id: "soccer", name: "Soccer", icon: "⚽" },
  { id: "f1", name: "F1/Motorsport", icon: "🏎️" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "college", name: "College Sports", icon: "🎓" },
  { id: "other", name: "Other Sports", icon: "🏆" },
];

const SPORTS_EMBED_PROVIDERS = [
  { name: "VidSrc", build: (q: string) => `https://vidsrc.dev/embed/sport/${q}` },
  { name: "VidSrc 2", build: (q: string) => `https://vidsrc.to/embed/sport/${q}` },
  { name: "VidSrc 3", build: (q: string) => `https://vidsrc.xyz/embed/sport/${q}` },
  { name: "Embed.su", build: (q: string) => `https://embed.su/embed/sport/${q}` },
  { name: "VidBinge", build: (q: string) => `https://vidbinge.dev/embed/sport/${q}` },
];

export function getSportEmbedUrls(query: string): string[] {
  return SPORTS_EMBED_PROVIDERS.map(p => p.build(encodeURIComponent(query)));
}

export const SPORTS_CHANNELS: SportChannel[] = [
  // === NFL ===
  { id: "nfl-1", name: "NFL RedZone", category: "nfl", embedUrls: getSportEmbedUrls("nfl-redzone") },
  { id: "nfl-2", name: "NFL Network", category: "nfl", embedUrls: getSportEmbedUrls("nfl-network") },
  { id: "nfl-3", name: "ESPN NFL", category: "nfl", embedUrls: getSportEmbedUrls("espn-nfl") },
  { id: "nfl-4", name: "Fox NFL", category: "nfl", embedUrls: getSportEmbedUrls("fox-sports-nfl") },
  { id: "nfl-5", name: "CBS NFL", category: "nfl", embedUrls: getSportEmbedUrls("cbs-sports-nfl") },
  { id: "nfl-6", name: "NBC NFL", category: "nfl", embedUrls: getSportEmbedUrls("nbc-sports-nfl") },
  { id: "nfl-7", name: "NFL Sunday Ticket", category: "nfl", embedUrls: getSportEmbedUrls("nfl-sunday-ticket") },
  { id: "nfl-8", name: "Thursday Night Football", category: "nfl", embedUrls: getSportEmbedUrls("thursday-night-football") },
  { id: "nfl-9", name: "Monday Night Football", category: "nfl", embedUrls: getSportEmbedUrls("monday-night-football") },
  { id: "nfl-10", name: "Sunday Night Football", category: "nfl", embedUrls: getSportEmbedUrls("sunday-night-football") },

  // === NBA ===
  { id: "nba-1", name: "NBA TV", category: "nba", embedUrls: getSportEmbedUrls("nba-tv") },
  { id: "nba-2", name: "ESPN NBA", category: "nba", embedUrls: getSportEmbedUrls("espn-nba") },
  { id: "nba-3", name: "TNT NBA", category: "nba", embedUrls: getSportEmbedUrls("tnt-nba") },
  { id: "nba-4", name: "ABC NBA", category: "nba", embedUrls: getSportEmbedUrls("abc-nba") },
  { id: "nba-5", name: "NBA League Pass", category: "nba", embedUrls: getSportEmbedUrls("nba-league-pass") },
  { id: "nba-6", name: "NBA Playoffs", category: "nba", embedUrls: getSportEmbedUrls("nba-playoffs") },

  // === MLB ===
  { id: "mlb-1", name: "MLB Network", category: "mlb", embedUrls: getSportEmbedUrls("mlb-network") },
  { id: "mlb-2", name: "ESPN MLB", category: "mlb", embedUrls: getSportEmbedUrls("espn-mlb") },
  { id: "mlb-3", name: "Fox MLB", category: "mlb", embedUrls: getSportEmbedUrls("fox-sports-mlb") },
  { id: "mlb-4", name: "TBS MLB", category: "mlb", embedUrls: getSportEmbedUrls("tbs-mlb") },
  { id: "mlb-5", name: "MLB Sunday Night", category: "mlb", embedUrls: getSportEmbedUrls("mlb-sunday-night") },
  { id: "mlb-6", name: "MLB Postseason", category: "mlb", embedUrls: getSportEmbedUrls("mlb-postseason") },

  // === NHL ===
  { id: "nhl-1", name: "NHL Network", category: "nhl", embedUrls: getSportEmbedUrls("nhl-network") },
  { id: "nhl-2", name: "ESPN NHL", category: "nhl", embedUrls: getSportEmbedUrls("espn-nhl") },
  { id: "nhl-3", name: "TNT NHL", category: "nhl", embedUrls: getSportEmbedUrls("tnt-nhl") },
  { id: "nhl-4", name: "NHL Playoffs", category: "nhl", embedUrls: getSportEmbedUrls("nhl-playoffs") },
  { id: "nhl-5", name: "Hockey Night", category: "nhl", embedUrls: getSportEmbedUrls("hockey-night") },

  // === UFC / Boxing ===
  { id: "ufc-1", name: "UFC Fight Pass", category: "ufc", embedUrls: getSportEmbedUrls("ufc-fight-pass") },
  { id: "ufc-2", name: "UFC PPV", category: "ufc", embedUrls: getSportEmbedUrls("ufc-ppv") },
  { id: "ufc-3", name: "ESPN UFC", category: "ufc", embedUrls: getSportEmbedUrls("espn-ufc") },
  { id: "ufc-4", name: "Boxing PPV", category: "ufc", embedUrls: getSportEmbedUrls("boxing-ppv") },
  { id: "ufc-5", name: "Matchroom Boxing", category: "ufc", embedUrls: getSportEmbedUrls("matchroom-boxing") },
  { id: "ufc-6", name: "Top Rank Boxing", category: "ufc", embedUrls: getSportEmbedUrls("top-rank-boxing") },

  // === Soccer ===
  { id: "soccer-1", name: "Premier League", category: "soccer", embedUrls: getSportEmbedUrls("premier-league") },
  { id: "soccer-2", name: "La Liga", category: "soccer", embedUrls: getSportEmbedUrls("la-liga") },
  { id: "soccer-3", name: "Serie A", category: "soccer", embedUrls: getSportEmbedUrls("serie-a") },
  { id: "soccer-4", name: "Bundesliga", category: "soccer", embedUrls: getSportEmbedUrls("bundesliga") },
  { id: "soccer-5", name: "Ligue 1", category: "soccer", embedUrls: getSportEmbedUrls("ligue-1") },
  { id: "soccer-6", name: "UEFA Champions League", category: "soccer", embedUrls: getSportEmbedUrls("champions-league") },
  { id: "soccer-7", name: "UEFA Europa League", category: "soccer", embedUrls: getSportEmbedUrls("europa-league") },
  { id: "soccer-8", name: "MLS", category: "soccer", embedUrls: getSportEmbedUrls("mls") },
  { id: "soccer-9", name: "EFL Championship", category: "soccer", embedUrls: getSportEmbedUrls("efl-championship") },
  { id: "soccer-10", name: "World Cup", category: "soccer", embedUrls: getSportEmbedUrls("world-cup") },
  { id: "soccer-11", name: "Copa America", category: "soccer", embedUrls: getSportEmbedUrls("copa-america") },
  { id: "soccer-12", name: "African Nations", category: "soccer", embedUrls: getSportEmbedUrls("african-nations") },

  // === F1 / Motorsport ===
  { id: "f1-1", name: "F1 Grand Prix", category: "f1", embedUrls: getSportEmbedUrls("f1-grand-prix") },
  { id: "f1-2", name: "F1 Qualifying", category: "f1", embedUrls: getSportEmbedUrls("f1-qualifying") },
  { id: "f1-3", name: "F1 Practice", category: "f1", embedUrls: getSportEmbedUrls("f1-practice") },
  { id: "f1-4", name: "MotoGP", category: "f1", embedUrls: getSportEmbedUrls("motogp") },
  { id: "f1-5", name: "NASCAR", category: "f1", embedUrls: getSportEmbedUrls("nascar") },
  { id: "f1-6", name: "IndyCar", category: "f1", embedUrls: getSportEmbedUrls("indycar") },
  { id: "f1-7", name: "WRC Rally", category: "f1", embedUrls: getSportEmbedUrls("wrc-rally") },
  { id: "f1-8", name: "Formula E", category: "f1", embedUrls: getSportEmbedUrls("formula-e") },

  // === Tennis ===
  { id: "tennis-1", name: "Wimbledon", category: "tennis", embedUrls: getSportEmbedUrls("wimbledon") },
  { id: "tennis-2", name: "US Open", category: "tennis", embedUrls: getSportEmbedUrls("us-open-tennis") },
  { id: "tennis-3", name: "French Open", category: "tennis", embedUrls: getSportEmbedUrls("french-open") },
  { id: "tennis-4", name: "Australian Open", category: "tennis", embedUrls: getSportEmbedUrls("australian-open") },
  { id: "tennis-5", name: "ATP Tour", category: "tennis", embedUrls: getSportEmbedUrls("atp-tour") },
  { id: "tennis-6", name: "WTA Tour", category: "tennis", embedUrls: getSportEmbedUrls("wta-tour") },

  // === College Sports ===
  { id: "college-1", name: "College Football", category: "college", embedUrls: getSportEmbedUrls("college-football") },
  { id: "college-2", name: "College Basketball", category: "college", embedUrls: getSportEmbedUrls("college-basketball") },
  { id: "college-3", name: "March Madness", category: "college", embedUrls: getSportEmbedUrls("march-madness") },
  { id: "college-4", name: "College Baseball", category: "college", embedUrls: getSportEmbedUrls("college-baseball") },
  { id: "college-5", name: "NCAA Wrestling", category: "college", embedUrls: getSportEmbedUrls("ncaa-wrestling") },

  // === Other Sports ===
  { id: "other-1", name: "ESPN Main", category: "other", embedUrls: getSportEmbedUrls("espn") },
  { id: "other-2", name: "Fox Sports 1", category: "other", embedUrls: getSportEmbedUrls("fox-sports-1") },
  { id: "other-3", name: "Fox Sports 2", category: "other", embedUrls: getSportEmbedUrls("fox-sports-2") },
  { id: "other-4", name: "CBS Sports", category: "other", embedUrls: getSportEmbedUrls("cbs-sports") },
  { id: "other-5", name: "NBC Sports", category: "other", embedUrls: getSportEmbedUrls("nbc-sports") },
  { id: "other-6", name: "Golf Channel", category: "other", embedUrls: getSportEmbedUrls("golf-channel") },
  { id: "other-7", name: "Olympic Channel", category: "other", embedUrls: getSportEmbedUrls("olympic-channel") },
  { id: "other-8", name: "Cricket World", category: "other", embedUrls: getSportEmbedUrls("cricket") },
  { id: "other-9", name: "Rugby Union", category: "other", embedUrls: getSportEmbedUrls("rugby") },
  { id: "other-10", name: "AFL", category: "other", embedUrls: getSportEmbedUrls("afl") },
  { id: "other-11", name: "PGA Tour", category: "other", embedUrls: getSportEmbedUrls("pga-tour") },
  { id: "other-12", name: "WWE Raw", category: "other", embedUrls: getSportEmbedUrls("wwe-raw") },
  { id: "other-13", name: "WWE SmackDown", category: "other", embedUrls: getSportEmbedUrls("wwe-smackdown") },
  { id: "other-14", name: "AEW Wrestling", category: "other", embedUrls: getSportEmbedUrls("aew-wrestling") },
  { id: "other-15", name: "Winter Sports", category: "other", embedUrls: getSportEmbedUrls("winter-sports") },
  { id: "other-16", name: "Summer Sports", category: "other", embedUrls: getSportEmbedUrls("summer-sports") },
];

export function getChannelsByCategory(categoryId: string): SportChannel[] {
  return SPORTS_CHANNELS.filter(c => c.category === categoryId);
}

export function getChannelById(id: string): SportChannel | undefined {
  return SPORTS_CHANNELS.find(c => c.id === id);
}

export function getCategoryById(id: string): SportCategory | undefined {
  return SPORT_CATEGORIES.find(c => c.id === id);
}
