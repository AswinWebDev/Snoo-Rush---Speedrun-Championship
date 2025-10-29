import Phaser from 'phaser';

export class AssetGenerator {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  // Generate platform textures for each theme
  generatePlatformTexture(type: string, width: number, height: number): string {
    const key = `platform_${type}_${width}_${height}`;
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    
    switch (type) {
      case 'grass':
        // Grass platform with dirt and grass blades
        graphics.fillStyle(0x8B4513, 1); // Brown dirt
        graphics.fillRoundedRect(0, 10, width, height - 10, 4);
        
        graphics.fillStyle(0x228B22, 1); // Green grass top
        graphics.fillRoundedRect(0, 0, width, 12, 4);
        
        // Grass blades detail
        graphics.lineStyle(2, 0x32CD32, 1);
        for (let i = 0; i < width; i += 8) {
          graphics.lineBetween(i, 2, i, 10);
          graphics.lineBetween(i + 4, 4, i + 4, 12);
        }
        
        // Dirt texture
        graphics.fillStyle(0x654321, 0.3);
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width;
          const y = 12 + Math.random() * (height - 12);
          graphics.fillCircle(x, y, 2);
        }
        break;
        
      case 'stone':
        // Stone brick texture
        graphics.fillStyle(0x696969, 1);
        graphics.fillRoundedRect(0, 0, width, height, 4);
        
        // Brick pattern
        graphics.lineStyle(2, 0x505050, 1);
        const brickHeight = height / 2;
        graphics.lineBetween(0, brickHeight, width, brickHeight);
        
        for (let x = 0; x < width; x += width / 4) {
          graphics.lineBetween(x, 0, x, brickHeight);
        }
        for (let x = width / 8; x < width; x += width / 4) {
          graphics.lineBetween(x, brickHeight, x, height);
        }
        
        // Stone texture details
        graphics.fillStyle(0x808080, 0.3);
        for (let i = 0; i < 15; i++) {
          graphics.fillCircle(Math.random() * width, Math.random() * height, 2);
        }
        break;
        
      case 'ice':
        // Icy blue platform
        graphics.fillStyle(0xADD8E6, 1);
        graphics.fillRoundedRect(0, 0, width, height, 6);
        
        // Ice shine/highlight
        graphics.fillStyle(0xF0FFFF, 0.6);
        graphics.fillRoundedRect(4, 2, width - 8, height / 3, 4);
        
        // Ice cracks
        graphics.lineStyle(1, 0xB0E0E6, 0.8);
        graphics.lineBetween(width * 0.3, 0, width * 0.35, height);
        graphics.lineBetween(width * 0.7, 0, width * 0.65, height);
        break;
        
      case 'wood':
        // Wooden plank
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRoundedRect(0, 0, width, height, 4);
        
        // Wood grain
        graphics.lineStyle(1, 0x654321, 0.5);
        for (let i = 0; i < 5; i++) {
          const y = (height / 5) * i;
          graphics.lineBetween(0, y, width, y + Math.random() * 3);
        }
        
        // Wood knots
        graphics.fillStyle(0x654321, 0.7);
        graphics.fillCircle(width * 0.3, height / 2, 3);
        graphics.fillCircle(width * 0.7, height / 2, 3);
        break;
        
      case 'metal':
        // Metal platform (for space/sky)
        graphics.fillStyle(0x708090, 1);
        graphics.fillRoundedRect(0, 0, width, height, 2);
        
        // Metal shine
        graphics.fillStyle(0xC0C0C0, 0.5);
        graphics.fillRoundedRect(0, 0, width, height / 3, 2);
        
        // Rivets
        graphics.fillStyle(0x404040, 1);
        for (let x = 10; x < width; x += 30) {
          graphics.fillCircle(x, 5, 2);
          graphics.fillCircle(x, height - 5, 2);
        }
        break;
        
      default:
        // Default colorful platform
        graphics.fillStyle(0x4a90e2, 1);
        graphics.fillRoundedRect(0, 0, width, height, 6);
        graphics.fillStyle(0xffffff, 0.3);
        graphics.fillRoundedRect(0, 0, width, height / 3, 6);
    }
    
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    
    return key;
  }
  
  // Generate tree sprite
  generateTree(size: 'small' | 'medium' | 'large'): string {
    const sizes = { small: 40, medium: 60, large: 80 };
    const treeSize = sizes[size];
    const key = `tree_${size}`;
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    const trunkWidth = treeSize / 8;
    const trunkHeight = treeSize / 2;
    
    // Trunk
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(treeSize / 2 - trunkWidth / 2, treeSize / 2, trunkWidth, trunkHeight);
    
    // Foliage (3 layers for depth)
    graphics.fillStyle(0x228B22, 1);
    graphics.fillCircle(treeSize / 2, treeSize / 3, treeSize / 3);
    
    graphics.fillStyle(0x32CD32, 1);
    graphics.fillCircle(treeSize / 2 - treeSize / 6, treeSize / 3, treeSize / 4);
    graphics.fillCircle(treeSize / 2 + treeSize / 6, treeSize / 3, treeSize / 4);
    
    graphics.fillStyle(0x3CB371, 1);
    graphics.fillCircle(treeSize / 2, treeSize / 5, treeSize / 5);
    
    graphics.generateTexture(key, treeSize, treeSize);
    graphics.destroy();
    
    return key;
  }
  
  // Generate rock/boulder
  generateRock(size: 'small' | 'medium' | 'large'): string {
    const sizes = { small: 30, medium: 50, large: 70 };
    const rockSize = sizes[size];
    const key = `rock_${size}`;
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    
    // Main rock shape (irregular)
    graphics.fillStyle(0x696969, 1);
    graphics.beginPath();
    graphics.moveTo(rockSize * 0.2, rockSize * 0.8);
    graphics.lineTo(rockSize * 0.5, rockSize * 0.1);
    graphics.lineTo(rockSize * 0.8, rockSize * 0.3);
    graphics.lineTo(rockSize * 0.9, rockSize * 0.7);
    graphics.lineTo(rockSize * 0.6, rockSize * 0.95);
    graphics.closePath();
    graphics.fillPath();
    
    // Highlight
    graphics.fillStyle(0x808080, 0.6);
    graphics.fillCircle(rockSize * 0.6, rockSize * 0.4, rockSize * 0.15);
    
    // Shadow/cracks
    graphics.lineStyle(2, 0x404040, 0.8);
    graphics.lineBetween(rockSize * 0.5, rockSize * 0.3, rockSize * 0.7, rockSize * 0.6);
    
    graphics.generateTexture(key, rockSize, rockSize);
    graphics.destroy();
    
    return key;
  }
  
  // Generate bush
  generateBush(): string {
    const key = 'bush';
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    
    // Bush shape (3 circles)
    graphics.fillStyle(0x228B22, 1);
    graphics.fillCircle(15, 20, 12);
    graphics.fillCircle(30, 20, 14);
    graphics.fillCircle(45, 20, 12);
    
    // Darker details
    graphics.fillStyle(0x1e7a1e, 0.7);
    graphics.fillCircle(20, 18, 8);
    graphics.fillCircle(40, 18, 8);
    
    graphics.generateTexture(key, 60, 30);
    graphics.destroy();
    
    return key;
  }
  
  // Generate collectible coin
  generateCoin(): string {
    const key = 'coin';
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    
    // Gold coin
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(16, 16, 14);
    
    // Inner circle
    graphics.lineStyle(2, 0xFFA500, 1);
    graphics.strokeCircle(16, 16, 10);
    
    // Shine
    graphics.fillStyle(0xFFFF00, 0.7);
    graphics.fillCircle(20, 12, 4);
    
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
    
    return key;
  }
  
  // Generate gem
  generateGem(): string {
    const key = 'gem';
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    
    // Diamond shape
    graphics.fillStyle(0x00CED1, 1);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(28, 16);
    graphics.lineTo(16, 28);
    graphics.lineTo(4, 16);
    graphics.closePath();
    graphics.fillPath();
    
    // Facets
    graphics.fillStyle(0x40E0D0, 1);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(16, 16);
    graphics.lineTo(28, 16);
    graphics.closePath();
    graphics.fillPath();
    
    // Shine
    graphics.fillStyle(0xAFEEEE, 1);
    graphics.fillCircle(20, 10, 3);
    
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
    
    return key;
  }
  
  // Generate enemy sprite
  generateEnemy(type: 'patrol' | 'jump' | 'fly'): string {
    const key = `enemy_${type}`;
    
    if (this.scene.textures.exists(key)) {
      return key;
    }
    
    const graphics = this.scene.add.graphics();
    
    switch (type) {
      case 'patrol':
        // Ground enemy (spiky ball)
        graphics.fillStyle(0x8B0000, 1);
        graphics.fillCircle(16, 16, 14);
        
        // Spikes
        graphics.fillStyle(0xFF0000, 1);
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          const x1 = 16 + Math.cos(angle) * 14;
          const y1 = 16 + Math.sin(angle) * 14;
          const x2 = 16 + Math.cos(angle) * 20;
          const y2 = 16 + Math.sin(angle) * 20;
          
          graphics.beginPath();
          graphics.moveTo(x1 - 2, y1);
          graphics.lineTo(x2, y2);
          graphics.lineTo(x1 + 2, y1);
          graphics.closePath();
          graphics.fillPath();
        }
        break;
        
      case 'jump':
        // Jumping enemy (blob)
        graphics.fillStyle(0x9400D3, 1);
        graphics.fillEllipse(16, 20, 16, 12);
        
        // Eyes
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(12, 18, 4);
        graphics.fillCircle(20, 18, 4);
        
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(12, 18, 2);
        graphics.fillCircle(20, 18, 2);
        break;
        
      case 'fly':
        // Flying enemy (bat-like)
        graphics.fillStyle(0x4B0082, 1);
        graphics.fillCircle(16, 16, 10);
        
        // Wings
        graphics.fillStyle(0x6A0DAD, 1);
        graphics.fillEllipse(6, 16, 8, 12);
        graphics.fillEllipse(26, 16, 8, 12);
        
        // Eyes
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillCircle(13, 15, 2);
        graphics.fillCircle(19, 15, 2);
        break;
    }
    
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
    
    return key;
  }
}
