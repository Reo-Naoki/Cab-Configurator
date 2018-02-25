<template>
  <div class="menu-left" @click.stop="">
    <div class="wrapper-name-panel" v-if="panel != null">
      <div>Planche n°{{ panel.id }}</div>
      <div v-bind:class="[`round-icon-2${enableMoving ? '' : ' medium-emphasis'}`]" @click="movePanel()">☩</div>
      <div v-bind:class="[`round-icon-2${enableResizing ? '' : ' medium-emphasis'}${panel.resizable ? '' :' disabled'}`]" @click="panel.resizable ? resizePanel() : null">◱</div>
      <div class="round-icon-2 medium-emphasis red" @click="deletePanel()"></div>
    </div>
    <div class="wrapper-name-panel" v-else-if="group != null">
      <div>Group n°{{ selectedObject3DIndex + 1 }}</div>
      <div v-bind:class="[`round-icon-2${enableMoving ? '' : ' medium-emphasis'}`]" @click="movePanel()">☩</div>
      <div v-bind:class="[`round-icon-2${enableResizing ? '' : ' medium-emphasis'}`]" @click="resizePanel()">◱</div>
      <div class="round-icon-2 medium-emphasis red" @click="deletePanel()"></div>
    </div>
    <EdgesDisplayer />
    <LayerEditor :layers="layers"/>
    <GroupDimensionEditor />
    <DimensionEditor />
    <TypeEditor />
    <PositionEditor />
    <ColorEditor />
    <ConnectionEditor />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import GroupDimensionEditor from './Plugins/GroupDimensionEditor';
import DimensionEditor from './Plugins/DimensionEditor';
import PositionEditor from './Plugins/PositionEditor';
import TypeEditor from './Plugins/TypeEditor';
import ColorEditor from './Plugins/ColorEditor';
import EdgesDisplayer from './Plugins/EdgesDisplayer';
import LayerEditor from './Plugins/LayerEditor';

export default {
  name: 'PlankEditor',
  components: {
    ColorEditor,
    TypeEditor,
    PositionEditor,
    DimensionEditor,
    GroupDimensionEditor,
    EdgesDisplayer,
    LayerEditor,
    ConnectionEditor: () => import(/* webpackChunkName: "connection-editor" */ './Plugins/Connection/ConnectionEditor'),
  },
  props: ['layers'],
  computed: {
    ...mapState('Panels', [
      'panels',
      'groups',
      'enableMoving',
      'enableResizing',
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
      if (this.panel) this.$store.dispatch('Panels/deletePanel', this.panel.id);
      else if (this.group) {
        window.groups[this.group.name].rlist.forEach(panel => this.$store.dispatch('Panels/deletePanel', panel.id.split('-')[0]));
        this.$store.dispatch('Panels/deleteGroup', this.group.name);
      }
    },
    movePanel() {
      this.$store.commit('Panels/enableMoving', !this.enableMoving);
      this.$store.commit('Panels/enableResizing', false);
    },
    resizePanel() {
      this.$store.commit('Panels/enableResizing', !this.enableResizing);
      this.$store.commit('Panels/enableMoving', false);
    },
  },
};
</script>
