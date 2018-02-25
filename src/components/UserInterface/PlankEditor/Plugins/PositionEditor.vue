<template>
  <div v-if="panel != null || group != null">
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
      'groups',
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
    position: {
      get() {
        if (this.panel) {
          const [x, y, z] = this.panel.pos;
          return { x, y, z };
        }

        const groupPos = window.groups[this.group.name].position;
        return { x: groupPos.z / 10, y: groupPos.x / 10, z: groupPos.y / 10 };
      },
      set({ x, y, z }) {
        if (this.panel) this.$store.commit('Panels/setPanelData', { index: this.selectedObject3DIndex, key: 'pos', data: [x, y, z] });
        else if (this.group) window.groups[this.group.name].position = { x: y * 10, y: z * 10, z: x * 10 };
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
