<template>
  <el-button class="toolbar-button" @click="duplicate()" title="Duplicate" :disabled="isDisable">
    <svg aria-hidden="true" focusable="false" width="1.7em" height="1.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
         preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512">
      <rect x="128" y="128" width="336" height="336" rx="57" ry="57" fill="none" :stroke="isDisable ? '#dddddd' : '#888888'" stroke-linejoin="round" stroke-width="32"/>
      <path d="M383.5 128l.5-24a56.16 56.16 0 0 0-56-56H112a64.19 64.19 0 0 0-64 64v216a56.16 56.16 0 0 0 56 56h24" fill="none"
            :stroke="isDisable ? '#dddddd' : '#888888'" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
      <path fill="none" :stroke="isDisable ? '#dddddd' : '#888888'" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="32" d="M296 216v160"/>
      <path fill="none" :stroke="isDisable ? '#dddddd' : '#888888'" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M376 296H216" />
    </svg>
  </el-button>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';

export default {
  name: 'DuplicateButton',
  components: {
    [Button.name]: Button,
  },
  computed: {
    ...mapState('Panels', [
      'panels',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    isDisable() {
      if (!this.selectedObject3D) return true;
      return !this.selectedObject3D.object3d.isPanel;
    },
    selectedObject3DIndex() {
      const selectedObject = this.selectedObject3D.object3d;
      return this.panels.findIndex(p => p.id === selectedObject.name);
    },
  },
  methods: {
    duplicate() {
      this.$store.dispatch('Panels/duplicatePanel', this.panels[this.selectedObject3DIndex]);
    },
  },
};
</script>
