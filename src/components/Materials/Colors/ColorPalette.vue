<template>
  <div class="ard-colorsbox" v-if="isColorsInitialized">
    <color-list
      v-if="colors && getColorsMaterials.length"
      :name="t('yourcolorpalette')"
      :materials="getColorsMaterials"
      :hide-show-more-colors="true"
      :editable="editable"
      :deletable="deletable"
      :catalog="[colorCatalog]"
      position="extended" />
    <div v-if="colors_hdf && getBackPanelMaterials.length">
      <h4>{{t('backcolor')}}</h4>
      <color-list
        name=""
        :materials="getBackPanelMaterials"
        :force-full-listed="true"
        :hide-show-more-colors="true"
        :editable="editable"
        :catalog="backPanelCatalog"
        :deletable="deletable"
        position="extended" />
    </div>
    <color-list
      v-if="colors_hpl && getStepMaterials.length"
      :name="t('stepscolor')"
      :desc="t('describestepscolors')"
      :force-full-listed="true"
      :materials="getStepMaterials"
      :deletable="deletable"
      :editable="editable"
      :catalog="[hplCatalog, colorCatalog]"
      position="extended" />
  </div>
</template>

<script>
/* eslint-disable no-console,no-undef */
import { mapState, mapGetters } from 'vuex';
import ColorList from './ColorList';

export default {
  name: 'color-palette',
  components: { ColorList },
  props: {
    editable: {
      type: Boolean,
      default: true,
    },
    deletable: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState('materials/colors', [
      'colors',
      'colors_hdf',
      'colors_hpl',
    ]),
    ...mapGetters('materials/colors', [
      'isColorsInitialized',
      'defaultBackPanelColorCode',
      'getColorByCode',
    ]),
    ...mapGetters('materials', [
      'getColorsMaterials',
      'getBackPanelMaterials',
      'getStepMaterials',
      'materialIDToColor',
    ]),
    hasFondColor() {
      return this.general.hdfpos && this.general.hdfpos !== 0;
    },
    isFond18mm() {
      return this.general.hdfpos && this.general.hdfpos === 3;
    },
    isFond3mm() {
      return this.general.hdfpos && this.general.hdfpos === 1;
    },
    colorCatalog() { return ({ slug: 'title_colorsmfc', catalog: this.colors }); },
    hdfCatalog() { return ({ slug: 'title_colorshdf', catalog: this.colors_hdf }); },
    hplCatalog() { return ({ slug: 'title_colorshpl', catalog: this.colors_hpl }); },
    backPanelCatalog() { return 0 === 1 ? [this.hdfCatalog] : [this.colorCatalog]; },
  },
  methods: {
    t(msg) {
      // eslint-disable-next-line no-undef
      return this.$t(msg);
    },
  },
};
</script>

<style scoped>
</style>
