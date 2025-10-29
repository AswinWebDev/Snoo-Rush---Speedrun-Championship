import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash screen customization
      appDisplayName: 'Snoo Rush',
      backgroundUri: 'default-splash.png',
      buttonLabel: '🏃 START SPEEDRUN',
      description: 'Compete for your subreddit in this fast-paced platformer!',
      entryUri: 'index.html',
      heading: '⚡ SNOO RUSH - Speedrun Championship',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'Snoo Rush - Speedrun Championship',
  });
};
