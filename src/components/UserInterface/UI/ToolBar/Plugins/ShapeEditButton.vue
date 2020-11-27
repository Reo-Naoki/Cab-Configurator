<template>
  <div v-bind:class="[`round-icon-2 ${enableShapeEdit ? '' : 'medium-emphasis'} toolbtn`]" :style="`${isDisable ? 'cursor: not-allowed;' : ''}`"
    @click="shapeEdit()" title="Shape Edit" :disabled="isDisable">
    <img src="../../../../../assets/images/Jigsaw.png" alt="" width="22" height="22" :style="`vertical-align: sub; opacity: ${isDisable ? 0.2 : 0.5};`" />
  </div>
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
      if (!window.panels[this.selectedObject3D.object3d.name.split('_')[0]]) return true;
      return !window.panels[this.selectedObject3D.object3d.name.split('_')[0]].points;
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
