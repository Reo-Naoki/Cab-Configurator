<template>
  <div class="wrapper-switch">
    <RulerButton />
    <ShapeEditButton />
  </div>
</template>

<script>

import RulerButton from './Plugins/RulerButton';
import ShapeEditButton from './Plugins/ShapeEditButton';

export default {
  name: 'ToolBar',
  components: {
    RulerButton,
    ShapeEditButton,
  },
};
</script>

<style scoped>
  .wrapper-switch {
    top: 0%;
    bottom: auto;
    background-color: white;
    margin: 3px;
    padding: 0px;
    border-radius: 5px;
    width: auto;
    box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, .1);
  }
  .wrapper-switch .wrapper-line :last-child {
    float: right;
  }
  .toolbar-button {
    padding: 2px;
    background-color: #f0f0f0;
    margin: 2px;
  }
</style>
