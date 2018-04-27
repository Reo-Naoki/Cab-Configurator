<script>
import VerticalPanel from './VerticalPanel';
import PanelwithPoints from '../Common/PanelwithPoints';

export default {
  name: 'VPwithPoints',
  mixins: [VerticalPanel, PanelwithPoints],
  computed: {
    shapeSideRotation() {
      return '0 0 0';
    },
  },
  methods: {
    shapeThick() {
      return this.dimensionsByType.depth;
    },
    shapeRotations() {
      const rotations = [];
      const points = this.fixedShapePoints();
      const rightAngle = Math.PI / 2;
      for (let i = 0; i < points.length; i += 1) {
        const nextI = (i + 1) % points.length;
        const angle = points[nextI].clone().sub(points[i]).angle();
        rotations.push(`${rightAngle} ${angle} ${rightAngle}`);
      }
      return rotations;
    },
    shapePositions(index) {
      const points = this.fixedShapePoints();
      const nextI = (index + 1) % points.length;
      return `${this.fixedPosition.x + (points[index].x + points[nextI].x) / 2} ${this.fixedPosition.y + (points[index].y + points[nextI].y) / 2} ${this.fixedPosition.z}`;
    },
    outline() {
      const positions = [];
      const points = this.fixedShapePoints();
      for (let i = 0; i < points.length; i += 1) {
        positions.push(points[i].x);
        positions.push(points[i].y);
        positions.push(0);
      }
      return positions;
    },
    shapeSegmentLine(index) {
      return `${this.fixedShapePoints()[index].x}, ${this.fixedShapePoints()[index].y}, ${-this.dimensionsByType.depth / 2},
        ${this.fixedShapePoints()[index].x}, ${this.fixedShapePoints()[index].y}, ${this.dimensionsByType.depth / 2}`;
    },
    leftPanelPosition() {
      return `${this.fixedPosition.x} ${this.fixedPosition.y} ${this.fixedPosition.z - this.dimensionsByType.depth / 2}`;
    },
    rightPanelPosition() {
      return `${this.fixedPosition.x} ${this.fixedPosition.y} ${this.fixedPosition.z + this.dimensionsByType.depth / 2}`;
    },
  },
};
</script>
