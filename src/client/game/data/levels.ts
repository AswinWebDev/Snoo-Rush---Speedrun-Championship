// Level data configuration
export interface LevelConfig {
  id: number;
  name: string;
  platforms: PlatformData[];
  spikes: SpikeData[];
  goal: { x: number; y: number };
  background: string;
}

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: number;
}

export interface SpikeData {
  x: number;
  y: number;
  width: number;
}

// Level configurations (7 levels with increasing difficulty)
export const LEVELS: LevelConfig[] = [
  // Level 1: Tutorial - Easy jumps
  {
    id: 1,
    name: 'First Steps',
    background: '#1e3a5f',
    goal: { x: 750, y: 500 },
    platforms: [
      { x: 50, y: 550, width: 200, height: 20, color: 0x4a90e2 },
      { x: 300, y: 500, width: 150, height: 20, color: 0x4a90e2 },
      { x: 500, y: 450, width: 150, height: 20, color: 0x4a90e2 },
      { x: 700, y: 520, width: 100, height: 20, color: 0x4a90e2 },
    ],
    spikes: [],
  },
  
  // Level 2: Introduction to hazards
  {
    id: 2,
    name: 'Watch Your Step',
    background: '#2a1e3f',
    goal: { x: 750, y: 400 },
    platforms: [
      { x: 50, y: 550, width: 150, height: 20, color: 0x5f4a90 },
      { x: 250, y: 500, width: 120, height: 20, color: 0x5f4a90 },
      { x: 420, y: 450, width: 100, height: 20, color: 0x5f4a90 },
      { x: 570, y: 500, width: 100, height: 20, color: 0x5f4a90 },
      { x: 720, y: 420, width: 80, height: 20, color: 0x5f4a90 },
    ],
    spikes: [
      { x: 200, y: 530, width: 40 },
      { x: 380, y: 480, width: 30 },
    ],
  },
  
  // Level 3: Timing challenge
  {
    id: 3,
    name: 'Precision Required',
    background: '#1e3f2a',
    goal: { x: 750, y: 300 },
    platforms: [
      { x: 50, y: 550, width: 120, height: 20, color: 0x4a9060 },
      { x: 220, y: 490, width: 100, height: 20, color: 0x4a9060 },
      { x: 370, y: 430, width: 80, height: 20, color: 0x4a9060 },
      { x: 500, y: 470, width: 90, height: 20, color: 0x4a9060 },
      { x: 640, y: 410, width: 80, height: 20, color: 0x4a9060 },
      { x: 750, y: 320, width: 70, height: 20, color: 0x4a9060 },
    ],
    spikes: [
      { x: 180, y: 520, width: 30 },
      { x: 330, y: 460, width: 30 },
      { x: 460, y: 500, width: 30 },
      { x: 600, y: 440, width: 30 },
    ],
  },
  
  // Level 4: Vertical challenge
  {
    id: 4,
    name: 'Sky High',
    background: '#3f1e2a',
    goal: { x: 400, y: 150 },
    platforms: [
      { x: 50, y: 550, width: 100, height: 20, color: 0x904a60 },
      { x: 200, y: 490, width: 90, height: 20, color: 0x904a60 },
      { x: 340, y: 430, width: 80, height: 20, color: 0x904a60 },
      { x: 480, y: 370, width: 80, height: 20, color: 0x904a60 },
      { x: 350, y: 310, width: 70, height: 20, color: 0x904a60 },
      { x: 220, y: 250, width: 70, height: 20, color: 0x904a60 },
      { x: 370, y: 190, width: 90, height: 20, color: 0x904a60 },
    ],
    spikes: [
      { x: 160, y: 520, width: 30 },
      { x: 300, y: 460, width: 30 },
      { x: 440, y: 400, width: 30 },
      { x: 310, y: 340, width: 30 },
    ],
  },
  
  // Level 5: Long jumps
  {
    id: 5,
    name: 'Leap of Faith',
    background: '#3f3f1e',
    goal: { x: 750, y: 450 },
    platforms: [
      { x: 50, y: 550, width: 100, height: 20, color: 0x909060 },
      { x: 250, y: 500, width: 80, height: 20, color: 0x909060 },
      { x: 450, y: 480, width: 70, height: 20, color: 0x909060 },
      { x: 650, y: 500, width: 80, height: 20, color: 0x909060 },
      { x: 750, y: 470, width: 70, height: 20, color: 0x909060 },
    ],
    spikes: [
      { x: 180, y: 530, width: 50 },
      { x: 360, y: 510, width: 70 },
      { x: 550, y: 510, width: 80 },
    ],
  },
  
  // Level 6: Maze-like
  {
    id: 6,
    name: 'The Gauntlet',
    background: '#1e2a3f',
    goal: { x: 750, y: 250 },
    platforms: [
      { x: 50, y: 550, width: 90, height: 20, color: 0x4a6090 },
      { x: 180, y: 490, width: 80, height: 20, color: 0x4a6090 },
      { x: 300, y: 430, width: 70, height: 20, color: 0x4a6090 },
      { x: 420, y: 490, width: 70, height: 20, color: 0x4a6090 },
      { x: 540, y: 430, width: 70, height: 20, color: 0x4a6090 },
      { x: 660, y: 370, width: 70, height: 20, color: 0x4a6090 },
      { x: 750, y: 310, width: 70, height: 20, color: 0x4a6090 },
      { x: 700, y: 270, width: 90, height: 20, color: 0x4a6090 },
    ],
    spikes: [
      { x: 150, y: 520, width: 20 },
      { x: 270, y: 460, width: 20 },
      { x: 390, y: 520, width: 20 },
      { x: 510, y: 460, width: 20 },
      { x: 630, y: 400, width: 20 },
      { x: 720, y: 340, width: 20 },
    ],
  },
  
  // Level 7: Final challenge - Master level
  {
    id: 7,
    name: 'Championship Run',
    background: '#3f1e1e',
    goal: { x: 750, y: 200 },
    platforms: [
      { x: 50, y: 550, width: 80, height: 20, color: 0x904a4a },
      { x: 180, y: 480, width: 70, height: 20, color: 0x904a4a },
      { x: 300, y: 420, width: 60, height: 20, color: 0x904a4a },
      { x: 410, y: 360, width: 60, height: 20, color: 0x904a4a },
      { x: 520, y: 420, width: 60, height: 20, color: 0x904a4a },
      { x: 630, y: 360, width: 60, height: 20, color: 0x904a4a },
      { x: 700, y: 300, width: 60, height: 20, color: 0x904a4a },
      { x: 620, y: 260, width: 70, height: 20, color: 0x904a4a },
      { x: 730, y: 220, width: 80, height: 20, color: 0x904a4a },
    ],
    spikes: [
      { x: 140, y: 510, width: 30 },
      { x: 260, y: 450, width: 30 },
      { x: 370, y: 390, width: 30 },
      { x: 480, y: 450, width: 30 },
      { x: 590, y: 390, width: 30 },
      { x: 670, y: 330, width: 30 },
      { x: 690, y: 290, width: 30 },
    ],
  },
];
