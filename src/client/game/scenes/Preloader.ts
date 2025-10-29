import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    const { width, height } = this.scale;
    
    // Check if mobile
    const isMobile = width < 768;
    
    // Modern gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1929, 0x0a1929, 0x1a2a4a, 0x1a2a4a, 1);
    bg.fillRect(0, 0, width, height);
    
    // Animated particles
    this.createLoadingParticles();
    
    // Game logo/title - Responsive sizing
    const titleY = isMobile ? height * 0.3 : height * 0.35;
    const titleSize = isMobile ? Math.min(48, width / 8) : Math.min(64, width / 10);
    const title = this.add.text(width / 2, titleY, 'SNOO RUSH', {
      fontFamily: 'Arial Black',
      fontSize: `${titleSize}px`,
      color: '#FF4500',
      stroke: '#000000',
      strokeThickness: isMobile ? 6 : 8,
    }).setOrigin(0.5).setAlpha(0);
    
    // Fade in title
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });
    
    // Loading text - Responsive
    const loadingY = isMobile ? height * 0.5 : height * 0.55;
    const loadingSize = isMobile ? '18px' : '24px';
    const loadingText = this.add.text(width / 2, loadingY, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: loadingSize,
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);
    
    // Pulse loading text
    this.tweens.add({
      targets: loadingText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
    
    // Modern progress bar container - Responsive
    const barWidth = isMobile ? Math.min(280, width * 0.75) : Math.min(500, width * 0.7);
    const barHeight = isMobile ? 4 : 6;
    const barY = isMobile ? height * 0.6 : height * 0.65;
    
    // Progress bar background (track)
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1a1a, 0.5);
    barBg.fillRoundedRect(width / 2 - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 3);
    
    // Progress bar fill
    const bar = this.add.graphics();
    
    // Percentage text - Responsive
    const percentSize = isMobile ? '14px' : '18px';
    const percentY = isMobile ? barY + 25 : barY + 30;
    const percentText = this.add.text(width / 2, percentY, '0%', {
      fontFamily: 'Arial',
      fontSize: percentSize,
      color: '#888888',
    }).setOrigin(0.5);
    
    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      bar.clear();
      
      // Gradient progress bar
      const currentWidth = barWidth * progress;
      bar.fillGradientStyle(0xFF4500, 0xFF6B35, 0xFF4500, 0xFF6B35, 1);
      bar.fillRoundedRect(width / 2 - barWidth / 2, barY - barHeight / 2, currentWidth, barHeight, 3);
      
      // Update percentage
      percentText.setText(`${Math.floor(progress * 100)}%`);
      percentText.setColor(progress > 0.5 ? '#ffffff' : '#888888');
    });
    
    // Complete animation
    this.load.on('complete', () => {
      this.tweens.add({
        targets: [title, loadingText, percentText],
        alpha: 0,
        duration: 300,
        ease: 'Power2',
      });
    });
  }
  
  private createLoadingParticles(): void {
    const { width, height } = this.scale;
    
    // Create floating particles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const particle = this.add.circle(x, y, size, 0xffffff, 0.3);
      
      // Float animation
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeOut',
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    this.load.image('logo', 'logo.png');
    
    // Forest
    this.load.image('forest_sky', 'bg/forest/forest_sky.png');
    this.load.image('forest_far', 'bg/forest/forest_far.png');
    this.load.image('forest_mid', 'bg/forest/forest_mid.png');
    this.load.image('forest_near', 'bg/forest/forest_near.png');
    
    // Cave
    this.load.image('cave_far', 'bg/cave/cave_far.png');
    this.load.image('cave_mid', 'bg/cave/cave_mid.png');
    this.load.image('cave_near', 'bg/cave/cave_near.png');
    
    // Sky
    this.load.image('sky_far', 'bg/sky/sky_far.png');
    this.load.image('sky_mid', 'bg/sky/sky_mid.png');
    this.load.image('sky_near', 'bg/sky/sky_near.png');
    
    // Desert
    this.load.image('desert_far', 'bg/desert/desert_far.png');
    this.load.image('desert_mid', 'bg/desert/desert_mid.png');
    this.load.image('desert_near', 'bg/desert/desert_near.png');
    
    // Ice
    this.load.image('ice_far', 'bg/ice/ice_far.png');
    this.load.image('ice_mid', 'bg/ice/ice_mid.png');
    this.load.image('ice_near', 'bg/ice/ice_near.png');
    
    // Lava
    this.load.image('lava_far', 'bg/lava/lava_far.png');
    this.load.image('lava_mid', 'bg/lava/lava_mid.png');
    this.load.image('lava_near', 'bg/lava/lava_near.png');
    
    // Space
    this.load.image('space_far', 'bg/space/space_far.png');
    this.load.image('space_mid', 'bg/space/space_mid.png');
    this.load.image('space_near', 'bg/space/space_near.png');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
