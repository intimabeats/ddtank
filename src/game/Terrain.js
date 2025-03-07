export class Terrain {
  constructor(width, height, assetLoader) {
    this.width = width;
    this.height = height;
    this.assetLoader = assetLoader;
    
    // Terrain data
    this.terrainData = [];
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = width;
    this.terrainCanvas.height = height;
    this.terrainCtx = this.terrainCanvas.getContext('2d');
    
    // Generate initial terrain
    this.generateTerrain();
  }

  generateTerrain() {
    // Clear terrain canvas
    this.terrainCtx.clearRect(0, 0, this.width, this.height);
    
    // Generate terrain points
    const points = [];
    const segments = 20;
    const segmentWidth = this.width / segments;
    
    // Generate random heights with smooth transitions
    for (let i = 0; i <= segments; i++) {
      const x = i * segmentWidth;
      let y;
      
      if (i === 0) {
        // First point
        y = this.height * 0.6 + Math.random() * this.height * 0.2;
      } else {
        // Subsequent points - ensure smooth transition
        const prevY = points[i - 1].y;
        const variance = segmentWidth * 0.5; // Max height difference
        y = prevY + (Math.random() * variance * 2 - variance);
        
        // Keep within bounds
        y = Math.max(this.height * 0.4, Math.min(this.height * 0.8, y));
      }
      
      points.push({ x, y });
    }
    
    // Draw terrain
    this.drawTerrain(points);
    
    // Store terrain data for collision detection
    this.updateTerrainData();
  }

  drawTerrain(points) {
    const terrainImage = this.assetLoader.getImage('terrain');
    
    if (terrainImage) {
      // Draw using terrain texture
      this.drawTerrainWithTexture(points, terrainImage);
    } else {
      // Fallback: draw with gradient
      this.drawTerrainWithGradient(points);
    }
  }

  drawTerrainWithTexture(points, terrainImage) {
    this.terrainCtx.beginPath();
    this.terrainCtx.moveTo(points[0].x, points[0].y);
    
    // Draw curve through points
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i - 1].x + points[i].x) / 2;
      const yc = (points[i - 1].y + points[i].y) / 2;
      this.terrainCtx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    
    // Complete the path
    this.terrainCtx.lineTo(this.width, this.height);
    this.terrainCtx.lineTo(0, this.height);
    this.terrainCtx.closePath();
    
    // Create pattern from terrain image
    const pattern = this.terrainCtx.createPattern(terrainImage, 'repeat');
    this.terrainCtx.fillStyle = pattern;
    this.terrainCtx.fill();
    
    // Add outline
    this.terrainCtx.strokeStyle = '#5D4037';
    this.terrainCtx.lineWidth = 2;
    this.terrainCtx.stroke();
  }

  drawTerrainWithGradient(points) {
    this.terrainCtx.beginPath();
    this.terrainCtx.moveTo(points[0].x, points[0].y);
    
    // Draw curve through points
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i - 1].x + points[i].x) / 2;
      const yc = (points[i - 1].y + points[i].y) / 2;
      this.terrainCtx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    
    // Complete the path
    this.terrainCtx.lineTo(this.width, this.height);
    this.terrainCtx.lineTo(0, this.height);
    this.terrainCtx.closePath();
    
    // Create gradient
    const gradient = this.terrainCtx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#5D4037');
    
    this.terrainCtx.fillStyle = gradient;
    this.terrainCtx.fill();
    
    // Add pixelated details
    this.addPixelatedDetails();
  }

  addPixelatedDetails() {
    // Add grass on top
    this.terrainCtx.fillStyle = '#4CAF50';
    
    for (let x = 0; x < this.width; x += 4) {
      const y = this.getGroundLevel(x);
      this.terrainCtx.fillRect(x, y - 2, 4, 2);
    }
    
    // Add random dirt pixels
    this.terrainCtx.fillStyle = '#3E2723';
    
    for (let i = 0; i < 500; i++) {
      const x = Math.floor(Math.random() * this.width);
      const groundY = this.getGroundLevel(x);
      const y = groundY + Math.random() * (this.height - groundY) * 0.5;
      const size = Math.floor(Math.random() * 3) + 1;
      
      this.terrainCtx.fillRect(x, y, size, size);
    }
  }

  updateTerrainData() {
    // Get terrain data for collision detection
    this.terrainData = [];
    
    const imageData = this.terrainCtx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;
    
    // For each column, find the highest non-transparent pixel
    for (let x = 0; x < this.width; x++) {
      let groundY = this.height;
      
      for (let y = 0; y < this.height; y++) {
        const index = (y * this.width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 0) {
          groundY = y;
          break;
        }
      }
      
      this.terrainData[x] = groundY;
    }
  }

  getGroundLevel(x) {
    // Get ground level at given x position
    const xInt = Math.floor(x);
    
    // Check bounds
    if (xInt < 0 || xInt >= this.width) {
      return this.height;
    }
    
    return this.terrainData[xInt] || this.height;
  }

  checkCollision(x, y, radius) {
    // Check if point collides with terrain
    const xStart = Math.max(0, Math.floor(x - radius));
    const xEnd = Math.min(this.width - 1, Math.floor(x + radius));
    
    for (let xi = xStart; xi <= xEnd; xi++) {
      const groundY = this.getGroundLevel(xi);
      
      // Simple circle-line collision check
      if (y + radius >= groundY) {
        return true;
      }
    }
    
    return false;
  }

  createCrater(x, y, radius) {
    // Create a crater at the given position
    this.terrainCtx.globalCompositeOperation = 'destination-out';
    
    // Draw circle to create crater
    this.terrainCtx.beginPath();
    this.terrainCtx.arc(x, y, radius, 0, Math.PI * 2);
    this.terrainCtx.fill();
    
    // Reset composite operation
    this.terrainCtx.globalCompositeOperation = 'source-over';
    
    // Update terrain data
    this.updateTerrainData();
  }

  update(deltaTime) {
    // No dynamic updates needed for now
  }

  render(ctx) {
    // Draw terrain
    ctx.drawImage(this.terrainCanvas, 0, 0);
  }
}
