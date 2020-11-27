<template>
  <div v-bind:class="[`round-icon-2 ${enableDrillEdit ? '' : 'medium-emphasis'} toolbtn`]" :style="`${isDisable ? 'cursor: not-allowed;' : ''}`"
    @click="isDisable ? null : drillEdit()" title="Drill Edit">
    <img src="../../../../../assets/images/Drill.png" alt="" width="22" height="22" :style="`vertical-align: sub; opacity: ${isDisable ? 0.2 : 0.5};`" />
  </div>
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
      if (!window.panels[this.selectedObject3D.object3d.name.split('_')[0]]) return true;
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
