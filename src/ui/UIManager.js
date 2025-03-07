export class UIManager {
  constructor() {
    this.elements = {
      playerInfo: document.getElementById('player-info'),
      playerName: document.getElementById('player-name'),
      playerHealth: document.getElementById('player-health'),
      powerBar: document.getElementById('power-bar'),
      angleDisplay: document.getElementById('angle-display'),
      weaponSelector: document.getElementById('weapon-selector')
    };
    
    this.currentWeapon = 'basic';
    this.initEventListeners();
    this.initUI();
  }

  initUI() {
    // Add power meter label
    const powerMeter = document.getElementById('power-meter');
    if (powerMeter) {
      const label = document.createElement('div');
      label.textContent = 'POWER';
      label.style.fontSize = '10px';
      label.style.marginBottom = '2px';
      powerMeter.parentNode.insertBefore(label, powerMeter);
    }
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .weapon {
        transition: all 0.2s ease;
      }
      
      .weapon:hover {
        transform: scale(1.1);
        background-color: #555;
      }
      
      .weapon.selected {
        animation: pulse 2s infinite;
      }
    `;
    document.head.appendChild(style);
  }

  initEventListeners() {
    // Add event listeners for weapon selection
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach(weapon => {
      weapon.addEventListener('click', (e) => {
        this.selectWeapon(e.target.dataset.weapon);
      });
    });
    
    // Add keyboard shortcuts for weapon selection
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') {
        this.selectWeapon('basic');
      } else if (e.key === '2') {
        this.selectWeapon('bomb');
      }
    });
  }

  updatePlayerInfo(player) {
    if (this.elements.playerName) {
      this.elements.playerName.textContent = player.name;
    }
    
    if (this.elements.playerHealth) {
      this.elements.playerHealth.textContent = `${player.health} HP`;
      
      // Change color based on health
      if (player.health < 30) {
        this.elements.playerHealth.style.color = '#ff0000';
      } else if (player.health < 70) {
        this.elements.playerHealth.style.color = '#ffff00';
      } else {
        this.elements.playerHealth.style.color = '#00ff00';
      }
      
      // Add animation effect when health changes
      this.elements.playerHealth.style.animation = 'pulse 0.5s';
      setTimeout(() => {
        this.elements.playerHealth.style.animation = '';
      }, 500);
    }
  }

  updatePowerBar(power) {
    if (this.elements.powerBar) {
      this.elements.powerBar.style.width = `${power}%`;
      
      // Change color based on power level
      if (power < 30) {
        this.elements.powerBar.style.background = 'linear-gradient(to right, #00ff00, #00ff00)';
      } else if (power < 70) {
        this.elements.powerBar.style.background = 'linear-gradient(to right, #00ff00, #ffff00)';
      } else {
        this.elements.powerBar.style.background = 'linear-gradient(to right, #00ff00, #ffff00, #ff0000)';
      }
    }
  }

  updateAngleDisplay(angle) {
    if (this.elements.angleDisplay) {
      this.elements.angleDisplay.textContent = `${Math.round(angle)}°`;
      
      // Add animation effect when angle changes
      this.elements.angleDisplay.style.animation = 'pulse 0.3s';
      setTimeout(() => {
        this.elements.angleDisplay.style.animation = '';
      }, 300);
    }
  }

  selectWeapon(weaponType) {
    this.currentWeapon = weaponType;
    
    // Update UI
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach(weapon => {
      if (weapon.dataset.weapon === weaponType) {
        weapon.classList.add('selected');
        
        // Add highlight effect
        weapon.style.boxShadow = '0 0 10px #00ffff';
        setTimeout(() => {
          weapon.style.boxShadow = '';
        }, 500);
      } else {
        weapon.classList.remove('selected');
      }
    });
    
    console.log(`Selected weapon: ${weaponType}`);
  }

  showMessage(message, duration = 3000) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('game-message');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'game-message';
      messageElement.style.position = 'absolute';
      messageElement.style.top = '20%';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translateX(-50%)';
      messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      messageElement.style.color = '#ffffff';
      messageElement.style.padding = '10px 20px';
      messageElement.style.borderRadius = '5px';
      messageElement.style.fontFamily = "'Press Start 2P', cursive";
      messageElement.style.fontSize = '16px';
      messageElement.style.textAlign = 'center';
      messageElement.style.zIndex = '1000';
      messageElement.style.opacity = '0';
      messageElement.style.transition = 'opacity 0.3s';
      document.body.appendChild(messageElement);
    }
    
    // Set message and show
    messageElement.textContent = message;
    setTimeout(() => {
      messageElement.style.opacity = '1';
    }, 10);
    
    // Hide after duration
    setTimeout(() => {
      messageElement.style.opacity = '0';
    }, duration);
    
    console.log(`Message shown: ${message}`);
  }

  showTurnIndicator(playerName) {
    this.showMessage(`${playerName}'s Turn`, 2000);
  }

  showTutorial(steps) {
    // Create tutorial overlay
    const tutorialOverlay = document.createElement('div');
    tutorialOverlay.id = 'tutorial-overlay';
    tutorialOverlay.style.position = 'absolute';
    tutorialOverlay.style.top = '0';
    tutorialOverlay.style.left = '0';
    tutorialOverlay.style.width = '100%';
    tutorialOverlay.style.height = '100%';
    tutorialOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tutorialOverlay.style.display = 'flex';
    tutorialOverlay.style.flexDirection = 'column';
    tutorialOverlay.style.justifyContent = 'center';
    tutorialOverlay.style.alignItems = 'center';
    tutorialOverlay.style.zIndex = '3000';
    tutorialOverlay.style.animation = 'fadeIn 0.5s';
    
    // Create tutorial content
    const tutorialContent = document.createElement('div');
    tutorialContent.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tutorialContent.style.padding = '20px';
    tutorialContent.style.borderRadius = '10px';
    tutorialContent.style.border = '2px solid #00aaff';
    tutorialContent.style.maxWidth = '80%';
    tutorialContent.style.textAlign = 'center';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'How to Play';
    title.style.color = '#00aaff';
    title.style.marginBottom = '20px';
    title.style.fontFamily = "'Press Start 2P', cursive";
    title.style.fontSize = '18px';
    tutorialContent.appendChild(title);
    
    // Add steps
    steps.forEach((step, index) => {
      const stepElement = document.createElement('p');
      stepElement.textContent = `${index + 1}. ${step}`;
      stepElement.style.color = '#ffffff';
      stepElement.style.margin = '10px 0';
      stepElement.style.fontFamily = "'Press Start 2P', cursive";
      stepElement.style.fontSize = '12px';
      stepElement.style.textAlign = 'left';
      stepElement.style.animation = `fadeIn 0.5s ${index * 0.2}s both`;
      tutorialContent.appendChild(stepElement);
    });
    
    // Add start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.marginTop = '20px';
    startButton.style.padding = '10px 20px';
    startButton.style.backgroundColor = '#00aaff';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.color = 'white';
    startButton.style.fontFamily = "'Press Start 2P', cursive";
    startButton.style.fontSize = '14px';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'transform 0.2s';
    
    startButton.addEventListener('mouseover', () => {
      startButton.style.transform = 'scale(1.1)';
    });
    
    startButton.addEventListener('mouseout', () => {
      startButton.style.transform = 'scale(1)';
    });
    
    startButton.addEventListener('click', () => {
      document.body.removeChild(tutorialOverlay);
    });
    
    tutorialContent.appendChild(startButton);
    tutorialOverlay.appendChild(tutorialContent);
    document.body.appendChild(tutorialOverlay);
  }

  showGameOver(winner) {
    // Create game over screen
    const gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over';
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.top = '0';
    gameOverElement.style.left = '0';
    gameOverElement.style.width = '100%';
    gameOverElement.style.height = '100%';
    gameOverElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameOverElement.style.display = 'flex';
    gameOverElement.style.flexDirection = 'column';
    gameOverElement.style.justifyContent = 'center';
    gameOverElement.style.alignItems = 'center';
    gameOverElement.style.zIndex = '2000';
    gameOverElement.style.animation = 'fadeIn 1s';
    
    // Winner text
    const winnerText = document.createElement('h1');
    winnerText.textContent = `${winner} Wins!`;
    winnerText.style.color = '#ffff00';
    winnerText.style.marginBottom = '30px';
    winnerText.style.fontFamily = "'Press Start 2P', cursive";
    winnerText.style.textShadow = '0 0 10px #ffff00';
    winnerText.style.animation = 'pulse 1s infinite';
    
    // Add some confetti effect
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = this.getRandomColor();
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 100}%`;
      confetti.style.opacity = '0';
      confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      gameOverElement.appendChild(confetti);
    }
    
    // Restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Play Again';
    restartButton.style.padding = '10px 20px';
    restartButton.style.backgroundColor = '#00aaff';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.color = 'white';
    restartButton.style.fontFamily = "'Press Start 2P', cursive";
    restartButton.style.cursor = 'pointer';
    restartButton.style.fontSize = '16px';
    restartButton.style.transition = 'transform 0.2s';
    
    restartButton.addEventListener('mouseover', () => {
      restartButton.style.transform = 'scale(1.1)';
    });
    
    restartButton.addEventListener('mouseout', () => {
      restartButton.style.transform = 'scale(1)';
    });
    
    restartButton.addEventListener('click', () => {
      document.body.removeChild(gameOverElement);
      window.location.reload();
    });
    
    gameOverElement.appendChild(winnerText);
    gameOverElement.appendChild(restartButton);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      @keyframes fall {
        0% { 
          transform: translateY(-100px) rotate(0deg); 
          opacity: 1;
        }
        100% { 
          transform: translateY(1000px) rotate(720deg); 
          opacity: 0.7;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(gameOverElement);
    
    console.log(`Game over. Winner: ${winner}`);
  }
  
  getRandomColor() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
