<template>
  <div class="wrapper-line">
    <div class="inline-block">Afficher la palette de couleur</div>
    <el-dialog :visible.sync="showColorPalette" append-to-body custom-class="color-picker-dialog" top="2vh">
      <ColorPalette />
    </el-dialog>
    <el-switch v-model="showColorPalette"></el-switch>
  </div>
</template>

<script>
import { Switch, Dialog } from 'element-ui';
import ColorPalette from '../../../../Materials/Colors/ColorPalette';

export default {
  name: 'ColorPaletteDisplayer',
  components: {
    ColorPalette,
    [Switch.name]: Switch,
    [Dialog.name]: Dialog,
  },
  data() {
    return {
      showColorPalette: false,
    };
  },
};
</script>

<style>
  .color-picker-dialog {
    display: flex;
    flex-flow: column;
    max-height: 96vh;
    margin-bottom: 0;
  }
  .color-picker-dialog .el-dialog__body {
    flex: 1 1 auto;
    overflow-x: auto;
    padding: 5px 20px;
  }
</style>
