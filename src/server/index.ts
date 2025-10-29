import express from 'express';
import {
  InitResponse,
  SubmitTimeRequest,
  SubmitTimeResponse,
  LeaderboardResponse,
  ProgressResponse,
  PlayerProgress,
  LeaderboardEntry,
  SubredditTeamResponse,
  SubredditTeamEntry,
  TOTAL_LEVELS,
} from '../shared/types/api';
import { redis, createServer, context } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// Helper: Get player progress from Redis
async function getPlayerProgress(postId: string, userId: string): Promise<PlayerProgress> {
  const progressKey = `progress:${postId}:${userId}`;
  const data = await redis.get(progressKey);
  
  if (data) {
    return JSON.parse(data);
  }
  
  // Default progress
  return {
    userId,
    username: userId,
    levelsCompleted: [],
    bestTimes: {},
    totalDeaths: 0,
  };
}

// Helper: Save player progress
async function savePlayerProgress(postId: string, progress: PlayerProgress): Promise<void> {
  const progressKey = `progress:${postId}:${progress.userId}`;
  await redis.set(progressKey, JSON.stringify(progress));
}

// GET /api/init - Initialize game for user
router.get('/api/init', async (_req, res): Promise<void> => {
  const { postId, userId } = context;

  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'Required context missing',
    });
    return;
  }

  try {
    const progress = await getPlayerProgress(postId, userId);
    
    res.json({
      type: 'init',
      postId,
      userId: userId || 'anonymous',
      username: userId || 'Player',
      progress,
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ status: 'error', message: 'Init failed' });
  }
});

// POST /api/submit-time - Submit level completion time
router.post('/api/submit-time', async (req, res): Promise<void> => {
  const { postId, userId, subredditName } = context;
  const { levelId, completionTime, deaths } = req.body as SubmitTimeRequest;

  if (!postId || !userId) {
    res.status(400).json({ 
      success: false, 
      message: 'User not authenticated', 
      isPersonalBest: false, 
      rank: 0 
    });
    return;
  }

  try {
    // Save player's subreddit for team competition
    if (subredditName) {
      const subredditKey = `player:subreddit:${userId}`;
      await redis.set(subredditKey, subredditName);
    }
    
    // Get player progress
    const progress = await getPlayerProgress(postId, userId);
    
    // Check if this is a personal best
    const previousBest = progress.bestTimes[levelId];
    const isPersonalBest = !previousBest || completionTime < previousBest;
    
    if (isPersonalBest) {
      // Update progress
      progress.bestTimes[levelId] = completionTime;
      if (!progress.levelsCompleted.includes(levelId)) {
        progress.levelsCompleted.push(levelId);
      }
      progress.totalDeaths += deaths;
      
      await savePlayerProgress(postId, progress);
      
      // Update leaderboard
      const leaderboardKey = `leaderboard:${postId}:${levelId}`;
      await redis.zAdd(leaderboardKey, { member: userId, score: completionTime });
    }
    
    // Get rank
    const leaderboardKey = `leaderboard:${postId}:${levelId}`;
    const rank = await redis.zRank(leaderboardKey, userId);
    
    res.json({
      success: true,
      isPersonalBest,
      rank: (rank !== undefined ? rank + 1 : 0),
      previousBest,
    });
  } catch (error) {
    console.error('Submit time error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit time', 
      isPersonalBest: false, 
      rank: 0 
    });
  }
});

// GET /api/leaderboard/:levelId - Get leaderboard for a level
router.get('/api/leaderboard/:levelId', async (req, res): Promise<void> => {
  const { postId } = context;
  const levelId = parseInt(req.params.levelId);

  if (!postId) {
    res.status(400).json({ 
      status: 'error', 
      message: 'Post ID required', 
      levelId: 0, 
      entries: [], 
      totalPlayers: 0 
    });
    return;
  }

  try {
    const leaderboardKey = `leaderboard:${postId}:${levelId}`;
    const topScores = await redis.zRange(leaderboardKey, 0, 9, { by: 'rank' }); // Top 10
    
    const entries: LeaderboardEntry[] = topScores.map((item, index) => ({
      rank: index + 1,
      userId: item.member,
      username: item.member,
      levelId,
      completionTime: item.score,
      deaths: 0,
      timestamp: Date.now(),
    }));
    
    const totalPlayers = await redis.zCard(leaderboardKey);
    
    res.json({
      levelId,
      entries,
      totalPlayers,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get leaderboard', 
      levelId: 0, 
      entries: [], 
      totalPlayers: 0 
    });
  }
});

// GET /api/subreddit-teams/:levelId - Get subreddit team leaderboard
router.get('/api/subreddit-teams/:levelId', async (req, res): Promise<void> => {
  const { postId, subredditName } = context;
  const levelId = parseInt(req.params.levelId);

  if (!postId) {
    res.status(400).json({ 
      levelId: 0, 
      teams: [], 
      yourSubreddit: '' 
    });
    return;
  }

  try {
    const leaderboardKey = `leaderboard:${postId}:${levelId}`;
    const allScores = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank' });
    
    // Group by subreddit
    const subredditData: Record<string, { times: number[], players: string[] }> = {};
    
    for (const score of allScores) {
      // Store player's subreddit with their score (simplified - using current subreddit)
      const playerSubreddit = subredditName || 'unknown';
      const subredditKey = `player:subreddit:${score.member}`;
      const storedSubreddit = await redis.get(subredditKey) || playerSubreddit;
      
      if (!subredditData[storedSubreddit]) {
        subredditData[storedSubreddit] = { times: [], players: [] };
      }
      
      subredditData[storedSubreddit].times.push(score.score);
      subredditData[storedSubreddit].players.push(score.member);
    }
    
    // Calculate team stats
    const teams: SubredditTeamEntry[] = Object.entries(subredditData).map(([subreddit, data]) => {
      const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
      const fastestTime = Math.min(...data.times);
      const fastestIdx = data.times.indexOf(fastestTime);
      
      return {
        rank: 0, // Will set after sorting
        subredditName: subreddit,
        totalPlayers: data.players.length,
        averageTime: avgTime,
        fastestTime: fastestTime,
        fastestPlayer: data.players[fastestIdx] || 'unknown',
      };
    });
    
    // Sort by average time
    teams.sort((a, b) => a.averageTime - b.averageTime);
    teams.forEach((team, idx) => team.rank = idx + 1);
    
    const yourTeam = teams.find(t => t.subredditName === subredditName);
    
    res.json({
      levelId,
      teams: teams.slice(0, 10), // Top 10 teams
      yourTeam,
      yourSubreddit: subredditName || 'unknown',
    });
  } catch (error) {
    console.error('Team leaderboard error:', error);
    res.status(500).json({ 
      levelId: 0, 
      teams: [], 
      yourSubreddit: '' 
    });
  }
});

// GET /api/progress - Get player progress
router.get('/api/progress', async (_req, res): Promise<void> => {
  const { postId, userId } = context;

  if (!postId || !userId) {
    res.status(400).json({ 
      status: 'error', 
      message: 'Authentication required', 
      progress: { 
        userId: '', 
        username: '', 
        levelsCompleted: [], 
        bestTimes: {}, 
        totalDeaths: 0 
      } 
    });
    return;
  }

  try {
    const progress = await getPlayerProgress(postId, userId);
    res.json({ progress });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get progress', 
      progress: { 
        userId: '', 
        username: '', 
        levelsCompleted: [], 
        bestTimes: {}, 
        totalDeaths: 0 
      } 
    });
  }
});

// Internal routes for Devvit - App lifecycle hooks
router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
