export class Projectile {
  constructor({ x, y, vx, vy, radius, color, damage, power, gravity, type, assetLoader, ownerId }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.damage = damage;
    this.power = power;
    this.gravity = gravity;
    this.type = type;
    this.assetLoader = assetLoader;
    this.ownerId = ownerId; // ID of the player who fired this projectile
    
    // Animation properties
    this.rotation = 0;
    this.rotationSpeed = Math.random() * 0.2 - 0.1;
    
    // Trail particles
    this.trail = [];
    this.trailTimer = 0;
    this.trailInterval = 50; // ms
    
    console.log(`Projectile created at (${x}, ${y}) with velocity (${vx}, ${vy}), owner: ${ownerId}`);
  }

  update(deltaTime, physics) {
    // Apply gravity and wind
    this.vy += this.gravity * physics.gravity;
    this.vx += physics.wind * 0.01;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Update rotation
    this.rotation += this.rotationSpeed;
    
    // Update trail
    this.updateTrail(deltaTime);
  }

  updateTrail(deltaTime) {
    // Add trail particles at intervals
    this.trailTimer += deltaTime;
    
    if (this.trailTimer >= this.trailInterval) {
      this.trailTimer = 0;
      
      this.trail.push({
        x: this.x,
        y: this.y,
        radius: this.radius * 0.7,
        alpha: 1
      });
      
      // Limit trail length
      if (this.trail.length > 10) {
        this.trail.shift();
      }
    }
    
    // Fade out trail particles
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].alpha -= 0.05;
      this.trail[i].radius *= 0.95;
    }
    
    // Remove faded particles
    this.trail = this.trail.filter(particle => particle.alpha > 0);
  }

  render(ctx) {
    // Draw trail
    this.renderTrail(ctx);
    
    // Draw projectile
    const weaponImage = this.assetLoader.getImage('weapons');
    
    if (weaponImage) {
      // Draw sprite from weapon sheet
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      // Determine sprite position based on weapon type
      let spriteX = 0;
      switch (this.type) {
        case 'bomb':
          spriteX = 16;
          break;
        case 'missile':
          spriteX = 32;
          break;
        case 'grenade':
          spriteX = 48;
          break;
      }
      
      ctx.drawImage(
        weaponImage,
        spriteX, 0,
        16, 16,
        -this.radius, -this.radius,
        this.radius * 2, this.radius * 2
      );
      
      ctx.restore();
    } else {
      // Fallback: draw colored circle
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add pixel details
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
    }
  }

  renderTrail(ctx) {
    // Draw trail particles
    for (const particle of this.trail) {
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
