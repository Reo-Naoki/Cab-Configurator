<script>
import { Vector3 } from 'three';
import FlatPanel from './FlatPanel';

export default {
  name: 'FDoorPanel',
  mixins: [FlatPanel],
  data() {
    return {
      dimensionsMarginBottom: 40,
      dimensionsMarginLeft: 15,
      dimensionsMarginTop: 15,
      dimensionsMarginRight: 15,
    };
  },
  computed: {
    fixedPosition: {
      get() {
        const { x, y, z } = this.position;
        const { width, height, depth } = this.dimensionsByType;
        return new Vector3(
          x + (width / 2) - this.dimensionsMarginBottom,
          y + (height / 2),
          z + (depth / 2) - this.dimensionsMarginLeft,
        );
      },
      set({ x, y, z }) {
        const { width, height, depth } = this.dimensionsByType;
        this.position = {
          x: x - (width / 2) + this.dimensionsMarginBottom,
          y: y - (height / 2),
          z: z - (depth / 2) + this.dimensionsMarginLeft,
        };
      },
    },
    dimensionsByType: {
      get() {
        const { x, y, thick } = this.dimension;
        let depth = x;
        let width = y;
        depth += this.dimensionsMarginLeft;
        depth += this.dimensionsMarginRight;
        width += this.dimensionsMarginTop;
        width += this.dimensionsMarginBottom;
        return {
          width,
          height: thick,
          depth,
        };
      },
      set({ width, height, depth }) {
        this.dimension = {
          x: depth - this.dimensionsMarginRight - this.dimensionsMarginLeft,
          y: width - this.dimensionsMarginTop - this.dimensionsMarginBottom,
          thick: height,
        };
      },
    },
    realDimensionByType() {
      return {
        width: this.dimensionsByType.width - (this.dimensionsMarginTop + this.dimensionsMarginBottom),
        height: this.dimensionsByType.height,
        depth: this.dimensionsByType.depth - (this.dimensionsMarginLeft + this.dimensionsMarginRight),
      };
    },
    isDoorPanel() {
      return true;
    },
  },
};
</script>
