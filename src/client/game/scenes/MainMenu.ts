import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  private title!: GameObjects.Text;
  private subtitle!: GameObjects.Text;
  private startButton!: GameObjects.Text;
  private instructions!: GameObjects.Text[];

  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;
    
    // Dynamic gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1929, 0x0a1929, 0x1a2a4a, 0x2a3a5a, 1);
    bg.fillRect(0, 0, width, height);
    
    // Create animated star particles
    this.createStarField();
    
    // Hero section card - Better vertical distribution
    const isMobile = width < 768;
    const cardWidth = Math.min(700, width * 0.92);
    const cardHeight = isMobile ? Math.min(120, height * 0.14) : Math.min(160, height * 0.18);
    const cardY = isMobile ? height * 0.18 : height * 0.2;
    
    // Card background with glassmorphism effect
    const card = this.add.graphics();
    card.fillStyle(0x1a2a3a, 0.6);
    card.fillRoundedRect(width / 2 - cardWidth / 2, cardY - cardHeight / 2, cardWidth, cardHeight, 16);
    card.lineStyle(2, 0x4a90e2, 0.5);
    card.strokeRoundedRect(width / 2 - cardWidth / 2, cardY - cardHeight / 2, cardWidth, cardHeight, 16);
    
    // Title - Better mobile sizing
    const titleSize = isMobile ? Math.min(42, width / 10) : Math.min(64, width / 9);
    this.title = this.add.text(width / 2, cardY - (isMobile ? 10 : 20), 'SNOO RUSH', {
      fontFamily: 'Arial Black',
      fontSize: `${titleSize}px`,
      color: '#FF4500',
      stroke: '#000000',
      strokeThickness: 6,
    })
    .setOrigin(0.5);
    
    // Glow effect on title
    this.tweens.add({
      targets: this.title,
      alpha: 0.85,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Subtitle - Better mobile sizing
    const subtitleSize = isMobile ? Math.min(16, width / 25) : Math.min(24, width / 22);
    this.subtitle = this.add.text(width / 2, cardY + (isMobile ? 20 : 30), 'Speedrun Championship', {
      fontFamily: 'Arial',
      fontSize: `${subtitleSize}px`,
      color: '#d0d0d0',
      stroke: '#000000',
      strokeThickness: 2,
    })
    .setOrigin(0.5);
    
    // Instructions - Show controls based on device
    
    const rules = isMobile ? [
      '🏃 Race through levels as fast as possible',
      '🏆 Compete on global leaderboards', 
      '📱 MOBILE CONTROLS:',
      '   Hold Left Side = Move Left',
      '   Hold Right Side = Move Right',
      '   Quick Tap = Jump',
    ] : [
      '🏃 Race through levels as fast as possible',
      '🏆 Compete on global leaderboards', 
      '⌨️ DESKTOP CONTROLS:',
      '   WASD or Arrow Keys = Move',
      '   W / Up Arrow = Jump',
    ];
    
    this.instructions = [];
    const instructionStartY = isMobile ? height * 0.38 : height * 0.48;
    const lineSpacing = isMobile ? 24 : 32;
    
    rules.forEach((rule, index) => {
      const isControlHeader = rule.includes('CONTROLS:');
      const isIndented = rule.startsWith('   ');
      
      const fontSize = isMobile 
        ? (isControlHeader ? '14px' : (isIndented ? '12px' : '13px'))
        : (isControlHeader ? '18px' : (isIndented ? '15px' : '16px'));
      
      const text = this.add.text(
        width / 2, 
        instructionStartY + (index * lineSpacing), 
        rule,
        {
          fontFamily: isControlHeader ? 'Arial Black' : 'Arial',
          fontSize: fontSize,
          color: isControlHeader ? '#FFD635' : '#d7dadc',
        }
      ).setOrigin(0.5);
      this.instructions.push(text);
    });
    
    // Main action buttons container - Use bottom third of screen
    const lastInstructionY = instructionStartY + (rules.length - 1) * lineSpacing;
    const btnY = isMobile ? height * 0.73 : height * 0.76;
    const btnWidth = isMobile ? Math.min(320, width * 0.85) : Math.min(380, width * 0.68);
    const btnHeight = isMobile ? 56 : 62;
    
    // Start button with modern card design
    const startBtnBg = this.add.graphics();
    startBtnBg.fillGradientStyle(0x46D160, 0x38A14D, 0x46D160, 0x38A14D, 1);
    startBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
    startBtnBg.lineStyle(3, 0x5fe178, 1);
    startBtnBg.strokeRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
    startBtnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    const startBtnFontSize = isMobile ? '22px' : '28px';
    this.startButton = this.add.text(width / 2, btnY, '▶  START GAME', {
      fontFamily: 'Arial Black',
      fontSize: startBtnFontSize,
      color: '#ffffff',
    })
    .setOrigin(0.5);
    
    // Hover effects - Subtle glow without jumping
    startBtnBg.on('pointerover', () => {
      startBtnBg.clear();
      startBtnBg.fillGradientStyle(0x56E170, 0x48B15D, 0x56E170, 0x48B15D, 1);
      startBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
      startBtnBg.lineStyle(4, 0x6ff188, 1);
      startBtnBg.strokeRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
    });
    
    startBtnBg.on('pointerout', () => {
      startBtnBg.clear();
      startBtnBg.fillGradientStyle(0x46D160, 0x38A14D, 0x46D160, 0x38A14D, 1);
      startBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
      startBtnBg.lineStyle(3, 0x5fe178, 1);
      startBtnBg.strokeRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
    });
    
    // Subtle pulsing glow animation on text only
    this.tweens.add({
      targets: this.startButton,
      alpha: 0.9,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Click to start
    startBtnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('LevelSelect');
      });
    });
    
    // Leaderboard button (secondary style) - Bottom of screen
    const lbBtnY = isMobile ? height * 0.88 : height * 0.88;
    const lbBtnBg = this.add.graphics();
    lbBtnBg.fillStyle(0x2a3a4a, 0.8);
    lbBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight, 12);
    lbBtnBg.lineStyle(2, 0xFFD635, 0.8);
    lbBtnBg.strokeRoundedRect(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight, 12);
    lbBtnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    const lbBtnFontSize = isMobile ? '18px' : '24px';
    const leaderboardBtn = this.add.text(width / 2, lbBtnY, '🏆  LEADERBOARDS', {
      fontFamily: 'Arial Black',
      fontSize: lbBtnFontSize,
      color: '#FFD635',
    })
    .setOrigin(0.5);
    
    lbBtnBg.on('pointerover', () => {
      lbBtnBg.clear();
      lbBtnBg.fillStyle(0x3a4a5a, 1);
      lbBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight, 12);
      lbBtnBg.lineStyle(2, 0xFFD635, 1);
      lbBtnBg.strokeRoundedRect(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight, 12);
      leaderboardBtn.setScale(1.05);
    });
    
    lbBtnBg.on('pointerout', () => {
      lbBtnBg.clear();
      lbBtnBg.fillStyle(0x2a3a4a, 0.8);
      lbBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight, 12);
      lbBtnBg.lineStyle(2, 0xFFD635, 0.8);
      lbBtnBg.strokeRoundedRect(width / 2 - btnWidth / 2, lbBtnY - btnHeight / 2, btnWidth, btnHeight, 12);
      leaderboardBtn.setScale(1);
    });
    
    lbBtnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GlobalLeaderboard');
      });
    });
    
    // Responsive layout
    this.scale.on('resize', this.updateLayout, this);
  }
  
  private createStarField(): void {
    // Create twinkling star effect
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const star = this.add.circle(x, y, 1, 0xffffff, 0.8);
      
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }
  
  private updateLayout(): void {
    const { width, height } = this.scale;
    this.cameras.resize(width, height);
    
    if (this.title) {
      this.title.setPosition(width / 2, Math.max(100, height * 0.2));
    }
    if (this.subtitle) {
      this.subtitle.setPosition(width / 2, Math.max(160, height * 0.3));
    }
    if (this.instructions) {
      this.instructions.forEach((text, i) => {
        text.setPosition(width / 2, height * 0.45 + (i * 28));
      });
    }
    if (this.startButton) {
      this.startButton.setPosition(width / 2, height * 0.8);
    }
  }
}
