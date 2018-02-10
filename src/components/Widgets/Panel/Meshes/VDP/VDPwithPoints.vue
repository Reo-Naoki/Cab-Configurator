<script>
import { Vector2, Vector3 } from 'three';
import VDPanel from './VDPanel';

export default {
  name: 'VDPwithPoints',
  mixins: [VDPanel],
  props: {
    points: {
      type: Array,
      required: true,
    },
    rotation: {
      type: Object,
      default: () => ({ x: 0, y: -90 * Math.PI / 180, z: 0 }),
    },
  },
  computed: {
    fixedPoints() {
      return this.points.map(p => new Vector2(p[0] * 10, p[1] * 10));
    },
    fixedPosition: {
      get() {
        return new Vector3(
          this.position.x + this.dimensionsByType.width,
          this.position.y,
          this.position.z,
        );
      },
      set({ x, y, z }) {
        this.position = {
          x: x - this.dimensionsByType.width,
          y,
          z,
        };
      },
    },
    materials() {
      // const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      return [
        this.isSelected ? 'selected' : this.material.toString(),
        'raw',
      ];
    },
    customGeometry() {
      return 'VglExtrudeGeometry';
    },
    customGeometryBinding() {
      return {
        ref: 'geometry',
        name: `${this.id}_geometry`,
        shapes: this.fixedPoints,
        depth: this.dimensionsByType.width,
        bevelEnabled: false,
        curveSegments: 2,
        steps: this.points.length,
      };
    },
  },
  mounted() {
    this.$refs.geometry.inst.lookAt(new Vector3(-1, 0, 0));
  },
};
</script>
