<template>
  <div class="wrapper-switch">
    <DragActivator />
    <ColorPaletteDisplayer />
    <ConnectionsDisplayer />
    <!-- <StickerDisplayer /> -->
  </div>
</template>

<script>
import ConnectionsDisplayer from './Plugins/ConnectionsDisplayer';
// import StickerDisplayer from './Plugins/StickerDisplayer';
import ColorPaletteDisplayer from './Plugins/ColorPaletteDisplayer';
import DragActivator from './Plugins/DragActivator';

export default {
  name: 'DisplayOptions',
  components: {
    DragActivator,
    ColorPaletteDisplayer,
    ConnectionsDisplayer,
    // StickerDisplayer,
  },
};
</script>

<style scoped>
  .wrapper-switch .wrapper-line :last-child {
    float: right;
  }
</style>
