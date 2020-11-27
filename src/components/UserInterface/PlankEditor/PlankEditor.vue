<template>
  <div class="menu-left" @click.stop="">
      <div class="wrapper-name-panel" v-if="panel != null || group != null">
        <div v-if="panel != null">Planche n°{{ panel.id }}</div>
        <div v-else-if="group != null">Group n°{{ selectedObject3DIndex + 1 }}</div>
        <div style="width: 50%;">
          <div v-if="showMoveButton" v-bind:class="[`round-icon-2 ${enableMoving ? '' : 'medium-emphasis'} toolbtn`]" @click="movePanel()" title="Move">
            <img src="../../../assets/images/Move.png" alt="" width="24" height="24" :style="`vertical-align: sub; opacity: 0.7;`" />
          </div>
          <div v-if="showResizeButton" v-bind:class="[`round-icon-2 ${enableResizing ? '' : 'medium-emphasis'} ${resizable ? '' : 'disabled'} toolbtn`]"
              @click="resizable ? resizePanel() : null" title="Resize">
            <img src="../../../assets/images/Resize.png" alt="" width="22" height="22" :style="`vertical-align: sub; opacity: ${resizable ? 0.7 : 0.2};`" />
          </div>
          <div class="round-icon-2 medium-emphasis red toolbtn" @click="deletePanel()" title="Delete"><em class="el-icon-delete" /></div>
          <ShapeEditButton />
          <DrillEditButton />
          <DuplicateButton />
        </div>
      </div>
      <ShapeEditor v-if="enableShapeEdit" />
      <DrillEditor v-else-if="enableDrillEdit" />
      <div v-else>
        <GroupDimensionEditor />
        <EdgesDisplayer />
        <LayerEditor :layers="layers"/>
        <DimensionEditor />
        <TypeEditor />
        <PositionEditor :selectedObject3DIndex="selectedObject3DIndex" :panel="panel" :group="group"/>
        <ColorEditor />
        <ConnectionEditor />
        <LayerManager :layers="layers"/>
      </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ShapeEditButton from '../UI/ToolBar/Plugins/ShapeEditButton';
import DrillEditButton from '../UI/ToolBar/Plugins/DrillEditButton';
import DuplicateButton from '../UI/ToolBar/Plugins/DuplicateButton';
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
    ShapeEditButton,
    DrillEditButton,
    DuplicateButton,
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
    moveMode() {
      if (!this.$route.query.mode) return -1;
      return this.$route.query.mode[0];
    },
    resizeMode() {
      if (!this.$route.query.mode) return -1;
      return this.$route.query.mode[1];
    },
    showMoveButton() {
      if (this.panel && this.moveMode === '1') return true;
      if (this.group && this.moveMode === '2') return true;
      if (this.moveMode === '3') return true;
      return false;
    },
    showResizeButton() {
      if (this.panel && this.resizeMode === '1') return true;
      if (this.group && this.resizeMode === '2') return true;
      if (this.resizeMode === '3') return true;
      return false;
    },
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
      if (selectedObject.isGroup) return this.groups.findIndex(p => p.name === selectedObject.name);
      return this.panels.findIndex(p => p.id === selectedObject.name.split('_')[0]);
    },
    panel() {
      if (!this.selectedObject3D || this.selectedObject3D.object3d.isGroupArrow || this.selectedObject3D.object3d.isGroup) return null;
      return this.panels[this.selectedObject3DIndex];
    },
    group() {
      return this.groups[this.selectedObject3DIndex];
    },
    resizable() {
      return (this.panel && this.panel.resizable) || (this.group && this.group.resizable);
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
        if (list.ptype.startsWith('group_')) {
          this.deleteGroup(list.name);
          lastGroup = false;
        } else this.$store.dispatch('Panels/deletePanel', { id: list.id.split('-')[0] });
      });
      this.$store.dispatch('Panels/deleteGroup', { name, save: lastGroup });
    },
  },
};
</script>
<style>
  .toolbtn {
    margin: 3px;
    display: inline-block;
  }
  .createbtn {
    margin: 5px;
    margin-left: auto;
  }
</style>
