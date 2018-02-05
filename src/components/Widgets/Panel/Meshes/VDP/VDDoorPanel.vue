<script>
import { Vector3 } from 'three';
import VerticalDPanel from './VDPanel';

export default {
  name: 'VDDoorPanel',
  mixins: [VerticalDPanel],
  data() {
    return {
      dimensionsMarginBottom: 40,
      dimensionsMarginLeft: 15,
      dimensionsMarginTop: 15,
      dimensionsMarginRight: 15,
    };
  },
  mounted() {
  },
  computed: {
    fixedPosition: {
      get() {
        const { x, y, z } = this.position;
        const { width, height, depth } = this.dimensionsByType;
        return new Vector3(
          x + (width / 2),
          y + (height / 2) - this.dimensionsMarginBottom,
          z + (depth / 2) - this.dimensionsMarginLeft,
        );
      },
      set({ x, y, z }) {
        const { width, height, depth } = this.dimensionsByType;
        this.position = {
          x: x - (width / 2),
          y: y - (height / 2) + this.dimensionsMarginBottom,
          z: z - (depth / 2) + this.dimensionsMarginLeft,
        };
      },
    },
    dimensionsByType: {
      get() {
        const { x, y, thick } = this.dimension;
        let depth = x;
        let height = y;
        depth += this.dimensionsMarginLeft;
        depth += this.dimensionsMarginRight;
        height += this.dimensionsMarginTop;
        height += this.dimensionsMarginBottom;
        return {
          width: thick,
          height,
          depth,
        };
      },
      set({ width, height, depth }) {
        this.dimension = {
          x: depth - this.dimensionsMarginRight - this.dimensionsMarginLeft,
          y: height - this.dimensionsMarginTop - this.dimensionsMarginBottom,
          thick: width,
        };
      },
    },
    realDimensionByType() {
      return {
        width: this.dimensionsByType.width,
        height: this.dimensionsByType.height - (this.dimensionsMarginTop + this.dimensionsMarginBottom),
        depth: this.dimensionsByType.depth - (this.dimensionsMarginLeft + this.dimensionsMarginRight),
      };
    },
    isDoorPanel() {
      return true;
    },
  },
};
</script>

<style scoped>

</style>
