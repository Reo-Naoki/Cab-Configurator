<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Dimensions</h2></div>
    <div class="content-menu-left">
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">{{ panelType === 'VP' ? 'Largeur' : 'Longueur' }}:</label>
          <input class="dimension-box w-input" v-model.number.lazy="x" :disabled="!panel.resizable" />
        </div>
      </div>
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">{{ panelType === 'FP' ? 'Largeur' : 'Hauteur' }}:</label>
          <input class="dimension-box w-input" v-model.number.lazy="y" :disabled="!panel.resizable" />
        </div>
      </div>
      <div class="w-form">
        <div class="dimension-wrapper">
          <label class="inline-block normal">Epaisseur:</label>
          <select class="dimension-select w-select" v-model.number="thick" :disabled="!panel.resizable">
            <option :value="4" v-if="panelType === 'VP'">4 mm</option>
            <option :value="18">18 mm</option>
            <option :value="36" v-if="panelType !== 'VP'">36 mm</option>
            <option v-if="specialThick" :value="thick">{{thick}} mm</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
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
    specialThick() {
      return this.thick !== 4 && this.thick !== 18 && this.thick !== 36;
    },
    x: {
      get() { return this.panel.x; },
      set(data) {
        this.calcPanelPoints({ x: data, y: this.y });
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
        this.calcPanelPoints({ x: this.x, y: data });
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
  methods: {
    calcPanelPoints(newDimension) {
      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const { shapePoints } = window.panels[id];
      const maxX = Math.max(...shapePoints.map(p => p[0]));
      const maxY = Math.max(...shapePoints.map(p => p[1]));
      const minX = Math.min(...shapePoints.map(p => p[0]));
      const minY = Math.min(...shapePoints.map(p => p[1]));
      const newPoints = shapePoints.map(point => (this.isResizablePoint(point, maxX, maxY) ? this.resizePoint(point, newDimension, minX, minY, maxX, maxY) : point));
      window.panels[id].shapePoints = newPoints;
    },
    isResizablePoint(point, maxX, maxY) {
      return point[0] === maxX || point[1] === maxY || point[0] === 0 || point[1] === 0;
    },
    resizePoint(point, dimension, minX, minY, maxX, maxY) {
      return [point[0] === maxX ? Math.max(minX + 1, dimension.x) : point[0],
        point[1] === maxY ? Math.max(minY + 1, dimension.y) : point[1]];
    },
  },
};
</script>
