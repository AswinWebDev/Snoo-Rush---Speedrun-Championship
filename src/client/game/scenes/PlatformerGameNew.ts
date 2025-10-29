import { Scene } from 'phaser';
import { LEVELS } from '../data/levels_new';
import type { LevelConfig } from '../data/levels_new';
import { SubmitTimeRequest, SubmitTimeResponse } from '../../../shared/types/api';
import { MobileControls } from '../ui/MobileControls';
import { AssetGenerator } from '../utils/AssetGenerator';
import { ParallaxBackground } from '../utils/ParallaxBackground';
import { Enemy } from '../entities/Enemy';
import { Collectible } from '../entities/Collectible';
import { SoundManager } from '../audio/SoundManager';
import { AtmosphericEffects } from '../effects/AtmosphericEffects';

export class PlatformerGameNew extends Scene {
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
  private timeBonus = 0; // Time reduction from collectibles
  private isRunning = false;
  private collectedItemsThisSession: Set<string> = new Set(); // Track collected items
  
  // Systems
  private mobileControls!: MobileControls;
  private assetGenerator!: AssetGenerator;
  private parallaxBg!: ParallaxBackground;
  private soundManager!: SoundManager;
  private atmosphere!: AtmosphericEffects;
  private enemies: Enemy[] = [];
  private collectibles: Collectible[] = [];
  
  // Visual effects tracking
  private lastGrounded = false;
  
  // Advanced platformer feel
  private coyoteTimeMs = 120;
  private jumpBufferMs = 150;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private prevJumpDown = false;
  
  // UI Elements
  private timerText!: Phaser.GameObjects.Text;
  private deathText!: Phaser.GameObjects.Text;
  private bonusText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  private isPaused = false;
  
  constructor() {
    super('GameNew');
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
    this.timeBonus = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.enemies = [];
    this.collectibles = [];
    this.collectedItemsThisSession = new Set(); // Reset collected items for new level
  }

  create() {
    // Initialize systems
    this.assetGenerator = new AssetGenerator(this);
    this.parallaxBg = new ParallaxBackground(this);
    this.mobileControls = new MobileControls(this);
    this.soundManager = new SoundManager(this);
    this.atmosphere = new AtmosphericEffects(this);
    
    // Generate all assets
    this.generateAssets();
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.currentLevel.worldWidth, this.currentLevel.worldHeight);
    
    // Create parallax background
    this.parallaxBg.create(
      this.currentLevel.theme,
      this.currentLevel.worldWidth,
      this.currentLevel.worldHeight
    );
    
    // Create level
    this.createLevel();
    
    // Create player
    this.createPlayer();
    
    // Create enemies
    this.createEnemies();
    
    // Create collectibles
    this.createCollectibles();
    
    // Create UI
    this.createUI();
    
