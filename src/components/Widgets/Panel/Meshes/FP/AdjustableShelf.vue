<script>
import { Vector3 } from 'three';
import FlatPanel from './FlatPanel';
import AdjustableHoles from '../../Plugins/AdjustableHoles';

export default {
  name: 'AdjustableShelf',
  components: {
    AdjustableHoles,
  },
  mixins: [FlatPanel],
  props: {
    connections: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      margin: 5,
    };
  },
  computed: {
    pluginComponent() {
      return 'AdjustableHoles';
    },
    pluginBinding() {
      return {
        connections: this.connections,
      };
    },
    dimensionsByType: {
      get() {
        return {
          width: this.dimension.y + this.margin * 2,
          height: this.dimension.thick,
          depth: this.dimension.x,
        };
      },
      set({ width, height, depth }) {
        this.dimension = { x: depth, y: width - this.margin * 2, thick: height };
      },
    },
    fixedPosition: {
      get() {
        return new Vector3(
          this.position.x + (this.dimensionsByType.width / 2) - this.margin,
          this.position.y + (this.dimensionsByType.height / 2),
          this.position.z + (this.dimensionsByType.depth / 2),
        );
      },
      set({ x, y, z }) {
        this.position = {
          x: x - (this.dimensionsByType.width / 2) + this.margin,
          y: y - (this.dimensionsByType.height / 2),
          z: z - (this.dimensionsByType.depth / 2),
        };
      },
    },
  },
};
</script>

<style scoped>

</style>
