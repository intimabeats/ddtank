export class Physics {
  constructor(gravity = 0.2, wind = 0) {
    this.gravity = gravity;
    this.wind = wind;
  }

  setGravity(gravity) {
    this.gravity = gravity;
  }

  setWind(wind) {
    this.wind = wind;
    console.log(`Wind set to: ${wind}`);
  }

  // Calculate trajectory for a projectile
  calculateTrajectory(x0, y0, vx, vy, steps = 100) {
    const trajectory = [];
    let x = x0;
    let y = y0;
    let velocityX = vx;
    let velocityY = vy;
    
    for (let i = 0; i < steps; i++) {
      // Apply physics
      velocityY += this.gravity;
      velocityX += this.wind * 0.01;
      
      // Update position
      x += velocityX;
      y += velocityY;
      
      // Add point to trajectory
      trajectory.push({ x, y });
    }
    
    return trajectory;
  }

  // Check if a point is within a circle
  isPointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  // Calculate distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate angle between two points (in degrees)
  angle(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }
}
