<script>
import PanelMeshMixin from '../PanelMeshMixin';

export default {
  name: 'VerticalDPanel',
  mixins: [PanelMeshMixin],
  computed: {
    dimensionsByType: {
      get() {
        return {
          width: this.dimension.thick,
          height: this.dimension.y,
          depth: this.dimension.x,
        };
      },
      set({ width, height, depth }) {
        this.dimension = { x: depth, y: height, thick: width };
      },
    },
    materials() {
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      if (this.collide) return 'red';
      return [
        this.isSelected ? 'selected' : this.material.toString(),
        this.isSelected ? 'selected' : this.material.toString(),
        formattedEdges[1] ? this.material.toString() : 'raw',
        formattedEdges[3] ? this.material.toString() : 'raw',
        formattedEdges[2] ? this.material.toString() : 'raw',
        formattedEdges[0] ? this.material.toString() : 'raw',
      ];
    },
  },
};
</script>
