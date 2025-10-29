// Game configuration
export const TOTAL_LEVELS = 7;
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Level completion data
export type LevelCompletion = {
  levelId: number;
  userId: string;
  username: string;
  completionTime: number; // milliseconds
  timestamp: number;
  deaths: number;
};

// Leaderboard entry
export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  levelId: number;
  completionTime: number;
  deaths: number;
  timestamp: number;
};

// Player progress
export type PlayerProgress = {
  userId: string;
  username: string;
  levelsCompleted: number[];
  bestTimes: Record<number, number>; // levelId -> time in ms
  totalDeaths: number;
};

// API Response types
export type InitResponse = {
  type: 'init';
  postId: string;
  userId: string;
  username: string;
  progress: PlayerProgress;
};

export type SubmitTimeRequest = {
  levelId: number;
  completionTime: number;
  deaths: number;
};

export type SubmitTimeResponse = {
  success: boolean;
  message?: string;
  isPersonalBest: boolean;
  rank: number;
  previousBest?: number;
};

export type LeaderboardResponse = {
  levelId: number;
  entries: LeaderboardEntry[];
  totalPlayers: number;
};

export type ProgressResponse = {
  progress: PlayerProgress;
};

// Subreddit Team Competition
export type SubredditTeamEntry = {
  rank: number;
  subredditName: string;
  totalPlayers: number;
  averageTime: number; // Average of best times
  fastestTime: number;
  fastestPlayer: string;
};

export type SubredditTeamResponse = {
  levelId: number;
  teams: SubredditTeamEntry[];
  yourTeam?: SubredditTeamEntry;
  yourSubreddit: string;
};
