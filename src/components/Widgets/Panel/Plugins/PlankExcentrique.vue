<template>
  <div>
    <div v-for="(c, index) in connectionsWherePanelIsP2" :key="`${plankID}_excentrique_${c.p1}_${c.p2}_key_${index}`">
      <vgl-box-geometry :name="`${plankID}_excentrique_${c.p1}_${c.p2}_geometry`" v-bind="textureDimension(c)"/>
      <vgl-mesh :geometry="`${plankID}_excentrique_${c.p1}_${c.p2}_geometry`"
                :material="texture(c)"
                :position="getFixedOrigin(c)"
                :name="`${plankID}_excentrique_${c.p1}_${c.p2}`">
      </vgl-mesh>
    </div>
  </div>
</template>

<script>
// panel must be the P2 of someone
export default {
  name: 'PlankExcentrique',
  props: {
    plankID: {
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
    connections: {
      // connections related to current panel
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      textureSpacing: 10, // space between the plank and the texture (avoid colliding geometry
      textureMargin: 180, // margin of the texture
      textureSize: 500,
    };
  },
  computed: {
    connectionsWherePanelIsP2() {
      return this.connections.filter(c => c.p2 === Number(this.plankID) && c.isDefaultConnection);
    },
  },
  methods: {
    texture(connection) {
      const { center } = connection;
      const { plankPosition: { y: py, z: pz }, plankDimension: { depth, height } } = this;
      switch (this.plankType) {
        case 'FP':
          if (this.almostEqual(center.z, pz) || this.almostEqual(center.z, pz + depth)) { // Connect along x axis = with VP
            return 'excentrique';
          }
          return 'excentrique2';
        case 'VP':
          if (this.almostEqual(center.y, py) || this.almostEqual(center.y, py + height)) { // Connect along x axis = with
            return 'excentrique';
          }
          return 'excentrique2';
        case 'VDP':
        default:
          if (this.almostEqual(center.y, py) || this.almostEqual(center.y, py + height)) { // Connect with VP
            return 'excentrique';
          }
          return 'excentrique2';
      }
    },
    almostEqual(v1, v2) { // true if interval between 2 values is less than 100 (=10mm)
      return (Math.abs(v2 - v1) < 100);
    },
    getOriginByP1(connection) {
      const { p2side, center, ilength } = connection;
      const { plankPosition: { x: px, y: py, z: pz }, plankDimension: { width, depth, height } } = this;
      switch (this.plankType) {
        case 'FP': // Ok
          if (this.almostEqual(center.z, pz) || this.almostEqual(center.z, pz + depth)) { // Connect along x axis = with VP
            return {
              x: center.x - Math.floor(ilength / 2),
              y: p2side === 1 ? py + height + this.textureSpacing : py - this.textureSpacing,
              z: center.z > pz ? pz + depth - this.textureSize : pz,
            };
          }
          return { // Connect along z axis = with VDP
            x: center.x > px ? px + width - this.textureSize : px,
            y: p2side === 1 ? py + height + this.textureSpacing : py - this.textureSpacing,
            z: center.z - Math.floor(ilength / 2), //  ? pz : center.z - this.textureSize,
          };
        case 'VP': // Not done
          if (this.almostEqual(center.x, px) || this.almostEqual(center.x, px + width)) { // Connect with VDP
            return {
              x: center.x <= px ? px : px + width - this.textureSize,
              y: center.y - Math.floor(ilength / 2),
              z: p2side === 1 ? pz - this.textureSpacing : pz + depth + this.textureSpacing,
            };
          }
          return { // Connect with FP
            x: center.x - Math.floor(ilength / 2),
            y: center.y > py ? py + height - this.textureSize : py,
            z: p2side === 1 ? pz - this.textureSpacing : pz + depth + this.textureSpacing,
          };
        case 'VDP': // Tested Ok
        default:
          if (this.almostEqual(center.y, py) || this.almostEqual(center.y, py + height)) { // Connect with VP
            return {
              x: p2side === 1 ? px + width + this.textureSpacing : px - this.textureSpacing,
              y: center.y > py ? center.y - this.textureSize : py,
              z: center.z - Math.floor(ilength / 2),
            };
          }
          return {
            x: p2side === 1 ? px + width + this.textureSpacing : px - this.textureSpacing,
            y: center.y - Math.floor(ilength / 2),
            z: center.z > pz ? pz + depth - this.textureSize : pz,
          };
      }
    },
    getFixedOrigin(connection) {
      const { width, depth, height } = this.textureDimension(connection);
      const { x, y, z } = this.getOriginByP1(connection);
      return `${x + width / 2} ${y + height / 2} ${z + depth / 2}`;
    },
    textureDimension(connection) {
      /*
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
      const entryAsObject = { [entry[0]]: 1 };
      return {
        width: this.textureSize,
        height: this.textureSize,
        depth: this.textureSize,
        ...entryAsObject, // will override the key/value with the smallest value
      };
*/
      // const dimension = this.plankDimension;
      const { center, ilength } = connection;
      // eslint-disable-next-line no-unused-vars
      const { plankPosition: { x: px, y: py, z: pz }, plankDimension: { width, depth, height } } = this;
      switch (this.plankType) {
        case 'FP':
          if (this.almostEqual(center.z, pz) || this.almostEqual(center.z, pz + depth)) { // Connect along x axis = with VP
            return {
              width: ilength,
              height: 1,
              depth: this.textureSize,
            };
          }
          return {
            width: this.textureSize,
            height: 1,
            depth: ilength,
          };

        case 'VP':
          if (this.almostEqual(center.x, px) || this.almostEqual(center.x, px + width)) { // Connect with VDP
            return {
              width: this.textureSize,
              height: ilength,
              depth: 1,
            };
          }
          return { // Connect with FP
            width: ilength,
            height: this.textureSize,
            depth: 1,
          };
        case 'VDP':
        default:
          if (this.almostEqual(center.y, py) || this.almostEqual(center.y, py + height)) { // connect with VP
            return {
              width: 1,
              height: this.textureSize,
              depth: connection.ilength,
            };
          }
          return {
            width: 1,
            height: connection.ilength,
            depth: this.textureSize,
          };
      }
    },
  },
};
</script>

<style scoped>

</style>
