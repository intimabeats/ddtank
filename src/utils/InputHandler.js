export class InputHandler {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      isDown: false,
      isPressed: false
    };
    this.touchStartPosition = null;
    this.touchEndPosition = null;
    this.powerCharging = false;
    this.powerLevel = 0;
    this.powerReleased = false;
    this.angleAdjusting = false;
    this.currentAngle = 45;
    
    // Initialize event listeners
    this.initKeyboardListeners();
    this.initMouseListeners();
    this.initTouchListeners();
  }

  initKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      // Handle specific key presses
      switch (e.key) {
        case ' ':
          // Space bar to start power charging
          if (!this.powerCharging) {
            this.startPowerCharge();
          }
          break;
        case 'ArrowLeft':
          // Decrease angle
          this.adjustAngle(-1);
          break;
        case 'ArrowRight':
          // Increase angle
          this.adjustAngle(1);
          break;
        case '1':
        case '2':
          // Weapon selection
          this.selectWeapon(parseInt(e.key) - 1);
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      
      // Handle specific key releases
      if (e.key === ' ' && this.powerCharging) {
        this.releasePowerCharge();
      }
    });
  }

  initMouseListeners() {
    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.mouse.isPressed = true;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Start power charge on mouse down
      if (!this.powerCharging) {
        this.startPowerCharge();
      }
    });

    window.addEventListener('mouseup', (e) => {
      this.mouse.isDown = false;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Release power on mouse up
      if (this.powerCharging) {
        this.releasePowerCharge();
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Adjust angle when right mouse button is held
      if (this.mouse.isDown && e.buttons === 2) {
        this.angleAdjusting = true;
        // Calculate angle based on mouse movement
        // Implementation depends on game mechanics
      }
    });
    
    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  initTouchListeners() {
    window.addEventListener('touchstart', (e) => {
      this.touchStartPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      
      // Start power charge on touch
      if (!this.powerCharging) {
        this.startPowerCharge();
      }
    });

    window.addEventListener('touchend', (e) => {
      this.touchEndPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
      
      // Release power on touch end
      if (this.powerCharging) {
        this.releasePowerCharge();
      }
    });

    window.addEventListener('touchmove', (e) => {
      const currentTouch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      
      // Calculate swipe direction and distance for angle adjustment
      if (this.touchStartPosition) {
        const dx = currentTouch.x - this.touchStartPosition.x;
        // Use dx to adjust angle
        this.adjustAngle(Math.sign(dx));
      }
    });
  }

  startPowerCharge() {
    this.powerCharging = true;
    this.powerReleased = false;
    this.powerLevel = 0;
    
    // Start increasing power
    this.powerInterval = setInterval(() => {
      this.powerLevel = (this.powerLevel + 2) % 100;
      this.updatePowerUI();
    }, 50);
    
    console.log("Power charging started");
  }

  releasePowerCharge() {
    this.powerCharging = false;
    this.powerReleased = true;
    clearInterval(this.powerInterval);
    
    // Trigger shot with current power level
    // This will be handled by the game logic
    console.log(`Shot ready with power: ${this.powerLevel}`);
  }

  adjustAngle(direction) {
    // direction: 1 for increase, -1 for decrease
    this.currentAngle = Math.max(0, Math.min(90, this.currentAngle + direction));
    this.updateAngleUI();
  }

  selectWeapon(index) {
    // Update UI to show selected weapon
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach((weapon, i) => {
      if (i === index) {
        weapon.classList.add('selected');
      } else {
        weapon.classList.remove('selected');
      }
    });
  }

  updatePowerUI() {
    const powerBar = document.getElementById('power-bar');
    if (powerBar) {
      powerBar.style.width = `${this.powerLevel}%`;
    }
  }

  updateAngleUI() {
    const angleDisplay = document.getElementById('angle-display');
    if (angleDisplay) {
      angleDisplay.textContent = `${this.currentAngle}°`;
    }
  }

  isKeyDown(key) {
    return this.keys[key] || false;
  }

  resetMousePressed() {
    this.mouse.isPressed = false;
  }

  // Reset power released flag after it's been processed
  resetPowerReleased() {
    this.powerReleased = false;
  }

  // Clean up event listeners and timers
  cleanup() {
    if (this.powerInterval) {
      clearInterval(this.powerInterval);
    }
  }
}
