<template>
  <div>
    <vgl-cylinder-geometry :name="`${plankID}_excentrique_geometry`" v-bind="screwDimension()"/>
    <div v-for="(c, index) in connectionsWherePanelIsP2" :key="`${plankID}_excentrique_${c.p1}_${c.p2}_key_${index}`">
      <vgl-mesh :geometry="`${plankID}_excentrique_geometry`"
                material="excentrique"
                :position="getFixedOrigin(c, -1)"
                :rotation="getFixedRotation(c)"
                :name="`${plankID}_excentrique_${c.p1}_${c.p2}_left`">
      </vgl-mesh>
      <vgl-mesh :geometry="`${plankID}_excentrique_geometry`"
                material="excentrique"
                :position="getFixedOrigin(c, 1)"
                :rotation="getFixedRotation(c)"
                :name="`${plankID}_excentrique_${c.p1}_${c.p2}_right`">
      </vgl-mesh>
      <vgl-mesh v-if="c.ilength >= 6000"
                :geometry="`${plankID}_excentrique_geometry`"
                material="excentrique"
                :position="getFixedOrigin(c, 0)"
                :rotation="getFixedRotation(c)"
                :name="`${plankID}_excentrique_${c.p1}_${c.p2}_middle`">
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
      screwHeaderHeight: 5, // space between the plank and the texture (avoid colliding geometry)
      screwSpacing: 250,
      screwMargin: 500,
      screwDiameter: 150,
      radialSegments: 20,
    };
  },
  computed: {
    connectionsWherePanelIsP2() {
      return this.connections.filter(c => c.p2 === Number(this.plankID) && (c.isDefaultConnection || c.isRafixConnection))
        .filter(c => !window.panels[c.p2].groupName || (window.groups[window.panels[c.p2].groupName] && !window.groups[window.panels[c.p2].groupName].moving));
    },
  },
  methods: {
    almostEqual(v1, v2) { // true if interval between 2 values is less than 100 (=10mm)
      return (Math.abs(v2 - v1) < 100);
    },
    getFixedOrigin(connection, index = 0) {
      const { x, y, z } = this.getOriginByP1(connection, index);
      return `${x} ${y} ${z}`;
    },
    getOriginByP1(connection, index) {
      const { p2side, center, ilength } = connection;
      const { plankPosition: { x: px, y: py, z: pz }, plankDimension: { width, depth, height } } = this;
      const spacing = connection.isDefaultConnection ? this.screwSpacing : (this.screwDiameter / 2);

      switch (this.plankType) {
        case 'FP': // Ok
          if (this.almostEqual(center.z, pz) || this.almostEqual(center.z, pz + depth)) { // Connect along x axis = with VP
            return {
              x: center.x + (ilength / 2 - this.screwMargin) * index,
              y: p2side === 1 ? py + height + this.screwHeaderHeight : py - this.screwHeaderHeight,
              z: center.z > pz ? pz + depth - spacing : pz + spacing,
            };
          }
          return { // Connect along z axis = with VDP
            x: center.x > px ? px + width - spacing : px + spacing,
            y: p2side === 1 ? py + height + this.screwHeaderHeight : py - this.screwHeaderHeight,
            z: center.z + (ilength / 2 - this.screwMargin) * index,
          };
        case 'VP': // Not done
          if (this.almostEqual(center.x, px) || this.almostEqual(center.x, px + width)) { // Connect with VDP
            return {
              x: center.x <= px ? px + spacing : px + width - spacing,
              y: center.y + (ilength / 2 - this.screwMargin) * index,
              z: p2side === 1 ? pz - this.screwHeaderHeight : pz + depth + this.screwHeaderHeight,
            };
          }
          return { // Connect with FP
            x: center.x + (ilength / 2 - this.screwMargin) * index,
            y: center.y > py ? py + height - spacing : py + spacing,
            z: p2side === 1 ? pz - this.screwHeaderHeight : pz + depth + this.screwHeaderHeight,
          };
        case 'VDP': // Tested Ok
        default:
          if (this.almostEqual(center.y, py) || this.almostEqual(center.y, py + height)) { // Connect with VP
            return {
              x: p2side === 1 ? px + width + this.screwHeaderHeight : px - this.screwHeaderHeight,
              y: center.y > py ? center.y - spacing : py + spacing,
              z: center.z + (ilength / 2 - this.screwMargin) * index,
            };
          }
          return {
            x: p2side === 1 ? px + width + this.screwHeaderHeight : px - this.screwHeaderHeight,
            y: center.y + (ilength / 2 - this.screwMargin) * index,
            z: center.z > pz ? pz + depth - spacing : pz + spacing,
          };
      }
    },
    getFixedRotation(connection) {
      const { x, y, z } = this.getRotationByP1(connection);
      return `${x} ${y} ${z}`;
    },
    getRotationByP1(connection) {
      const { p2side, center } = connection;
      const { plankPosition: { x: px, y: py, z: pz }, plankDimension: { width, depth, height } } = this;

      switch (this.plankType) {
        case 'FP': // Ok
          if (this.almostEqual(center.z, pz) || this.almostEqual(center.z, pz + depth)) { // Connect along x axis = with VP
            return {
              x: 0,
              y: (pz < center.z ? Math.PI * 1.5 : Math.PI * 0.5) + (p2side === 1 ? 0 : Math.PI),
              z: 0,
            };
          }
          // Connect along z axis = with VDP
          return {
            x: 0,
            y: (px < center.x ? 0 : Math.PI) + (p2side === 1 ? 0 : Math.PI),
            z: 0,
          };
        case 'VP': // Not done
          if (this.almostEqual(center.x, px) || this.almostEqual(center.x, px + width)) { // Connect with VDP
            return {
              x: Math.PI * 0.5,
              y: (px < center.x ? 0 : Math.PI) + (p2side === 1 ? Math.PI : 0),
              z: 0,
            };
          }
          // Connect with FP
          return {
            x: Math.PI * 0.5,
            y: (py < center.y ? Math.PI * 0.5 : Math.PI * 1.5) + (p2side === 1 ? Math.PI : 0),
            z: 0,
          };
        case 'VDP': // Tested Ok
        default:
          if (this.almostEqual(center.y, py) || this.almostEqual(center.y, py + height)) { // Connect with FP
            return {
              x: (py < center.y ? 0 : Math.PI) + (p2side === 1 ? Math.PI : 0),
              y: 0,
              z: Math.PI * 0.5,
            };
          }
          // Connect with VP
          return {
            x: (pz < center.z ? Math.PI * 1.5 : Math.PI * 0.5) + (p2side === 1 ? 0 : Math.PI),
            y: 0,
            z: Math.PI * 0.5,
          };
      }
    },
    screwDimension() {
      return {
        radiusTop: this.screwDiameter * 0.5,
        radiusBottom: this.screwDiameter * 0.5,
        height: 1,
        radialSegments: this.radialSegments,
      };
    },
  },
};
</script>
