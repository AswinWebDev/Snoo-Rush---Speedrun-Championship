import Phaser from 'phaser';

export class MobileControls {
  private scene: Phaser.Scene;
  
  public isLeftPressed = false;
  public isRightPressed = false;
  public isJumpPressed = false;
  
  private activeTouches: Map<number, 'left' | 'right'> = new Map();
  private leftHoldTimer: Phaser.Time.TimerEvent | null = null;
  private rightHoldTimer: Phaser.Time.TimerEvent | null = null;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  create() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    
    // Show touch controls on mobile/touch devices OR small screens
    const isMobile = width < 768 || 'ontouchstart' in window;
    
    if (isMobile) {
      console.log('🎮 Mobile touch controls - Enabled');
      
      // Use global input manager instead of zones to avoid conflicts
      this.scene.input.on('pointerdown', this.handlePointerDown, this);
      this.scene.input.on('pointermove', this.handlePointerMove, this);
      this.scene.input.on('pointerup', this.handlePointerUp, this);
      
      console.log('✅ Touch controls active!');
    }
  }
  
  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    
    // Ignore top UI (first 140px) and bottom UI (last 60px)
    if (pointer.y < 140 || pointer.y > height - 60) {
      return;
    }
    
    // Determine which side was touched
    const side = pointer.x < width / 2 ? 'left' : 'right';
    
    // Already tracking this pointer? Skip
    if (this.activeTouches.has(pointer.id)) {
      return;
    }
    
    this.activeTouches.set(pointer.id, side);
    
    if (side === 'left') {
      // Clear any existing timer
      if (this.leftHoldTimer) {
        this.leftHoldTimer.remove();
        this.leftHoldTimer = null;
      }
      
      // Set hold timer
      this.leftHoldTimer = this.scene.time.delayedCall(100, () => {
        if (this.activeTouches.get(pointer.id) === 'left') {
          this.isLeftPressed = true;
        }
      });
    } else {
      // Clear any existing timer
      if (this.rightHoldTimer) {
        this.rightHoldTimer.remove();
        this.rightHoldTimer = null;
      }
      
      // Set hold timer
      this.rightHoldTimer = this.scene.time.delayedCall(100, () => {
        if (this.activeTouches.get(pointer.id) === 'right') {
          this.isRightPressed = true;
        }
      });
    }
  }
  
  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    // If touch moves outside gameplay area, release it
    const height = this.scene.scale.height;
    
    if (!this.activeTouches.has(pointer.id)) {
      return;
    }
    
    if (pointer.y < 140 || pointer.y > height - 60) {
      this.releasePointer(pointer.id);
    }
  }
  
  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.activeTouches.has(pointer.id)) {
      return;
    }
    
    const side = this.activeTouches.get(pointer.id);
    
    // Check if this was a quick tap (jump)
    if (side === 'left') {
      if (this.leftHoldTimer && !this.isLeftPressed) {
        // Quick tap = jump
        this.triggerJump();
      }
    } else if (side === 'right') {
      if (this.rightHoldTimer && !this.isRightPressed) {
        // Quick tap = jump
        this.triggerJump();
      }
    }
    
    this.releasePointer(pointer.id);
  }
  
  private releasePointer(pointerId: number) {
    const side = this.activeTouches.get(pointerId);
    
    if (side === 'left') {
      if (this.leftHoldTimer) {
        this.leftHoldTimer.remove();
        this.leftHoldTimer = null;
      }
      
      // Only release left if no other left touches exist
      let hasOtherLeftTouch = false;
      this.activeTouches.forEach((touchSide, id) => {
        if (id !== pointerId && touchSide === 'left') {
          hasOtherLeftTouch = true;
        }
      });
      
      if (!hasOtherLeftTouch) {
        this.isLeftPressed = false;
      }
    } else if (side === 'right') {
      if (this.rightHoldTimer) {
        this.rightHoldTimer.remove();
        this.rightHoldTimer = null;
      }
      
      // Only release right if no other right touches exist
      let hasOtherRightTouch = false;
      this.activeTouches.forEach((touchSide, id) => {
        if (id !== pointerId && touchSide === 'right') {
          hasOtherRightTouch = true;
        }
      });
      
      if (!hasOtherRightTouch) {
        this.isRightPressed = false;
      }
    }
    
    this.activeTouches.delete(pointerId);
  }
  
  private triggerJump() {
    this.isJumpPressed = true;
    
    // Hold jump longer for full variable jump height (match desktop W-hold behavior)
    // Must hold until player reaches jump peak to avoid early velocity cut
    this.scene.time.delayedCall(450, () => {
      this.isJumpPressed = false;
    });
  }
  
  update() {
    // Safety check: clear stuck states if no active touches
    if (this.activeTouches.size === 0) {
      this.isLeftPressed = false;
      this.isRightPressed = false;
    }
  }
  
  destroy() {
    // Remove all event listeners
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    
    // Clear timers
    if (this.leftHoldTimer) {
      this.leftHoldTimer.remove();
      this.leftHoldTimer = null;
    }
    if (this.rightHoldTimer) {
      this.rightHoldTimer.remove();
      this.rightHoldTimer = null;
    }
    
    // Clear state
    this.activeTouches.clear();
    this.isLeftPressed = false;
    this.isRightPressed = false;
    this.isJumpPressed = false;
  }
}
