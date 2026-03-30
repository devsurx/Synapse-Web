export const RANKS = [
  "Initiate", "Observer", "Acolyte", "Scribe", "Sentinel", "Warden", // Orbit 1: Grounded
  "Scholar", "Adept", "Magus", "Architect", "Strategist", "Luminary", // Orbit 2: Cognitive
  "Viscount", "Exarch", "High-Seer", "Grand-Master", "Oracle", "Sovereign", // Orbit 3: Elevated
  "Ethereal", "Nova", "Supernova", "Quasar", "Pulsar", "Singularity", // Orbit 4: Stellar
  "Void-Walker", "Star-Child", "Cosmic-Mind", "Eternal", "Zenith", "The Synapse" // Orbit 5: Ascended
];

export const getRank = (points: number) => {
  // Linear progression for early ranks, exponential for later
  const level = Math.min(Math.floor(Math.pow(points / 100, 0.7)), 29);
  return {
    title: RANKS[level],
    level: level + 1,
    progress: (points % 500) / 5, // For the progress bar
    nextThreshold: (level + 1) * 500
  };
};