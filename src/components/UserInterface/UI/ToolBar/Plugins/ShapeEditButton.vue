<template>
    <el-button class="toolbar-button" @click="shapeEdit()" :style="`${enableShapeEdit ? 'backgroundColor:lightgray' : ''}`"  :disabled="isDisable">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false"
          width="1.7em" height="1.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
          preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
        <path d="M7.83 20A3.001 3.001 0 1 1 4 16.17V7.83A3.001 3.001 0 1 1 7.83 4h8.34A3.001 3.001 0 1 1 20 7.83v8.34A3.001 3.001 0 1 1
                16.17 20H7.83zm0-2h8.34A3.008 3.008 0 0 1 18 16.17V7.83A3.008 3.008 0 0 1 16.17 6H7.83A3.008 3.008 0 0 1 6 7.83v8.34A3.008
                3.008 0 0 1 7.83 18zM5 6a1 1 0 1 0 0-2a1 1 0 0 0 0 2zm14 0a1 1 0 1 0 0-2a1 1 0 0 0 0 2zm0 14a1 1 0 1 0 0-2a1 1 0 0 0 0 2zM5
                20a1 1 0 1 0 0-2a1 1 0 0 0 0 2z" :fill="isDisable ? '#dddddd' : '#888888'"/>
      </svg>
    </el-button>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';

export default {
  name: 'ShapeEditButton',
  components: {
    [Button.name]: Button,
  },
  computed: {
    ...mapState('Panels', [
      'enableShapeEdit',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    isDisable() {
      if (!this.selectedObject3D) return true;
      if (this.selectedObject3D.object3d.isGroup) return true;
      if (this.selectedObject3D.object3d.isConnectionBubble) return true;
      if (window.panels[this.selectedObject3D.object3d.name.split('_')[0]].ptype !== 'VDP') return true;
      return false;
    },
  },
  methods: {
    shapeEdit() {
      this.$store.commit('Panels/enableShapeEdit', !this.enableShapeEdit);
      this.$store.dispatch('DisplayManager/hideItems', ['edges-selector']);
    },
  },
};
</script>
