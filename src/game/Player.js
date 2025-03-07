export class Player {
  constructor({ id, name, x, y, color, assetLoader, isAI, direction }) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.color = color;
    this.assetLoader = assetLoader;
    this.isAI = isAI;
    
    this.health = 100;
    this.angle = isAI ? 135 : 45; // Default angle (left or right facing)
    this.power = 50;
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;
    
    // Animation properties
    this.frameX = 0;
    this.frameY = 0;
    this.frameCount = 4;
    this.frameTimer = 0;
    this.frameInterval = 150; // ms
    
    // Direction (1 = right, -1 = left)
    this.direction = direction || (isAI ? -1 : 1);
    
    // Flag for current player
    this._isCurrentPlayer = false;
    
    // Recoil animation
    this.recoilAmount = 0;
    this.isRecoiling = false;
    
    // Cannon properties
    this.cannonLength = 20;
    this.cannonWidth = 8;
    
    // Hit animation
    this.isHit = false;
    this.hitTimer = 0;
    this.hitDuration = 500; // ms
    
    // Celebration animation
    this.isCelebrating = false;
    this.celebrateTimer = 0;
    this.celebrateDuration = 2000; // ms
  }

  update(deltaTime, terrain) {
    // Skip update if player is dead
    if (this.health <= 0) return;
    
    // Apply gravity if not grounded
    if (!this.isGrounded) {
      this.velocity.y += 0.2;
      this.y += this.velocity.y;
      
      // Check for ground collision
      const groundY = terrain.getGroundLevel(this.x + this.width / 2);
      if (this.y + this.height >= groundY) {
        this.y = groundY - this.height;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    } else {
      // Check if still grounded
      const groundY = terrain.getGroundLevel(this.x + this.width / 2);
      if (this.y + this.height < groundY - 1) {
        this.isGrounded = false;
      } else {
        // Adjust position to ground level
        this.y = groundY - this.height;
      }
    }
    
    // Update animation
    this.updateAnimation(deltaTime);
    
    // Update recoil
    this.updateRecoil();
    
    // Update hit animation
    this.updateHitAnimation(deltaTime);
    
    // Update celebration animation
    this.updateCelebrationAnimation(deltaTime);
  }

  updateAnimation(deltaTime) {
    this.frameTimer += deltaTime;
    
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % this.frameCount;
    }
  }

  updateRecoil() {
    if (this.isRecoiling) {
      this.recoilAmount -= 0.5; // Gradually reduce recoil
      
      if (this.recoilAmount <= 0) {
        this.recoilAmount = 0;
        this.isRecoiling = false;
      }
    }
  }

  updateHitAnimation(deltaTime) {
    if (this.isHit) {
      this.hitTimer += deltaTime;
      
      if (this.hitTimer >= this.hitDuration) {
        this.isHit = false;
        this.hitTimer = 0;
      }
    }
  }

  updateCelebrationAnimation(deltaTime) {
    if (this.isCelebrating) {
      this.celebrateTimer += deltaTime;
      
      if (this.celebrateTimer >= this.celebrateDuration) {
        this.isCelebrating = false;
        this.celebrateTimer = 0;
      }
    }
  }

  applyRecoil() {
    this.recoilAmount = 5; // Set initial recoil amount
    this.isRecoiling = true;
  }

  startHitAnimation() {
    this.isHit = true;
    this.hitTimer = 0;
  }

  startCelebration() {
    this.isCelebrating = true;
    this.celebrateTimer = 0;
  }

  render(ctx) {
    // Skip rendering if player is dead
    if (this.health <= 0) return;
    
    // Apply hit effect (flashing)
    if (this.isHit && Math.floor(this.hitTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.7;
    }
    
    // Draw player sprite if available
    const playerImage = this.assetLoader.getImage('player');
    if (playerImage) {
      const frameWidth = playerImage.width / this.frameCount;
      const frameHeight = playerImage.height / 2; // Assuming 2 rows (directions)
      
      // Determine frame row based on direction
      const frameRow = this.direction === 1 ? 0 : 1;
      
      ctx.drawImage(
        playerImage,
        this.frameX * frameWidth,
        frameRow * frameHeight,
        frameWidth,
        frameHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      // Fallback: draw colored rectangle with pixelated character
      this.drawPixelatedCharacter(ctx);
    }
    
    // Draw cannon/weapon
    this.drawCannon(ctx);
    
    // Draw aiming line
    this.drawAimingLine(ctx);
    
    // Draw health bar
    this.drawHealthBar(ctx);
    
    // Draw name
    this.drawName(ctx);
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
    
    // Draw celebration effect if celebrating
    if (this.isCelebrating) {
      this.drawCelebrationEffect(ctx);
    }
  }

  drawPixelatedCharacter(ctx) {
    // Main body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw face
    ctx.fillStyle = '#FFFFFF';
    const eyeSize = 4;
    const eyeY = this.y + 10;
    
    // Eyes position based on direction
    if (this.direction === 1) {
      ctx.fillRect(this.x + 18, eyeY, eyeSize, eyeSize);
      ctx.fillRect(this.x + 24, eyeY, eyeSize, eyeSize);
      
      // Mouth
      ctx.fillRect(this.x + 20, eyeY + 8, 6, 2);
    } else {
      ctx.fillRect(this.x + 4, eyeY, eyeSize, eyeSize);
      ctx.fillRect(this.x + 10, eyeY, eyeSize, eyeSize);
      
      // Mouth
      ctx.fillRect(this.x + 6, eyeY + 8, 6, 2);
    }
    
    // Add pixelated details
    ctx.fillStyle = this.isCurrentPlayer ? '#FFFF00' : '#FF0000';
    
    // Hat or helmet
    ctx.fillRect(this.x + 8, this.y - 2, 16, 4);
    ctx.fillRect(this.x + 12, this.y - 4, 8, 2);
    
    // Feet
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + 6, this.y + this.height - 4, 8, 4);
    ctx.fillRect(this.x + this.width - 14, this.y + this.height - 4, 8, 4);
  }

  drawCannon(ctx) {
    const cannonX = this.x + this.width / 2;
    const cannonY = this.y + this.height / 3;
    
    // Calculate cannon end point based on angle and direction
    const angleRad = this.angle * Math.PI / 180;
    
    // Apply recoil to cannon length
    const adjustedLength = this.cannonLength - this.recoilAmount;
    
    const endX = cannonX + Math.cos(angleRad) * adjustedLength * this.direction;
    const endY = cannonY - Math.sin(angleRad) * adjustedLength;
    
    // Draw cannon base (circle)
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(cannonX, cannonY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw cannon barrel
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = this.cannonWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(cannonX, cannonY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw cannon highlight
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = this.cannonWidth / 2;
    
    ctx.beginPath();
    ctx.moveTo(cannonX, cannonY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  drawAimingLine(ctx) {
    // Only draw aiming line for current player
    if (!this._isCurrentPlayer) return;
    
    const startX = this.x + this.width / 2;
    const startY = this.y + this.height / 3;
    
    // Calculate cannon end point based on angle and direction
    const angleRad = this.angle * Math.PI / 180;
    const cannonEndX = startX + Math.cos(angleRad) * this.cannonLength * this.direction;
    const cannonEndY = startY - Math.sin(angleRad) * this.cannonLength;
    
    // Draw dotted trajectory line
    const lineLength = 100;
    const endX = cannonEndX + Math.cos(angleRad) * lineLength * this.direction;
    const endY = cannonEndY - Math.sin(angleRad) * lineLength;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // Dotted line
    
    ctx.beginPath();
    ctx.moveTo(cannonEndX, cannonEndY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Draw angle indicator
    this.drawAngleIndicator(ctx, startX, startY);
  }

  drawAngleIndicator(ctx, x, y) {
    const radius = 20;
    const startAngle = this.direction > 0 ? Math.PI : 0;
    const endAngle = startAngle + this.angle * Math.PI / 180 * this.direction;
    
    // Draw arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, this.direction < 0);
    ctx.stroke();
    
    // Draw angle text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(this.angle)}°`, x, y - radius - 5);
  }

  drawHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 5;
    const x = this.x;
    const y = this.y - barHeight - 5;
    
    // Draw background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw health
    const healthWidth = (this.health / 100) * barWidth;
    
    // Health color based on amount
    let healthColor;
    if (this.health > 70) {
      healthColor = '#00FF00';
    } else if (this.health > 30) {
      healthColor = '#FFFF00';
    } else {
      healthColor = '#FF0000';
    }
    
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y, healthWidth, barHeight);
    
    // Add pixelated effect to health bar
    for (let i = 0; i < healthWidth; i += 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x + i, y, 2, barHeight / 2);
    }
  }

  drawName(ctx) {
    ctx.fillStyle = this.isCurrentPlayer ? '#FFFF00' : '#FFFFFF';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 15);
  }

  drawCelebrationEffect(ctx) {
    const x = this.x + this.width / 2;
    const y = this.y;
    
    // Draw stars or confetti around player
    for (let i = 0; i < 5; i++) {
      const angle = (this.celebrateTimer / 100 + i * Math.PI * 2 / 5) % (Math.PI * 2);
      const distance = 20 + Math.sin(this.celebrateTimer / 200) * 5;
      const starX = x + Math.cos(angle) * distance;
      const starY = y + Math.sin(angle) * distance;
      
      // Draw star
      this.drawStar(ctx, starX, starY, 5, 2, 5);
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    
    ctx.fillStyle = '#FFFF00';
    ctx.fill();
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Apply knockback
    if (this.health > 0) {
      this.velocity.y = -2;
      this.isGrounded = false;
      
      // Start hit animation
      this.startHitAnimation();
    }
    
    console.log(`${this.name} took ${amount} damage. Health: ${this.health}`);
  }

  increaseAngle() {
    this.angle = Math.min(90, this.angle + 1);
  }

  decreaseAngle() {
    this.angle = Math.max(0, this.angle - 1);
  }

  checkCollision(x, y, radius) {
    // Skip collision check if player is dead
    if (this.health <= 0) return false;
    
    // Simple circle-rectangle collision
    const closestX = Math.max(this.x, Math.min(x, this.x + this.width));
    const closestY = Math.max(this.y, Math.min(y, this.y + this.height));
    
    const distanceX = x - closestX;
    const distanceY = y - closestY;
    
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < radius * radius;
  }

  set isCurrentPlayer(value) {
    this._isCurrentPlayer = value;
  }

  get isCurrentPlayer() {
    return this._isCurrentPlayer;
  }
}
