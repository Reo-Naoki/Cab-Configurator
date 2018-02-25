<script>
import PanelMeshMixin from '../PanelMeshMixin';

export default {
  name: 'VerticalPanel',
  mixins: [PanelMeshMixin],
  computed: {
    dimensionsByType: {
      get() {
        return {
          width: this.dimension.x,
          height: this.dimension.y,
          depth: this.dimension.thick,
        };
      },
      set({ width, height, depth }) {
        this.dimension = { x: width, y: height, thick: depth };
      },
    },
    materials() {
      if (!this.edges) return null;
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      if (this.collide) return 'red';
      return [
        formattedEdges[1] ? this.material.toString() : 'raw',
        formattedEdges[3] ? this.material.toString() : 'raw',
        formattedEdges[2] ? this.material.toString() : 'raw',
        formattedEdges[0] ? this.material.toString() : 'raw',
        this.isSelected ? 'selected' : this.material.toString(),
        this.isSelected ? 'selected' : this.material.toString(),
      ];
    },
  },
};
</script>
