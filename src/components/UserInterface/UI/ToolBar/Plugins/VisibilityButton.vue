<template>
  <el-button class="toolbar-button" @click="changeMode()" :title="`${panelVisibleMode} Mode`" :disabled="isDisable">
    <svg aria-hidden="true" focusable="false" width="1.7em" height="1.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
          preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
      <path v-if="panelVisibleMode === 'Normal'" d="M14 3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" :fill="isDisable ? '#dddddd' : '#888888'" />
      <path v-if="panelVisibleMode === 'Normal'" d="M21 19v-9a2 2 0 0 0-2-2h-1v8a2 2 0 0 1-2 2H8v1a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2z" :fill="isDisable ? '#dddddd' : '#888888'" />
      <path v-else-if="panelVisibleMode === 'Self Hidden'"
            d="M5 16h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2
            2v9c0 1.103.897 2 2 2zm13.997 3H10v-9h9l-.003 9z" :fill="isDisable ? '#dddddd' : '#888888'" />
      <path v-else-if="panelVisibleMode === 'Others Hidden'"
            d="M14 3H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897
            2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2zM5 5h9l-.003 9H5V5z" :fill="isDisable ? '#dddddd' : '#888888'" />
      <path v-else-if="panelVisibleMode === 'All Hidden'"
            d="M5 16h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2
            2zm9.001-2L14 10h.001v4zM19 10l.001 9H10v-3h4c1.103 0 2-.897 2-2v-4h3zM5 5h9v3h-4c-1.103 0-2 .897-2 2v4H5V5z" :fill="isDisable ? '#dddddd' : '#888888'" />
    </svg>
  </el-button>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';

export default {
  name: 'VisibilityButton',
  components: {
    [Button.name]: Button,
  },
  computed: {
    ...mapState('Panels', [
      'panelVisibleMode',
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
    changeMode() {
      this.$store.commit('Panels/changePanelVisibleMode');
    },
  },
};
</script>
