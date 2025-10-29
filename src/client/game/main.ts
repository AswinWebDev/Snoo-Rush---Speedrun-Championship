import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { LevelSelect } from './scenes/LevelSelect';
import { PlatformerGameNew } from './scenes/PlatformerGameNew';
import { LevelComplete } from './scenes/LevelComplete';
import { GlobalLeaderboard } from './scenes/GlobalLeaderboard';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Reddit Rush - AAA Speedrun Platformer Game Config
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#0a1929',
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: 'high-performance',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
  },
  scene: [Boot, Preloader, MainMenu, LevelSelect, PlatformerGameNew, LevelComplete, GlobalLeaderboard],
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
