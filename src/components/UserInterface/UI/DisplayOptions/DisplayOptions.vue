<template>
  <div class="wrapper-switch">
    <LayerDisplayer v-for="(layer) in layers" :key="layer.name" :layer="layer"/>
    <el-divider v-if="layers.length > 0" margin='1px 0' height="3px"/>
    <ColorPaletteDisplayer />
    <ConnectionsDisplayer />
  </div>
</template>

<script>
import {
  Divider,
} from 'element-ui';
import ConnectionsDisplayer from './Plugins/ConnectionsDisplayer';
import ColorPaletteDisplayer from './Plugins/ColorPaletteDisplayer';
import LayerDisplayer from './Plugins/LayerDisplayer';

export default {
  name: 'DisplayOptions',
  props: ['layers'],
  components: {
    ColorPaletteDisplayer,
    ConnectionsDisplayer,
    LayerDisplayer,
    [Divider.name]: Divider,
  },
};
</script>

<style scoped>
  .wrapper-switch .wrapper-line :last-child {
    float: right;
  }
  .el-divider {
    height: 2px;
    margin: 1px 0;
  }
</style>
