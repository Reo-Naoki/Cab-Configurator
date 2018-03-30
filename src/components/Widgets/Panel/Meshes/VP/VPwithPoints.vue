<script>
import * as THREE from 'three';
// import * as THREE from 'three';
import VerticalPanel from './VerticalPanel';

export default {
  name: 'VPwithPoints',
  mixins: [VerticalPanel],
  computed: {
    shapeSideRotation() {
      return '0 0 0';
    },
    customGeometry() {
      return 'VglExtrudeGeometry';
    },
    materials() {
      const formattedEdges = this.edges.split('-').map(edge => parseInt(edge, 10));
      const material = [];
      if (this.collide) {
        for (let i = 0; i <= formattedEdges.length; i += 1) material.push('red');
      } else {
        material.push(this.isSelected && !this.enableShapeEdit ? 'selected' : this.material.toString());
        for (let i = 0; i < formattedEdges.length; i += 1) material.push(formattedEdges[i] ? this.material.toString() : 'raw');
      }
      return material;
    },
  },
  methods: {
    setAsPanel() {
      // add in ThreeJS object a tag to identify the mesh as a Panel
      this.$refs.panel.inst.isPanel = true;
      if (this.$refs.physicalGeometry) this.$refs.physicalGeometry.inst.isPhysicalGeometry = true;
      if (this.$refs.leftPhysicalGeometry) this.$refs.leftPhysicalGeometry.inst.isPhysicalGeometry = true;
      if (this.$refs.rightPhysicalGeometry) this.$refs.rightPhysicalGeometry.inst.isPhysicalGeometry = true;
      for (let i = 0; i < this.shapePoints.length; i += 1) {
        if (this.$refs[`${i}_physicalGeometry`]) this.$refs[`${i}_physicalGeometry`][0].inst.isPhysicalGeometry = true;
      }
    },
    customGeometryBinding() {
      return {
        ref: 'shape',
        name: `${this.id}_physicalGeometry`,
        shapes: this.fixedPoints(),
        depth: 0,
        bevelEnabled: false,
        curveSegments: 2,
        steps: this.shapePoints.length,
      };
    },
    fixedPoints() {
      const width = (Math.max(...this.shapePoints.map(p => p[0])) - Math.min(...this.shapePoints.map(p => p[0]))) * 5;
      const height = (Math.max(...this.shapePoints.map(p => p[1])) - Math.min(...this.shapePoints.map(p => p[1]))) * 5;
      return this.shapePoints.map(p => new THREE.Vector2(p[0] * 10 - width, p[1] * 10 - height));
    },
    shapeThick() {
      return this.dimensionsByType.depth;
    },
    shapeHeights() {
      const heights = [];
      const points = this.fixedPoints();
      for (let i = 0; i < points.length; i += 1) heights.push(points[i].distanceTo(points[(i + 1) % points.length]));
      return heights;
    },
    shapeRotations() {
      const rotations = [];
      const points = this.fixedPoints();
      for (let i = 0; i < points.length; i += 1) {
        const nextI = (i + 1) % points.length;
        const angle = points[nextI].clone().sub(points[i]).angle();
        rotations.push(`${Math.PI / 2} ${angle} ${Math.PI / 2}`);
      }
      return rotations;
    },
    shapePositions(index) {
      const points = this.fixedPoints();
      const nextI = (index + 1) % points.length;
      return `${this.fixedPosition.x + (points[index].x + points[nextI].x) / 2} ${this.fixedPosition.y + (points[index].y + points[nextI].y) / 2} ${this.fixedPosition.z}`;
    },
    outline() {
      const positions = [];
      const points = this.fixedPoints();
      for (let i = 0; i < points.length; i += 1) {
        positions.push(points[i].x);
        positions.push(points[i].y);
        positions.push(0);
      }
      return positions;
    },
    shapeSegmentLine(index) {
      return `${this.fixedPoints()[index].x}, ${this.fixedPoints()[index].y}, ${-this.dimensionsByType.depth / 2},
        ${this.fixedPoints()[index].x}, ${this.fixedPoints()[index].y}, ${this.dimensionsByType.depth / 2}`;
    },
    leftPanelPosition() {
      return `${this.fixedPosition.x} ${this.fixedPosition.y} ${this.fixedPosition.z - this.dimensionsByType.depth / 2}`;
    },
    rightPanelPosition() {
      return `${this.fixedPosition.x} ${this.fixedPosition.y} ${this.fixedPosition.z + this.dimensionsByType.depth / 2}`;
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
