// Sprite Manager
// Handles loading, caching, and management of sprite sheets
// Phase 3: Asset management clarification - improved asset tracking and management ✅

class SpriteManager {
  constructor() {
    this.sprites = new Map(); // Cache for loaded images
    this.loadingPromises = new Map(); // Track loading promises
    this.loadCallbacks = []; // Callbacks when all sprites are loaded

    // Asset management tracking
    this.assetStats = {
      totalLoaded: 0,
      totalFailed: 0,
      loadTimes: new Map(), // path -> load time
      memoryUsage: 0 // Estimated memory usage in bytes
    };

    // Asset categories for better organization
    this.assetCategories = {
      entitySprites: new Set(),
      uiSprites: new Set(),
      effectSprites: new Set(),
      backgroundSprites: new Set()
    };
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
    await this.loadSprites(spritePaths);
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

  // ===========================================
  // ASSET MANAGEMENT METHODS - Phase 3
  // ===========================================

  // Categorize asset by type
  categorizeAsset(path, category) {
    if (this.assetCategories[category]) {
      this.assetCategories[category].add(path);
    }
  }

  // Get assets by category
  getAssetsByCategory(category) {
    return Array.from(this.assetCategories[category] || []);
  }

  // Get asset statistics
  getAssetStats() {
    return {
      ...this.assetStats,
      loadedSprites: this.sprites.size,
      loadingSprites: this.loadingPromises.size,
      totalAssets: this.sprites.size + this.loadingPromises.size,
      categories: Object.keys(this.assetCategories).reduce((acc, cat) => {
        acc[cat] = this.assetCategories[cat].size;
        return acc;
      }, {})
    };
  }

  // Check if all assets in category are loaded
  isCategoryLoaded(category) {
    const categoryAssets = this.getAssetsByCategory(category);
    return categoryAssets.every(path => this.sprites.has(path));
  }

  // Unload specific asset (for memory management)
  unloadAsset(path) {
    if (this.sprites.has(path)) {
      const img = this.sprites.get(path);
      // Estimate memory savings
      const estimatedSize = (img.width * img.height * 4); // RGBA bytes
      this.assetStats.memoryUsage -= estimatedSize;

      this.sprites.delete(path);

      // Remove from categories
      Object.values(this.assetCategories).forEach(categorySet => {
        categorySet.delete(path);
      });

      console.log(`[SpriteManager] Unloaded asset: ${path} (${(estimatedSize / 1024).toFixed(1)}KB saved)`);
      return true;
    }
    return false;
  }

  // Preload assets with progress tracking
  async preloadWithProgress(assetList, onProgress = null) {
    const total = assetList.length;
    let loaded = 0;

    const promises = assetList.map(async (path) => {
      await this.loadSprite(path);
      loaded++;
      if (onProgress) {
        onProgress(loaded / total, path);
      }
    });

    await Promise.all(promises);
    console.log(`[SpriteManager] Preloaded ${total} assets with progress tracking`);
  }

  // Validate asset exists and is accessible
  async validateAsset(path) {
    try {
      const img = await this.loadSprite(path);
      return {
        valid: true,
        dimensions: { width: img.width, height: img.height },
        size: img.width * img.height * 4 // Estimated RGBA bytes
      };
    } catch (error) {
      console.warn(`[SpriteManager] Asset validation failed for ${path}:`, error);
      return { valid: false, error: error.message };
    }
  }

  // Cleanup method
  dispose() {
    this.sprites.clear();
    this.loadingPromises.clear();
    this.loadCallbacks = [];

    // Reset asset tracking
    this.assetStats = {
      totalLoaded: 0,
      totalFailed: 0,
      loadTimes: new Map(),
      memoryUsage: 0
    };

    Object.values(this.assetCategories).forEach(set => set.clear());
  }
}

// Global instance
window.spriteManager = new SpriteManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpriteManager;
}
