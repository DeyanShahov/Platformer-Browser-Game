// Sprite Manager
// Handles loading, caching, and management of sprite sheets

class SpriteManager {
  constructor() {
    this.sprites = new Map(); // Cache for loaded images
    this.loadingPromises = new Map(); // Track loading promises
    this.loadCallbacks = []; // Callbacks when all sprites are loaded
  }

  // Load a single sprite sheet
  async loadSprite(path) {
    // Return cached sprite if already loaded
    if (this.sprites.has(path)) {
      return this.sprites.get(path);
    }

    // Return existing promise if currently loading
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }

    // Start loading
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        //console.log(`[SpriteManager] Loaded sprite: ${path}`);
        this.sprites.set(path, img);
        this.loadingPromises.delete(path);
        resolve(img);
      };
      img.onerror = () => {
        //console.error(`[SpriteManager] Failed to load sprite: ${path}`);
        this.loadingPromises.delete(path);
        reject(new Error(`Failed to load sprite: ${path}`));
      };
      img.src = path;
    });

    this.loadingPromises.set(path, loadPromise);
    return loadPromise;
  }

  // Load multiple sprites
  async loadSprites(paths) {
    const promises = paths.map(path => this.loadSprite(path));
    return Promise.all(promises);
  }

  // Preload all sprites for a specific entity type
  async preloadEntitySprites(entityType) {
    const spritePaths = this.getEntitySpritePaths(entityType);
    //console.log(`[SpriteManager] Preloading ${spritePaths.length} sprites for ${entityType}`);
    await this.loadSprites(spritePaths);
    //console.log(`[SpriteManager] Finished preloading sprites for ${entityType}`);
  }

  // Get all sprite paths for an entity type
  getEntitySpritePaths(entityType) {
    //console.log(`[SpriteManager] Getting sprite paths for ${entityType}`);
    //console.log(`[SpriteManager] ANIMATION_DEFINITIONS available:`, !!window.ANIMATION_DEFINITIONS);
    //console.log(`[SpriteManager] ANIMATION_DEFINITIONS:`, window.ANIMATION_DEFINITIONS);

    const paths = [];
    const definitions = window.ANIMATION_DEFINITIONS?.[entityType];

    //console.log(`[SpriteManager] Definitions for ${entityType}:`, definitions);

    if (definitions) {
      Object.values(definitions).forEach(animation => {
        if (animation.spriteSheet && !paths.includes(animation.spriteSheet)) {
          //console.log(`[SpriteManager] Found sprite: ${animation.spriteSheet}`);
          paths.push(animation.spriteSheet);
        }
      });
    }

    //console.log(`[SpriteManager] Returning ${paths.length} sprite paths:`, paths);
    return paths;
  }

  // Get a cached sprite
  getSprite(path) {
    return this.sprites.get(path);
  }

  // Check if a sprite is loaded
  isSpriteLoaded(path) {
    return this.sprites.has(path);
  }

  // Get loading progress
  getLoadingProgress() {
    const totalSprites = this.loadingPromises.size + this.sprites.size;
    const loadedSprites = this.sprites.size;
    return totalSprites > 0 ? loadedSprites / totalSprites : 1;
  }

  // Add callback for when all sprites are loaded
  onAllSpritesLoaded(callback) {
    this.loadCallbacks.push(callback);
  }

  // Preload all known sprites
  async preloadAllSprites() {
    const allPaths = [];

    // Collect all sprite paths from animation definitions
    Object.keys(window.ANIMATION_DEFINITIONS || {}).forEach(entityType => {
      allPaths.push(...this.getEntitySpritePaths(entityType));
    });

    // Remove duplicates
    const uniquePaths = [...new Set(allPaths)];

    console.log(`[SpriteManager] Preloading ${uniquePaths.length} total sprites`);
    await this.loadSprites(uniquePaths);

    // Call all registered callbacks
    this.loadCallbacks.forEach(callback => callback());
    this.loadCallbacks = [];

    //console.log(`[SpriteManager] All sprites preloaded successfully`);
  }

  // Create a sprite sheet info object
  createSpriteSheetInfo(path, config) {
    const img = this.getSprite(path);
    if (!img) return null;

    return {
      image: img,
      path: path,
      frameWidth: config.frameWidth || 128,
      frameHeight: config.frameHeight || 128,
      scale: config.scale || 1,
      totalWidth: img.width,
      totalHeight: img.height,
      framesPerRow: Math.floor(img.width / (config.frameWidth || 128)),
      totalFrames: Math.floor(img.width / (config.frameWidth || 128)) * Math.floor(img.height / (config.frameHeight || 128))
    };
  }

  // Get frame rectangle for a specific frame index
  getFrameRect(spriteSheetInfo, frameIndex) {
    const framesPerRow = spriteSheetInfo.framesPerRow;
    const frameX = (frameIndex % framesPerRow) * spriteSheetInfo.frameWidth;
    const frameY = Math.floor(frameIndex / framesPerRow) * spriteSheetInfo.frameHeight;

    return {
      x: frameX,
      y: frameY,
      width: spriteSheetInfo.frameWidth,
      height: spriteSheetInfo.frameHeight
    };
  }

  // Cleanup method
  dispose() {
    this.sprites.clear();
    this.loadingPromises.clear();
    this.loadCallbacks = [];
  }
}

// Global instance
window.spriteManager = new SpriteManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpriteManager;
}
