import { Projectile } from './Projectile.js';

export class WeaponManager {
  constructor(assetLoader) {
    this.assetLoader = assetLoader;
    
    // Define weapons
    this.weapons = {
      basic: {
        name: 'Basic',
        damage: 20,
        radius: 30,
        speed: 1,
        gravity: 0.2,
        color: '#FFFFFF'
      },
      bomb: {
        name: 'Bomb',
        damage: 35,
        radius: 40,
        speed: 0.8,
        gravity: 0.25,
        color: '#FF0000'
      },
      missile: {
        name: 'Missile',
        damage: 25,
        radius: 25,
        speed: 1.5,
        gravity: 0.1,
        color: '#00FFFF'
      },
      grenade: {
        name: 'Grenade',
        damage: 30,
        radius: 35,
        speed: 0.9,
        gravity: 0.3,
        color: '#00FF00'
      }
    };
  }

  createProjectile(x, y, angle, power, weaponType = 'basic', direction = 1, ownerId = null) {
    // Get weapon data
    const weapon = this.weapons[weaponType] || this.weapons.basic;
    
    // Calculate velocity based on angle and power
    const angleRad = angle * Math.PI / 180;
    const vx = Math.cos(angleRad) * power * weapon.speed * direction;
    const vy = -Math.sin(angleRad) * power * weapon.speed;
    
    // Create projectile
    return new Projectile({
      x,
      y,
      vx,
      vy,
      radius: 5,
      color: weapon.color,
      damage: weapon.damage,
      power: weapon.radius / 30, // Normalized power for explosion size
      gravity: weapon.gravity,
      type: weaponType,
      assetLoader: this.assetLoader,
      ownerId: ownerId
    });
  }

  getWeaponList() {
    return Object.keys(this.weapons).map(key => ({
      id: key,
      name: this.weapons[key].name
    }));
  }
}
