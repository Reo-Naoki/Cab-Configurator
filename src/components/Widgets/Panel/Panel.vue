<template>
  <component ref="panel" :is="component" v-bind="[$props, $attrs]" v-on="handleUpdate"/>
</template>

<script>
import VerticalPanel from './Meshes/VP/VerticalPanel';
import AdjustableShelf from './Meshes/FP/AdjustableShelf';
import FlatPanel from './Meshes/FP/FlatPanel';
import VerticalDPanel from './Meshes/VDP/VDPanel';
import VDPwithPoints from './Meshes/VDP/VDPwithPoints';
import HDFPanel from './Meshes/VP/HDFPanel';
import DoorPanel from './Meshes/VP/DoorPanel';

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
    DoorPanel,
  },
  props: ['index', 'connections', 'ptype', 'thick', 'points'],
  computed: {
    component() {
      const connections = this.connections || [];
      switch (this.ptype) {
        case 'VP':
          if (this.thick < 18 || connections.some(c => c.type === 'hdfgrove')) return 'HDFPanel';
          if (connections.some(c => c.type === 'hinged')) return 'DoorPanel';
          return 'VerticalPanel';
        case 'FP':
          if (connections.some(c => c.type === 'holeline32')) return 'AdjustableShelf';
          if (connections.some(c => c.type === 'adj40')) return 'AdjustableShelf';
          return 'FlatPanel';
        case 'VDP':
          if (this.points != null && this.points.length !== 0) return 'VDPwithPoints';
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
    syncHandler(key, data) {
      // update key of panel
      this.$store.commit('Panels/setPanelData', { index: this.index, key, data });
    },
  },
};
</script>

<style scoped>

</style>
