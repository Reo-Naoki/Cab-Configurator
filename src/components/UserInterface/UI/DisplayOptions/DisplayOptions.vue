<template>
  <div class="wrapper-switch">
    <ColorPaletteDisplayer />
    <ConnectionsDisplayer />
  </div>
</template>

<script>
import { Divider, Button } from 'element-ui';
import ColorPaletteDisplayer from './Plugins/ColorPaletteDisplayer';
import ConnectionsDisplayer from './Plugins/ConnectionsDisplayer';

export default {
  name: 'DisplayOptions',
  components: {
    [Divider.name]: Divider,
    [Button.name]: Button,
    ColorPaletteDisplayer,
    ConnectionsDisplayer,
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
  .toolbar-button {
    padding: 2px;
    background-color: #f0f0f0;
    margin: 2px;
    border: black solid 0px;
  }
</style>
