<template>
  <div>
    <vgl-sphere-geometry
      name="bubble_small"
      :radius="250"
      :width-segments="6"
      :height-segments="6" />
    <vgl-sphere-geometry
      name="bubble_big"
      :radius="400"
      :width-segments="6"
      :height-segments="6" />
    <div v-for="(connection, index) in bubbles" :key="`bubble_${plankID}_${connection.center.x}_${connection.center.y}_${connection.center.z}_${connection.type || 'default'}_${index}`">
      <vgl-mesh :geometry="(connection.ilength >= 6000 && (connection.type === undefined || connection.type === 'rafix')) ? 'bubble_small' : 'bubble_big'"
                :material="connection.material"
                :position="`${connection.center.x} ${connection.center.y} ${connection.center.z}`"
                :name="`bubble_${plankID}_${connection.p2}`"
                ref="bubble" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    connectionsWherePanelIsP1() {
      return this.connections.filter(c => c.p1 === Number(this.plankID))
        .filter((c) => {
          if (c.isHidden) return false;
          if (!window.panels[c.p1] || !window.panels[c.p2]) return false;
          if (!window.panels[c.p1].visible || !window.panels[c.p2].visible) return false;
          if (this.selectedObject3D) {
            const selectedObject = this.selectedObject3D.object3d;
            let selectedGroupName = null;
            if (selectedObject.isConnectionBubble) {
              selectedGroupName = window.panels[selectedObject.name.split('_')[1]].groupName;
            } else if (!selectedObject.isGroup && !selectedObject.isGroupArrow) {
              selectedGroupName = window.panels[selectedObject.name.split('_')[0]].groupName;
            } else if (selectedObject.isGroup) {
              selectedGroupName = selectedObject.name;
            } else if (selectedObject.isGroupArrow) {
              selectedGroupName = selectedObject.isCoordinate ? selectedObject.name.split('_coordinate')[0] : selectedObject.name.split('_dimensions')[0];
            } else selectedGroupName = selectedObject.groupName;

            if (selectedGroupName) {
              return ((window.panels[c.p1].groupName === selectedGroupName
                    || window.panels[c.p2].groupName === selectedGroupName) && window.panels[c.p1].isChildOf(selectedGroupName) && window.panels[c.p2].isChildOf(selectedGroupName));
            }
          }

          const p1GroupName = window.panels[c.p1].topGroupName;
          const p2GroupName = window.panels[c.p2].topGroupName;

          return (!(p1GroupName && p2GroupName) || (p1GroupName !== p2GroupName));
        });
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
