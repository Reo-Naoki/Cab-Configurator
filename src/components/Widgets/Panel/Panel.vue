<template>
  <vgl-group>
    <component ref="panel" :is="component" v-bind="[$props, $attrs]" v-on="handleUpdate"/>
  </vgl-group>
</template>

<script>
import { mapState } from 'vuex';
import VerticalPanel from './Meshes/VP/VerticalPanel';
import AdjustableShelf from './Meshes/FP/AdjustableShelf';
import FlatPanel from './Meshes/FP/FlatPanel';
import VerticalDPanel from './Meshes/VDP/VDPanel';
import VDPwithPoints from './Meshes/VDP/VDPwithPoints';
import HDFPanel from './Meshes/VP/HDFPanel';
import FDoorPanel from './Meshes/FP/FDoorPanel';
import VDDoorPanel from './Meshes/VDP/VDDoorPanel';
import VDoorPanel from './Meshes/VP/VDoorPanel';

export default {
  name: 'Panel',
  inheritAttrs: false,
  components: {
    VerticalPanel,
    AdjustableShelf,
    FlatPanel,
    VerticalDPanel,
    VDPwithPoints,
    HDFPanel,
    FDoorPanel,
    VDDoorPanel,
    VDoorPanel,
  },
  data() {
    return {
      prevType: null,
    };
  },
  inject: ['vglNamespace'],
  props: ['id', 'index', 'ptype', 'x', 'y', 'thick', 'pos', 'points'],
  computed: {
    ...mapState('Panels', [
      'connections',
    ]),
    relatedConnections() {
      return this.connections.filter(c => c.containsPanel(this.id));
    },
    component() {
      const connections = this.relatedConnections || [];
      const doorPanelData = VDoorPanel.data();
      const panelPos = this.pos;

      switch (this.ptype) {
        case 'VP':
          if (this.thick < 18 || connections.some(c => c.type === 'hdfgrove')) {
            if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
              panelPos[1] -= doorPanelData.dimensionsMarginLeft / 10;
              panelPos[2] -= doorPanelData.dimensionsMarginBottom / 10;
              this.syncHandler('x', this.x + doorPanelData.dimensionsMarginLeft / 10 + doorPanelData.dimensionsMarginRight / 10);
              this.syncHandler('y', this.y + doorPanelData.dimensionsMarginTop / 10 + doorPanelData.dimensionsMarginBottom / 10);
              this.syncHandler('pos', panelPos);
            }
            this.setPrevType('HDFPanel');

            return 'HDFPanel';
          }
          if (connections.some(c => c.type === 'hinged' && c.p1.toString() === this.id)) {
            if (this.prevType !== null && this.prevType !== 'DoorPanel') { // Convert VerticalPanel into DoorPanel(Set magnetic panel dimension with VP dimension)
              panelPos[1] += doorPanelData.dimensionsMarginLeft / 10;
              panelPos[2] += doorPanelData.dimensionsMarginBottom / 10;
              this.syncHandler('x', this.x - doorPanelData.dimensionsMarginLeft / 10 - doorPanelData.dimensionsMarginRight / 10);
              this.syncHandler('y', this.y - doorPanelData.dimensionsMarginTop / 10 - doorPanelData.dimensionsMarginBottom / 10);
              this.syncHandler('pos', panelPos);
            }
            this.setPrevType('DoorPanel');

            return 'VDoorPanel';
          }

          if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
            panelPos[1] -= doorPanelData.dimensionsMarginLeft / 10;
            panelPos[2] -= doorPanelData.dimensionsMarginBottom / 10;
            this.syncHandler('x', this.x + doorPanelData.dimensionsMarginLeft / 10 + doorPanelData.dimensionsMarginRight / 10);
            this.syncHandler('y', this.y + doorPanelData.dimensionsMarginTop / 10 + doorPanelData.dimensionsMarginBottom / 10);
            this.syncHandler('pos', panelPos);
          }
          this.setPrevType('VerticalPanel');

          return 'VerticalPanel';
        case 'FP':
          if (connections.some(c => c.type === 'holeline32')) return 'AdjustableShelf';
          if (connections.some(c => c.type === 'adj40')) return 'AdjustableShelf';
          if (connections.some(c => c.type === 'hinged' && c.p1.toString() === this.id)) {
            if (this.prevType !== null && this.prevType !== 'DoorPanel') { // Convert VerticalPanel into DoorPanel(Set magnetic panel dimension with VP dimension)
              panelPos[0] += doorPanelData.dimensionsMarginLeft / 10;
              panelPos[1] += doorPanelData.dimensionsMarginBottom / 10;
              this.syncHandler('x', this.x - doorPanelData.dimensionsMarginLeft / 10 - doorPanelData.dimensionsMarginRight / 10);
              this.syncHandler('y', this.y - doorPanelData.dimensionsMarginTop / 10 - doorPanelData.dimensionsMarginBottom / 10);
              this.syncHandler('pos', panelPos);
            }
            this.setPrevType('DoorPanel');

            return 'FDoorPanel';
          }

          if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
            panelPos[0] -= doorPanelData.dimensionsMarginLeft / 10;
            panelPos[1] -= doorPanelData.dimensionsMarginBottom / 10;
            this.syncHandler('x', this.x + doorPanelData.dimensionsMarginLeft / 10 + doorPanelData.dimensionsMarginRight / 10);
            this.syncHandler('y', this.y + doorPanelData.dimensionsMarginTop / 10 + doorPanelData.dimensionsMarginBottom / 10);
            this.syncHandler('pos', panelPos);
          }
          this.setPrevType('FlatPanel');

          return 'FlatPanel';
        case 'VDP':
          if (this.points != null && this.points.length !== 0) return 'VDPwithPoints';
          if (connections.some(c => c.type === 'hinged' && c.p1.toString() === this.id)) {
            if (this.prevType !== null && this.prevType !== 'DoorPanel') { // Convert VerticalPanel into DoorPanel(Set magnetic panel dimension with VP dimension)
              panelPos[0] += doorPanelData.dimensionsMarginLeft / 10;
              panelPos[2] += doorPanelData.dimensionsMarginBottom / 10;
              this.syncHandler('x', this.x - doorPanelData.dimensionsMarginLeft / 10 - doorPanelData.dimensionsMarginRight / 10);
              this.syncHandler('y', this.y - doorPanelData.dimensionsMarginTop / 10 - doorPanelData.dimensionsMarginBottom / 10);
              this.syncHandler('pos', panelPos);
            }
            this.setPrevType('DoorPanel');

            return 'VDDoorPanel';
          }

          if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
            panelPos[0] -= doorPanelData.dimensionsMarginLeft / 10;
            panelPos[2] -= doorPanelData.dimensionsMarginBottom / 10;
            this.syncHandler('x', this.x + doorPanelData.dimensionsMarginLeft / 10 + doorPanelData.dimensionsMarginRight / 10);
            this.syncHandler('y', this.y + doorPanelData.dimensionsMarginTop / 10 + doorPanelData.dimensionsMarginBottom / 10);
            this.syncHandler('pos', panelPos);
          }
          this.setPrevType('VerticalDPanel');

          return 'VerticalDPanel';
        default:
          return '';
      }
    },
    handleUpdate() {
      // custom v-on/.sync handler
      // we generate all possible props and assign every 'update:props' to a syncHandler
      // plus handle all parent v-on (cf $listener)
      const customListener = [...Object.keys(this.$props), ...Object.keys(this.$attrs)]
        .reduce((acc, current) => ({ ...acc, [`update:${current}`]: (e) => this.syncHandler(current, e) }), {});
      return { ...this.$listeners, ...customListener };
    },
  },
  methods: {
    setPrevType(data) {
      this.prevType = data;
    },
    syncHandler(key, data) {
      // update key of panel
      this.$store.commit('Panels/setPanelData', { index: this.index, key, data });
    },
  },
};
</script>

<style scoped>

</style>
