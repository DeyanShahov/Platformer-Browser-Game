// Animation Data Configuration
// Contains all animation definitions, frame data, and sprite configurations

// Animation Types
const ANIMATION_TYPES = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  ATTACK_1: 'attack1',
  ATTACK_2: 'attack2',
  ATTACK_3: 'attack3',
  RUN_ATTACK: 'run_attack',
  DEFEND: 'defend',
  HURT: 'hurt',
  DEAD: 'dead'
};

// Sprite Sheet Configurations
const SPRITE_CONFIGS = {
  knight: {
    frameWidth: 128,
    frameHeight: 128,
    scale: 3, // 384x384 final size
    imageRendering: 'pixelated'
  }
};

// Animation Definitions
// Based on the Knight_1 sprite sheets and the reference HTML
const ANIMATION_DEFINITIONS = {
  // Player animations
  knight: {
    [ANIMATION_TYPES.IDLE]: {
      spriteSheet: './Knight_1/Idle.png',
      frames: 4,
      frameWidth: 120,    // How much to take from each frame start
      frameHeight: 128,
      frameStarts: [0, 128, 256, 384], // Original frame start positions (assuming 128px original frames)
      duration: 1.5,
       // Per-frame collision data
      frameData: [
        // Frame 0 
        {
          hitBox: { x: 65, y: 0, width: 110, height: 260 }, // Character body from ground up
          attackBox: null
        },
        // Frame 1 
        {
          hitBox: { x: 65, y: 0, width: 110, height: 260 },
          attackBox: null
        },
        // Frame 2 
        {
          hitBox: { x: 65, y: 0, width: 110, height: 260 },
          attackBox: null
        },
        // Frame 3 
        {
          hitBox: { x: 65, y: 0, width: 110, height: 260 },
          attackBox: null
        }
      ],
      loop: true,
      keyframe: 'sprite-4-frames'
    },
    [ANIMATION_TYPES.WALK]: {
      spriteSheet: './Knight_1/Walk.png',
      frames: 8,
      frameWidth: 120,    // How much to take from each frame start
      frameHeight: 128,
      frameStarts: [0, 128, 256, 384, 512, 640, 768, 896], // Original frame start positions
      duration: 1.0,
       // Per-frame collision data
      frameData: [
        // Frame 0 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 }, // Character body from ground up
          attackBox: null
        },
        // Frame 1 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        },
        // Frame 2 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        },
        // Frame 3 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        },
        // Frame 4 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        },
        // Frame 5 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        },
        // Frame 6 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        },
        // Frame 7 
        {
          hitBox: { x: 65, y: 0, width: 130, height: 260 },
          attackBox: null
        }
      ],
      loop: true,
      keyframe: 'sprite-8-frames'
    },
    [ANIMATION_TYPES.RUN]: {
      spriteSheet: './Knight_1/Run.png',
      frames: 7,
      frameWidth: 120,    // How much to take from each frame start
      frameHeight: 128,
      frameStarts: [0, 128, 256, 384, 512, 640, 768], // Original frame start positions
      duration: 0.8,
      loop: true,
      keyframe: 'sprite-7-frames'
    },
    [ANIMATION_TYPES.JUMP]: {
      spriteSheet: './Knight_1/Jump.png',
      frames: 6,
      frameWidth: 120,    // How much to take from each frame start
      frameHeight: 128,
      frameStarts: [0, 128, 256, 384, 512, 640], // Original frame start positions
      duration: 1.2,
       // Per-frame collision data
      frameData: [
        // Frame 0 
        {
          hitBox: { x: 80, y: 0, width: 135, height: 260 }, // Character body from ground up
          attackBox: null
        },
        // Frame 1 
        {
          hitBox: { x: 80, y: 60, width: 135, height: 260 },
          attackBox: null
        },
        // Frame 2 
        {
          hitBox: { x: 80, y: 90, width: 135, height: 260 },
          attackBox: null
        },
        // Frame 3 
        {
          hitBox: { x: 80, y: 60, width: 135, height: 260 },
          attackBox: null
        },
        // Frame 4 
        {
          hitBox: { x: 60, y: 30, width: 135, height: 260 },
          attackBox: null
        },
        // Frame 5 
        {
          hitBox: { x: 60, y: 0, width: 135, height: 260 },
          attackBox: null
        }
      ],
      loop: false, // Jump is typically not looped
      keyframe: 'sprite-6-frames'
    },
    [ANIMATION_TYPES.ATTACK_1]: {
      spriteSheet: './Knight_1/Attack 1.png',
      frames: 5,
      frameWidth: 120,    // How much to take from each frame start (collision box width)
      frameHeight: 128,
      frameStarts: [0, 128, 256, 384, 512], // Original frame start positions (5 frames)
      duration: 0.8,     // Sum of frameDurations
      frameDurations: [0.15, 0.15, 0.15, 0.15, 0.2], // Frame 5 shows for 0.2 seconds
      // Per-frame collision data
      frameData: [
        // Frame 0 - Wind up (body centered)
        {
          hitBox: { x: 160, y: 0, width: 120, height: 260 }, // Character body from ground up
          attackBox: null
        },
        // Frame 1 - Swing start (body shifted slightly)
        {
          hitBox: { x: 160, y: 0, width: 120, height: 260 },
          attackBox: null
        },
        // Frame 2 - Swing middle (body more shifted)
        {
          hitBox: { x: 160, y: 0, width: 120, height: 260 },
          attackBox: null
        },
        // Frame 3 - Swing end (body fully shifted)
        {
          hitBox: { x: 160, y: 0, width: 120, height: 260 },
          attackBox: {
            x: -218,           // Offset from entity.x + entity.w
            yRatio: 0.5,     // Y offset as ratio of entity.h - positioned lower to hit enemies
            width: 218,       // Width of attack area
            heightRatio: 0.52 // Height as ratio of entity.h - smaller height for better precision
          }
        },
        // Frame 4 - Impact (character in final pose)
        {
          hitBox: { x: 160, y: 0, width: 120, height: 260 }, // Slightly larger than enemy rectangle
          attackBox: {
            x: -218,//-218,           // Offset from entity.x + entity.w
            yRatio: 0.5,     // Y offset as ratio of entity.h - positioned lower to hit enemies
            width: 218,//218,       // Width of attack area
            heightRatio: 0.52 // Height as ratio of entity.h - smaller height for better precision
          }
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.RUN_ATTACK]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.8,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Run attack frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.DEFEND]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Defend frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: true,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.HURT]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.5,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Hurt frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.DEAD]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Dead frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    }
  },

  // Enemy animations (simple colored rectangles for now)
  enemy: {
    [ANIMATION_TYPES.IDLE]: {
      spriteSheet: null, // No sprite - render as colored rectangle
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999, // Static - never changes
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Idle frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: true,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.WALK]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Walk frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: true,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.RUN]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Run frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: true,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.JUMP]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 1.0,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Jump frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.ATTACK_1]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.8,
      // Per-frame collision data for enemies
      frameData: [
        // Frame 0 - Attack frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 }, // Slightly larger than enemy rectangle
          attackBox: {
            x: 15,         // Offset from entity.x + entity.w (extends right from enemy)
            yRatio: 0.5,   // Y offset as ratio of entity.h
            width: 20,     // Width of attack area
            heightRatio: 0.5 // Height as ratio of entity.h
          }
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.ATTACK_2]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.6,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Attack frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.ATTACK_3]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.8,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Attack frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.RUN_ATTACK]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.8,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Run attack frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.DEFEND]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Defend frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: true,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.HURT]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 0.5,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Hurt frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    },
    [ANIMATION_TYPES.DEAD]: {
      spriteSheet: null,
      frames: 1,
      frameWidth: 60,
      frameHeight: 60,
      duration: 999,
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Dead frame
        {
          hitBox: { x: 0, y: 0, width: 65, height: 65 } // Slightly larger than enemy rectangle
        }
      ],
      loop: false,
      keyframe: 'static-1-frame'
    }
  },

  // Ally animations (static colored rectangle)
  ally: {
    [ANIMATION_TYPES.IDLE]: {
      spriteSheet: null, // No sprite - render as colored rectangle
      frames: 1,
      frameWidth: 50,
      frameHeight: 50,
      duration: 999, // Static - never changes
      // Per-frame collision data for constant hit box display
      frameData: [
        // Frame 0 - Idle frame
        {
          hitBox: { x: 0, y: 0, width: 50, height: 50 } // Same size as ally rectangle
        }
      ],
      loop: true,
      keyframe: 'static-1-frame'
    }
  }
};

