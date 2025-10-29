import Phaser from 'phaser';

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private layers: Phaser.GameObjects.TileSprite[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  create(theme: string, worldWidth: number, worldHeight: number) {
    const { width, height } = this.scene.scale;
    
    switch (theme) {
      case 'forest':
        this.createForestBackground(width, height, worldWidth, worldHeight);
        break;
      case 'cave':
        this.createCaveBackground(width, height, worldWidth, worldHeight);
        break;
      case 'sky':
        this.createSkyBackground(width, height, worldWidth, worldHeight);
        break;
      case 'lava':
        this.createLavaBackground(width, height, worldWidth, worldHeight);
        break;
      case 'ice':
        this.createIceBackground(width, height, worldWidth, worldHeight);
        break;
      case 'desert':
        this.createDesertBackground(width, height, worldWidth, worldHeight);
        break;
      case 'space':
        this.createSpaceBackground(width, height, worldWidth, worldHeight);
        break;
    }
  }
  
  private createForestBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Try textured parallax if assets exist (drop-in ready)
    const textured = this.createTexturedParallax(
      ['forest_sky', 'forest_far', 'forest_mid', 'forest_near'],
      [0, 0.15, 0.35, 0.65],
      [-100, -95, -85, -75],
      ww, wh
    );
    if (textured) {
      return;
    }
    
    // Sky layer (gradient)
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8C8, 0x98D8C8, 1);
    sky.fillRect(0, 0, ww, wh);
    sky.setDepth(-100);
    sky.setScrollFactor(0);
    
    // Distant mountains
    this.createMountainLayer(ww, wh, 0.2, 0x6B8E23, -90);
    
    // Mid trees
    this.createTreeLayer(ww, wh, 0.5, 'medium', -80);
    
    // Close trees
    this.createTreeLayer(ww, wh, 0.8, 'large', -70);
  }
  
  private createCaveBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Optional textured parallax
    const textured = this.createTexturedParallax(
      ['cave_far', 'cave_mid', 'cave_near'],
      [0.05, 0.25, 0.6],
      [-100, -90, -80],
      ww, wh
    );
    if (textured) {
      return;
    }
    // Dark cave gradient
    const cave = this.scene.add.graphics();
    cave.fillGradientStyle(0x1a0f2e, 0x1a0f2e, 0x0a0515, 0x0a0515, 1);
    cave.fillRect(0, 0, ww, wh);
    cave.setDepth(-100);
    cave.setScrollFactor(0);
    
    // Stalactites
    this.createStalactiteLayer(ww, wh, 0.3, -90);
    
    // Glowing crystals
    this.createCrystalLayer(ww, wh, 0.6, -80);
  }
  
  private createSkyBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Optional textured parallax
    const textured = this.createTexturedParallax(
      ['sky_far', 'sky_mid', 'sky_near'],
      [0.05, 0.2, 0.5],
      [-100, -90, -80],
      ww, wh
    );
    if (textured) {
      return;
    }
    
    // Sky gradient
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x4a9fd8, 0x4a9fd8, 0x87CEEB, 0x87CEEB, 1);
    sky.fillRect(0, 0, ww, wh);
    sky.setDepth(-100);
    sky.setScrollFactor(0);
    
    // Clouds
    this.createCloudLayer(ww, wh, 0.2, -90);
    this.createCloudLayer(ww, wh, 0.5, -85);
    
    // Stars
    for (let i = 0; i < 30; i++) {
      const star = this.scene.add.circle(
        Math.random() * ww,
        Math.random() * (wh / 2),
        2,
        0xFFFFFF,
        0.6
      );
      star.setDepth(-95);
      star.setScrollFactor(0.1);
      
      this.scene.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
      });
    }
  }
  
  private createLavaBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Optional textured parallax
    const textured = this.createTexturedParallax(
      ['lava_far', 'lava_mid', 'lava_near'],
      [0.05, 0.25, 0.6],
      [-100, -90, -80],
      ww, wh
    );
    if (textured) {
      return;
    }
    // Lava glow
    const lava = this.scene.add.graphics();
    lava.fillGradientStyle(0x8b2500, 0x8b2500, 0xFF4500, 0xFF4500, 1);
    lava.fillRect(0, 0, ww, wh);
    lava.setDepth(-100);
    lava.setScrollFactor(0);
    
    // Lava glow animation
    this.scene.tweens.add({
      targets: lava,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
    
    // Rock pillars
    this.createRockPillarLayer(ww, wh, 0.4, -90);
  }
  
  private createIceBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Optional textured parallax
    const textured = this.createTexturedParallax(
      ['ice_far', 'ice_mid', 'ice_near'],
      [0.05, 0.25, 0.6],
      [-100, -90, -80],
      ww, wh
    );
    if (textured) {
      return;
    }
    // Ice gradient
    const ice = this.scene.add.graphics();
    ice.fillGradientStyle(0xa0d8ef, 0xa0d8ef, 0xE0F6FF, 0xE0F6FF, 1);
    ice.fillRect(0, 0, ww, wh);
    ice.setDepth(-100);
    ice.setScrollFactor(0);
    
    // Snowflakes
    for (let i = 0; i < 50; i++) {
      const snowflake = this.scene.add.circle(
        Math.random() * ww,
        Math.random() * wh,
        3,
        0xFFFFFF,
        0.7
      );
      snowflake.setDepth(-85);
      snowflake.setScrollFactor(0.3);
      
      this.scene.tweens.add({
        targets: snowflake,
        y: snowflake.y + 200,
        x: snowflake.x + (Math.random() - 0.5) * 100,
        duration: 5000 + Math.random() * 3000,
        repeat: -1,
        onRepeat: () => {
          snowflake.y = -10;
          snowflake.x = Math.random() * ww;
        },
      });
    }
    
    // Ice crystals
    this.createIceCrystalLayer(ww, wh, 0.5, -90);
  }
  
  private createDesertBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Optional textured parallax
    const textured = this.createTexturedParallax(
      ['desert_far', 'desert_mid', 'desert_near'],
      [0.05, 0.25, 0.6],
      [-100, -90, -85],
      ww, wh
    );
    if (textured) {
      return;
    }
    
    // Desert gradient
    const desert = this.scene.add.graphics();
    desert.fillGradientStyle(0xf4a460, 0xf4a460, 0xc19a6b, 0xc19a6b, 1);
    desert.fillRect(0, 0, ww, wh);
    desert.setDepth(-100);
    desert.setScrollFactor(0);
    
    // Sand dunes
    this.createDuneLayer(ww, wh, 0.3, -90);
    this.createDuneLayer(ww, wh, 0.6, -85);
  }
  
  private createSpaceBackground(w: number, h: number, ww: number, wh: number) {
    void w; void h;
    // Optional textured parallax
    const textured = this.createTexturedParallax(
      ['space_far', 'space_mid', 'space_near'],
      [0.02, 0.15, 0.4],
      [-100, -95, -90],
      ww, wh
    );
    if (textured) {
      return;
    }
    
    // Space gradient
    const space = this.scene.add.graphics();
    space.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x000000, 0x000000, 1);
    space.fillRect(0, 0, ww, wh);
    space.setDepth(-100);
    space.setScrollFactor(0);
    
    // Stars
    for (let i = 0; i < 100; i++) {
      const star = this.scene.add.circle(
        Math.random() * ww,
        Math.random() * wh,
        1 + Math.random() * 2,
        0xFFFFFF,
        0.8
      );
      star.setDepth(-95);
      star.setScrollFactor(Math.random() * 0.3);
      
      this.scene.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
      });
    }
    
    // Nebula effect
    for (let i = 0; i < 5; i++) {
      const nebula = this.scene.add.circle(
        Math.random() * ww,
        Math.random() * wh,
        100 + Math.random() * 100,
        [0x8B00FF, 0x4B0082, 0x9400D3][Math.floor(Math.random() * 3)],
        0.1
      );
      nebula.setDepth(-98);
      nebula.setScrollFactor(0.2);
    }
  }
  
  // Helper methods for creating layers
  private createMountainLayer(ww: number, wh: number, scrollFactor: number, color: number, depth: number) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    
    for (let x = 0; x < ww; x += 200) {
      graphics.beginPath();
      graphics.moveTo(x, wh);
      graphics.lineTo(x + 100, wh - 150 - Math.random() * 50);
      graphics.lineTo(x + 200, wh);
      graphics.closePath();
      graphics.fillPath();
    }
    
    graphics.setDepth(depth);
    graphics.setScrollFactor(scrollFactor);
  }
  
  private createTreeLayer(ww: number, wh: number, scrollFactor: number, size: string, depth: number) {
    const container = this.scene.add.container(0, 0);
    
    for (let x = 0; x < ww; x += 150) {
      const tree = this.scene.add.sprite(x + Math.random() * 100, wh - 100, `tree_${size}`);
      tree.setOrigin(0.5, 1);
      container.add(tree);
    }
    
    container.setDepth(depth);
    container.setScrollFactor(scrollFactor);
  }
  
  private createCloudLayer(ww: number, wh: number, scrollFactor: number, depth: number) {
    for (let i = 0; i < 10; i++) {
      const cloud = this.scene.add.ellipse(
        Math.random() * ww,
        Math.random() * (wh / 2),
        60 + Math.random() * 40,
        30 + Math.random() * 20,
        0xFFFFFF,
        0.6
      );
      cloud.setDepth(depth);
      cloud.setScrollFactor(scrollFactor);
      
      // Drift animation
      this.scene.tweens.add({
        targets: cloud,
        x: cloud.x + 100,
        duration: 20000 + Math.random() * 10000,
        repeat: -1,
        yoyo: true,
      });
    }
  }
  
  private createStalactiteLayer(ww: number, wh: number, scrollFactor: number, depth: number) {
    void wh;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x4a4a6a, 1);
    
    for (let x = 0; x < ww; x += 100) {
      const height = 30 + Math.random() * 50;
      graphics.fillTriangle(
        x + Math.random() * 50, 0,
        x + 10, height,
        x + 20, 0
      );
    }
    
    graphics.setDepth(depth);
    graphics.setScrollFactor(scrollFactor);
  }
  
  private createCrystalLayer(ww: number, wh: number, scrollFactor: number, depth: number) {
    for (let i = 0; i < 15; i++) {
      const crystal = this.scene.add.circle(
        Math.random() * ww,
        Math.random() * wh,
        5 + Math.random() * 5,
        [0x00CED1, 0x40E0D0, 0x7FFFD4][Math.floor(Math.random() * 3)],
        0.6
      );
      crystal.setDepth(depth);
      crystal.setScrollFactor(scrollFactor);
      
      this.scene.tweens.add({
        targets: crystal,
        alpha: 0.3,
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
      });
    }
  }
  
  private createRockPillarLayer(ww: number, wh: number, scrollFactor: number, depth: number) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x8B4513, 1);
    
    for (let x = 0; x < ww; x += 300) {
      const height = 200 + Math.random() * 100;
      graphics.fillRect(x + Math.random() * 100, wh - height, 40, height);
    }
    
    graphics.setDepth(depth);
    graphics.setScrollFactor(scrollFactor);
  }
  
  private createIceCrystalLayer(ww: number, wh: number, scrollFactor: number, depth: number) {
    for (let i = 0; i < 20; i++) {
      const crystal = this.scene.add.star(
        Math.random() * ww,
        wh - Math.random() * 200,
        6,
        10,
        20,
        0xADD8E6,
        0.7
      );
      crystal.setDepth(depth);
      crystal.setScrollFactor(scrollFactor);
      
      this.scene.tweens.add({
        targets: crystal,
        angle: 360,
        duration: 5000,
        repeat: -1,
      });
    }
  }
  
  private createDuneLayer(ww: number, wh: number, scrollFactor: number, depth: number) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xdeb887, 0.7);
    
    graphics.beginPath();
    graphics.moveTo(0, wh);
    
    for (let x = 0; x < ww; x += 50) {
      const y = wh - 80 - Math.sin(x / 100) * 40;
      graphics.lineTo(x, y);
    }
    
    graphics.lineTo(ww, wh);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.setDepth(depth);
    graphics.setScrollFactor(scrollFactor);
  }
  
  update(camera: Phaser.Cameras.Scene2D.Camera) {
    void camera;
    // Parallax layers now cover full world height, no update needed
  }

  // Helpers for textured parallax
  private createTexturedParallax(keys: string[], scrolls: number[], depths: number[], ww: number, wh: number): boolean {
    const anyExists = keys.some(k => this.scene.textures.exists(k));
    if (!anyExists) return false;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!key) continue;
      if (!this.scene.textures.exists(key)) continue;
      const layer = this.createTiledLayer(key, ww, wh);
      layer.setScrollFactor(scrolls[i] ?? 0.2);
      layer.setDepth(depths[i] ?? -90);
      this.layers.push(layer);
    }
    return true;
  }
  
  private createTiledLayer(key: string, ww: number, wh: number): Phaser.GameObjects.TileSprite {
    // Use world height to ensure full coverage when camera moves vertically
    const ts = this.scene.add.tileSprite(0, 0, ww, wh, key);
    ts.setOrigin(0, 0);
    return ts;
  }
}
