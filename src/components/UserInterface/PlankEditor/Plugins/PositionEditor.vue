<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Position</h2></div>
    <div class="content-menu-left">
      <div class="w-form">
        <div class="wrapper-position">
          <label class="inline-block normal">X:</label>
          <input class="dimension-box position w-input" v-model.number="x"/>
          <label class="inline-block normal">Y:</label>
          <input class="dimension-box position w-input" v-model.number="y"/>
          <label class="inline-block normal">Z:</label>
          <input class="dimension-box position w-input" v-model.number="z"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'PositionEditor',
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
    position: {
      get() {
        const [x, y, z] = this.panel.pos;
        return { x, y, z };
      },
      set({ x, y, z }) {
        this.$store.commit('Panels/setPanelData', { index: this.selectedObject3DIndex, key: 'pos', data: [x, y, z] });
      },
    },
    x: {
      get() { return this.position.x; },
      set(val) { this.position = { ...this.position, x: val }; },
    },
    y: {
      get() { return this.position.y; },
      set(val) { this.position = { ...this.position, y: val }; },
    },
    z: {
      get() { return this.position.z; },
      set(val) { this.position = { ...this.position, z: val }; },
    },
  },
  methods: {
    modify(key, event) {
      const { x, y, z } = { ...this.pos, [key]: event.target.value };
      this.$emit('update:pos', [x, y, z]);
    },
  },
};
</script>

<style scoped>
  input {
    width: 60px;
  }
</style>
