<script>
import { Vector2 } from 'three';

export default {
  name: 'PanelwithPoints',
  computed: {
    customGeometry() {
      return 'VglExtrudeGeometry';
    },
    materials() {
      const formattedEdges = this.edges.split('-').map(edge => parseInt(edge, 10));
      const material = [];
      if (this.collide || this.shapeSelfIntersects()) {
        for (let i = 0; i <= this.points.length; i += 1) material.push('red');
      } else {
        material.push(this.isSelected && !this.enableShapeEdit ? 'selected' : this.material.toString());
        for (let i = 0; i < this.points.length; i += 1) {
          material.push((i < formattedEdges.length && formattedEdges[i]) ? this.material.toString() : 'raw');
          if (this.shapePointAngles[i] > 180) material.push((i < formattedEdges.length && formattedEdges[i]) ? this.material.toString() : 'raw');
        }
      }
      return material;
    },
  },
  methods: {
    setAsPanel() {
      this.$refs.panel.inst.isPanel = true;
      if (this.$refs.physicalGeometry) this.$refs.physicalGeometry.inst.isPhysicalGeometry = true;
      if (this.$refs.leftPhysicalGeometry) this.$refs.leftPhysicalGeometry.inst.isPhysicalGeometry = true;
      if (this.$refs.rightPhysicalGeometry) this.$refs.rightPhysicalGeometry.inst.isPhysicalGeometry = true;
      for (let i = 0; i < this.points.length; i += 1) {
        if (this.$refs[`${i}_physicalGeometry`]) this.$refs[`${i}_physicalGeometry`][0].inst.isPhysicalGeometry = true;
      }
    },
    lineIntersects(p1, p2, p3, p4) {
      const det = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);
      if (det === 0) return false;
      const lambda = ((p4[1] - p3[1]) * (p4[0] - p1[0]) + (p3[0] - p4[0]) * (p4[1] - p1[1])) / det;
      const gamma = ((p1[1] - p2[1]) * (p4[0] - p1[0]) + (p2[0] - p1[0]) * (p4[1] - p1[1])) / det;
      return (lambda > 0 && lambda < 1) && (gamma > 0 && gamma < 1);
    },
    shapeSelfIntersects() {
      const { points } = this;
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 2; j < points.length - 1; j += 1) {
          if (this.lineIntersects(points[i], points[i + 1], points[j], points[j + 1])) return true;
        }
      }
      return false;
    },
    shapeHeights() {
      const heights = [];
      const points = this.fixedShapePoints();
      for (let i = 0; i < points.length; i += 1) heights.push(points[i].distanceTo(points[(i + 1) % points.length]));
      return heights;
    },
    fixedShapePoints() {
      const width = (Math.max(...this.points.map(p => p[0])) - Math.min(...this.points.map(p => p[0]))) * 5;
      const height = (Math.max(...this.points.map(p => p[1])) - Math.min(...this.points.map(p => p[1]))) * 5;

      const points = [];
      this.points.forEach((p, index) => {
        if (this.shapePointAngles[index] > 180) {
          const prevIndex = (index - 1 + this.points.length) % this.points.length;
          const nextIndex = (index + 1) % this.points.length;
          const maxOffset = Math.min(new Vector2(p[0], p[1]).distanceTo(new Vector2(this.points[nextIndex][0], this.points[nextIndex][1])),
            new Vector2(p[0], p[1]).distanceTo(new Vector2(this.points[prevIndex][0], this.points[prevIndex][1])));
          const offset = Math.min(maxOffset, 6 / Math.tan(Math.PI - this.shapePointAngles[index] * Math.PI / 360));

          let direct = new Vector2(this.points[prevIndex][0] - p[0], this.points[prevIndex][1] - p[1]).normalize();
          let point = new Vector2(p[0], p[1]).add(direct.multiplyScalar(offset));
          points.push([Math.round(point.x * 10) / 10, Math.round(point.y * 10) / 10]);

          direct = new Vector2(this.points[nextIndex][0] - p[0], this.points[nextIndex][1] - p[1]).normalize();
          point = new Vector2(p[0], p[1]).add(direct.multiplyScalar(offset));
          points.push([Math.round(point.x * 10) / 10, Math.round(point.y * 10) / 10]);
        } else {
          points.push(p);
        }
      });
      return points.map(p => new Vector2(p[0] * 10 - width, p[1] * 10 - height));
    },
    customGeometryBinding() {
      return {
        ref: 'shape',
        name: `${this.id}_physicalGeometry`,
        shapes: this.fixedShapePoints(),
        depth: 0,
        bevelEnabled: false,
        curveSegments: 2,
        steps: this.points.length,
      };
    },
  },
};
</script>
