<template>
  <div class="toolbar-div">
    <el-button class="toolbar-button" @click="changeMode()" :title="`${panelVisibleMode} Mode`" >
      <img src="../../../../../assets/images/XRay.png" alt="" width="28" height="28" :style="`vertical-align: sub; opacity: 0.7;`" />
    </el-button>
    <div v-if="enableLayerDisplayer" class="toolbar-popup layer-displayer">
      <LayerDisplayer v-for="(layer, index) in layers" :key="index" :layer="layer" />
    </div>
  </div>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';
import LayerDisplayer from '../../DisplayOptions/Plugins/LayerDisplayer';

export default {
  name: 'VisibilityButton',
  props: ['layers'],
  components: {
    [Button.name]: Button,
    LayerDisplayer,
  },
  computed: {
    ...mapState('Panels', [
      'panelVisibleMode',
      'enableLayerDisplayer',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
  },
  methods: {
    changeMode() {
      if (this.selectedObject3D && window.panels[this.selectedObject3D.object3d.name.split('_')[0]]) {
        this.$store.commit('Panels/changePanelVisibleMode');
      } else {
        this.$store.commit('Panels/changeLayerDisplayerMode', !this.enableLayerDisplayer);
      }
    },
  },
};
</script>

<style>
  .wrapper-switch .wrapper-line :last-child {
    float: right;
  }
  .toolbar-div {
    display: inline-block;
  }
  .toolbar-button {
    padding: 2px !important;
    background-color: #f0f0f0 !important;
    margin: 2px !important;
  }
  .toolbar-popup {
    padding: 20px;
    padding-top: 0px;
    padding-bottom: 0px;
    position: absolute;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 1px 1px 6px 0 #bfbfbf;
    transform: translate(0px, 1px);
  }
  .layer-displayer {
    width: 300px;
  }
</style>
