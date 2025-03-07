export class AssetLoader {
  constructor() {
    this.images = {};
    this.sounds = {};
    this.sprites = {};
    this.loaded = false;
  }

  async loadAssets() {
    try {
      // Define assets to load
      const imageAssets = {
        'terrain': 'assets/terrain.png',
        'player': 'assets/player.png',
        'weapons': 'assets/weapons.png',
        'explosion': 'assets/explosion.png',
        'background': 'assets/background.png',
        'ui': 'assets/ui.png'
      };

      // Create placeholder assets for development
      await this.createPlaceholderAssets(imageAssets);
      
      // Load all images
      const imagePromises = Object.entries(imageAssets).map(([key, src]) => {
        return this.loadImage(key, src);
      });
      
      await Promise.all(imagePromises);
      this.loaded = true;
      console.log('All assets loaded successfully');
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }

  async loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}, using placeholder`);
        // Create a placeholder image
        const placeholderImg = this.createPlaceholderImageSync(key);
        this.images[key] = placeholderImg;
        resolve(placeholderImg);
      };
      img.src = src;
    });
  }

  // Create placeholder assets for development
  async createPlaceholderAssets(imageAssets) {
    // Create assets directory if it doesn't exist
    try {
      await this.createDirectory('assets');
    } catch (error) {
      console.log('Note: Creating directories is only supported in Node.js environment');
    }
    
    // Create placeholder images
    for (const [key, path] of Object.entries(imageAssets)) {
      await this.createPlaceholderImage(key, path);
    }
  }

  async createDirectory(path) {
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(path, { recursive: true });
    } catch (error) {
      // Directory might already exist or we're in browser environment
      console.log('Note: Creating directories is only supported in Node.js environment');
    }
  }

  createPlaceholderImageSync(key) {
    // In browser environment, we'll create data URLs for placeholder images
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Fill with different colors based on asset type
    switch (key) {
      case 'terrain':
        ctx.fillStyle = '#8B4513';
        break;
      case 'player':
        ctx.fillStyle = '#4169E1';
        break;
      case 'weapons':
        ctx.fillStyle = '#FF4500';
        break;
      case 'explosion':
        ctx.fillStyle = '#FFA500';
        break;
      case 'background':
        ctx.fillStyle = '#87CEEB';
        break;
      case 'ui':
        ctx.fillStyle = '#9932CC';
        break;
      default:
        ctx.fillStyle = '#CCCCCC';
    }
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key, canvas.width / 2, canvas.height / 2);
    
    // Create grid pattern for pixelated look
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Create an image from the canvas
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    return img;
  }

  async createPlaceholderImage(key, path) {
    const img = this.createPlaceholderImageSync(key);
    this.images[key] = img;
    return img;
  }

  getImage(key) {
    return this.images[key];
  }
}
