<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Dimensions</h2></div>
    <div class="content-menu-left">
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">Width:</label>
          <input class="dimension-box w-input" v-model.number.lazy="width"/>
        </div>
      </div>
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">Height:</label>
          <input class="dimension-box w-input" v-model.number.lazy="height"/>
        </div>
      </div>
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">Depth:</label>
          <input class="dimension-box w-input" v-model.number.lazy="depth"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Switch } from 'element-ui';

export default {
  name: 'GroupDimensionEditor',
  components: { [Switch.name]: Switch },
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

      if (selectedObject.isGroupArrow) {
        if (selectedObject.isDimension) return this.groups.findIndex(p => p.name === selectedObject.name.split('_dimensions')[0]);
        if (selectedObject.isCoordinate) return this.groups.findIndex(p => p.name === selectedObject.name.split('_coordinate')[0]);
      }

      return this.groups.findIndex(p => p.name === selectedObject.name);
    },
    group() {
      return this.groups[this.selectedObject3DIndex];
    },
    dimension: {
      get() {
        const groupDimension = window.groups[this.group.name].dimension;
        return { width: groupDimension.width / 10, height: groupDimension.height / 10, depth: groupDimension.depth / 10 };
      },
      set({ width, height, depth }) {
        window.groups[this.group.name].dimension = { width: width * 10, height: height * 10, depth: depth * 10 };
      },
    },
    width: {
      get() { return this.dimension.width; },
      set(val) { this.dimension = { ...this.dimension, width: val }; },
    },
    height: {
      get() { return this.dimension.height; },
      set(val) { this.dimension = { ...this.dimension, height: val }; },
    },
    depth: {
      get() { return this.dimension.depth; },
      set(val) { this.dimension = { ...this.dimension, depth: val }; },
    },
  },
};
</script>
