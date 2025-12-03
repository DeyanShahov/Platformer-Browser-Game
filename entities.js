// Entity management
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
let hero, enemy, ally;
