import { Game } from './game/Game.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { InputHandler } from './utils/InputHandler.js';
import { UIManager } from './ui/UIManager.js';

// Initialize the game when assets are loaded
async function init() {
  console.log("Initializing game...");
  
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 800;
  canvas.height = 600;
  
  // Show loading screen
  showLoadingScreen(ctx, canvas.width, canvas.height);
  
  // Load assets
  const assetLoader = new AssetLoader();
  await assetLoader.loadAssets();
  
  // Initialize input handler
  const inputHandler = new InputHandler();
  
  // Initialize UI manager
  const uiManager = new UIManager();
  
  // Create and start the game
  const game = new Game(canvas, ctx, assetLoader, inputHandler, uiManager);
  
  // Add event listener for page unload to clean up resources
  window.addEventListener('beforeunload', () => {
    game.cleanup();
    inputHandler.cleanup();
  });
  
  // Start the game
  game.start();
  
  console.log("Game started successfully");
}

function showLoadingScreen(ctx, width, height) {
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // Draw loading text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('LOADING...', width / 2, height / 2);
  
  // Draw pixelated border
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 4;
  ctx.strokeRect(width / 2 - 100, height / 2 + 20, 200, 20);
  
  // Draw loading bar animation
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += 5;
    
    // Update loading bar
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(width / 2 - 98, height / 2 + 22, progress * 1.96, 16);
    
    if (progress >= 100) {
      clearInterval(loadingInterval);
    }
  }, 100);
}

// Start the game when page is loaded
window.addEventListener('load', init);
