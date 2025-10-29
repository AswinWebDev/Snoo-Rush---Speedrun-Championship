import Phaser from 'phaser';

export class AtmosphericEffects {
  private scene: Phaser.Scene;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  // Create magical fireflies/spirit lights
  createFireflies(x: number, y: number, width: number, height: number, count: number = 15) {
    for (let i = 0; i < count; i++) {
      const firefly = this.scene.add.circle(
        x + Math.random() * width,
        y + Math.random() * height,
        3 + Math.random() * 2,
        0xFFFFAA,
        0.8
      );
      
      firefly.setDepth(-10);
      firefly.setBlendMode(Phaser.BlendModes.ADD);
      
      // Glow effect
      const glow = this.scene.add.circle(
        firefly.x,
        firefly.y,
        8,
        0xFFFF00,
        0.2
      );
      glow.setDepth(-11);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      
      // Floating animation
      this.scene.tweens.add({
        targets: [firefly, glow],
        x: firefly.x + (Math.random() - 0.5) * 100,
        y: firefly.y + (Math.random() - 0.5) * 100,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      
      // Pulsing glow
      this.scene.tweens.add({
        targets: [firefly, glow],
        alpha: 0.3,
        scale: 0.8,
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
  
  // Light rays (like in Ori) - Using multiple semi-transparent triangles for gradient effect
  createLightRays(x: number, y: number, count: number = 5) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / 3) + (Math.random() - 0.5) * (Math.PI / 6);
      const length = 300 + Math.random() * 200;
      
      // Create multiple layers for gradient effect
      for (let layer = 0; layer < 5; layer++) {
        const ray = this.scene.add.graphics();
        ray.setDepth(-50 - layer);
        ray.setBlendMode(Phaser.BlendModes.ADD);
        
        const opacity = 0.08 * (1 - layer / 5);
        ray.fillStyle(0xFFFFAA, opacity);
        
        const layerLength = length * (1 - layer / 6);
        ray.fillTriangle(
          x, y,
          x + Math.cos(angle - 0.1) * layerLength, y + Math.sin(angle - 0.1) * layerLength,
          x + Math.cos(angle + 0.1) * layerLength, y + Math.sin(angle + 0.1) * layerLength
        );
        
        // Animated light ray movement
        this.scene.tweens.add({
          targets: ray,
          alpha: 0.02,
          duration: 2000 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }
  
  // Floating dust particles
  createDustParticles(worldWidth: number, worldHeight: number, count: number = 100) {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(
        Math.random() * worldWidth,
        Math.random() * worldHeight,
        1,
        0xFFFFFF,
        0.3
      );
      particle.setDepth(-20);
      
      // Slow floating
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 50 - Math.random() * 100,
        x: particle.x + (Math.random() - 0.5) * 50,
        duration: 5000 + Math.random() * 5000,
        repeat: -1,
        onRepeat: () => {
          particle.y = worldHeight + 50;
          particle.x = Math.random() * worldWidth;
        },
        ease: 'Linear',
      });
      
      // Fade in/out
      this.scene.tweens.add({
        targets: particle,
        alpha: 0.1,
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
  
  // Glowing trail behind player
  createPlayerTrail(x: number, y: number, color: number = 0xFF4500) {
    const trail = this.scene.add.circle(x, y, 8, color, 0.6);
    trail.setDepth(-1);
    trail.setBlendMode(Phaser.BlendModes.ADD);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => trail.destroy(),
    });
  }
  
  // Jump burst particles (like Ori's spirit flame)
  createJumpBurst(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 80 + Math.random() * 40;
      
      const particle = this.scene.add.circle(x, y, 3, 0x00D9FF, 1);
      particle.setDepth(10);
      particle.setBlendMode(Phaser.BlendModes.ADD);
      
      // Add glow
      const glow = this.scene.add.circle(x, y, 8, 0x00D9FF, 0.4);
      glow.setDepth(9);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      
      this.scene.tweens.add({
        targets: [particle, glow],
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => {
          particle.destroy();
          glow.destroy();
        },
      });
    }
  }
  
  // Collectible shimmer effect
  createShimmer(x: number, y: number, color: number = 0xFFD700) {
    const shimmer = this.scene.add.star(x, y, 5, 4, 8, color, 1);
    shimmer.setDepth(5);
    shimmer.setBlendMode(Phaser.BlendModes.ADD);
    
    this.scene.tweens.add({
      targets: shimmer,
      angle: 180,
      scale: 1.5,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => shimmer.destroy(),
    });
  }
  
  // Screen shake effect
  screenShake(intensity: number = 0.02, duration: number = 300) {
    this.scene.cameras.main.shake(duration, intensity);
  }
  
  // Screen flash effect
  screenFlash(r: number, g: number, b: number, duration: number = 250) {
    this.scene.cameras.main.flash(duration, r, g, b);
  }
  
  // Slow-motion effect (time scale)
  slowMotion(scale: number = 0.5, duration: number = 500) {
    this.scene.tweens.add({
      targets: this.scene.time,
      timeScale: scale,
      duration: duration / 2,
      yoyo: true,
      ease: 'Quad.easeInOut',
    });
  }
  
  destroy() {
    this.particles.forEach(p => p.stop());
    this.particles = [];
  }
}
