<template>
  <div class="wrapper-line" v-if="selectedObject3DIndex !== -1">
    <div class="inline-block">Afficher les Placages de chant</div>
    <el-switch v-model="showEdgesSelector"></el-switch>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { Switch } from 'element-ui';

export default {
  name: 'EdgesDisplayer',
  components: { [Switch.name]: Switch },
  computed: {
    ...mapState('Panels', [
      'panels',
    ]),
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      if (this.selectedObject3D.object3d.isDimension || this.selectedObject3D.object3d.isCoordinate) {
        return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name.split('_')[0]);
      }
      return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name);
    },
    showEdgesSelector: {
      get() { return this.isItemDisplayed('edges-selector'); },
      set(val) { this.$store.dispatch(val ? 'DisplayManager/showItems' : 'DisplayManager/hideItems', ['edges-selector']); },
    },
  },
};
</script>

<style scoped>

</style>
