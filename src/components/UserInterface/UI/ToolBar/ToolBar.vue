<template>
  <div class="wrapper-switch">
    <RulerButton />
    <VisibilityButton :layers="layers"/>
    <ArrangeButton />
    <AutoEdgeButton />
  </div>
</template>

<script>

import RulerButton from './Plugins/RulerButton';
import VisibilityButton from './Plugins/VisibilityButton';
import ArrangeButton from './Plugins/ArrangeButton';
import AutoEdgeButton from './Plugins/AutoEdgeButton';

export default {
  name: 'ToolBar',
  props: ['layers'],
  components: {
    RulerButton,
    VisibilityButton,
    ArrangeButton,
    AutoEdgeButton,
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
</style>
