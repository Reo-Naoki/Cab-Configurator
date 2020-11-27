<template>
  <div class="round-icon-2 medium-emphasis toolbtn" :style="`${isDisable ? 'cursor: not-allowed;' : ''}`"
    @click="isDisable ? null : duplicate()" title="Duplicate">
    <img src="../../../../../assets/images/Duplicate.png" alt="" width="22" height="22" :style="`vertical-align: sub; opacity: ${isDisable ? 0.2 : 0.5};`" />
  </div>
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
