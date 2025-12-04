class Player {
  constructor(controls, x, y, z, color) {
    this.controls = controls;
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = 50;
    this.h = 50;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.color = color;
    this.onGround = false;
    this.attacking = false;
    this.attackTimer = 0;
    this.hit = false;
  }
}

// Entity management for NPCs
function createEntity(x, y, z, w, h, color) {
  return {
    x, y, z,
    w, h,
    vx: 0,
    vy: 0,
    vz: 0,
    color,
    onGround: false,

    // For attack state
    attacking: false,
    attackTimer: 0,

    // For hit state
    hit: false,
  };
}

// Global entities
window.players = [];
let enemy, ally;
