const GENRES = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37];

const TITLES = [
  "The Neon Protocol", "Shadow District", "Crimson Tide Rising", "Last Signal",
  "Velocity", "The Whispering Pines", "Starfall", "Midnight Express",
  "Crystal Empire", "The Iron Crown", "Ghost Protocol", "Aurora",
  "The Dark Horizon", "Echoes of Tomorrow", "Thunderstrike", "Beneath the Surface",
  "Shattered Glass", "The Long Night", "Quantum Break", "Wildfire",
  "The Silent Wave", "Obsidian", "Frozen Earth", "The Phoenix Protocol",
  "Stormchaser", "Nightshade", "Golden Hour", "The Last Frontier",
  "Void Walker", "Scarlet Dawn", "Iron Will", "The Deep End",
  "Cipher", "Titanfall", "The Broken Crown", "Silver Lining",
  "Dark Matter", "The Rover", "Infinite Loop", "Aftermath",
];

const DESCRIPTIONS = [
  "In a world on the brink of chaos, one hero must rise to restore order.",
  "A gripping tale of survival, betrayal, and redemption in the face of overwhelming odds.",
  "When the unthinkable happens, ordinary people must do extraordinary things.",
  "Two strangers discover a connection that transcends time and space.",
  "The line between friend and foe blurs in this heart-pounding thriller.",
  "An epic journey across uncharted territories where every step could be your last.",
  "In the shadows of a sprawling metropolis, secrets lurk behind every corner.",
  "A team of unlikely heroes bands together to save what they hold most dear.",
  "When reality itself begins to unravel, the truth becomes the only weapon.",
  "A pulse-pounding race against time where every second counts.",
];

export function generateMockMovies(count = 60): any[] {
  const movies = [];
  for (let i = 0; i < count; i++) {
    const titleIndex = i % TITLES.length;
    const descIndex = i % DESCRIPTIONS.length;
    const year = 2015 + (i % 10);
    const month = 1 + (i % 12);
    const day = 1 + (i % 28);
    movies.push({
      id: 100000 + i,
      title: TITLES[titleIndex],
      name: TITLES[titleIndex],
      overview: DESCRIPTIONS[descIndex],
      poster_path: null,
      backdrop_path: null,
      vote_average: 5.5 + (i % 5) * 0.8,
      release_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      first_air_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      media_type: i % 3 === 1 ? "tv" : "movie",
      genre_ids: [GENRES[i % GENRES.length]],
    });
  }
  return movies;
}

export const MOCK_MOVIES = generateMockMovies(60);

export function mockResponse(totalResults = 60) {
  return {
    results: MOCK_MOVIES.slice(0, totalResults),
    page: 1,
    total_pages: Math.ceil(totalResults / 20),
    total_results: totalResults,
  };
}
