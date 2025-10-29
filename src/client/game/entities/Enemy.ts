import Phaser from 'phaser';

export class Enemy {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private type: 'patrol' | 'jump' | 'fly';
  private range: number;
  private startX: number;
  private startY: number;
  private direction: number = 1;
  private scene: Phaser.Scene;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: 'patrol' | 'jump' | 'fly',
    range: number
  ) {
    this.scene = scene;
    this.type = type;
    this.range = range;
    this.startX = x;
    this.startY = y;
    
    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, `enemy_${type}`);
    this.sprite.setScale(1);
    
    // Set physics based on type
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    switch (type) {
      case 'patrol':
        body.setGravityY(800);
        this.sprite.setBounce(0);
        this.sprite.setCollideWorldBounds(true);
        break;
        
      case 'jump':
        body.setGravityY(800);
        this.sprite.setBounce(0.5);
        this.sprite.setCollideWorldBounds(true);
        break;
        
      case 'fly':
        body.setAllowGravity(false);
        break;
    }
    
    // Add glow effect
    this.addGlowEffect();
  }
  
  private addGlowEffect() {
    // Pulsing glow animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  
  update() {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    switch (this.type) {
      case 'patrol':
        // Move back and forth
        const distanceFromStart = this.sprite.x - this.startX;
        
        if (Math.abs(distanceFromStart) > this.range) {
          this.direction *= -1;
        }
        
        body.setVelocityX(this.direction * 100);
        
        // Flip sprite based on direction
        this.sprite.setFlipX(this.direction < 0);
        
        // Rotate slightly while moving
        this.sprite.setRotation(Math.sin(Date.now() / 200) * 0.1);
        break;
        
      case 'jump':
        // Jump periodically
        if (body.touching.down && Math.random() < 0.02) {
          body.setVelocityY(-400);
        }
        
        // Squash and stretch effect
        if (body.velocity.y < 0) {
          this.sprite.setScale(0.9, 1.1);
        } else if (body.velocity.y > 0) {
          this.sprite.setScale(1.1, 0.9);
        } else {
          this.sprite.setScale(1, 1);
        }
        break;
        
      case 'fly':
        // Fly in a sine wave pattern
        const time = Date.now() / 1000;
        const targetY = this.startY + Math.sin(time * 2) * (this.range / 2);
        const targetX = this.startX + Math.cos(time) * this.range;
        
        // Smooth movement towards target
        const dx = targetX - this.sprite.x;
        const dy = targetY - this.sprite.y;
        
        body.setVelocityX(dx * 2);
        body.setVelocityY(dy * 2);
        
        // Flap animation
        this.sprite.setScale(
          1 + Math.sin(time * 10) * 0.1,
          1 - Math.sin(time * 10) * 0.1
        );
        
        // Face movement direction
        this.sprite.setFlipX(dx < 0);
        break;
    }
  }
  
  destroy() {
    // Death animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0,
      angle: 360,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.destroy();
      },
    });
    
    // Particle explosion
    this.createDeathParticles();
  }
  
  private createDeathParticles() {
    const colors = [0xFF0000, 0xFF4500, 0xFFD700];
    
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.circle(
        this.sprite.x,
        this.sprite.y,
        4,
        colors[Math.floor(Math.random() * colors.length)],
        1
      );
      
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 150;
      
      this.scene.tweens.add({
        targets: particle,
        x: this.sprite.x + Math.cos(angle) * 50,
        y: this.sprite.y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
