<template>
  <div>
    <vgl-group ref="root" name="root">>
      <Panel v-for="(panel, index) in panels" :key="`panel-${panel.id}-${index}`"
             v-bind="panel"
             :index="index"
             @ready="handlePanelsReady()"
      />
    </vgl-group>
    <drag-controls camera="camera1"
                   :enable="enableDragControls"
                   :enable-moving="enableMoving"
                   :enable-resizing="enableResizing"
                   @hoveron="handleOverOn"
                   @hoveroff="handleOverOff"
                   @dragstart="handleDragStart"
                   @dragend="handleDragEnd"
                   @move="handleMove"/>
    <Connections ref="connections"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Panel from './Panel/Panel';
import DragControls from '../Controls/DragControls';
import EventBus from '../EventBus/EventBus';
import Connections from './Connections/Connections';

export default {
  name: 'Panels',
  components: { Connections, Panel, DragControls },
  computed: {
    ...mapState('Panels', [
      'panels',
      'enableDragControls',
      'enableMoving',
      'enableResizing',
    ]),
  },
  created() {
    window.panels = {};
    this.setStoreWatcher();
  },
  mounted() { window.root = this.$refs.root; },
  beforeDestroy() {
    this.panelsMutationWatcher();
    this.panelsActionWatcher();
    window.root = null;
  },
  data() {
    return {
      panelsMutationWatcher: () => {},
      panelsActionWatcher: () => {},
      readyCount: 0,
      init: false,
    };
  },
  methods: {
    handleOverOn() {
      // disable OrbitCamera on hover
      this.$store.commit('Camera/enableRotate', false);
      this.$store.commit('Camera/enablePan', false);
    },
    handleOverOff() {
      // enable OrbitCamera on hover
      this.$store.commit('Camera/enableRotate');
      this.$store.commit('Camera/enablePan');
    },
    handleDragStart(object3d, faceIndex) {
      if (!object3d) return;
      // console.log('click on Object3D', object3d);
      this.$store.commit('Camera/selectObject3D', { object3d, faceIndex });
    },
    handleDragEnd() {
      // save history
      EventBus.$emit('save');
    },
    handleMove(payload) {
      // position is a ThreeJS value
      // the plank position has to be unfix so it can be applied to the data itself
      // for that purpose, we ask the plank component to perform the movement
      const {
        event, selected, position, faceIndex, magnetism,
      } = payload;
      const { name } = selected;
      if (selected.isPanel) window.panels[name].move(event, position, selected, faceIndex, magnetism);
      else {
        const id = name.split('_')[0];
        if (!window.panels[id]) return;
        window.panels[id].move(event, position, selected, faceIndex, magnetism);
      }
    },
    handlePanelsReady() {
      // init Connections when panels are rendered
      // mandatory for detecting collisions or default connections
      if (this.init) return;
      this.readyCount += 1;
      if (this.readyCount === this.panels.length) {
        this.$refs.connections.setConnections();
        this.init = true;
      }
    },
    setStoreWatcher() {
      const self = this;
      this.panelsMutationWatcher = this.$store.subscribe((mutation) => {
        if (mutation.type === 'Panels/setPanelData') {
          const { key } = mutation.payload;
          if (['pos', 'x', 'y', 'thick', 'ptype'].includes(key)) {
            // props that can create colliding effect when mutated
            Object.values(window.panels).forEach(p => p.updateColliding());
            self.$refs.connections.setConnections();
          }
        } else if (mutation.type === 'Panels/updateConnection') {
          Object.values(window.panels).forEach(p => p.updateColliding());
        }
      });
      this.panelsActionWatcher = this.$store.subscribeAction({
        after: (action) => {
          if (action.type === 'Panels/deserialize') {
            // deserialize handler
            Object.values(window.panels).forEach(p => p.updateColliding());
            self.$refs.connections.setConnections();
          }
        },
      });
    },
  },
};
</script>

<style scoped>

</style>
