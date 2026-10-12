// Movie data and categories. Swap this for a TMDB fetch to use real posters.
const SAMPLE_BASE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";
const sampleVideos = ["BigBuckBunny.mp4", "ElephantsDream.mp4", "Sintel.mp4", "TearsOfSteel.mp4"].map(
  (file) => SAMPLE_BASE + file
);

// A few hand-picked images make the featured titles feel tied to their stories.
// Keep the deterministic Picsum fallback so every sample title still has artwork.
const featuredArt = {
  "midnight-protocol": "https://images.pexels.com/photos/4132321/pexels-photo-4132321.jpeg?auto=compress&cs=tinysrgb",
  "last-lighthouse": "https://images.pexels.com/photos/8080389/pexels-photo-8080389.jpeg?auto=compress&cs=tinysrgb",
  "neon-drift": "https://images.pexels.com/photos/31306031/pexels-photo-31306031.jpeg?auto=compress&cs=tinysrgb",
  "echo-valley": "https://images.pexels.com/photos/33785353/pexels-photo-33785353.jpeg?auto=compress&cs=tinysrgb",
  "red-canyon": "https://images.pexels.com/photos/27688724/pexels-photo-27688724.jpeg?auto=compress&cs=tinysrgb"
};
const artUrl = (movie, kind, w, h) => {
  const curated = featuredArt[movie.slug];
  return curated
    ? `${curated}&w=${w}&h=${h}&fit=crop`
    : `https://picsum.photos/seed/${movie.slug}${kind === "backdrop" ? "-bg" : ""}/${w}/${h}`;
};

const movies = [
  { id: 1, slug: "midnight-protocol", title: "Midnight Protocol", category: "trending", year: 2025, rating: "TV-14", match: 97, length: "1h 52m", genres: ["Thriller", "Tech"], desc: "A burned-out hacker has one night to stop a blackout that could take down an entire city." },
  { id: 2, slug: "last-lighthouse", title: "The Last Lighthouse", category: "trending", year: 2024, rating: "TV-MA", match: 94, length: "1h 38m", genres: ["Mystery", "Horror"], desc: "A keeper on a remote island discovers the lamp is guiding something other than ships." },
  { id: 3, slug: "neon-drift", title: "Neon Drift", category: "trending", year: 2026, rating: "TV-14", match: 92, length: "2h 04m", genres: ["Action", "Racing"], desc: "Street racers risk everything in a city that never turns its lights off." },
  { id: 4, slug: "paper-kingdoms", title: "Paper Kingdoms", category: "trending", year: 2023, rating: "TV-PG", match: 90, length: "1h 47m", genres: ["Fantasy", "Drama"], desc: "Two rival heirs fight for a throne that may not exist." },
  { id: 5, slug: "salt-and-ashes", title: "Salt & Ashes", category: "trending", year: 2025, rating: "TV-MA", match: 88, length: "1h 56m", genres: ["Drama", "Mystery"], desc: "A family returns to their ruined hometown to bury a secret." },
  { id: 6, slug: "echo-valley", title: "Echo Valley", category: "top-rated", year: 2022, rating: "TV-14", match: 98, length: "2h 11m", genres: ["Mystery", "Crime"], desc: "A search for a missing hiker turns into a search for the truth." },
  { id: 7, slug: "orbit-seven", title: "Orbit Seven", category: "top-rated", year: 2024, rating: "TV-14", match: 96, length: "1h 49m", genres: ["Sci-Fi", "Thriller"], desc: "Seven strangers wake aboard a station with no memory of the launch." },
  { id: 8, slug: "quiet-rebellion", title: "Quiet Rebellion", category: "top-rated", year: 2021, rating: "TV-PG", match: 95, length: "1h 42m", genres: ["Drama"], desc: "A small-town teacher starts a movement with a single lesson." },
  { id: 9, slug: "iron-harvest", title: "Iron Harvest", category: "top-rated", year: 2023, rating: "TV-14", match: 93, length: "2h 02m", genres: ["Sci-Fi", "Action"], desc: "Farmers and machines clash over the last fertile land on Earth." },
  { id: 10, slug: "glass-harbor", title: "Glass Harbor", category: "top-rated", year: 2025, rating: "TV-MA", match: 91, length: "1h 55m", genres: ["Crime", "Mystery"], desc: "A detective untangles a crime that keeps changing its story." },
  { id: 11, slug: "red-canyon", title: "Red Canyon", category: "action", year: 2026, rating: "TV-14", match: 96, length: "1h 58m", genres: ["Action", "Adventure"], desc: "A rogue courier crosses a desert war zone carrying a package everyone wants." },
  { id: 12, slug: "steel-tide", title: "Steel Tide", category: "action", year: 2024, rating: "TV-14", match: 93, length: "2h 06m", genres: ["Action", "War"], desc: "A naval crew fights to take back a hijacked carrier." },
  { id: 13, slug: "night-shift", title: "Night Shift", category: "action", year: 2025, rating: "TV-MA", match: 91, length: "1h 44m", genres: ["Action", "Thriller"], desc: "A paramedic becomes the only witness to a city-wide conspiracy." },
  { id: 14, slug: "wolfpack", title: "Wolfpack", category: "action", year: 2023, rating: "TV-14", match: 89, length: "1h 51m", genres: ["Action", "Heist"], desc: "An elite unit goes off the grid to finish one last job." },
  { id: 15, slug: "sky-breaker", title: "Sky Breaker", category: "action", year: 2026, rating: "TV-PG", match: 87, length: "2h 08m", genres: ["Adventure", "Sci-Fi"], desc: "Pilots race against a storm that was built, not born." }
].map((movie, i) => ({
  ...movie,
  poster: artUrl(movie, "poster", 400, 600),
  backdrop: artUrl(movie, "backdrop", 1600, 900),
  video: sampleVideos[i % sampleVideos.length]
}));

const categories = [
  { key: "trending", label: "Trending Now" },
  { key: "top-rated", label: "Top Rated" },
  { key: "action", label: "Action & Adventure" }
];
