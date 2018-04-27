<script>
import FlatPanel from './FlatPanel';
import PanelwithPoints from '../Common/PanelwithPoints';

export default {
  name: 'FPwithPoints',
  mixins: [FlatPanel, PanelwithPoints],
  computed: {
    shapeSideRotation() {
      const rightAngle = Math.PI / 2;
      return `${-rightAngle} 0 ${-rightAngle}`;
    },
  },
  methods: {
    shapeThick() {
      return this.dimensionsByType.height;
    },
    shapeRotations() {
      const rotations = [];
      const points = this.fixedShapePoints();
      const rightAngle = Math.PI / 2;
      for (let i = 0; i < points.length; i += 1) {
        const nextI = (i + 1) % points.length;
        const angle = points[nextI].clone().sub(points[i]).angle();
        rotations.push(`0 ${angle - rightAngle} ${-rightAngle}`);
      }
      return rotations;
    },
    shapePositions(index) {
      const points = this.fixedShapePoints();
      const nextI = (index + 1) % points.length;
      return `${this.fixedPosition.x + (points[index].y + points[nextI].y) / 2} ${this.fixedPosition.y} ${this.fixedPosition.z + (points[index].x + points[nextI].x) / 2}`;
    },
    outline() {
      const positions = [];
      const points = this.fixedShapePoints();
      for (let i = 0; i < points.length; i += 1) {
        positions.push(points[i].y);
        positions.push(0);
        positions.push(points[i].x);
      }
      return positions;
    },
    shapeSegmentLine(index) {
      return `${this.fixedShapePoints()[index].y}, ${-this.dimensionsByType.height / 2}, ${this.fixedShapePoints()[index].x},
        ${this.fixedShapePoints()[index].y}, ${this.dimensionsByType.height / 2},  ${this.fixedShapePoints()[index].x}`;
    },
    leftPanelPosition() {
      return `${this.fixedPosition.x} ${this.fixedPosition.y - this.dimensionsByType.height / 2} ${this.fixedPosition.z}`;
    },
    rightPanelPosition() {
      return `${this.fixedPosition.x} ${this.fixedPosition.y + this.dimensionsByType.height / 2} ${this.fixedPosition.z}`;
    },
  },
};
</script>
