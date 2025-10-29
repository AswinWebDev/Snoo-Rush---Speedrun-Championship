import { Scene } from 'phaser';
import {
  InitResponse,
  PlacePixelResponse,
  GridStateResponse,
  LeaderboardResponse,
  Pixel,
  Team,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '../../../shared/types/api';

export class PixelGrid extends Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pixels: Map<string, Pixel> = new Map();
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private userInfo!: InitResponse;
  private cellSize = 8; // pixels per grid cell
  private leaderboardText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private cooldownText!: Phaser.GameObjects.Text;
  private canPlace = true;
  private cooldownRemaining = 0;

  constructor() {
    super('PixelGrid');
  }

  async create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor('#0e0e0e');

    // Initialize user and load grid
    await this.initializeGame();

    // Create grid graphics
    this.gridGraphics = this.add.graphics();
    this.drawGrid();

    // Create UI
    this.createUI();

    // Enable grid clicking
    this.input.on('pointerdown', this.handleGridClick, this);

    // Update grid periodically
    this.time.addEvent({
      delay: 5000, // Update every 5 seconds
      callback: this.loadGridState,
      callbackScope: this,
      loop: true,
    });

    // Update cooldown timer
    this.time.addEvent({
      delay: 1000, // Update every second
      callback: this.updateCooldownDisplay,
      callbackScope: this,
      loop: true,
    });

    // Setup responsive layout
    this.updateLayout();
    this.scale.on('resize', this.updateLayout, this);
  }

  private async initializeGame() {
    try {
      const response = await fetch('/api/init');
      if (!response.ok) throw new Error('Failed to initialize');

      this.userInfo = (await response.json()) as InitResponse;
      this.canPlace = this.userInfo.canPlace;
      this.cooldownRemaining = this.userInfo.cooldownRemaining;

      console.log(`Team: ${this.userInfo.teamName} (${this.userInfo.teamColor})`);

      await this.loadGridState();
      await this.loadLeaderboard();
    } catch (error) {
      console.error('Init error:', error);
    }
  }

  private async loadGridState() {
    try {
      const response = await fetch('/api/grid-state');
      if (!response.ok) return;

      const data = (await response.json()) as GridStateResponse;
      this.pixels.clear();
      data.pixels.forEach((pixel) => {
        const key = `${pixel.x}:${pixel.y}`;
        this.pixels.set(key, pixel);
      });

      this.drawGrid();
      await this.loadLeaderboard();
    } catch (error) {
      console.error('Grid load error:', error);
    }
  }

  private async loadLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) return;

      const data = (await response.json()) as LeaderboardResponse;
      this.updateLeaderboard(data.teams);
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
  }

  private drawGrid() {
    this.gridGraphics.clear();

    // Draw pixels
    this.pixels.forEach((pixel) => {
      const color = parseInt(pixel.color.replace('#', '0x'));
      this.gridGraphics.fillStyle(color, 1);
      this.gridGraphics.fillRect(
        pixel.x * this.cellSize,
        pixel.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    });

    // Draw grid lines (subtle)
    this.gridGraphics.lineStyle(0.5, 0x333333, 0.3);
    for (let x = 0; x <= GRID_WIDTH; x++) {
      this.gridGraphics.lineBetween(
        x * this.cellSize,
        0,
        x * this.cellSize,
        GRID_HEIGHT * this.cellSize
      );
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      this.gridGraphics.lineBetween(
        0,
        y * this.cellSize,
        GRID_WIDTH * this.cellSize,
        y * this.cellSize
      );
    }
  }

  private createUI() {
    const { width, height } = this.scale;

    // Status bar at top
    this.statusText = this.add
      .text(10, 10, '', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Cooldown timer
    this.cooldownText = this.add
      .text(10, 40, '', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffaa00',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Leaderboard
    this.leaderboardText = this.add
      .text(width - 10, 10, '', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 4 },
        align: 'right',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.updateStatusDisplay();
  }

  private updateStatusDisplay() {
    if (!this.userInfo) return;

    this.statusText.setText(
      `Team: ${this.userInfo.teamName} | Color: ${this.userInfo.teamColor}`
    );
  }

  private updateCooldownDisplay() {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining -= 1000;
      const seconds = Math.ceil(this.cooldownRemaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      this.cooldownText.setText(`⏱️ Next pixel in: ${minutes}:${secs.toString().padStart(2, '0')}`);
      this.canPlace = false;
    } else {
      this.cooldownText.setText('✅ Ready to place pixel!');
      this.canPlace = true;
    }
  }

  private updateLeaderboard(teams: Team[]) {
    const top5 = teams.slice(0, 5);
    let text = '🏆 LEADERBOARD\n';
    top5.forEach((team, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      text += `${emoji} ${team.name}: ${team.pixelCount}\n`;
    });
    this.leaderboardText.setText(text);
  }

  private async handleGridClick(pointer: Phaser.Input.Pointer) {
    if (!this.canPlace) {
      console.log('On cooldown!');
      return;
    }

    // Convert screen coords to grid coords
    const gridX = Math.floor(pointer.worldX / this.cellSize);
    const gridY = Math.floor(pointer.worldY / this.cellSize);

    // Validate
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
      return;
    }

    try {
      const response = await fetch('/api/place-pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: gridX, y: gridY }),
      });

      const data = (await response.json()) as PlacePixelResponse;

      if (data.success && data.pixel) {
        // Add pixel to map
        const key = `${data.pixel.x}:${data.pixel.y}`;
        this.pixels.set(key, data.pixel);
        this.drawGrid();

        // Update cooldown
        this.cooldownRemaining = data.cooldownRemaining || 0;
        this.canPlace = false;

        // Reload leaderboard
        await this.loadLeaderboard();
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error('Place pixel error:', error);
    }
  }

  private updateLayout() {
    const { width, height } = this.scale;
    this.cameras.resize(width, height);

    // Center grid
    const gridWidth = GRID_WIDTH * this.cellSize;
    const gridHeight = GRID_HEIGHT * this.cellSize;
    const offsetX = (width - gridWidth) / 2;
    const offsetY = (height - gridHeight) / 2;

    this.gridGraphics.setPosition(offsetX, offsetY);

    // Update UI positions
    if (this.leaderboardText) {
      this.leaderboardText.setPosition(width - 10, 10);
    }
  }

  override update() {
    // Game loop updates if needed
  }
}
