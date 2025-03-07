export class TrajectoryPredictor {
  constructor(physics) {
    this.physics = physics;
    this.maxSteps = 200; // Maximum number of prediction steps
    this.stepSize = 1; // Smaller step size for more accurate prediction
  }

  predictTrajectory(x, y, vx, vy, terrain) {
    const trajectory = [];
    let currentX = x;
    let currentY = y;
    let currentVX = vx;
    let currentVY = vy;
    
    // Predict trajectory until collision or max steps reached
    for (let i = 0; i < this.maxSteps; i++) {
      // Apply physics
      currentVY += this.physics.gravity * this.stepSize;
      currentVX += this.physics.wind * 0.01 * this.stepSize;
      
      // Update position
      currentX += currentVX * this.stepSize;
      currentY += currentVY * this.stepSize;
      
      // Add point to trajectory
      trajectory.push({ x: currentX, y: currentY });
      
      // Check for collision with terrain
      if (terrain && terrain.checkCollision(currentX, currentY, 5)) {
        break;
      }
      
      // Check if out of bounds
      if (currentX < 0 || currentX > terrain.width || currentY > terrain.height) {
        break;
      }
    }
    
    return trajectory;
  }
}
