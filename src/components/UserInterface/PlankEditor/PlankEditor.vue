<template>
  <div class="menu-left" @click.stop="">
    <ShapeEditor v-if="enableShapeEdit" />
    <DrillEditor v-else-if="enableDrillEdit" />
    <div v-else>
      <div class="wrapper-name-panel" v-if="panel != null || group != null">
        <div v-if="panel != null">Planche n°{{ panel.id }}</div>
        <div v-else-if="group != null">Group n°{{ selectedObject3DIndex + 1 }}</div>
        <div v-bind:class="[`round-icon-2${enableMoving ? '' : ' medium-emphasis'}`]" @click="movePanel()" title="Move"><em class="el-icon-rank" /></div>
        <div v-bind:class="[`round-icon-2${enableResizing ? '' : ' medium-emphasis'}${(panel != null && !panel.resizable) || (group != null && !group.resizable) ? ' disabled' :''}`]"
            @click="(panel != null && panel.resizable) || (group != null && group.resizable) ? resizePanel() : null" title="Resize">◱</div>
        <div class="round-icon-2 medium-emphasis red" @click="deletePanel()" title="Delete"><em class="el-icon-delete" /></div>
      </div>
      <GroupDimensionEditor />
      <EdgesDisplayer />
      <LayerEditor :layers="layers"/>
      <DimensionEditor />
      <TypeEditor />
      <PositionEditor />
      <ColorEditor />
      <ConnectionEditor />
      <LayerManager :layers="layers"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import GroupDimensionEditor from './Plugins/GroupDimensionEditor';
import EdgesDisplayer from './Plugins/EdgesDisplayer';
import LayerEditor from './Plugins/LayerEditor';
import DimensionEditor from './Plugins/DimensionEditor';
import TypeEditor from './Plugins/TypeEditor';
import PositionEditor from './Plugins/PositionEditor';
import ColorEditor from './Plugins/ColorEditor';
import ConnectionEditor from './Plugins/Connection/ConnectionEditor';
import LayerManager from './Plugins/Layer/LayerManager';
import ShapeEditor from './Plugins/ShapeEditor';
import DrillEditor from './Plugins/DrillEditor';

export default {
  name: 'PlankEditor',
  components: {
    GroupDimensionEditor,
    EdgesDisplayer,
    LayerEditor,
    DimensionEditor,
    TypeEditor,
    PositionEditor,
    ColorEditor,
    ConnectionEditor,
    LayerManager,
    ShapeEditor,
    DrillEditor,
  },
  props: ['layers'],
  computed: {
    ...mapState('Panels', [
      'panels',
      'groups',
      'enableMoving',
      'enableResizing',
      'enableShapeEdit',
      'enableDrillEdit',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      const selectedObject = this.selectedObject3D.object3d;

      if (selectedObject.isDimension || selectedObject.isCoordinate) {
        if (selectedObject.isGroupArrow) {
          if (selectedObject.isDimension) return this.groups.findIndex(p => p.name === selectedObject.name.split('_dimensions')[0]);
          if (selectedObject.isCoordinate) return this.groups.findIndex(p => p.name === selectedObject.name.split('_coordinate')[0]);
        }
        return this.panels.findIndex(p => p.id === selectedObject.name.split('_')[0]);
      }

      if (selectedObject.isPanel) return this.panels.findIndex(p => p.id === selectedObject.name);
      return this.groups.findIndex(p => p.name === selectedObject.name);
    },
    panel() {
      if (!this.selectedObject3D || this.selectedObject3D.object3d.isGroupArrow || this.selectedObject3D.object3d.isGroup) return null;
      return this.panels[this.selectedObject3DIndex];
    },
    group() {
      return this.groups[this.selectedObject3DIndex];
    },
  },
  methods: {
    deletePanel() {
      if (this.panel) this.$store.dispatch('Panels/deletePanel', { id: this.panel.id, save: true });
      else if (this.group) this.deleteGroup(this.group.name);
      this.$store.commit('Camera/selectObject3D');
    },
    movePanel() {
      this.$store.commit('Panels/enableMoving', !this.enableMoving);
    },
    resizePanel() {
      this.$store.commit('Panels/enableResizing', !this.enableResizing);
    },
    deleteGroup(name) {
      let lastGroup = true;
      window.groups[name].rlist.forEach((list) => {
        if (list.ptype === 'group_stddrawer') {
          this.deleteGroup(list.name);
          lastGroup = false;
        } else this.$store.dispatch('Panels/deletePanel', { id: list.id.split('-')[0] });
      });
      this.$store.dispatch('Panels/deleteGroup', { name, save: lastGroup });
    },
  },
};
</script>
