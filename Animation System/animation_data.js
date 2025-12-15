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
  knight: {
    [ANIMATION_TYPES.IDLE]: {
      spriteSheet: './Knight_1/Idle.png',
      frames: 4,
      frameWidth: 120,    // How much to take from each frame start
      frameHeight: 128,
      frameStarts: [0, 128, 256, 384], // Original frame start positions (assuming 128px original frames)
      duration: 1.5,
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
      duration: 1.2,
      loop: false, // Jump is typically not looped
      keyframe: 'sprite-6-frames'
    },
    [ANIMATION_TYPES.ATTACK_1]: {
      spriteSheet: './Knight_1/Attack 1.png',
      frames: 5,
      duration: 0.6,
      loop: false,
      keyframe: 'sprite-5-frames'
    },
    [ANIMATION_TYPES.ATTACK_2]: {
      spriteSheet: './Knight_1/Attack 2.png',
      frames: 4,
      duration: 0.6,
      loop: false,
      keyframe: 'sprite-4-frames'
    },
    [ANIMATION_TYPES.ATTACK_3]: {
      spriteSheet: './Knight_1/Attack 3.png',
      frames: 4,
      duration: 0.8,
      loop: false,
      keyframe: 'sprite-4-frames'
    },
    [ANIMATION_TYPES.RUN_ATTACK]: {
      spriteSheet: './Knight_1/Run+Attack.png',
      frames: 6,
      duration: 0.8,
      loop: false,
      keyframe: 'sprite-6-frames'
    },
    [ANIMATION_TYPES.DEFEND]: {
      spriteSheet: './Knight_1/Defend.png',
      frames: 5,
      duration: 1.0,
      loop: true,
      keyframe: 'sprite-5-frames'
    },
    [ANIMATION_TYPES.HURT]: {
      spriteSheet: './Knight_1/Hurt.png',
      frames: 2,
      duration: 0.5,
      loop: false,
      keyframe: 'sprite-2-frames'
    },
    [ANIMATION_TYPES.DEAD]: {
      spriteSheet: './Knight_1/Dead.png',
      frames: 6,
      duration: 1.5,
      loop: false,
      keyframe: 'sprite-6-frames'
    }
  }
};

// Keyframe definitions for CSS animations
// These match the keyframes from the reference HTML
const KEYFRAME_DEFINITIONS = {
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
