<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Couche</h2></div>
    <div class="content-menu-left">
      <select class="dimension-select w-select" v-model="layer">
        <option v-if="layers.findIndex(layer => layer.name === 'Structure') ===  undefined" value="Structure" label="Structure" />
        <option v-for="(layer, index) in layers" :key="index" :value="layer.name" :label="layer.name" />
      </select>
      <div class="align-right">
        <input type="button" class="edit-button" @click="manageLayers()" value="Edit Layers"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'LayerEditor',
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
          data: data.toString(),
        });
      },
    },
  },
  methods: {
    manageLayers() {
      this.$store.commit('Panels/enableLayerManager', true);
    },
  },
};
</script>

<style scoped>
  .edit-button {
    font-weight: 500;
    border-radius: 4px;
    border: 1px solid rgb(204, 204, 204);
  }
  .align-right {
    text-align: right;
  }
</style>
