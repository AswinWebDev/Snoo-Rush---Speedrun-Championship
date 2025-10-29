import { Scene } from 'phaser';

export class GlobalLeaderboard extends Scene {
  constructor() {
    super('GlobalLeaderboard');
  }

  create() {
    const { width, height } = this.scale;
    
    // Dynamic gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1929, 0x0a1929, 0x1a2a4a, 0x2a3a5a, 1);
    bg.fillRect(0, 0, width, height);
    
    // Background particles
    this.createBackgroundParticles();
    
    // Hero title card
    const titleY = Math.max(55, height * 0.08);
    const titleSize = Math.min(42, width / 13);
    const title = this.add.text(width / 2, titleY, '🏆 GLOBAL LEADERBOARDS', {
      fontFamily: 'Arial Black',
      fontSize: `${titleSize}px`,
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);
    
    // Title glow animation
    this.tweens.add({
      targets: title,
      alpha: 0.9,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Level cards - Modern design
    const startY = Math.max(140, height * 0.18);
    const cardWidth = Math.min(650, width * 0.9);
    const cardHeight = Math.min(65, height * 0.075);
    const spacing = 12;
    
    for (let i = 1; i <= 7; i++) {
      const y = startY + (i - 1) * (cardHeight + spacing);
      
      // Card container for each level
      const container = this.add.container(width / 2, y);
      
      // Card background with gradient
      const cardBg = this.add.graphics();
      cardBg.fillGradientStyle(0x2a3f5f, 0x1a2f4f, 0x2a3f5f, 0x1a2f4f, 1);
      cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
      cardBg.lineStyle(2, 0x4a90e2, 0.6);
      cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
      container.add(cardBg);
      
      // Interactive hit area
      const hitArea = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);
      
      // Level icon and text
      const levelTextSize = Math.min(22, width / 20);
      const levelText = this.add.text(-cardWidth / 2 + 30, 0, `LEVEL ${i}`, {
        fontFamily: 'Arial Black',
        fontSize: `${levelTextSize}px`,
        color: '#ffffff',
      }).setOrigin(0, 0.5);
      container.add(levelText);
      
      // Decorative level badge
      const badge = this.add.circle(-cardWidth / 2 + 15, 0, 6, 0x4a90e2, 1);
      container.add(badge);
      
      // View button with arrow
      const viewBtnSize = Math.min(20, width / 20);
      const viewBtn = this.add.text(cardWidth / 2 - 50, 0, 'VIEW →', {
        fontFamily: 'Arial Black',
        fontSize: `${viewBtnSize}px`,
        color: '#46D160',
      }).setOrigin(0.5);
      container.add(viewBtn);
      
      // Hover effects
      hitArea.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.03,
          scaleY: 1.03,
          duration: 150,
          ease: 'Power2',
        });
        
        // Redraw with brighter gradient
        cardBg.clear();
        cardBg.fillGradientStyle(0x3a4f6f, 0x2a3f5f, 0x3a4f6f, 0x2a3f5f, 1);
        cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        cardBg.lineStyle(3, 0x5fa0f2, 1);
        cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        
        viewBtn.setScale(1.1);
        badge.setScale(1.2);
      });
      
      hitArea.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2',
        });
        
        // Restore original gradient
        cardBg.clear();
        cardBg.fillGradientStyle(0x2a3f5f, 0x1a2f4f, 0x2a3f5f, 0x1a2f4f, 1);
        cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        cardBg.lineStyle(2, 0x4a90e2, 0.6);
        cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        
        viewBtn.setScale(1);
        badge.setScale(1);
      });
      
      hitArea.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.start('LevelComplete', { level: i, time: 0, deaths: 0, score: 0 });
        });
      });
    }
    
    // Back button with modern styling
    const backBtnY = height - 55;
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
  
  private createBackgroundParticles(): void {
    const { width, height } = this.scale;
    
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 2);
      const particle = this.add.circle(x, y, size, 0xFFD700, 0.3);
      
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
}
