<script>
import PanelMeshMixin from '../PanelMeshMixin';

export default {
  name: 'FlatPanel',
  mixins: [PanelMeshMixin],
  computed: {
    dimensionsByType: {
      get() {
        return {
          width: this.dimension.y,
          height: this.dimension.thick,
          depth: this.dimension.x,
        };
      },
      set({ width, height, depth }) {
        this.dimension = { x: depth, y: width, thick: height };
      },
    },
    materials() {
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      if (this.collide) return 'red';
      return [
        formattedEdges[2] ? this.material.toString() : 'raw',
        formattedEdges[0] ? this.material.toString() : 'raw',
        this.isSelected ? 'selected' : this.material.toString(),
        this.isSelected ? 'selected' : this.material.toString(),
        formattedEdges[1] ? this.material.toString() : 'raw',
        formattedEdges[3] ? this.material.toString() : 'raw',
      ];
    },
  },
};
</script>

<style scoped>

</style>
