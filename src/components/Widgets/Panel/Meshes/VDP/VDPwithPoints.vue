<script>
import * as THREE from 'three';
// import * as THREE from 'three';
import VDPanel from './VDPanel';

export default {
  name: 'VDPwithPoints',
  mixins: [VDPanel],
  computed: {
    shapeSideRotation() {
      return `0 ${-Math.PI / 2} 0`;
    },
    fixedPoints() {
      const width = (Math.max(...this.points.map(p => p[0])) - Math.min(...this.points.map(p => p[0]))) * 5;
      const height = (Math.max(...this.points.map(p => p[1])) - Math.min(...this.points.map(p => p[1]))) * 5;
      return this.points.map(p => new THREE.Vector2(p[0] * 10 - width, p[1] * 10 - height));
    },
    shapeHeights() {
      const heights = [];
      const points = this.fixedPoints;
      for (let i = 0; i < points.length; i += 1) heights.push(points[i].distanceTo(points[(i + 1) % points.length]));
      return heights;
    },
    shapeRotations() {
      const rotations = [];
      const points = this.fixedPoints;
      for (let i = 0; i < points.length; i += 1) {
        const nextI = (i + 1) % points.length;
        let xAngle = 0;
        if (points[i].x < points[nextI].x) xAngle = 0;
        else if (points[i].x > points[nextI].x) xAngle = 2;
        else if (points[i].y < points[nextI].y) xAngle = 1;
        else xAngle = 3;
        rotations.push(`${-Math.PI * (xAngle - 1) / 2} 0 0`);
      }
      return rotations;
    },
    shapePositions() {
      const positions = [];
      const points = this.fixedPoints;
      for (let i = 0; i < points.length; i += 1) {
        const nextI = (i + 1) % points.length;
        positions.push({
          x: this.fixedPosition.x,
          y: this.fixedPosition.y + (points[i].y + points[nextI].y) / 2,
          z: this.fixedPosition.z + (points[i].x + points[nextI].x) / 2,
        });
      }
      return positions;
    },
    materials() {
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      if (this.collide) return ['red', 'red', 'red', 'red', 'red', 'red', 'red'];
      return [
        this.isSelected ? 'selected' : this.material.toString(),
        formattedEdges[0] ? this.material.toString() : 'raw',
        formattedEdges[1] ? this.material.toString() : 'raw',
        formattedEdges[2] ? this.material.toString() : 'raw',
        formattedEdges[3] ? this.material.toString() : 'raw',
        formattedEdges[4] ? this.material.toString() : 'raw',
        formattedEdges[5] ? this.material.toString() : 'raw',
      ];
    },
    customGeometry() {
      return 'VglExtrudeGeometry';
    },
    customGeometryBinding() {
      return {
        ref: 'shape',
        name: `${this.id}_physicalGeometry`,
        shapes: this.fixedPoints,
        depth: 0,
        bevelEnabled: false,
        curveSegments: 2,
        steps: this.points.length,
      };
    },
  },
  methods: {
    setAsPanel() {
      // add in ThreeJS object a tag to identify the mesh as a Panel
      this.$refs.panel.inst.isPanel = true;
      if (this.$refs.physicalGeometry) this.$refs.physicalGeometry.inst.isPhysicalGeometry = true;
      if (this.$refs.leftPhysicalGeometry) this.$refs.leftPhysicalGeometry.inst.isPhysicalGeometry = true;
      if (this.$refs.rightPhysicalGeometry) this.$refs.rightPhysicalGeometry.inst.isPhysicalGeometry = true;
      for (let i = 0; i < this.points.length; i += 1) {
        if (this.$refs[`${i}_physicalGeometry`]) this.$refs[`${i}_physicalGeometry`][0].inst.isPhysicalGeometry = true;
      }
    },
  },
  mounted() {
    this.setAsPanel();
    this.$emit('ready');
  },
  beforeDestroy() {
    // eslint-disable-next-line no-underscore-dangle
    if (window.panels[this.id]._uid === this._uid) delete window.panels[this.id];
  },
};
</script>
