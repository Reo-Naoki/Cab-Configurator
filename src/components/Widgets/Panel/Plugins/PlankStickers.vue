<template>
  <div>
    <vgl-box-geometry :name="plankName + '_sticker_geometry'"
                      :width="stickerDimensionByType.width"
                      :height="stickerDimensionByType.height"
                      :depth="stickerDimensionByType.depth">
    </vgl-box-geometry>
    <vgl-mesh ref="sticker"
              :geometry="plankName + '_sticker_geometry'"
              material="sticker"
              :position="stickerFixedOriginByType"
              :name="plankName + '_sticker'">
    </vgl-mesh>
  </div>
</template>

<script>
export default {
  name: 'PlankStickers',
  props: {
    plankName: {
      type: String,
      required: true,
    },
    plankPosition: {
      type: Object,
      required: true,
    },
    plankDimension: {
      type: Object,
      required: true,
    },
    plankType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      stickerSpacing: 10, // space between the plank and the sticker (avoid colliding geometry
      stickerMargin: 180, // margin of the sticker
      stickerSize: 500,
    };
  },
  computed: {
    stickerOriginByType() {
      // origin/position du sticker selon le type de planche
      const { plankPosition: { x: px, y: py, z: pz }, plankDimension: { width, depth, height } } = this;
      switch (this.plankType) {
        case 'FP':
          return {
            x: px + width - this.stickerMargin - this.stickerSize,
            y: py + height + this.stickerSpacing,
            z: pz + (width > depth ? depth - this.stickerMargin - this.stickerSize : this.stickerMargin),
          };
        case 'VP':
          return {
            x: px + (height > width ? width - this.stickerMargin - this.stickerSize : this.stickerMargin),
            y: py + this.stickerMargin,
            z: pz - this.stickerSpacing,
          };
        case 'VDP':
        default:
          return {
            x: px + width + this.stickerSpacing,
            y: py + this.stickerMargin,
            z: pz + (height > depth ? depth - this.stickerMargin - this.stickerSize : this.stickerMargin),
          };
      }
    },
    stickerDimensionByType() {
      // plutot que de faire au cas par cas selon le type
      // il y a un moyen plus simple pour que le sticker aie la meme 'orientation' que la planche
      // il suffit de trouver la propriété (width, depth ou height) qui correspond à la thickness
      // pour cela on cherche la plus petite valeur dans les dimensions de la planche
      const dimension = this.plankDimension;
      // looking for the smallest value (with the matching key) in the dimensions data
      const entry = Object.entries(dimension).reduce(
        ([resultKey, smallestValue], [key, value]) => (smallestValue > value ? [key, value] : [resultKey, smallestValue]),
        ['width', dimension.width],
      );
      const entryAsObject = { [entry[0]]: 10 };
      return {
        width: this.stickerSize,
        height: this.stickerSize,
        depth: this.stickerSize,
        ...entryAsObject, // will override the key/value with the smallest value
      };
    },
    stickerFixedOriginByType() {
      const { stickerOriginByType: { x, y, z }, stickerDimensionByType: { width, depth, height } } = this;
      return `${x + width / 2} ${y + height / 2} ${z + depth / 2}`;
    },
  },
  mounted() {
    this.setAsSticker();
  },
  methods: {
    setAsSticker() {
      this.$refs.sticker.inst.isSticker = true;
    },
  },
};
</script>