    // Mobile controls
    this.mobileControls.create();
    
    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    
    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.spikes, this.hitSpike, undefined, this);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
    
    // Enemy collisions
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy.sprite, this.platforms);
      this.physics.add.overlap(this.player, enemy.sprite, () => this.hitEnemy(enemy), undefined, this);
    });
    
    // Collectible collisions
    this.collectibles.forEach(collectible => {
      this.physics.add.overlap(
        this.player,
        collectible.sprite,
        () => this.collectItem(collectible),
        undefined,
        this
      );
    });
    
    // Start timer
    this.startTime = Date.now();
    this.isRunning = true;
    
    // Camera setup
    this.cameras.main.setBounds(0, 0, this.currentLevel.worldWidth, this.currentLevel.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    
    // Add atmospheric effects
    this.addAtmosphericEffects();
    
    // Add vignette effect
    this.addVignetteEffect();
    
    // Play ambient background music
    this.soundManager.playBackgroundMusic();
  }
  
  private addAtmosphericEffects() {
    // Add fireflies throughout the level
    this.atmosphere.createFireflies(
      0, 
      0, 
      this.currentLevel.worldWidth, 
      this.currentLevel.worldHeight, 
      20
    );
    
    // Add floating dust particles
    this.atmosphere.createDustParticles(
      this.currentLevel.worldWidth,
      this.currentLevel.worldHeight,
      150
    );
    
    // Add light rays from top
    if (this.currentLevel.theme === 'forest' || this.currentLevel.theme === 'sky') {
      this.atmosphere.createLightRays(
        this.currentLevel.worldWidth / 2,
        0,
        7
      );
    }
  }

  private generateAssets() {
    // Generate all platform textures for this theme
    this.currentLevel.platforms.forEach((platform, index) => {
      const type = platform.type || 'grass';
      this.assetGenerator.generatePlatformTexture(type, platform.width, platform.height);
    });
    
    // Generate environmental assets
    this.assetGenerator.generateTree('small');
    this.assetGenerator.generateTree('medium');
    this.assetGenerator.generateTree('large');
    this.assetGenerator.generateRock('small');
    this.assetGenerator.generateRock('medium');
    this.assetGenerator.generateRock('large');
    this.assetGenerator.generateBush();
    
    // Generate collectibles
    this.assetGenerator.generateCoin();
    this.assetGenerator.generateGem();
    
    // Generate enemies
    this.assetGenerator.generateEnemy('patrol');
    this.assetGenerator.generateEnemy('jump');
    this.assetGenerator.generateEnemy('fly');
  }

  private createLevel() {
    // Platforms with beautiful textures
    this.platforms = this.physics.add.staticGroup();
    
    this.currentLevel.platforms.forEach((platform, index) => {
      const centerX = platform.x + platform.width / 2;
      const centerY = platform.y + platform.height / 2;
      const type = platform.type || 'grass';
      
      const textureKey = this.assetGenerator.generatePlatformTexture(
        type,
        platform.width,
        platform.height
      );
      
      const platformSprite = this.add.image(centerX, centerY, textureKey);
      this.physics.add.existing(platformSprite, true);
      this.platforms.add(platformSprite);
      
      // Add environmental decorations
      this.addPlatformDecorations(platform, index);
    });
    
    // Spikes with better visuals
    this.spikes = this.physics.add.staticGroup();
    
    this.currentLevel.spikes.forEach(spike => {
      const spikeGraphics = this.add.graphics();
      spikeGraphics.fillStyle(0xDC143C, 1);
      
      // Draw sharp spikes
      const spikeCount = Math.floor(spike.width / 12);
      for (let i = 0; i < spikeCount; i++) {
        spikeGraphics.fillTriangle(
          i * 12, 12,
          i * 12 + 6, 0,
          i * 12 + 12, 12
        );
      }
      
      // Add dark outline
      spikeGraphics.lineStyle(2, 0x8B0000, 1);
      for (let i = 0; i < spikeCount; i++) {
        spikeGraphics.strokeTriangle(
          i * 12, 12,
          i * 12 + 6, 0,
          i * 12 + 12, 12
        );
      }
      
      spikeGraphics.generateTexture(`spike_${spike.x}_${spike.y}`, spike.width, 12);
      spikeGraphics.destroy();
      
      const spikeSprite = this.add.image(spike.x + spike.width / 2, spike.y - 6, `spike_${spike.x}_${spike.y}`);
      this.physics.add.existing(spikeSprite, true);
      this.spikes.add(spikeSprite);
      
      // Danger glow
      const glow = this.add.circle(spike.x + spike.width / 2, spike.y, spike.width / 2, 0xFF0000, 0.2);
      glow.setDepth(-1);
      
      this.tweens.add({
        targets: glow,
        alpha: 0.4,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    });
    
    // Goal with epic animation
    this.createGoal();
  }

  private addPlatformDecorations(platform: any, index: number) {
    const platformTop = platform.y;
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;
    const platformWidth = platform.width;
    
    // Forest theme - lush decoration
    if (this.currentLevel.theme === 'forest' && platform.type === 'grass') {
      // Add bushes along platform
      const bushCount = Math.floor(platformWidth / 80);
      for (let i = 0; i < bushCount; i++) {
        const xPos = platformLeft + (i + 0.5) * (platformWidth / bushCount) + (Math.random() * 20 - 10);
        const bush = this.add.sprite(xPos, platformTop, 'bush');
        bush.setScale(0.4 + Math.random() * 0.2);
        bush.setOrigin(0.5, 1);
        bush.setDepth(platform.y / 100); // Depth based on Y position
      }
      
      // Add trees on wider platforms
      if (platformWidth > 150) {
        const treeCount = Math.floor(platformWidth / 200);
        for (let i = 0; i < treeCount; i++) {
          const xPos = platformLeft + (i + 1) * (platformWidth / (treeCount + 1));
          const treeSize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large';
          const tree = this.add.sprite(xPos, platformTop, `tree_${treeSize}`);
          tree.setOrigin(0.5, 1);
          tree.setDepth(-5);
          
          // Gentle sway animation
          this.tweens.add({
            targets: tree,
            angle: { from: -2, to: 2 },
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }
      }
    }
    
    // Cave/Desert theme - rocky decoration
    else if (this.currentLevel.theme === 'cave' || this.currentLevel.theme === 'desert') {
      // Add rocks
      const rockCount = Math.floor(platformWidth / 100);
      for (let i = 0; i < rockCount; i++) {
        const xPos = platformLeft + (i + 0.5) * (platformWidth / rockCount) + (Math.random() * 15 - 7.5);
        const rockSize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large';
        const rock = this.add.sprite(xPos, platformTop, `rock_${rockSize}`);
        rock.setOrigin(0.5, 1);
        rock.setDepth(platform.y / 100);
      }
    }
    
    // Ice theme - crystals
    else if (this.currentLevel.theme === 'ice') {
      if (platformWidth > 100 && Math.random() > 0.5) {
        const xPos = platformLeft + platformWidth / 2;
        const crystal = this.add.circle(xPos, platformTop - 20, 8, 0xADD8E6, 0.8);
        crystal.setDepth(platform.y / 100);
        
        this.tweens.add({
          targets: crystal,
          alpha: 0.4,
          duration: 1500,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }

  private createGoal() {
    // Epic goal portal
    const goalGraphics = this.add.graphics();
    
    // Portal base
    goalGraphics.fillStyle(0x46D160, 1);
    goalGraphics.fillRect(0, 0, 60, 80);
    
    // Door frame
    goalGraphics.lineStyle(4, 0x2E8B57, 1);
    goalGraphics.strokeRect(4, 4, 52, 72);
    
    // Inner glow
    goalGraphics.fillStyle(0x90EE90, 0.7);
    goalGraphics.fillRect(10, 10, 40, 60);
    
    // Star decoration
    goalGraphics.fillStyle(0xFFD700, 1);
    const centerX = 30;
    const centerY = 40;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * 15;
      const y = centerY + Math.sin(angle) * 15;
      if (i === 0) {
        goalGraphics.beginPath();
        goalGraphics.moveTo(x, y);
      } else {
        goalGraphics.lineTo(x, y);
      }
    }
    goalGraphics.closePath();
    goalGraphics.fillPath();
    
    goalGraphics.generateTexture('goal_portal', 60, 80);
    goalGraphics.destroy();
    
    this.goal = this.physics.add.sprite(
      this.currentLevel.goal.x,
      this.currentLevel.goal.y,
      'goal_portal'
    );
    
    // Floating animation
    this.tweens.add({
      targets: this.goal,
      y: this.currentLevel.goal.y - 15,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Rotation
    this.tweens.add({
      targets: this.goal,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });
    
    // Particle effect around goal
    this.time.addEvent({
      delay: 200,
      callback: () => {
        if (!this.goal.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 40;
        const x = this.goal.x + Math.cos(angle) * distance;
        const y = this.goal.y + Math.sin(angle) * distance;
        
        const particle = this.add.circle(x, y, 3, 0x46D160, 1);
        
        this.tweens.add({
          targets: particle,
          x: this.goal.x,
          y: this.goal.y,
          alpha: 0,
          duration: 1000,
          onComplete: () => particle.destroy(),
        });
      },
      loop: true,
    });
  }

  private createPlayer() {
    // Generate enhanced player sprite
    const playerGraphics = this.add.graphics();
    
    // Shadow
    playerGraphics.fillStyle(0x000000, 0.3);
    playerGraphics.fillCircle(20, 26, 16);
    
    // Body with gradient effect
    playerGraphics.fillStyle(0xFF4500, 1);
    playerGraphics.fillCircle(20, 20, 18);
    
    // Highlight
    playerGraphics.fillStyle(0xFF6B35, 1);
    playerGraphics.fillCircle(14, 14, 8);
    
    // Big cute eyes
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(14, 18, 6);
    playerGraphics.fillCircle(26, 18, 6);
    
    // Pupils
    playerGraphics.fillStyle(0x000000, 1);
    playerGraphics.fillCircle(15, 19, 3.5);
    playerGraphics.fillCircle(27, 19, 3.5);
    
    // Eye shine
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(16, 17, 2);
    playerGraphics.fillCircle(28, 17, 2);
    
    // Happy smile
    playerGraphics.lineStyle(3, 0x000000, 1);
    playerGraphics.beginPath();
    playerGraphics.arc(20, 23, 8, 0, Math.PI, false);
    playerGraphics.strokePath();
    
    playerGraphics.generateTexture('player_new', 40, 40);
    playerGraphics.destroy();
    
    this.player = this.physics.add.sprite(100, 400, 'player_new');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 32);
    body.setOffset(4, 4);
    body.setGravityY(800);
    body.setMaxVelocity(300, 700);
    body.setDrag(800, 0);
    
    // Idle bobbing animation
    this.tweens.add({
      targets: this.player,
      scaleY: 1.05,
      scaleX: 0.95,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createEnemies() {
    if (!this.currentLevel.enemies) return;
    
    this.currentLevel.enemies.forEach(enemyData => {
      const enemy = new Enemy(
        this,
        enemyData.x,
        enemyData.y,
        enemyData.type,
        enemyData.range
      );
      this.enemies.push(enemy);
    });
  }

  private createCollectibles() {
    if (!this.currentLevel.collectibles) return;
    
    this.currentLevel.collectibles.forEach(collectibleData => {
      const collectible = new Collectible(
        this,
        collectibleData.x,
        collectibleData.y,
        collectibleData.type
      );
      this.collectibles.push(collectible);
    });
  }

  private createUI() {
    const { width } = this.scale;
    
    // Level name with background
    const levelBg = this.add.rectangle(width / 2, 30, 400, 50, 0x000000, 0.7);
    levelBg.setScrollFactor(0);
    levelBg.setDepth(99);
    
    this.levelText = this.add.text(width / 2, 30, `Level ${this.levelNumber}: ${this.currentLevel.name}`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100);
    
    // Stats panel - moved down to avoid overlap with level title
    const statsBg = this.add.rectangle(100, 120, 180, 110, 0x000000, 0.7);
    statsBg.setOrigin(0.5);
    statsBg.setScrollFactor(0);
    statsBg.setDepth(99);
    
    this.timerText = this.add.text(20, 90, '⏱️ Time: 0.0s', {
      fontFamily: 'Arial Bold',
      fontSize: '18px',
      color: '#FFD700',
    })
    .setScrollFactor(0)
    .setDepth(100);
    
    this.deathText = this.add.text(20, 120, '💀 Deaths: 0', {
      fontFamily: 'Arial Bold',
      fontSize: '18px',
      color: '#FF6B6B',
    })
    .setScrollFactor(0)
    .setDepth(100);
    
    this.bonusText = this.add.text(20, 150, '⏱️ Bonus: -0.0s', {
      fontFamily: 'Arial Bold',
      fontSize: '18px',
      color: '#46D160',
    })
    .setScrollFactor(0)
    .setDepth(100);
    
    // Pause/Menu button (top right) - Small and minimal for mobile
    this.pauseButton = this.add.text(width - 10, 10, '⏸', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#FF4500',
      padding: { x: 8, y: 4 },
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(101)
    .setInteractive({ useHandCursor: true })
    .setAlpha(0.7); // Semi-transparent so it's less obtrusive
    
    // Pause button functionality
    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setScale(1.1);
    });
    
    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setScale(1);
    });
    
    this.pauseButton.on('pointerdown', () => {
      this.showPauseMenu();
    });
  }

  private addVignetteEffect() {
    const { width, height } = this.scale;
    
    // Simple vignette overlay
    const vignette = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.2);
    vignette.setScrollFactor(0);
    vignette.setDepth(98);
  }

  private showPauseMenu() {
    // Pause the game
    this.isPaused = true;
    this.isRunning = false;
    this.physics.pause();
    
    const { width, height } = this.scale;
    
    // Pause overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    
    // Pause text
    const pauseText = this.add.text(width / 2, height * 0.3, 'PAUSED', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 8,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201);
    
    // Resume button
    const resumeBtn = this.add.text(width / 2, height * 0.5, '▶ RESUME', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#46D160',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 },
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201)
    .setInteractive({ useHandCursor: true });
    
    resumeBtn.on('pointerover', () => resumeBtn.setScale(1.1));
    resumeBtn.on('pointerout', () => resumeBtn.setScale(1));
    resumeBtn.on('pointerdown', () => {
      overlay.destroy();
      pauseText.destroy();
      resumeBtn.destroy();
      restartBtn.destroy();
      quitBtn.destroy();
      this.isPaused = false;
      this.isRunning = true;
      this.physics.resume();
    });
    
    // Restart button
    const restartBtn = this.add.text(width / 2, height * 0.62, '🔄 RESTART LEVEL', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#FFD635',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 },
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201)
    .setInteractive({ useHandCursor: true });
    
    restartBtn.on('pointerover', () => restartBtn.setScale(1.1));
    restartBtn.on('pointerout', () => restartBtn.setScale(1));
    restartBtn.on('pointerdown', () => {
      this.scene.restart();
    });
    
    // Quit button
    const quitBtn = this.add.text(width / 2, height * 0.74, '🏠 QUIT TO MENU', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#FF6B6B',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 },
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201)
    .setInteractive({ useHandCursor: true });
    
    quitBtn.on('pointerover', () => quitBtn.setScale(1.1));
    quitBtn.on('pointerout', () => quitBtn.setScale(1));
    quitBtn.on('pointerdown', () => {
      this.scene.start('LevelSelect');
    });
  }

  override update() {
    // Always update mobile controls (even when paused, for safety cleanup)
    if (this.mobileControls) {
      this.mobileControls.update();
    }
    
    if (!this.isRunning || this.isPaused) return;
    
    // Update timer
    this.elapsedTime = Date.now() - this.startTime;
    this.timerText.setText(`⏱️ Time: ${(this.elapsedTime / 1000).toFixed(1)}s`);
    
    // Update parallax background
    if (this.parallaxBg) {
      this.parallaxBg.update(this.cameras.main);
    }
    
    // Update player movement
    this.updatePlayerMovement();
    
    // Update enemies
    this.enemies.forEach(enemy => enemy.update());
    
    // Check if fell off world (CRITICAL FIX)
    if (this.player.y > this.currentLevel.worldHeight - 50) {
      this.respawn();
    }
  }

  private updatePlayerMovement() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const delta = this.game.loop.delta;
    
    const acceleration = 1200;
    const jumpVelocity = -450;
    
    // Input
    const isLeftDown = this.cursors.left.isDown || this.wasd.A.isDown || this.mobileControls.isLeftPressed;
    const isRightDown = this.cursors.right.isDown || this.wasd.D.isDown || this.mobileControls.isRightPressed;
    const isJumpDown = this.cursors.up.isDown || this.wasd.W.isDown || this.mobileControls.isJumpPressed;
    const justPressed = isJumpDown && !this.prevJumpDown;
    const justReleased = !isJumpDown && this.prevJumpDown;
    
    // Horizontal movement
    if (isLeftDown) {
      body.setAccelerationX(-acceleration);
      this.player.setFlipX(true);
      this.player.setRotation(-0.05);
    } else if (isRightDown) {
      body.setAccelerationX(acceleration);
      this.player.setFlipX(false);
      this.player.setRotation(0.05);
    } else {
      body.setAccelerationX(0);
      this.player.setRotation(0);
    }
    
    // Update coyote time and jump buffer timers
    if (body.blocked.down || body.touching.down) {
      this.coyoteTimer = this.coyoteTimeMs;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }
    if (justPressed) {
      this.jumpBufferTimer = this.jumpBufferMs;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }
    
    // Jump when allowed by timers
    if (this.coyoteTimer > 0 && this.jumpBufferTimer > 0) {
      body.setVelocityY(jumpVelocity);
      
      // SOUND: Jump
      this.soundManager.playJump();
      
      // Squash and stretch
      this.tweens.add({
        targets: this.player,
        scaleY: 0.7,
        scaleX: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
      
      // Enhanced jump particles with glow
      this.atmosphere.createJumpBurst(this.player.x, this.player.y + 20);
      this.createJumpParticles(this.player.x, this.player.y + 20);
      
      // Consume timers
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }
    
    // Variable jump height: cut velocity on early release
    if (justReleased && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.5);
    }
    
    // Landing detection
    const isGroundedNow = body.touching.down && Math.abs(body.velocity.y) < 10;
    if (isGroundedNow && !this.lastGrounded && body.velocity.y > 100) {
      // SOUND: Land
      this.soundManager.playLand();
      
      // Landing particles
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
        const particle = this.add.circle(this.player.x, this.player.y + 20, 2, 0xCCCCCC, 1);
        
        this.tweens.add({
          targets: particle,
          x: this.player.x + Math.cos(angle) * 25,
          y: this.player.y + Math.sin(angle) * 15 + 20,
          alpha: 0,
          duration: 300,
          ease: 'Quad.easeOut',
          onComplete: () => particle.destroy(),
        });
      }
    }
    this.lastGrounded = isGroundedNow;
    
    // Air physics
    if (body.velocity.y > 0 && !body.touching.down) {
      this.player.setScale(0.9, 1.1);
    } else if (isGroundedNow) {
      this.player.setScale(1, 1);
    }
    
    // Movement trail with glow
    if (Math.abs(body.velocity.x) > 100) {
      this.atmosphere.createPlayerTrail(this.player.x, this.player.y);
      this.createMovementTrail();
    }
    
    this.prevJumpDown = isJumpDown;
  }

  private createJumpParticles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const particle = this.add.circle(x, y, 3, 0xFFD635, 1);
      const angle = (Math.PI * 2 * i) / 10;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40 + 25,
        alpha: 0,
        scale: 0,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private createMovementTrail() {
    if (Math.random() > 0.8) {
      const trail = this.add.circle(this.player.x, this.player.y, 5, 0xFF4500, 0.5);
      
      this.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => trail.destroy(),
      });
    }
  }

  private hitSpike() {
    // SOUND: Death
    this.soundManager.playDeath();
    this.respawn();
  }

  private hitEnemy(enemy: Enemy) {
    // Check if jumping on enemy
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    if (body.velocity.y > 0 && this.player.y < enemy.sprite.y - 10) {
      // SOUND: Enemy hit
      this.soundManager.playEnemyHit();
      
      // Defeat enemy - get time bonus
      const bonus = 0.5; // 0.5 second bonus
      this.timeBonus += bonus;
      this.bonusText.setText(`⏱️ Bonus: -${this.timeBonus.toFixed(1)}s`);
      
      // Slow motion effect
      this.atmosphere.slowMotion(0.3, 300);
      
      // Bounce
      body.setVelocityY(-350);
      
      // Remove enemy
      enemy.destroy();
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
    } else {
      // Take damage
      this.soundManager.playDeath();
      this.respawn();
    }
  }

  private collectItem(collectible: Collectible) {
    if (collectible.collected) return;
    
    // Create unique ID for this collectible
    const itemId = `${this.levelNumber}_${collectible.sprite.x}_${collectible.sprite.y}`;
    
    // Check if already collected this session
    if (this.collectedItemsThisSession.has(itemId)) return;
    
    // Mark as collected
    this.collectedItemsThisSession.add(itemId);
    
    // SOUND: Collect
    this.soundManager.playCollect();
    
    // Get time reduction based on type
    const timeReduction = collectible.collect();
    this.timeBonus += timeReduction;
    this.bonusText.setText(`⏱️ Bonus: -${this.timeBonus.toFixed(1)}s`);
    
    // Shimmer effect
    this.atmosphere.createShimmer(collectible.sprite.x, collectible.sprite.y);
    
    // Show floating text with time reduction
    const text = this.add.text(collectible.sprite.x, collectible.sprite.y, `-${timeReduction.toFixed(1)}s`, {
      fontSize: '20px',
      color: '#46D160',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  private respawn() {
    this.deaths++;
    this.deathText.setText(`💀 Deaths: ${this.deaths}`);
    
    // Screen shake
    this.cameras.main.shake(300, 0.01);
    
    // Flash effect
    this.cameras.main.flash(250, 255, 0, 0);
    
    // Reset position
    this.player.setPosition(100, 400);
    this.player.setVelocity(0, 0);
  }

  private async reachGoal() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // SOUND: Victory
    this.soundManager.playVictory();
    
    // Epic victory effect
    this.cameras.main.flash(600, 0, 255, 100);
    this.atmosphere.screenShake(0.01, 400);
    
    this.player.setVelocity(0, 0);
    
    // Victory animation
    this.tweens.add({
      targets: this.player,
      scaleX: 1.3,
      scaleY: 1.3,
      angle: 360,
      duration: 600,
      ease: 'Back.easeOut',
    });
    
    // Massive particle burst
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const distance = 150 + Math.random() * 50;
      const particle = this.add.circle(this.player.x, this.player.y, 4, [0xFF4500, 0xFFD700, 0x46D160][i % 3], 1);
      
      this.tweens.add({
        targets: particle,
        x: this.player.x + Math.cos(angle) * distance,
        y: this.player.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
    
    // Fireworks
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 50, () => {
        this.createFirework(this.player.x, this.player.y);
      });
    }
    
    // Submit score
    await this.submitTime();
    
    // Transition to completion screen with adjusted time
    this.time.delayedCall(1500, () => {
      const adjustedTime = Math.max(0, this.elapsedTime - (this.timeBonus * 1000));
      this.scene.start('LevelComplete', {
        level: this.levelNumber,
        time: adjustedTime,
        deaths: this.deaths,
        timeBonus: this.timeBonus,
      });
    });
  }

  private createFirework(x: number, y: number) {
    const colors = [0xFF4500, 0xFFD700, 0x46D160, 0x00CED1, 0xFF1493];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(x, y, 4, color, 1);
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 150 + Math.random() * 100;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private async submitTime() {
    try {
      // Submit adjusted time (raw time minus bonuses)
      const adjustedTime = Math.max(0, this.elapsedTime - (this.timeBonus * 1000));
      
      const data: SubmitTimeRequest = {
        levelId: this.levelNumber,
        completionTime: adjustedTime,
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
