<script>
import { Vector3 } from 'three';
import VerticalPanel from './VerticalPanel';

export default {
  name: 'VDoorPanel',
  mixins: [VerticalPanel],
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
          x + (width / 2) - this.dimensionsMarginLeft,
          y + (height / 2) - this.dimensionsMarginBottom,
          z + (depth / 2),
        );
      },
      set({ x, y, z }) {
        const { width, height, depth } = this.dimensionsByType;
        this.position = {
          x: x - (width / 2) + this.dimensionsMarginLeft,
          y: y - (height / 2) + this.dimensionsMarginBottom,
          z: z - (depth / 2),
        };
      },
    },
    dimensionsByType: {
      get() {
        const { x, y, thick } = this.dimension;
        let width = x;
        let height = y;
        width += this.dimensionsMarginLeft;
        width += this.dimensionsMarginRight;
        height += this.dimensionsMarginTop;
        height += this.dimensionsMarginBottom;
        return {
          width,
          height,
          depth: thick,
        };
      },
      set({ width, height, depth }) {
        this.dimension = {
          x: width - this.dimensionsMarginRight - this.dimensionsMarginLeft,
          y: height - this.dimensionsMarginTop - this.dimensionsMarginBottom,
          thick: depth,
        };
      },
    },
    realDimensionByType() {
      return {
        width: this.dimensionsByType.width - (this.dimensionsMarginLeft + this.dimensionsMarginRight),
        height: this.dimensionsByType.height - (this.dimensionsMarginTop + this.dimensionsMarginBottom),
        depth: this.dimensionsByType.depth,
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
