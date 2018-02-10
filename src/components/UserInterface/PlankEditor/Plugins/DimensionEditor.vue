<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Dimensions</h2></div>
    <div class="content-menu-left">
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">{{ panelType === 'VP' ? 'Largeur' : 'Longueur' }}:</label>
          <input class="dimension-box w-input" v-model.number.lazy="x"/>
        </div>
      </div>
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">{{ panelType === 'FP' ? 'Largeur' : 'Hauteur' }}:</label>
          <input class="dimension-box w-input" v-model.number.lazy="y"/>
        </div>
      </div>
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">Epaisseur:</label>
          <select class="dimension-select w-select" v-model.number="thick">
            <option :value="4" v-if="panelType === 'VP'">3 mm</option>
            <option :value="18">18 mm</option>
            <option :value="36" v-if="panelType !== 'VP'">36 mm</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { Switch } from 'element-ui';

export default {
  name: 'DimensionEditor',
  components: { [Switch.name]: Switch },
  computed: {
    ...mapState('Panels', [
      'panels',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      if (this.selectedObject3D.object3d.isDimension || this.selectedObject3D.object3d.isCoordinate) {
        return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name.split('_')[0]);
      }
      return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name);
    },
    panel() {
      return this.panels[this.selectedObject3DIndex];
    },
    panelType() {
      return this.panel.ptype;
    },
    x: {
      get() { return this.panel.x; },
      set(data) {
        this.$store.commit('Panels/setPanelData', {
          index: this.selectedObject3DIndex,
          key: 'x',
          data,
        });
      },
    },
    y: {
      get() { return this.panel.y; },
      set(data) {
        this.$store.commit('Panels/setPanelData', {
          index: this.selectedObject3DIndex,
          key: 'y',
          data,
        });
      },
    },
    thick: {
      get() { return this.panel.thick; },
      set(data) {
        this.$store.commit('Panels/setPanelData', {
          index: this.selectedObject3DIndex,
          key: 'thick',
          data,
        });
      },
    },
  },
};
</script>
