<script>
import { Vector3 } from 'three';
import VerticalPanel from './VerticalPanel';

export default {
  name: 'HDFPanel',
  mixins: [VerticalPanel],
  data() {
    return {
      dimensionsMarginBottom: 80, // virtual 3D dimensions (removing feuillure)
      dimensionsMarginLeft: 80, // virtual 3D dimensions (removing feuillure)
      dimensionsMarginTop: 80, // virtual 3D dimensions (removing feuillure)
      dimensionsMarginRight: 80, // virtual 3D dimensions (removing feuillure)
      hasFeuillure: {},
    };
  },
  computed: {
    hdfPhysicalDimensions() {
      return {
        width: this.dimensionsByType.width + (this.hasFeuillure.left ? this.dimensionsMarginLeft : 0) + (this.hasFeuillure.right ? this.dimensionsMarginRight : 0),
        height: this.dimensionsByType.height + (this.hasFeuillure.top ? this.dimensionsMarginTop : 0) + (this.hasFeuillure.bottom ? this.dimensionsMarginBottom : 0),
        depth: this.dimensionsByType.depth + 5,
      };
    },
    hdfPhysicalPosition() {
      return {
        x: this.fixedPosition.x - (this.hasFeuillure.left ? this.dimensionsMarginLeft / 2 : 0) + (this.hasFeuillure.right ? this.dimensionsMarginRight / 2 : 0),
        y: this.fixedPosition.y - (this.hasFeuillure.bottom ? this.dimensionsMarginBottom / 2 : 0) + (this.hasFeuillure.top ? this.dimensionsMarginTop / 2 : 0),
        z: this.fixedPosition.z,
      };
    },
    fixedPosition: {
      get() {
        const { left, bottom } = this.hasFeuillure;
        const { x, y, z } = this.position;
        const { width, height, depth } = this.dimensionsByType;
        return new Vector3(
          left ? x + (width / 2) + this.dimensionsMarginLeft : x + (width / 2),
          bottom ? y + (height / 2) + this.dimensionsMarginBottom : y + (height / 2),
          z + (depth / 2),
        );
      },
      set({ x, y, z }) {
        const { left, bottom } = this.hasFeuillure;
        const { width, height, depth } = this.dimensionsByType;
        this.position = {
          x: left ? x - (width / 2) - this.dimensionsMarginLeft : x - (width / 2),
          y: bottom ? y - (height / 2) - this.dimensionsMarginBottom : y - (height / 2),
          z: z - (depth / 2),
        };
      },
    },
    dimensionsByType: {
      get() {
        const {
          right, top, bottom, left,
        } = this.hasFeuillure;
        const { x, y, thick } = this.dimension;
        let width = x;
        let height = y;
        if (right) width -= this.dimensionsMarginRight;
        if (top) height -= this.dimensionsMarginTop;
        if (bottom) height -= this.dimensionsMarginBottom;
        if (left) width -= this.dimensionsMarginLeft;
        return {
          width,
          height,
          depth: thick,
        };
      },
      set({ width, height, depth }) {
        const {
          right, top, bottom, left,
        } = this.hasFeuillure;
        this.dimension = {
          x: width + (right ? this.dimensionsMarginRight : 0) + (left ? this.dimensionsMarginLeft : 0),
          y: height + (top ? this.dimensionsMarginTop : 0) + (bottom ? this.dimensionsMarginBottom : 0),
          thick: depth,
        };
      },
    },
    isHDFPanel() {
      return true;
    },
    materials() {
      if (!this.edges) return null;
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      return [
        formattedEdges[1] ? this.material.toString() : 'raw',
        formattedEdges[3] ? this.material.toString() : 'raw',
        formattedEdges[2] ? this.material.toString() : 'raw',
        formattedEdges[0] ? this.material.toString() : 'raw',
        this.isSelected ? 'selected' : this.material.toString(),
        this.isSelected ? 'selected' : 'raw',
      ];
    },
  },
  methods: {
    setFeuillure(isInit = false) {
      const hasFeuillure = {
        left: true, top: true, bottom: this.moving, right: true,
      };

      for (let i = 0; i < this.relatedConnections.length; i += 1) {
        // side detection for HDF connection
        const currentConnection = this.relatedConnections[i];
        if (currentConnection.isHDFConnection) {
          // is left, right, top or bottom connection
          const { p1, p2 } = currentConnection;
          const cPanel = (p1.toString() !== this.id ? window.panels[p1.toString()] : window.panels[p2.toString()]);
          if (!cPanel) return;
          const { x: cx, y: cy } = cPanel.position;
          const cType = cPanel.ptype;

          if (cType === 'VDP') {
            if (cx < this.fixedPosition.x) hasFeuillure.left = true;
            else if (cx > this.fixedPosition.x) hasFeuillure.right = true;
          } else if (cType === 'FP') {
            if (cy < this.fixedPosition.y) hasFeuillure.bottom = true;
            else if (cy > this.fixedPosition.y) hasFeuillure.top = true;
          }
        }
      }
      if (!isInit) {
        const newDimension = { ...this.dimension };
        const newPosition = { ...this.position };
        // if (this.hasFeuillure.top !== hasFeuillure.top) {
        //   // top connection changed, fix real dimension
        //   if (hasFeuillure.top) {
        //     // now have top connection
        //     newDimension.y += this.dimensionsMarginTop;
        //   } else {
        //     newDimension.y -= this.dimensionsMarginTop;
        //   }
        // }
        // if (this.hasFeuillure.right !== hasFeuillure.right) {
        //   // right connection changed, fix real dimension
        //   if (hasFeuillure.right) {
        //     // now have right connection
        //     newDimension.x += this.dimensionsMarginRight;
        //   } else {
        //     newDimension.x -= this.dimensionsMarginRight;
        //   }
        // }
        // if (this.hasFeuillure.left !== hasFeuillure.left) {
        //   // left connection changed, fix real position
        //   if (hasFeuillure.left) {
        //     // now have left connection
        //     newPosition.x -= this.dimensionsMarginLeft;
        //     newDimension.x += this.dimensionsMarginLeft;
        //   } else {
        //     newPosition.x += this.dimensionsMarginLeft;
        //     newDimension.x -= this.dimensionsMarginLeft;
        //   }
        // }
        // if (this.hasFeuillure.bottom !== hasFeuillure.bottom) {
        //   // bottom connection changed, fix real position
        //   if (hasFeuillure.bottom) {
        //     // now have bottom connection
        //     newPosition.y -= this.dimensionsMarginBottom;
        //     newDimension.y += this.dimensionsMarginBottom;
        //   } else {
        //     newPosition.y += this.dimensionsMarginBottom;
        //     newDimension.y -= this.dimensionsMarginBottom;
        //   }
        // }
        if (newDimension.x !== this.dimension.x || newDimension.y !== this.dimension.y || newDimension.z !== this.dimension.z) {
          // check for changes
          this.dimension = newDimension;
        }
        if (newPosition.x !== this.position.x || newPosition.y !== this.position.y) {
          this.position = newPosition;
        }
      }
      this.hasFeuillure = hasFeuillure;
      const self = this;
      this.$nextTick(() => self.updateColliding(true));
    },
  },
  mounted() {
    this.setFeuillure(true);
  },
  watch: {
    relatedConnections() {
      this.setFeuillure();
    },
  },
};
</script>
