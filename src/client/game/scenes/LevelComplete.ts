import { Scene } from 'phaser';
import { LeaderboardResponse, LeaderboardEntry } from '../../../shared/types/api';

export class LevelComplete extends Scene {
  private levelNumber!: number;
  private completionTime!: number;
  private deaths!: number;
  private leaderboard: LeaderboardEntry[] = [];
  private teamData: any = null;

  constructor() {
    super('LevelComplete');
  }

  init(data: { level: number; time: number; deaths: number }) {
    this.levelNumber = data.level;
    this.completionTime = data.time;
    this.deaths = data.deaths;
  }

  async create() {
    const { width, height } = this.scale;
    
    // Background
    this.cameras.main.setBackgroundColor('#0a1929');
    
    // Title - smaller and higher
    const isMobile = width < 768;
    const titleSize = isMobile ? '28px' : '36px';
    this.add.text(width / 2, 50, `LEVEL ${this.levelNumber} COMPLETE!`, {
      fontFamily: 'Arial Black',
      fontSize: titleSize,
      color: '#46D160',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    // Stats - compact
    const timeText = `Time: ${(this.completionTime / 1000).toFixed(2)}s`;
    const deathsText = `Deaths: ${this.deaths}`;
    
    const statsY = 100;
    this.add.text(width / 2, statsY, timeText, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, statsY + 30, deathsText, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // Load team data and leaderboard
    await this.loadTeamData();
    await this.loadLeaderboard();
    
    // Display team competition prominently
    this.displayTeamCompetition(width, height);
    
    // Display regular leaderboard
    this.displayLeaderboard(width, height);
    
    // Buttons - more compact
    const buttonY = height - 80;
    const buttonSpacing = isMobile ? 160 : 200;
    const btnFontSize = isMobile ? '18px' : '22px';
    
    // Retry button
    const retryBtn = this.add.text(width / 2 - buttonSpacing / 2, buttonY, '🔄 RETRY', {
      fontFamily: 'Arial Black',
      fontSize: btnFontSize,
      color: '#FFD635',
      backgroundColor: '#00000088',
      padding: { x: 15, y: 8 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
    
    retryBtn.on('pointerover', () => retryBtn.setStyle({ backgroundColor: '#FFD63544' }));
    retryBtn.on('pointerout', () => retryBtn.setStyle({ backgroundColor: '#00000088' }));
    retryBtn.on('pointerdown', () => {
      this.scene.start('GameNew', { level: this.levelNumber });
    });
    
    // Next level button
    const nextBtn = this.add.text(width / 2 + buttonSpacing / 2, buttonY, '▶ NEXT', {
      fontFamily: 'Arial Black',
      fontSize: btnFontSize,
      color: '#46D160',
      backgroundColor: '#00000088',
      padding: { x: 15, y: 8 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
    
    nextBtn.on('pointerover', () => nextBtn.setStyle({ backgroundColor: '#46D16044' }));
    nextBtn.on('pointerout', () => nextBtn.setStyle({ backgroundColor: '#00000088' }));
    nextBtn.on('pointerdown', () => {
      if (this.levelNumber < 7) {
        this.scene.start('GameNew', { level: this.levelNumber + 1 });
      } else {
        this.scene.start('LevelSelect');
      }
    });
    
    // Back to menu
    const menuBtn = this.add.text(width / 2, height - 40, '← LEVEL SELECT', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerdown', () => {
      this.scene.start('LevelSelect');
    });
  }

  private async loadTeamData() {
    try {
      const response = await fetch(`/api/subreddit-teams/${this.levelNumber}`);
      if (response.ok) {
        this.teamData = await response.json();
      }
    } catch (error) {
      console.log('Team data not available:', error);
    }
  }

  private async loadLeaderboard() {
    try {
      const response = await fetch(`/api/leaderboard/${this.levelNumber}`);
      if (response.ok) {
        const data = await response.json() as LeaderboardResponse;
        this.leaderboard = data.entries;
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }

  private displayTeamCompetition(width: number, height: number) {
    if (!this.teamData || !this.teamData.yourTeam) {
      return; // No team data available
    }

    // Team competition card - positioned after stats
    const cardY = 200;
    const cardWidth = Math.min(500, width * 0.88);
    const cardHeight = 85;
    
    // Card background
    const card = this.add.graphics();
    card.fillStyle(0xFF4500, 0.2); // Reddit orange tint
    card.fillRoundedRect(width / 2 - cardWidth / 2, cardY - cardHeight / 2, cardWidth, cardHeight, 12);
    card.lineStyle(3, 0xFF4500, 0.8);
    card.strokeRoundedRect(width / 2 - cardWidth / 2, cardY - cardHeight / 2, cardWidth, cardHeight, 12);
    
    // Team title - compact
    this.add.text(width / 2, cardY - 25, '🏆 SUBREDDIT TEAM', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FF4500',
    }).setOrigin(0.5);
    
    // Your team info
    const teamRank = this.teamData.yourTeam.rank;
    const rankColor = teamRank === 1 ? '#FFD700' : teamRank <= 3 ? '#C0C0C0' : '#CD7F32';
    
    this.add.text(width / 2, cardY + 5, 
      `r/${this.teamData.yourSubreddit} - Rank #${teamRank}`,
      {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: rankColor,
      }
    ).setOrigin(0.5);
    
    // Player count
    this.add.text(width / 2, cardY + 30,
      `${this.teamData.yourTeam.totalPlayers} players competing!`,
      {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#46D160',
      }
    ).setOrigin(0.5);
  }

  private displayLeaderboard(width: number, height: number) {
    // Adjust Y position based on whether team data is shown
    const startYOffset = this.teamData ? 300 : 200;
    
    // Responsive leaderboard
    const isMobile = width < 768;
    const maxEntries = isMobile ? 5 : 7;
    
    // Leaderboard title - smaller
    this.add.text(width / 2, startYOffset, `🏆 TOP ${maxEntries}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FFD635',
    }).setOrigin(0.5);
    
    // Header
    const startY = this.teamData ? 335 : 235;
    const lineHeight = isMobile ? 24 : 26;
    
    this.add.text(width / 2 - 150, startY, 'RANK', {
      fontFamily: 'Arial Bold',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0, 0.5);
    
    this.add.text(width / 2 - 50, startY, 'PLAYER', {
      fontFamily: 'Arial Bold',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0, 0.5);
    
    this.add.text(width / 2 + 100, startY, 'TIME', {
      fontFamily: 'Arial Bold',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(1, 0.5);
    
    // Entries
    const topEntries = this.leaderboard.slice(0, maxEntries);
    topEntries.forEach((entry, index) => {
      const y = startY + (index + 1) * lineHeight;
      const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      
      // Rank
      this.add.text(width / 2 - 150, y, `${medalEmoji} #${entry.rank}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: index < 3 ? '#FFD635' : '#ffffff',
      }).setOrigin(0, 0.5);
      
      // Player
      const playerName = entry.username.substring(0, 12);
      this.add.text(width / 2 - 50, y, playerName, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0, 0.5);
      
      // Time
      const timeText = `${(entry.completionTime / 1000).toFixed(2)}s`;
      this.add.text(width / 2 + 100, y, timeText, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#46D160',
      }).setOrigin(1, 0.5);
    });
    
    // If no entries yet
    if (topEntries.length === 0) {
      this.add.text(width / 2, startY + 60, 'Be the first to complete this level!', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#888888',
      }).setOrigin(0.5);
    }
  }
}
