import { Scene } from 'phaser';
import { InitResponse, TOTAL_LEVELS } from '../../../shared/types/api';

export class LevelSelect extends Scene {
  private userInfo!: InitResponse;
  private levelButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('LevelSelect');
  }

  async create() {
    const { width, height } = this.scale;
    
    // Dynamic gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1929, 0x0a1929, 0x1a2a4a, 0x2a3a5a, 1);
    bg.fillRect(0, 0, width, height);
    
    // Add subtle particle effects
    this.createBackgroundParticles();
    
    // Title card
    const titleY = Math.max(50, height * 0.07);
    const titleSize = Math.min(48, width / 11);
    const title = this.add.text(width / 2, titleY, '🎯 SELECT LEVEL', {
      fontFamily: 'Arial Black',
      fontSize: `${titleSize}px`,
      color: '#FF4500',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);
    
    // Subtle title glow
    this.tweens.add({
      targets: title,
      alpha: 0.9,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Load user progress
    await this.loadUserProgress();
    
    // Create level buttons (3 columns) - Responsive
    const cols = 3;
    const buttonWidth = Math.min(120, (width * 0.25));
    const buttonHeight = Math.min(120, (height * 0.15));
    const spacing = Math.min(20, width * 0.03);
    const startX = (width - (cols * buttonWidth + (cols - 1) * spacing)) / 2;
    const startY = Math.max(150, height * 0.2);
    
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (buttonWidth + spacing) + buttonWidth / 2;
      const y = startY + row * (buttonHeight + spacing) + buttonHeight / 2;
      
      this.createLevelButton(i + 1, x, y, buttonWidth, buttonHeight);
    }
    
    // Back button with modern styling
    const backBtnY = height - 50;
    const backBtnWidth = Math.min(250, width * 0.5);
    const backBtnHeight = 50;
    
    const backBtnBg = this.add.graphics();
    backBtnBg.fillStyle(0x2a3a4a, 0.8);
    backBtnBg.fillRoundedRect(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight, 10);
    backBtnBg.lineStyle(2, 0x666666, 0.6);
    backBtnBg.strokeRoundedRect(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight, 10);
    backBtnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    const backBtn = this.add.text(width / 2, backBtnY, '← BACK TO MENU', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    })
    .setOrigin(0.5);
    
    backBtnBg.on('pointerover', () => {
      backBtnBg.clear();
      backBtnBg.fillStyle(0x3a4a5a, 1);
      backBtnBg.fillRoundedRect(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight, 10);
      backBtnBg.lineStyle(2, 0x888888, 1);
      backBtnBg.strokeRoundedRect(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight, 10);
      backBtn.setScale(1.05);
    });
    
    backBtnBg.on('pointerout', () => {
      backBtnBg.clear();
      backBtnBg.fillStyle(0x2a3a4a, 0.8);
      backBtnBg.fillRoundedRect(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight, 10);
      backBtnBg.lineStyle(2, 0x666666, 0.6);
      backBtnBg.strokeRoundedRect(width / 2 - backBtnWidth / 2, backBtnY - backBtnHeight / 2, backBtnWidth, backBtnHeight, 10);
      backBtn.setScale(1);
    });
    
    backBtnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenu');
      });
    });
  }

  private async loadUserProgress() {
    try {
      const response = await fetch('/api/init');
      if (response.ok) {
        this.userInfo = await response.json() as InitResponse;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  private createLevelButton(level: number, x: number, y: number, width: number, height: number) {
    const container = this.add.container(x, y);
    
    // Check if level is unlocked (level 1 always unlocked, others require previous completion)
    const isUnlocked = level === 1 || this.userInfo?.progress?.levelsCompleted?.includes(level - 1);
    const isCompleted = this.userInfo?.progress?.levelsCompleted?.includes(level);
    
    // Modern card with gradient
    const cardGraphics = this.add.graphics();
    
    if (isUnlocked) {
      // Gradient for unlocked levels
      if (isCompleted) {
        cardGraphics.fillGradientStyle(0x2a4a3f, 0x1a3a2f, 0x2a4a3f, 0x1a3a2f, 1);
      } else {
        cardGraphics.fillGradientStyle(0x2a3f5f, 0x1a2f4f, 0x2a3f5f, 0x1a2f4f, 1);
      }
      cardGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      cardGraphics.lineStyle(2, isCompleted ? 0x46D160 : 0x4a90e2, 0.8);
      cardGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    } else {
      // Locked style
      cardGraphics.fillStyle(0x1a1a1a, 0.5);
      cardGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      cardGraphics.lineStyle(2, 0x444444, 0.5);
      cardGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    }
    container.add(cardGraphics);
    
    // Interactive hitbox
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0);
    
    // Only make interactive if unlocked
    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true });
      
      bg.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 150,
          ease: 'Power2',
        });
        
        // Redraw with brighter color
        cardGraphics.clear();
        if (isCompleted) {
          cardGraphics.fillGradientStyle(0x3a5a4f, 0x2a4a3f, 0x3a5a4f, 0x2a4a3f, 1);
        } else {
          cardGraphics.fillGradientStyle(0x3a4f6f, 0x2a3f5f, 0x3a4f6f, 0x2a3f5f, 1);
        }
        cardGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
        cardGraphics.lineStyle(3, isCompleted ? 0x5fe178 : 0x5fa0f2, 1);
        cardGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
      });
      
      bg.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2',
        });
        
        // Restore original color
        cardGraphics.clear();
        if (isCompleted) {
          cardGraphics.fillGradientStyle(0x2a4a3f, 0x1a3a2f, 0x2a4a3f, 0x1a3a2f, 1);
        } else {
          cardGraphics.fillGradientStyle(0x2a3f5f, 0x1a2f4f, 0x2a3f5f, 0x1a2f4f, 1);
        }
        cardGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
        cardGraphics.lineStyle(2, isCompleted ? 0x46D160 : 0x4a90e2, 0.8);
        cardGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
      });
      
      bg.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.start('GameNew', { level });
        });
      });
    }
    container.add(bg);
    
    // Level number - better positioned
    const levelTextSize = width > 100 ? '18px' : '16px';
    const levelText = this.add.text(0, -height / 3, `LEVEL ${level}`, {
      fontFamily: 'Arial Black',
      fontSize: levelTextSize,
      color: isUnlocked ? '#ffffff' : '#666666',
    }).setOrigin(0.5);
    container.add(levelText);
    
    // Best time (if completed)
    if (isCompleted && this.userInfo?.progress?.bestTimes?.[level]) {
      const bestTime = this.userInfo.progress.bestTimes[level];
      const timeText = this.add.text(0, 5, this.formatTime(bestTime), {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#46D160',
      }).setOrigin(0.5);
      container.add(timeText);
      
      // Trophy icon
      const trophyText = this.add.text(0, height / 3, '🏆', { fontSize: '20px' }).setOrigin(0.5);
      container.add(trophyText);
    } else if (!isUnlocked) {
      // Lock icon for locked levels - properly centered
      const lockText = this.add.text(0, 5, '🔒', { fontSize: '28px' }).setOrigin(0.5);
      container.add(lockText);
      
      const lockedText = this.add.text(0, height / 3, 'LOCKED', {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#666666',
      }).setOrigin(0.5);
      container.add(lockedText);
    }
    
    this.levelButtons.push(container);
  }

  private createBackgroundParticles(): void {
    const { width, height } = this.scale;
    
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 2);
      const particle = this.add.circle(x, y, size, 0xffffff, 0.2);
      
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeOut',
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${Math.floor(milliseconds / 100)}s`;
  }
}
