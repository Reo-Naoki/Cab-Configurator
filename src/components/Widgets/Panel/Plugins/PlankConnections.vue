<template>
  <div>
    <div v-for="(connection, index) in bubbles" :key="`${plankID}_connection_${index}`">
      <vgl-sphere-geometry :name="`${plankID}_bubble_${index}`" :radius="(connection.ilength >= 6000 && connection.type === undefined) ? 250 : 400"></vgl-sphere-geometry>
      <vgl-mesh v-for="(connection, index) in bubbles"
                :key="`bubble_${plankID}_${connection.center.x}_${connection.center.y}_${connection.center.z}_${connection.type || 'default'}_${index}`"
                :geometry="`${plankID}_bubble_${index}`"
                :material="connection.material"
                :position="`${connection.center.x} ${connection.center.y} ${connection.center.z}`"
                :name="`bubble_${plankID}_${connection.p2}`"
                ref="bubble"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlankConnections',
  props: {
    plankID: {
      type: String,
      required: true,
    },
    plankPosition: {
      type: Object,
      required: true,
    },
    connections: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    connectionsWherePanelIsP1() {
      return this.connections.filter(c => c.p1 === Number(this.plankID));
    },
    bubbles() {
      return this.connectionsWherePanelIsP1.map(c => {
        switch (c.type) {
          case 'undefined':
            return { ...c, material: 'red' };
          case 'free':
            return { ...c, material: 'black' };
          default:
            return { ...c, material: 'green' };
        }
      });
    },
  },
  mounted() {
    this.setAsConnectionBubbles();
  },
  methods: {
    setAsConnectionBubbles() {
      if (this.$refs.bubble) {
        for (let i = 0; i < this.$refs.bubble.length; i += 1) {
          this.$refs.bubble[i].inst.isConnectionBubble = true;
        }
      }
    },
  },
};
</script>

<style scoped>

</style>
