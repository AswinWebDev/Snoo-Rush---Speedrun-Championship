import Phaser from 'phaser';

export class Collectible {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private type: 'coin' | 'key' | 'gem';
  private scene: Phaser.Scene;
  public collected = false;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: 'coin' | 'key' | 'gem'
  ) {
    this.scene = scene;
    this.type = type;
    
    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, type);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.sprite.setScale(1);
    
    // Add floating animation
    this.addFloatAnimation();
    
    // Add rotation for coins and gems
    if (type === 'coin' || type === 'gem') {
      scene.tweens.add({
        targets: this.sprite,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear',
      });
    }
    
    // Add particle aura
    this.addAura();
  }
  
  private addFloatAnimation() {
    const startY = this.sprite.y;
    
    this.scene.tweens.add({
      targets: this.sprite,
      y: startY - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  
  private addAura() {
    let color: number;
    
    switch (this.type) {
      case 'coin':
        color = 0xFFD700;
        break;
      case 'gem':
        color = 0x00CED1;
        break;
      case 'key':
        color = 0xFFD700;
        break;
    }
    
    // Create sparkle particles around collectible
    const interval = setInterval(() => {
      if (this.collected || !this.sprite.active) {
        clearInterval(interval);
        return;
      }
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 10;
      const x = this.sprite.x + Math.cos(angle) * distance;
      const y = this.sprite.y + Math.sin(angle) * distance;
      
      const particle = this.scene.add.circle(x, y, 2, color, 1);
      
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }, 300);
  }
  
  collect(): number {
    if (this.collected) return 0;
    
    this.collected = true;
    
    // Collection animation
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.sprite.destroy();
      },
    });
    
    // Particle burst
    this.createCollectionParticles();
    
    // Return time reduction (in seconds) based on type
    switch (this.type) {
      case 'coin':
        return 0.5; // 0.5 second reduction
      case 'gem':
        return 2.0; // 2 second reduction
      case 'key':
        return 5.0; // 5 second reduction
      default:
        return 0;
    }
  }
  
  private createCollectionParticles() {
    let color: number;
    
    switch (this.type) {
      case 'coin':
        color = 0xFFD700;
        break;
      case 'gem':
        color = 0x00CED1;
        break;
      case 'key':
        color = 0xFFD700;
        break;
    }
    
    for (let i = 0; i < 15; i++) {
      const particle = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        3,
        color,
        1
      );
      
      const angle = (Math.PI * 2 * i) / 15;
      const speed = 100 + Math.random() * 50;
      
      this.scene.tweens.add({
        targets: particle,
        x: this.sprite.x + Math.cos(angle) * speed,
        y: this.sprite.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
