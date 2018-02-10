<template>
  <div class="menu-left" @click.stop="">
    <div class="wrapper-name-panel" v-if="panel != null">
      <div>Planche n°{{ panel.id }}</div>
      <div v-bind:class="[this.enableMoving ? 'round-icon-2' : 'round-icon-2 medium-emphasis']" @click="movePanel()">☩</div>
      <div v-bind:class="[this.enableResizing ? 'round-icon-2' : 'round-icon-2 medium-emphasis']" @click="resizePanel()">◱</div>
      <div class="round-icon-2 medium-emphasis red" @click="deletePanel()"></div>
    </div>
    <EdgesDisplayer />
    <LayerEditor :layers="layers"/>
    <DimensionEditor />
    <TypeEditor />
    <PositionEditor />
    <ColorEditor />
    <ConnectionEditor />
  </div>
</template>

<script>
import { mapState } from 'vuex';
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
    EdgesDisplayer,
    LayerEditor,
    ConnectionEditor: () => import(/* webpackChunkName: "connection-editor" */ './Plugins/Connection/ConnectionEditor'),
  },
  props: ['layers'],
  computed: {
    ...mapState('Panels', [
      'panels',
      'enableMoving',
      'enableResizing',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      if (this.selectedObject3D.object3d.isDimension || this.selectedObject3D.object3d.isCoordinate) {
        return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name.split('_')[0]);
      }
      return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name);
    },
    panel() {
      return this.panels[this.selectedObject3DIndex];
    },
  },
  methods: {
    deletePanel() {
      this.$store.dispatch('Panels/deletePanel', this.panel.id);
    },
    movePanel() {
      this.$store.commit('Panels/movePanel');
    },
    resizePanel() {
      this.$store.commit('Panels/resizePanel');
    },
  },
};
</script>
