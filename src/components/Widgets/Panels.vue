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
    <Ruler v-if="enableMeasure" :begin="rulerStartPoint" :end="rulerEndPoint"/>
    <drag-controls camera="camera1"
                   @hoveron="handleOverOn"
                   @hoveroff="handleOverOff"
                   @dragstart="handleDragStart"
                   @dragmove="handleMove"
                   @dragend="handleDragEnd"
                   @dragcancel="handleDragCancel"
                   @hovermove="handleHoverMove"
                   @rulerpoint="handleRulerPoint"
                   @rulermove="handleRulerMove"
                   @createpoint="handleCreatePoint"
                   @createdrill="handleCreateDrill" />
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
import Ruler from './Ruler/Ruler';

export default {
  name: 'Panels',
  inject: ['vglNamespace'],
  components: {
    Connections,
    Panel,
    Group,
    DragControls,
    Ruler,
  },
  computed: {
    ...mapState('Panels', [
      'panels',
      'groups',
      'enableMoving',
      'enableResizing',
      'enableMeasure',
      'enableShapeEdit',
      'enableDrillEdit',
      'rulerStartPoint',
      'rulerEndPoint',
      'rulerPointStep',
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
    window.verticeCoordinates = {};
    window.drillCoordinates = {};
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
      isDragging: false,
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

      if (this.enableShapeEdit) {
        this.$store.commit('Camera/selectObject3D', { object3d });
        if (object3d.isCoordinate) {
          this.$store.commit('Panels/setPrevPosition', window.verticeCoordinates[name.split('_coordinate')[0]].position);
          this.$store.commit('Panels/setPrevDimension', window.panels[name.split('_')[0]].dimension);
          window.panels[object3d.name.split('_')[0]].setDragging(true);
        }
        return;
      }
      if (this.enableDrillEdit) {
        this.$store.commit('Camera/selectObject3D', { object3d });
        if (object3d.isCoordinate) {
          this.$store.commit('Panels/setPrevPosition', window.drillCoordinates[name.split('_coordinate')[0]].position);
          this.$store.commit('Panels/setPrevDimension', window.panels[name.split('_')[0]].dimension);
          window.panels[object3d.name.split('_')[0]].setDragging(true);
        }
        return;
      }

      let groupName = null;
      if (object3d.isPanel) ({ groupName } = window.panels[name]);
      if (object3d.isGroup) ({ groupName } = window.groups[name]);

      if ((object3d.isPanel || object3d.isGroup) && groupName) {
        const selectedName = this.selectedObject3D && this.selectedObject3D.object3d.name;
        let parentName = null;

        if (this.selectedObject3D) {
          if (this.selectedObject3D.object3d.isPanel && window.panels[selectedName].groupName) parentName = window.panels[selectedName].groupName;
          else if (this.selectedObject3D.object3d.isGroup && this.selectedObject3D.object3d.groupName) parentName = this.selectedObject3D.object3d.groupName;
        }

        let unselectedName = null;
        if (this.selectedObject3D && object3d.isPanel && window.panels[object3d.name].isSelected) {
          ({ object3d } = this.selectedObject3D);
        } else {
          while (groupName) {
            if (selectedName === window.groups[groupName].name || parentName === window.groups[groupName].name) break;
            unselectedName = window.groups[groupName].name;
            ({ groupName } = window.groups[groupName]);
          }

          if (unselectedName) {
            if ((this.enableMoving || this.enableResizing) && groupName) {
              object3d = window.groups[groupName];
            } else object3d = window.groups[unselectedName];
          } else if (this.enableMoving || this.enableResizing) {
            ({ object3d } = this.selectedObject3D);
          }
        }
      }
      this.$store.commit('Camera/selectObject3D', { object3d });

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
      this.isDragging = true;
      const {
        event, selected, position, magnetism,
      } = payload;

      const { name } = this.selectedObject3D.object3d;

      if (this.enableShapeEdit || this.enableDrillEdit) {
        if (this.selectedObject3D.object3d.isCoordinate) {
          window.panels[name.split('_')[0]].move(event, position, this.selectedObject3D.object3d, magnetism);
        }
        return;
      }

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
      const { name } = object3d;

      if (this.enableShapeEdit) {
        window.panels[name.split('_')[0]].setDragging(false);
        this.$refs.connections.setConnections().then(() => EventBus.$emit('save'));
        return;
      }
      if (this.enableDrillEdit) {
        window.panels[name.split('_')[0]].setDragging(false);
        EventBus.$emit('save');
        return;
      }

      if (this.selectedObject3D.object3d.isGroup) window.groups[this.selectedObject3D.object3d.name].setDragging(false);

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
          this.$store.commit('Camera/selectObject3D', { object3d: this.vglNamespace.object3ds[id] });
        }
      }

      this.isDragging = false;
      this.$refs.connections.setConnections().then(() => EventBus.$emit('save'));
    },
    handleDragCancel() {
      // save history
      this.isDragging = false;
      EventBus.$emit('cancel');
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
    handleRulerPoint({ event, rulerPoint }) {
      if (!event) return;
      if (Object.values(window.panels).length > 0) {
        if (this.rulerPointStep === 0) this.handleOverOn();
        else this.handleOverOff();
        Object.values(window.panels)[0].setRuler(event, rulerPoint, false);
      }
    },
    handleRulerMove({ event, rulerPoint }) {
      if (!event) return;
      if (Object.values(window.panels).length > 0) Object.values(window.panels)[0].setRuler(event, rulerPoint);
    },
    handleCreatePoint(point) {
      const id = this.selectedObject3D.object3d.name.split('_')[0];
      window.panels[id].createPoint(point);
    },
    handleCreateDrill(point) {
      const id = this.selectedObject3D.object3d.name.split('_')[0];
      window.panels[id].createDrill(point);
    },
    setStoreWatcher() {
      this.panelsMutationWatcher = this.$store.subscribe((mutation) => {
        if (mutation.type === 'Panels/updateConnection') {
          const self = this;
          this.$nextTick(() => self.$refs.connections.setConnections().then(() => EventBus.$emit('save')));
        } else if (mutation.type === 'Panels/enableMeasure') {
          if (!this.isDragging) return;
          const appDiv = this.vglNamespace.renderers[0].inst.domElement;
          const auxclickEvent = new MouseEvent('auxclick', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          appDiv.dispatchEvent(auxclickEvent);
        }
      });
      this.panelsActionWatcher = this.$store.subscribeAction({
        after: (action) => {
          if (action.type === 'Panels/deserialize') {
            // deserialize handler
            const self = this;
            this.$nextTick(() => self.$refs.connections.setConnections(true));
            Object.values(window.panels).forEach(p => p.updateColliding());
          }
        },
      });
    },
  },
};
</script>
