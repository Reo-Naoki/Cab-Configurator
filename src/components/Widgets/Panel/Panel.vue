<template>
  <vgl-group>
    <component ref="panel" :is="component" v-bind="[$props, $attrs]" v-on="handleUpdate" :visible="isLayerVisible" />
  </vgl-group>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import FlatPanel from './Meshes/FP/FlatPanel';
import FDoorPanel from './Meshes/FP/FDoorPanel';
import AdjustableShelf from './Meshes/FP/AdjustableShelf';
import FPwithPoints from './Meshes/FP/FPwithPoints';
import VerticalPanel from './Meshes/VP/VerticalPanel';
import VDoorPanel from './Meshes/VP/VDoorPanel';
import HDFPanel from './Meshes/VP/HDFPanel';
import VPwithPoints from './Meshes/VP/VPwithPoints';
import VerticalDPanel from './Meshes/VDP/VDPanel';
import VDDoorPanel from './Meshes/VDP/VDDoorPanel';
import VDPwithPoints from './Meshes/VDP/VDPwithPoints';

export default {
  name: 'Panel',
  inheritAttrs: false,
  components: {
    FlatPanel,
    FDoorPanel,
    AdjustableShelf,
    FPwithPoints,
    VerticalPanel,
    VDoorPanel,
    HDFPanel,
    VPwithPoints,
    VerticalDPanel,
    VDDoorPanel,
    VDPwithPoints,
  },
  data() {
    return {
      prevType: null,
    };
  },
  inject: ['vglNamespace'],
  props: ['id', 'index', 'x', 'y', 'thick', 'ptype', 'pos', 'points', 'layer', 'groupName'],
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    ...mapState('Panels', [
      'connections',
    ]),
    relatedConnections() {
      return this.connections.filter(c => c.containsPanel(this.id));
    },
    isLayerVisible() {
      return this.isItemDisplayed(this.layer);
    },
    component() {
      const connections = this.relatedConnections || [];
      let doorPanelData;
      const panelPos = this.pos;
      switch (this.ptype) {
        case 'VP':
          doorPanelData = VDoorPanel.data();
          if (this.thick < 18 || connections.some(c => c.type === 'hdfgrove')) {
            if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
              panelPos[1] -= doorPanelData.dimensionsMarginLeft / 10;
              panelPos[2] -= doorPanelData.dimensionsMarginBottom / 10;
              this.cancelDoorDimension(doorPanelData, panelPos);
            }
            this.setPrevType('HDFPanel');

            return 'HDFPanel';
          }
          if (connections.some(c => c.type === 'hinged' && c.p1.toString() === this.id)) {
            if (this.prevType !== null && this.prevType !== 'DoorPanel') { // Convert VerticalPanel into DoorPanel(Set magnetic panel dimension with VP dimension)
              panelPos[1] += doorPanelData.dimensionsMarginLeft / 10;
              panelPos[2] += doorPanelData.dimensionsMarginBottom / 10;
              this.applyDoorDimension(doorPanelData, panelPos);
            }
            this.setPrevType('DoorPanel');

            return 'VDoorPanel';
          }

          if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
            panelPos[1] -= doorPanelData.dimensionsMarginLeft / 10;
            panelPos[2] -= doorPanelData.dimensionsMarginBottom / 10;
            this.cancelDoorDimension(doorPanelData, panelPos);
          }

          if (this.points != null && this.points.length !== 0) {
            this.setPrevType('VPwithPoints');
            return 'VPwithPoints';
          }

          this.setPrevType('VerticalPanel');
          return 'VerticalPanel';
        case 'FP':
          doorPanelData = FDoorPanel.data();
          if (connections.some(c => c.type === 'holeline32')) return 'AdjustableShelf';
          if (connections.some(c => c.type === 'adj40')) return 'AdjustableShelf';
          if (connections.some(c => c.type === 'hinged' && c.p1.toString() === this.id)) {
            if (this.prevType !== null && this.prevType !== 'DoorPanel') { // Convert VerticalPanel into DoorPanel(Set magnetic panel dimension with VP dimension)
              panelPos[0] += doorPanelData.dimensionsMarginLeft / 10;
              panelPos[1] += doorPanelData.dimensionsMarginBottom / 10;
              this.applyDoorDimension(doorPanelData, panelPos);
            }
            this.setPrevType('DoorPanel');

            return 'FDoorPanel';
          }

          if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
            panelPos[0] -= doorPanelData.dimensionsMarginLeft / 10;
            panelPos[1] -= doorPanelData.dimensionsMarginBottom / 10;
            this.cancelDoorDimension(doorPanelData, panelPos);
          }

          if (this.points != null && this.points.length !== 0) {
            this.setPrevType('FPwithPoints');
            return 'FPwithPoints';
          }

          this.setPrevType('FlatPanel');
          return 'FlatPanel';
        case 'VDP':
          doorPanelData = VDDoorPanel.data();
          if (connections.some(c => c.type === 'hinged' && c.p1.toString() === this.id)) {
            if (this.prevType !== null && this.prevType !== 'DoorPanel') { // Convert VerticalPanel into DoorPanel(Set magnetic panel dimension with VP dimension)
              panelPos[0] += doorPanelData.dimensionsMarginLeft / 10;
              panelPos[2] += doorPanelData.dimensionsMarginBottom / 10;
              this.applyDoorDimension(doorPanelData, panelPos);
            }
            this.setPrevType('DoorPanel');

            return 'VDDoorPanel';
          }

          if (this.prevType === 'DoorPanel') { // Convert DoorPanel into VerticalPanel(Set VP dimension with magnetic panel dimension)
            panelPos[0] -= doorPanelData.dimensionsMarginLeft / 10;
            panelPos[2] -= doorPanelData.dimensionsMarginBottom / 10;
            this.cancelDoorDimension(doorPanelData, panelPos);
          }

          if (this.points != null && this.points.length !== 0) {
            this.setPrevType('VDPwithPoints');
            return 'VDPwithPoints';
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
    applyDoorDimension(doorPanelData, panelPos) {
      this.syncHandler('x', this.x - doorPanelData.dimensionsMarginLeft / 10 - doorPanelData.dimensionsMarginRight / 10);
      this.syncHandler('y', this.y - doorPanelData.dimensionsMarginTop / 10 - doorPanelData.dimensionsMarginBottom / 10);
      this.syncHandler('pos', panelPos);
    },
    cancelDoorDimension(doorPanelData, panelPos) {
      this.syncHandler('x', this.x + doorPanelData.dimensionsMarginLeft / 10 + doorPanelData.dimensionsMarginRight / 10);
      this.syncHandler('y', this.y + doorPanelData.dimensionsMarginTop / 10 + doorPanelData.dimensionsMarginBottom / 10);
      this.syncHandler('pos', panelPos);
    },
    setPrevType(data) {
      // switch (data) {
      //   case 'DoorPanel':
      //     this.syncHandler('layer', 'Portes');
      //     break;
      //   case 'HDFPanel':
      //     this.syncHandler('layer', 'Fond');
      //     break;
      //   default:
      //     this.syncHandler('layer', 'Structure');
      // }
      this.prevType = data;
    },
    syncHandler(key, data) {
      // update key of panel
      this.$store.commit('Panels/setPanelData', {
        index: this.index,
        key,
        data,
        noSave: true,
      });
    },
  },
};
</script>