// Keyframe definitions for CSS animations
// These match the keyframes from the reference HTML
const KEYFRAME_DEFINITIONS = {
  'static-1-frame': { to: { backgroundPosition: '0 0' } }, // Static frame
  'sprite-2-frames': { to: { backgroundPosition: '-256px 0' } },
  'sprite-4-frames': { to: { backgroundPosition: '-512px 0' } },
  'sprite-5-frames': { to: { backgroundPosition: '-640px 0' } },
  'sprite-6-frames': { to: { backgroundPosition: '-768px 0' } },
  'sprite-7-frames': { to: { backgroundPosition: '-896px 0' } },
  'sprite-8-frames': { to: { backgroundPosition: '-1024px 0' } }
};

// Helper function to get animation definition
function getAnimationDefinition(entityType, animationType) {
  const definitions = ANIMATION_DEFINITIONS[entityType];
  return definitions ? definitions[animationType] : null;
}

// Helper function to get sprite config
function getSpriteConfig(entityType) {
  return SPRITE_CONFIGS[entityType] || SPRITE_CONFIGS.default;
}

// Helper function to get keyframe definition
function getKeyframeDefinition(keyframeName) {
  return KEYFRAME_DEFINITIONS[keyframeName];
}

// Animation state priorities (higher number = higher priority)
const ANIMATION_PRIORITIES = {
  [ANIMATION_TYPES.DEAD]: 100,
  [ANIMATION_TYPES.HURT]: 90,
  [ANIMATION_TYPES.ATTACK_1]: 80,
  [ANIMATION_TYPES.ATTACK_2]: 80,
  [ANIMATION_TYPES.ATTACK_3]: 80,
  [ANIMATION_TYPES.RUN_ATTACK]: 80,
  [ANIMATION_TYPES.DEFEND]: 70,
  [ANIMATION_TYPES.JUMP]: 60,
  [ANIMATION_TYPES.RUN]: 50,
  [ANIMATION_TYPES.WALK]: 40,
  [ANIMATION_TYPES.IDLE]: 10
};

// Helper function to get animation priority
function getAnimationPriority(animationType) {
  return ANIMATION_PRIORITIES[animationType] || 0;
}

// Export for use in other modules
window.ANIMATION_TYPES = ANIMATION_TYPES;
window.ANIMATION_DEFINITIONS = ANIMATION_DEFINITIONS;
window.getAnimationDefinition = getAnimationDefinition;
window.getSpriteConfig = getSpriteConfig;
window.getKeyframeDefinition = getKeyframeDefinition;
window.getAnimationPriority = getAnimationPriority;
