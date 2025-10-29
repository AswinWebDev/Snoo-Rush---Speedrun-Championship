import { Scene } from 'phaser';
import { LEVELS, LevelConfig } from '../data/levels';
import { SubmitTimeRequest, SubmitTimeResponse } from '../../../shared/types/api';

export class PlatformerGame extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private goal!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  
  private currentLevel!: LevelConfig;
  private levelNumber!: number;
  private startTime = 0;
  private elapsedTime = 0;
  private deaths = 0;
  private isRunning = false;
  
  // UI Elements
  private timerText!: Phaser.GameObjects.Text;
  private deathText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  
  constructor() {
    super('Game');
  }

  init(data: { level: number }) {
    this.levelNumber = data.level || 1;
    const level = LEVELS[this.levelNumber - 1];
    if (!level) {
      console.error('Level not found:', this.levelNumber);
      this.scene.start('LevelSelect');
      return;
    }
    this.currentLevel = level;
    this.deaths = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
  }

  create() {
    const { width, height } = this.scale;
    
    // Create beautiful gradient background
    this.createGradientBackground();
    
    // Create level with enhanced visuals
    this.createLevel();
    
    // Create player with animations
    this.createPlayer();
    
    // Create professional UI
    this.createUI();
    
    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    
    // Physics world bounds
    this.physics.world.setBounds(0, 0, width, height);
    
    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.spikes, this.hitSpike, undefined, this);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
    
    // Start timer
    this.startTime = Date.now();
    this.isRunning = true;
    
    // Smooth camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, width, height);
    
    // Add ambient particles
    this.createAmbientParticles();
  }
  
  private createGradientBackground() {
    const { width, height } = this.scale;
    
    // Create gradient background using Phaser's gradient
    const bg = this.add.graphics();
    
    // Convert hex color to RGB for gradient
    const topColor = parseInt(this.currentLevel.background.replace('#', '0x'));
    const bottomColor = 0x000000;
    
    bg.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-10);
  }
  
  private createAmbientParticles() {
    // Add floating particles for atmosphere
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const particle = this.add.circle(x, y, 2, 0xffffff, 0.3);
      
      this.tweens.add({
        targets: particle,
        y: y - 100,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 5000),
        repeat: -1,
        onRepeat: () => {
          particle.y = this.scale.height;
          particle.alpha = 0.3;
        },
      });
    }
  }

  private createLevel() {
    // Platforms with professional styling
    this.platforms = this.physics.add.staticGroup();
    this.currentLevel.platforms.forEach((platform, index) => {
      const centerX = platform.x + platform.width / 2;
      const centerY = platform.y + platform.height / 2;
      
      // Shadow for depth
      const shadow = this.add.rectangle(
        centerX + 4,
        centerY + 4,
        platform.width,
        platform.height,
        0x000000,
        0.3
      );
      shadow.setDepth(-1);
      
      // Main platform with rounded corners
      const graphics = this.add.graphics();
      graphics.fillStyle(platform.color || 0x4a90e2, 1);
      graphics.fillRoundedRect(0, 0, platform.width, platform.height, 8);
      
      // Add highlight on top
      graphics.fillStyle(0xffffff, 0.2);
      graphics.fillRoundedRect(0, 0, platform.width, platform.height / 3, 8);
      
      graphics.generateTexture(`platform_${index}`, platform.width, platform.height);
      graphics.destroy();
      
      const platformSprite = this.add.image(centerX, centerY, `platform_${index}`);
      this.physics.add.existing(platformSprite, true);
      this.platforms.add(platformSprite);
      
      // Subtle floating animation
      this.tweens.add({
        targets: platformSprite,
        y: centerY - 2,
        duration: 2000 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
    
    // Spikes
    this.spikes = this.physics.add.staticGroup();
    this.currentLevel.spikes.forEach(spike => {
      const spikeGraphics = this.add.graphics();
      spikeGraphics.fillStyle(0xff0000, 1);
      
      // Draw triangle spikes
      const spikeCount = Math.floor(spike.width / 10);
      for (let i = 0; i < spikeCount; i++) {
        spikeGraphics.fillTriangle(
          spike.x + i * 10, spike.y,
          spike.x + i * 10 + 5, spike.y - 10,
          spike.x + i * 10 + 10, spike.y
        );
      }
      spikeGraphics.generateTexture(`spike_${spike.x}_${spike.y}`, spike.width, 10);
      spikeGraphics.destroy();
      
      const spikeSprite = this.add.sprite(spike.x + spike.width / 2, spike.y - 5, `spike_${spike.x}_${spike.y}`);
      this.physics.add.existing(spikeSprite, true);
      this.spikes.add(spikeSprite);
    });
    
    // Goal
    this.goal = this.physics.add.sprite(
      this.currentLevel.goal.x,
      this.currentLevel.goal.y,
      ''
    );
    
    // Create goal visual (flag)
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0x46D160, 1);
    goalGraphics.fillRect(0, 0, 40, 60);
    goalGraphics.fillStyle(0xffffff, 1);
    // Draw a star shape manually
    goalGraphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = 20 + Math.cos(angle) * 10;
      const y = 30 + Math.sin(angle) * 10;
      if (i === 0) goalGraphics.moveTo(x, y);
      else goalGraphics.lineTo(x, y);
    }
    goalGraphics.closePath();
    goalGraphics.fillPath();
    goalGraphics.generateTexture('goal_flag', 40, 60);
    goalGraphics.destroy();
    
    this.goal.setTexture('goal_flag');
    this.goal.setScale(1);
    
    // Animate goal
    this.tweens.add({
      targets: this.goal,
      y: this.currentLevel.goal.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }

  private createPlayer() {
    // Create cute character sprite with shadow
    const playerGraphics = this.add.graphics();
    
    // Shadow
    playerGraphics.fillStyle(0x000000, 0.3);
    playerGraphics.fillCircle(18, 22, 14);
    
    // Main body (gradient effect)
    playerGraphics.fillStyle(0xFF4500, 1);
    playerGraphics.fillCircle(16, 16, 15);
    
    // Highlight
    playerGraphics.fillStyle(0xFF6B35, 1);
    playerGraphics.fillCircle(12, 12, 6);
    
    // Eyes (cute and big)
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(11, 14, 5);
    playerGraphics.fillCircle(21, 14, 5);
    
    // Pupils
    playerGraphics.fillStyle(0x000000, 1);
    playerGraphics.fillCircle(12, 15, 3);
    playerGraphics.fillCircle(22, 15, 3);
    
    // Eye shine
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(13, 14, 1.5);
    playerGraphics.fillCircle(23, 14, 1.5);
    
    // Happy smile
    playerGraphics.lineStyle(2, 0x000000, 1);
    playerGraphics.beginPath();
    playerGraphics.arc(16, 18, 6, 0, Math.PI, false);
    playerGraphics.strokePath();
    
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.body!.setSize(26, 26);
    this.player.body!.setOffset(3, 3);
    
    // Proper physics settings for smooth movement
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(800);
    body.setMaxVelocity(300, 600);
    body.setDrag(800, 0);
    
    // Idle animation (bobbing)
    this.tweens.add({
      targets: this.player,
      scaleY: 1.05,
      scaleX: 0.95,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createUI() {
    const { width } = this.scale;
    
    // Level name
    this.levelText = this.add.text(width / 2, 20, `Level ${this.levelNumber}: ${this.currentLevel.name}`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100);
    
    // Timer
    this.timerText = this.add.text(20, 20, 'Time: 0.0s', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    })
    .setScrollFactor(0)
    .setDepth(100);
    
    // Deaths
    this.deathText = this.add.text(20, 55, 'Deaths: 0', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    })
    .setScrollFactor(0)
    .setDepth(100);
    
    // Instructions
    this.add.text(width - 20, 20, 'WASD / Arrow Keys to Move', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(100);
  }

  override update() {
    if (!this.isRunning) return;
    
    // Update timer
    this.elapsedTime = Date.now() - this.startTime;
    this.timerText.setText(`Time: ${(this.elapsedTime / 1000).toFixed(1)}s`);
    
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Smooth player movement with acceleration
    const speed = 250;
    const acceleration = 1200;
    const jumpVelocity = -420;
    
    // Horizontal movement with acceleration
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setAccelerationX(-acceleration);
      this.player.setFlipX(true);
      
      // Tilt effect while moving
      this.player.setRotation(-0.05);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setAccelerationX(acceleration);
      this.player.setFlipX(false);
      
      // Tilt effect while moving
      this.player.setRotation(0.05);
    } else {
      body.setAccelerationX(0);
      
      // Reset tilt
      this.player.setRotation(0);
    }
    
    // Jump with squash & stretch effect
    if ((this.cursors.up.isDown || this.wasd.W.isDown) && body.touching.down) {
      body.setVelocityY(jumpVelocity);
      
      // Squash before jump
      this.tweens.add({
        targets: this.player,
        scaleY: 0.8,
        scaleX: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
      
      // Jump particles
      this.createJumpParticles(this.player.x, this.player.y + 16);
    }
    
    // Landing detection
    if (body.velocity.y > 0 && !body.touching.down) {
      // Falling - stretch
      this.player.setScale(0.9, 1.1);
    } else if (body.touching.down && Math.abs(body.velocity.y) < 10) {
      // On ground - reset
      this.player.setScale(1, 1);
    }
    
    // Check if fell off the world
    if (this.player.y > 650) {
      this.respawn();
    }
  }
  
  private createJumpParticles(x: number, y: number) {
    // Create particle effect on jump
    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(x, y, 3, 0xFFD635, 1);
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 100;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30 + 20,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private hitSpike() {
    this.respawn();
  }

  private respawn() {
    this.deaths++;
    this.deathText.setText(`Deaths: ${this.deaths}`);
    
    // Flash effect
    this.cameras.main.flash(200, 255, 0, 0);
    
    // Reset player position
    this.player.setPosition(100, 500);
    this.player.setVelocity(0, 0);
  }

  private async reachGoal() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Victory effect
    this.cameras.main.flash(500, 0, 255, 0);
    this.player.setVelocity(0, 0);
    
    // Celebrate
    this.tweens.add({
      targets: this.player,
      scaleX: 1.2,
      scaleY: 1.2,
      angle: 360,
      duration: 500,
    });
    
    // Submit time to server
    await this.submitTime();
    
    // Show completion screen after a delay
    this.time.delayedCall(1000, () => {
      this.scene.start('LevelComplete', {
        level: this.levelNumber,
        time: this.elapsedTime,
        deaths: this.deaths,
      });
    });
  }

  private async submitTime() {
    try {
      const data: SubmitTimeRequest = {
        levelId: this.levelNumber,
        completionTime: this.elapsedTime,
        deaths: this.deaths,
      };
      
      const response = await fetch('/api/submit-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json() as SubmitTimeResponse;
        console.log('Time submitted:', result);
      }
    } catch (error) {
      console.error('Failed to submit time:', error);
    }
  }
}
