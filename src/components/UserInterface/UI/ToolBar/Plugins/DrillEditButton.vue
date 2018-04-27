<template>
  <el-button class="toolbar-button" @click="drillEdit()" :style="`${enableDrillEdit ? 'backgroundColor:lightgray' : ''}`" title="Drill Edit" :disabled="isDisable">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false"
        width="1.7em" height="1.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
        preserveAspectRatio="xMidYMid meet" viewBox="2 1 30 30">
      <circle cx="16" cy="16" r="5" :fill="isDisable ? '#dddddd' : '#888888'"/>
      <path d="M26 28H6a2.002 2.002 0 0 1-2-2V6a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v20a2.002 2.002 0 0 1-2 2zM6 6v20h20.001L26 6z" :fill="isDisable ? '#dddddd' : '#888888'"/>
    </svg>
  </el-button>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';

export default {
  name: 'DrillEditButton',
  components: {
    [Button.name]: Button,
  },
  computed: {
    ...mapState('Panels', [
      'enableDrillEdit',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    isDisable() {
      if (!this.selectedObject3D) return true;
      if (this.selectedObject3D.object3d.isGroup) return true;
      if (this.selectedObject3D.object3d.isConnectionBubble) return true;
      return !window.panels[this.selectedObject3D.object3d.name.split('_')[0]].points;
    },
  },
  methods: {
    drillEdit() {
      this.$store.commit('Panels/enableDrillEdit', !this.enableDrillEdit);
      this.$store.dispatch('DisplayManager/hideItems', ['edges-selector']);
    },
  },
};
</script>
