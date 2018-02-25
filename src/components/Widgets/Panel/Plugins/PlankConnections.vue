<template>
  <div>
    <vgl-sphere-geometry
      name="bubble_small"
      :radius="250"
      :width-segments="6"
      :height-segments="6" />
    <vgl-sphere-geometry
      name="bubble_big" :radius="400"
      :width-segments="6"
      :height-segments="6" />
    <div v-for="(connection, index) in bubbles" :key="`${plankID}_connection_${index}`">
      <vgl-mesh v-for="(connection, index) in bubbles"
                :key="`bubble_${plankID}_${connection.center.x}_${connection.center.y}_${connection.center.z}_${connection.type || 'default'}_${index}`"
                :geometry="(connection.ilength >= 6000 && connection.type === undefined) ? 'bubble_small' : 'bubble_big'"
                :material="connection.material"
                :position="`${connection.center.x} ${connection.center.y} ${connection.center.z}`"
                :name="`bubble_${plankID}_${connection.p2}`"
                ref="bubble" />
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
      return this.connections.filter(c => c.p1 === Number(this.plankID)).filter(c => !window.panels[c.p1].groupName || !window.groups[window.panels[c.p1].groupName].moving);
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
    const self = this;
    this.$nextTick(() => self.setAsConnectionBubbles());
  },
  updated() {
    const self = this;
    this.$nextTick(() => self.setAsConnectionBubbles());
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
