<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Couche</h2></div>
    <div class="content-menu-left">
      <select class="dimension-select w-select" v-model.number="layer">
        <option v-if="layers.findIndex(layer => layer.name === 'Structure') ===  undefined" value="Structure" label="Structure" />
        <option v-for="(layer) in layers" :key="layer.name" :value="layer.name" :label="layer.name" />
      </select>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Switch } from 'element-ui';

export default {
  name: 'LayerEditor',
  components: { [Switch.name]: Switch },
  props: ['layers'],
  computed: {
    ...mapState('Panels', [
      'panels',
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
    layer: {
      get() { return this.panel.layer; },
      set(data) {
        this.$store.commit('Panels/setPanelData', {
          index: this.selectedObject3DIndex,
          key: 'layer',
          data,
        });
      },
    },
  },
};
</script>
