<template>
  <div>
    <vgl-group ref="root" name="root">
      <Panel v-for="(panel, index) in panels"
             :key="`panel-${panel.id}-${index}`"
             v-bind="panel"
             :index="index"
             @ready="handlePanelsReady()" />
      <Group v-for="(group, index) in groups"
             :key="`group-${group.name}-${index}`"
             v-bind="group"
             :index="index" />
    </vgl-group>
    <drag-controls camera="camera1"
                   :enable-moving="enableMoving"
                   :enable-resizing="enableResizing"
                   @hoveron="handleOverOn"
                   @hoveroff="handleOverOff"
                   @dragstart="handleDragStart"
                   @hovermove="handleHoverMove"
                   @dragend="handleDragEnd"
                   @dragcancel="handleDragCancel"
                   @move="handleMove" />
    <Connections ref="connections"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Panel from './Panel/Panel';
import Group from './Panel/Group';
import DragControls from '../Controls/DragControls';
import EventBus from '../EventBus/EventBus';
import Connections from './Connections/Connections';

export default {
  name: 'Panels',
  components: {
    Connections,
    Panel,
    Group,
    DragControls,
  },
  computed: {
    ...mapState('Panels', [
      'panels',
      'groups',
      'enableMoving',
      'enableResizing',
      'prevPosition',
      'prevDimension',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
  },
  created() {
    window.panels = {};
    window.groups = {};
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
    handleDragStart(selected) {
      if (!selected) return;
      let object3d = selected;
      const { name } = object3d;

      // console.log('click on Object3D', object3d);
      if (object3d.isPanel) {
        const selectedName = this.selectedObject3D && this.selectedObject3D.object3d.name;
        const { groupName } = window.panels[name];

        if ((selectedName === groupName && !this.enableMoving && !this.enableResizing)
          || selectedName === name || !groupName) {
          this.$store.commit('Camera/selectObject3D', { object3d });
        } else {
          this.$store.commit('Camera/selectObject3D', { object3d: window.groups[groupName] });
          object3d = window.groups[groupName];
        }
      } else this.$store.commit('Camera/selectObject3D', { object3d });

      if (object3d.isPanel) {
        this.$store.commit('Panels/setPrevPosition', window.panels[object3d.name].position);
        this.$store.commit('Panels/setPrevDimension', window.panels[object3d.name].dimension);
        window.panels[object3d.name].setDragging(true);
      } else if (object3d.isGroup) {
        this.$store.commit('Panels/setPrevPosition', window.groups[object3d.name].position);
        this.$store.commit('Panels/setPrevDimension', window.groups[object3d.name].dimension);
        window.groups[object3d.name].setDragging(true);
      } else {
        const id = object3d.isCoordinate ? name.split('_coordinate')[0] : name.split('_dimensions')[0];

        if (object3d.isGroupArrow) {
          if (!window.groups[id]) return;
          this.$store.commit('Panels/setPrevPosition', window.groups[id].position);
          this.$store.commit('Panels/setPrevDimension', window.groups[id].dimension);
          window.groups[id].setDragging(true);
        } else {
          if (!window.panels[id]) return;
          this.$store.commit('Panels/setPrevPosition', window.panels[id].position);
          this.$store.commit('Panels/setPrevDimension', window.panels[id].dimension);
          window.panels[id].setDragging(true);
        }
      }
    },
    handleHoverMove(object3d, point) {
      if (!object3d) return;
      this.$store.commit('Camera/setHoverObject3D', { object3d, point });
    },
    handleMove(payload) {
      // position is a ThreeJS value
      // the plank position has to be unfix so it can be applied to the data itself
      // for that purpose, we ask the plank component to perform the movement
      const {
        event, selected, position, magnetism,
      } = payload;

      const { name } = this.selectedObject3D.object3d;

      if (this.selectedObject3D.object3d.isPanel) {
        window.panels[name].move(event, position, this.selectedObject3D.object3d, magnetism);
      } else if (this.selectedObject3D.object3d.isGroup) {
        window.groups[name].move(event, position, this.selectedObject3D.object3d, magnetism);
      } else {
        const id = selected.isCoordinate ? name.split('_coordinate')[0] : name.split('_dimensions')[0];

        if (selected.isGroupArrow) {
          if (!window.groups[id]) return;
          window.groups[id].move(event, position, selected, magnetism);
        } else {
          if (!window.panels[id]) return;
          window.panels[id].move(event, position, selected, magnetism);
        }
      }
    },
    handleDragEnd(object3d) {
      // save history
      if (this.selectedObject3D.object3d.isGroup) window.groups[this.selectedObject3D.object3d.name].setDragging(false);

      const { name } = object3d;
      if (object3d.isPanel) {
        window.panels[object3d.name].setDragging(false);
      } else {
        const id = object3d.isCoordinate ? name.split('_coordinate')[0] : name.split('_dimensions')[0];

        if (object3d.isGroupArrow) {
          if (!window.groups[id]) return;
          window.groups[id].setDragging(false);
          this.$store.commit('Camera/selectObject3D', { object3d: window.groups[id] });
        } else {
          if (!window.panels[id]) return;
          window.panels[id].setDragging(false);
        }
      }

      this.$refs.connections.setConnections();
      Object.values(window.groups).forEach(group => group.updateBoundingBox());
      EventBus.$emit('save');
    },
    handleDragCancel() {
      // save history
      EventBus.$emit('cancel');
      // this.$store.commit('Panels/enableMoving', false);
      // this.$store.commit('Panels/enableResizing', false);
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
      this.panelsMutationWatcher = this.$store.subscribe((mutation) => {
        if (mutation.type === 'Panels/updateConnection') {
          const self = this;
          this.$nextTick(() => self.$refs.connections.setConnections());
        } else if (mutation.type === 'Panels/setPanelData') {
          this.$nextTick(() => Object.values(window.groups).forEach(group => group.updateBoundingBox()));
        }
      });
      this.panelsActionWatcher = this.$store.subscribeAction({
        after: (action) => {
          if (action.type === 'Panels/deserialize') {
            // deserialize handler
            Object.values(window.panels).forEach(p => p.updateColliding());
            this.$nextTick(() => Object.values(window.groups).forEach(group => group.updateBoundingBox()));
          }
        },
      });
    },
  },
};
</script>
