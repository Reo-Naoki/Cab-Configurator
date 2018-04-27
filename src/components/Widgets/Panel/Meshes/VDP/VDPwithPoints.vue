<script>
import VDPanel from './VDPanel';
import PanelwithPoints from '../Common/PanelwithPoints';

export default {
  name: 'VDPwithPoints',
  mixins: [VDPanel, PanelwithPoints],
  computed: {
    shapeSideRotation() {
      return `0 ${-Math.PI / 2} 0`;
    },
  },
  methods: {
    shapeThick() {
      return this.dimensionsByType.width;
    },
    shapeRotations() {
      const rotations = [];
      const points = this.fixedShapePoints();
      const rightAngle = Math.PI / 2;
      for (let i = 0; i < points.length; i += 1) {
        const nextI = (i + 1) % points.length;
        const angle = points[nextI].clone().sub(points[i]).angle();
        rotations.push(`${-angle + rightAngle} 0 0`);
      }
      return rotations;
    },
    shapePositions(index) {
      const points = this.fixedShapePoints();
      const nextI = (index + 1) % points.length;
      return `${this.fixedPosition.x} ${this.fixedPosition.y + (points[index].y + points[nextI].y) / 2} ${this.fixedPosition.z + (points[index].x + points[nextI].x) / 2}`;
    },
    outline() {
      const positions = [];
      const points = this.fixedShapePoints();
      for (let i = 0; i < points.length; i += 1) {
        positions.push(0);
        positions.push(points[i].y);
        positions.push(points[i].x);
      }
      return positions;
    },
    shapeSegmentLine(index) {
      return `${-this.dimensionsByType.width / 2}, ${this.fixedShapePoints()[index].y}, ${this.fixedShapePoints()[index].x},
        ${this.dimensionsByType.width / 2}, ${this.fixedShapePoints()[index].y}, ${this.fixedShapePoints()[index].x}`;
    },
    leftPanelPosition() {
      return `${this.fixedPosition.x - this.dimensionsByType.width / 2} ${this.fixedPosition.y} ${this.fixedPosition.z}`;
    },
    rightPanelPosition() {
      return `${this.fixedPosition.x + this.dimensionsByType.width / 2} ${this.fixedPosition.y} ${this.fixedPosition.z}`;
    },
  },
};
</script>
