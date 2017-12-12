export default class {
  constructor(dimensions, ratio = 1) {
    this.ratio = ratio;
    this.set(dimensions);
  }

  set({ x, y, thick }) {
    this.x = x < 0 ? 0 : x;
    this.y = y < 0 ? 0 : y;
    this.thick = thick < 0 ? 0 : thick;
    return this;
  }

  get minSize() {
    return 80 * this.ratio;
  }

  get maxWidth() {
    return 2300 * this.ratio;
  }

  get maxDepth() {
    return 2000 * this.ratio;
  }

  get minSurface() {
    // 'longueur + largeur doit être supérieure à 300mm'
    return 300 * this.ratio;
  }

  get maxBoth() {
    // Il ne peut y avoir qu'une seule dimension supérieure à 800mm
    return 800 * this.ratio;
  }

  get isValid() {
    const { x: depth, y: width } = this;
    const {
      minSize, maxWidth, maxDepth, minSurface, maxBoth,
    } = this;
    if (width < minSize || depth < minSize) return false;
    if (width > maxWidth) return false;
    if (depth > maxDepth) return false;
    if (width + depth < minSurface) return false;
    return Math.min(width, depth) <= maxBoth;
  }

  makeValid(priorityKey = 'x') {
    /**
     * priorityKey is the key that gets mutated in case of a conflict
     */
    if (this.isValid) return;
    const { x: depth, y: width } = this;
    if (width < this.minSize) this.y = this.minSize;
    if (depth < this.minSize) this.x = this.minSize;
    if (width > this.maxWidth) this.y = this.maxWidth;
    if (depth > this.maxDepth) this.x = this.maxDepth;
    if (width + depth < this.minSurface) {
      if (priorityKey === 'y') this.y = this.minSurface - depth;
      else this.x = this.minSurface - width;
    }
    if (Math.min(width, depth) > this.maxBoth) {
      if (width <= depth) this.y = this.maxBoth;
      else this.x = this.maxBoth;
    }
  }

  clone() {
    const { ratio, ...dimensions } = this;
    return new this.constructor(dimensions, ratio);
  }
}
