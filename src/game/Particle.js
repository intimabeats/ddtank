export class Particle {
  constructor({ x, y, vx, vy, size, color, lifetime }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.lifetime = lifetime;
    this.initialLifetime = lifetime;
    this.gravity = 0.1;
  }

  update(deltaTime) {
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply gravity
    this.vy += this.gravity;
    
    // Reduce velocity (air resistance)
    this.vx *= 0.98;
    this.vy *= 0.98;
    
    // Reduce lifetime
    this.lifetime--;
  }

  render(ctx) {
    // Calculate opacity based on remaining lifetime
    const opacity = this.lifetime / this.initialLifetime;
    
    // Draw particle
    ctx.fillStyle = this.getColorWithOpacity(opacity);
    ctx.fillRect(
      Math.floor(this.x - this.size / 2),
      Math.floor(this.y - this.size / 2),
      Math.floor(this.size),
      Math.floor(this.size)
    );
  }

  getColorWithOpacity(opacity) {
    // If color is in hex format, convert to rgba
    if (this.color.startsWith('#')) {
      const r = parseInt(this.color.slice(1, 3), 16);
      const g = parseInt(this.color.slice(3, 5), 16);
      const b = parseInt(this.color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // If color is already in rgb/rgba format
    if (this.color.startsWith('rgb')) {
      // Extract rgb values
      const rgbMatch = this.color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const [r, g, b] = rgbMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }
    
    // If color is hsl format
    if (this.color.startsWith('hsl')) {
      // Just add opacity to the end
      return this.color.replace('hsl', 'hsla').replace(')', `, ${opacity})`);
    }
    
    // Fallback
    return this.color;
  }
}
