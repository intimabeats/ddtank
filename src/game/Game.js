import { Player } from './Player.js';
import { Terrain } from './Terrain.js';
import { WeaponManager } from './WeaponManager.js';
import { Physics } from '../utils/Physics.js';
import { Particle } from './Particle.js';
import { TrajectoryPredictor } from './TrajectoryPredictor.js';

export class Game {
  constructor(canvas, ctx, assetLoader, inputHandler, uiManager) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.assetLoader = assetLoader;
    this.inputHandler = inputHandler;
    this.uiManager = uiManager;
    
    this.width = canvas.width;
    this.height = canvas.height;
    this.gravity = 0.2;
    this.wind = 0;
    
    this.players = [];
    this.currentPlayerIndex = 0;
    this.projectiles = [];
    this.particles = [];
    this.gameState = 'waiting'; // waiting, playing, turnTransition, gameOver
    
    this.physics = new Physics(this.gravity, this.wind);
    this.weaponManager = new WeaponManager(this.assetLoader);
    this.trajectoryPredictor = new TrajectoryPredictor(this.physics);
    
    // Game settings
    this.showTrajectory = true;
    this.tutorialShown = false;
    
    // Initialize game objects
    this.init();
  }

  init() {
    // Create terrain
    this.terrain = new Terrain(this.width, this.height, this.assetLoader);
    
    // Create players
    this.createPlayers();
    
    // Set initial game state
    this.gameState = 'waiting';
  }

  createPlayers() {
    // Create two players
    const player1 = new Player({
      id: 1,
      name: 'Player 1',
      x: this.width * 0.2,
      y: 0,
      color: '#4169E1',
      assetLoader: this.assetLoader,
      isAI: false,
      direction: 1 // Facing right
    });
    
    const player2 = new Player({
      id: 2,
      name: 'Player 2',
      x: this.width * 0.8,
      y: 0,
      color: '#FF4500',
      assetLoader: this.assetLoader,
      isAI: true,
      direction: -1 // Facing left
    });
    
    this.players = [player1, player2];
    
    // Position players on terrain
    this.positionPlayersOnTerrain();
  }

  positionPlayersOnTerrain() {
    this.players.forEach(player => {
      // Find ground level at player's x position
      const groundY = this.terrain.getGroundLevel(player.x);
      player.y = groundY - player.height;
    });
  }

  start() {
    // Start the game loop
    this.gameState = 'playing';
    this.lastTime = 0;
    
    // Set current player indicator
    this.updateCurrentPlayerIndicator();
    
    // Show turn indicator
    this.uiManager.showTurnIndicator(this.getCurrentPlayer().name);
    
    // Show tutorial for first-time players
    if (!this.tutorialShown) {
      this.showTutorial();
      this.tutorialShown = true;
    }
    
    // Start animation loop
    this.animate(0);
  }

  showTutorial() {
    this.uiManager.showTutorial([
      "Use LEFT/RIGHT arrows to adjust angle",
      "Hold SPACE to charge power, release to fire",
      "Click weapon icons to change weapons",
      "Destroy your opponent to win!"
    ]);
  }

  animate(timeStamp) {
    // Calculate delta time
    const deltaTime = timeStamp - this.lastTime;
    this.lastTime = timeStamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update and render game objects
    this.update(deltaTime);
    this.render();
    
    // Request next frame
    requestAnimationFrame(this.animate.bind(this));
  }

  update(deltaTime) {
    // Skip update if game is over
    if (this.gameState === 'gameOver') return;
    
    // Update terrain
    this.terrain.update(deltaTime);
    
    // Update players
    this.players.forEach(player => {
      player.update(deltaTime, this.terrain);
    });
    
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Handle input for current player
    if (this.gameState === 'playing') {
      this.handlePlayerInput();
    }
    
    // Check for game over condition
    this.checkGameOver();
  }

  updateProjectiles(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Update projectile position
      projectile.update(deltaTime, this.physics);
      
      // Check for collision with terrain
      if (this.terrain.checkCollision(projectile.x, projectile.y, projectile.radius)) {
        // Create explosion
        this.createExplosion(projectile.x, projectile.y, projectile.power);
        
        // Play explosion sound
        this.playSound('explosion');
        
        // Remove projectile
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check for collision with players
      for (const player of this.players) {
        // Skip collision with the player who fired the projectile
        if (player.id === projectile.ownerId) continue;
        
        if (player.checkCollision(projectile.x, projectile.y, projectile.radius)) {
          // Create explosion
          this.createExplosion(projectile.x, projectile.y, projectile.power);
          
          // Damage player
          player.takeDamage(projectile.damage);
          
          // Play hit sound
          this.playSound('hit');
          
          // Update UI
          this.uiManager.updatePlayerInfo(player);
          
          // Remove projectile
          this.projectiles.splice(i, 1);
          break;
        }
      }
      
      // Remove projectile if out of bounds
      if (
        projectile.x < -50 ||
        projectile.x > this.width + 50 ||
        projectile.y > this.height + 50
      ) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // If no projectiles and game state is turnTransition, switch to next player
    if (this.projectiles.length === 0 && this.gameState === 'turnTransition') {
      this.nextTurn();
    }
  }

  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update particle
      particle.update(deltaTime);
      
      // Remove particle if lifetime is over
      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  handlePlayerInput() {
    const currentPlayer = this.getCurrentPlayer();
    
    // Skip if current player is AI
    if (currentPlayer.isAI) {
      // AI logic will be handled separately
      this.handleAITurn();
      return;
    }
    
    // Update angle based on arrow keys
    if (this.inputHandler.isKeyDown('ArrowLeft')) {
      currentPlayer.decreaseAngle();
      this.uiManager.updateAngleDisplay(currentPlayer.angle);
    } else if (this.inputHandler.isKeyDown('ArrowRight')) {
      currentPlayer.increaseAngle();
      this.uiManager.updateAngleDisplay(currentPlayer.angle);
    }
    
    // Update power based on space bar
    if (this.inputHandler.powerCharging) {
      this.uiManager.updatePowerBar(this.inputHandler.powerLevel);
    }
    
    // Fire weapon when power is released
    if (this.inputHandler.powerReleased && this.inputHandler.powerLevel > 0) {
      this.fireWeapon(currentPlayer, this.inputHandler.powerLevel);
      this.inputHandler.powerLevel = 0;
      this.inputHandler.powerReleased = false;
      this.uiManager.updatePowerBar(0);
    }
  }

  fireWeapon(player, power) {
    // Calculate firing position (from the top of the player)
    const fireX = player.x + player.width / 2;
    const fireY = player.y;
    
    // Play firing sound
    this.playSound('fire');
    
    // Apply recoil animation to player
    player.applyRecoil();
    
    // Create projectile with correct direction
    const projectile = this.weaponManager.createProjectile(
      fireX,
      fireY,
      player.angle,
      power / 100 * 15, // Scale power
      this.uiManager.currentWeapon,
      player.direction,
      player.id // Add owner ID to prevent self-damage
    );
    
    // Add projectile to game
    this.projectiles.push(projectile);
    
    // Create muzzle flash particles
    this.createMuzzleFlash(fireX, fireY, player.angle, player.direction);
    
    // Transition to next turn after projectile is fired
    this.gameState = 'turnTransition';
    
    console.log(`Player ${player.id} fired with power ${power} and angle ${player.angle}`);
  }

  createMuzzleFlash(x, y, angle, direction) {
    // Create particles for muzzle flash
    const particleCount = 10;
    const angleRad = angle * Math.PI / 180;
    
    for (let i = 0; i < particleCount; i++) {
      const particleAngle = angleRad + (Math.random() * 0.5 - 0.25);
      const speed = Math.random() * 3 + 2;
      const size = Math.random() * 3 + 2;
      const lifetime = Math.random() * 10 + 5;
      
      const particle = new Particle({
        x,
        y,
        vx: Math.cos(particleAngle) * speed * direction,
        vy: -Math.sin(particleAngle) * speed,
        size,
        color: '#FFFF00',
        lifetime
      });
      
      this.particles.push(particle);
    }
  }

  createExplosion(x, y, power) {
    // Modify terrain
    this.terrain.createCrater(x, y, power * 2);
    
    // Create particles
    const particleCount = Math.floor(power * 5);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * power * 0.5;
      const size = Math.random() * 4 + 2;
      const lifetime = Math.random() * 30 + 20;
      
      // Randomize colors for better explosion effect
      const colors = ['#FF4500', '#FFA500', '#FFFF00', '#FFFFFF'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color,
        lifetime
      });
      
      this.particles.push(particle);
    }
    
    // Create smoke particles (slower and longer-lasting)
    for (let i = 0; i < particleCount / 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * power * 0.3;
      const size = Math.random() * 6 + 4;
      const lifetime = Math.random() * 60 + 40;
      
      const particle = new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // Slight upward drift
        size,
        color: 'rgba(100, 100, 100, 0.5)',
        lifetime
      });
      
      this.particles.push(particle);
    }
    
    // Check if players need to be repositioned due to terrain change
    this.positionPlayersOnTerrain();
  }

  nextTurn() {
    // Switch to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Update current player indicator
    this.updateCurrentPlayerIndicator();
    
    // Update wind
    this.updateWind();
    
    // Set game state to playing
    this.gameState = 'playing';
    
    // Show turn indicator
    this.uiManager.showTurnIndicator(this.getCurrentPlayer().name);
    
    // Update UI with current player info
    this.uiManager.updatePlayerInfo(this.getCurrentPlayer());
    this.uiManager.updateAngleDisplay(this.getCurrentPlayer().angle);
  }

  updateCurrentPlayerIndicator() {
    // Set current player flag for rendering
    this.players.forEach((player, index) => {
      player.isCurrentPlayer = (index === this.currentPlayerIndex);
    });
  }

  updateWind() {
    // Random wind between -5 and 5
    this.wind = (Math.random() - 0.5) * 10;
    this.physics.setWind(this.wind);
  }

  handleAITurn() {
    // Only proceed if we're in playing state and it's AI's turn
    if (this.gameState !== 'playing' || !this.getCurrentPlayer().isAI) return;
    
    // Add a delay before AI makes its move
    if (!this.aiThinking) {
      this.aiThinking = true;
      this.aiThinkingTimer = setTimeout(() => {
        this.executeAITurn();
        this.aiThinking = false;
      }, 2000); // 2 second delay to simulate "thinking"
    }
  }

  executeAITurn() {
    const aiPlayer = this.getCurrentPlayer();
    const targetPlayer = this.players.find(p => p.id !== aiPlayer.id);
    
    // Calculate angle to target
    const dx = targetPlayer.x - aiPlayer.x;
    const dy = targetPlayer.y - aiPlayer.y;
    let angle = Math.atan2(-dy, dx) * 180 / Math.PI;
    
    // Adjust for wind and add some randomness
    angle += this.wind * 2 + (Math.random() - 0.5) * 10;
    
    // Clamp angle between 0 and 90
    angle = Math.max(0, Math.min(90, angle));
    
    // Set AI angle
    aiPlayer.angle = angle;
    this.uiManager.updateAngleDisplay(angle);
    
    // Calculate power (with some randomness)
    const distance = Math.sqrt(dx * dx + dy * dy);
    let power = Math.min(100, distance / 5 + (Math.random() - 0.5) * 20);
    
    // Show AI "thinking" with power bar animation
    this.animateAIPower(power, () => {
      // Fire weapon after animation completes
      this.fireWeapon(aiPlayer, power);
    });
  }

  animateAIPower(targetPower, callback) {
    let currentPower = 0;
    const powerInterval = setInterval(() => {
      currentPower += 2;
      this.uiManager.updatePowerBar(currentPower);
      
      if (currentPower >= targetPower) {
        clearInterval(powerInterval);
        setTimeout(callback, 500); // Small delay before firing
      }
    }, 50);
  }

  checkGameOver() {
    // Count alive players
    const alivePlayers = this.players.filter(player => player.health > 0);
    
    // If only one player is alive, game is over
    if (alivePlayers.length === 1) {
      this.gameState = 'gameOver';
      this.uiManager.showGameOver(alivePlayers[0].name);
    }
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  render() {
    // Draw background
    this.drawBackground();
    
    // Draw terrain
    this.terrain.render(this.ctx);
    
    // Draw trajectory prediction if enabled
    if (this.showTrajectory && this.gameState === 'playing' && !this.getCurrentPlayer().isAI) {
      this.drawTrajectoryPrediction();
    }
    
    // Draw players
    this.players.forEach(player => {
      player.render(this.ctx);
    });
    
    // Draw projectiles
    this.projectiles.forEach(projectile => {
      projectile.render(this.ctx);
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });
    
    // Draw UI elements
    this.drawUI();
  }

  drawTrajectoryPrediction() {
    const player = this.getCurrentPlayer();
    const startX = player.x + player.width / 2;
    const startY = player.y;
    const angleRad = player.angle * Math.PI / 180;
    const power = this.inputHandler.powerLevel / 100 * 15;
    const vx = Math.cos(angleRad) * power * player.direction;
    const vy = -Math.sin(angleRad) * power;
    
    // Get predicted trajectory
    const trajectory = this.trajectoryPredictor.predictTrajectory(
      startX, startY, vx, vy, this.terrain
    );
    
    // Draw trajectory dots
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < trajectory.length; i += 3) { // Draw every 3rd point for performance
      const point = trajectory[i];
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawBackground() {
    // Draw sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw clouds (if background image is not available)
    if (!this.assetLoader.getImage('background')) {
      this.drawClouds();
    }
  }

  drawClouds() {
    // Simple cloud drawing
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Draw a few clouds
    for (let i = 0; i < 5; i++) {
      const x = (this.width / 5) * i + 50;
      const y = 50 + i * 20;
      const size = 30 + i * 5;
      
      // Draw cloud shape
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.arc(x + size * 0.5, y - size * 0.4, size * 0.8, 0, Math.PI * 2);
      this.ctx.arc(x + size, y, size * 0.9, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawUI() {
    // Draw wind indicator
    this.drawWindIndicator();
    
    // Draw current player indicator
    this.drawCurrentPlayerIndicator();
    
    // Draw controls help
    this.drawControlsHelp();
  }

  drawWindIndicator() {
    const x = this.width / 2;
    const y = 30;
    const width = 100;
    const height = 20;
    
    // Draw wind bar background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
    
    // Draw wind indicator
    const windX = x + (this.wind / 10) * (width / 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.moveTo(windX, y - height / 2);
    this.ctx.lineTo(windX + 5, y);
    this.ctx.lineTo(windX, y + height / 2);
    this.ctx.lineTo(windX - 5, y);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw wind text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px "Press Start 2P"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('WIND', x, y - height);
    
    // Draw wind direction arrow
    const arrowLength = Math.abs(this.wind) * 5;
    const arrowDirection = this.wind > 0 ? 1 : -1;
    
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - arrowLength * arrowDirection, y);
    this.ctx.lineTo(x + arrowLength * arrowDirection, y);
    this.ctx.stroke();
    
    // Arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(x + arrowLength * arrowDirection, y);
    this.ctx.lineTo(x + (arrowLength - 5) * arrowDirection, y - 5);
    this.ctx.lineTo(x + (arrowLength - 5) * arrowDirection, y + 5);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawCurrentPlayerIndicator() {
    const currentPlayer = this.getCurrentPlayer();
    
    // Draw arrow above current player
    const x = currentPlayer.x + currentPlayer.width / 2;
    const y = currentPlayer.y - 30;
    
    this.ctx.fillStyle = currentPlayer.color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - 10, y - 10);
    this.ctx.lineTo(x - 5, y - 10);
    this.ctx.lineTo(x - 5, y - 20);
    this.ctx.lineTo(x + 5, y - 20);
    this.ctx.lineTo(x + 5, y - 10);
    this.ctx.lineTo(x + 10, y - 10);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add pulsing effect
    const pulseSize = Math.sin(Date.now() / 200) * 2 + 2;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y - 10, pulseSize, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawControlsHelp() {
    // Only show controls help when it's the player's turn
    if (this.getCurrentPlayer().isAI) return;
    
    const x = 10;
    const y = this.height - 60;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, 200, 50);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '8px "Press Start 2P"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('← → : Adjust Angle', x + 10, y + 15);
    this.ctx.fillText('SPACE : Charge Power', x + 10, y + 30);
    this.ctx.fillText('1-2 : Change Weapon', x + 10, y + 45);
  }

  playSound(soundType) {
    // Placeholder for sound system
    // In a real implementation, this would play actual sounds
    console.log(`Playing sound: ${soundType}`);
  }
  
  // Clean up any timers when game is destroyed
  cleanup() {
    if (this.aiThinkingTimer) {
      clearTimeout(this.aiThinkingTimer);
    }
  }
}
