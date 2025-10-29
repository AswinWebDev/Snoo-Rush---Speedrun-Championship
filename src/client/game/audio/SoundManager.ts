import Phaser from 'phaser';

export class SoundManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  
  // Web Audio API synthesizer for procedural sound
  private audioContext!: AudioContext;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Procedurally generate sounds using Web Audio API
  playJump() {
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Jump sound: Quick rising frequency
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }
  
  playLand() {
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Land sound: Thud (low frequency, quick decay)
    oscillator.frequency.setValueAtTime(120, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }
  
  playCollect() {
    const ctx = this.audioContext;
    
    // Magical collect sound with multiple harmonics
    [1, 1.5, 2].forEach((harmonic, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(440 * harmonic, ctx.currentTime + i * 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(880 * harmonic, ctx.currentTime + i * 0.05 + 0.3);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.4);
      
      oscillator.start(ctx.currentTime + i * 0.05);
      oscillator.stop(ctx.currentTime + i * 0.05 + 0.4);
    });
  }
  
  playDeath() {
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Death sound: Descending frequency
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.6);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
  }
  
  playVictory() {
    const ctx = this.audioContext;
    
    // Victory fanfare with ascending notes
    const notes = [523.25, 587.33, 659.25, 783.99]; // C, D, E, G
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5);
      
      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  }
  
  playEnemyHit() {
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Hit sound: Sharp attack
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }
  
  // Ambient background music (simple loop)
  playBackgroundMusic() {
    const ctx = this.audioContext;
    
    // Simple ambient chord progression
    const playChord = (frequencies: number[], time: number, duration: number) => {
      frequencies.forEach(freq => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(freq, time);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.03, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        oscillator.start(time);
        oscillator.stop(time + duration);
      });
    };
    
    // Ambient chord progression (repeats every 8 seconds)
    const startTime = ctx.currentTime;
    const chordDuration = 2;
    
    // C major chord
    playChord([261.63, 329.63, 392.00], startTime, chordDuration);
    // F major chord
    playChord([349.23, 440.00, 523.25], startTime + chordDuration, chordDuration);
    // G major chord
    playChord([392.00, 493.88, 587.33], startTime + chordDuration * 2, chordDuration);
    // C major chord
    playChord([261.63, 329.63, 392.00], startTime + chordDuration * 3, chordDuration);
  }
  
  destroy() {
    this.sounds.forEach(sound => sound.destroy());
    this.sounds.clear();
  }
}
