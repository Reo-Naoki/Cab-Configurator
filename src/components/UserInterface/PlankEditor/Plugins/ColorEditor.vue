<template>
  <div v-if="selectedObject3DIndex !== -1">
    <h2 class="heading-menu">Coloris</h2>
    <div class="content-menu-left">
      <Color
        :color="getColorFromMaterial"
        :catalog="[catalogByType]"
        position="horizontal"
        @click.native="showColorPalette = true"
      />
      <ColorPicker :show-color-palette="showColorPalette"
                   :selected-color="Number(panel.material)"
                   :show-current-color="true"
                   :colors="colors"
                   name="coloreditor"
                   :catalog="[catalogByType]"
                   @show-dialog="showColorPalette = $event"
                   @picked-color="updateMaterial"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Color from '../../../Materials/Colors/Color';
import ColorPicker from '../../../Materials/Colors/ColorPicker';

export default {
  name: 'ColorEditor',
  components: { ColorPicker, Color },
  data() {
    return {
      showColorPalette: false,
    };
  },
  computed: {
    ...mapState('materials/colors', [
      'colors',
      'colors_hpl',
      'colors_hdf',
    ]),
    ...mapGetters('materials', [
      'materialIDToColor',
    ]),
    ...mapState('Panels', [
      'panels',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    getColorFromMaterial() {
      if (!this.panel) return undefined;
      return this.materialIDToColor(this.panel.material);
    },
    colorCatalog() { return ({ slug: 'title_colorsmfc', catalog: this.colors }); },
    hdfCatalog() { return ({ slug: 'title_colorshdf', catalog: this.colors_hdf }); },
    hplCatalog() { return ({ slug: 'title_colorshpl', catalog: this.colors_hpl }); },
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name.split('_')[0]);
    },
    panel() {
      return this.panels[this.selectedObject3DIndex] || undefined;
    },
    panelType() {
      if (!this.panel) return undefined;
      return window.panels[this.panel.id].ptype;
    },
    catalogByType() {
      if (this.panelType === 'VP') return this.hdfCatalog;
      return this.colorCatalog;
    },
  },
  methods: {
    updateMaterial(newID) {
      this.$store.commit('Panels/setPanelData', { index: this.selectedObject3DIndex, key: 'material', data: String(newID) });
    },
  },
};
</script>
