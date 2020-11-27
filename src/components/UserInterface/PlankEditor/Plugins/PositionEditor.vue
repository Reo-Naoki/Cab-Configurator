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
  props: ['selectedObject3DIndex', 'panel', 'group'],
  computed: {
    ...mapState('Panels', [
      'panels',
      'groups',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
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
