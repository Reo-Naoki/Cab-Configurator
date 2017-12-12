<template>
  <div class="wrapper-line">
    <div class="inline-block">Activer les déplacements</div>
    <el-switch v-model="isDragEnable"></el-switch>
  </div>
</template>

<script>
import { Switch } from 'element-ui';

export default {
  name: 'DragActivator',
  components: { [Switch.name]: Switch },
  computed: {
    isDragEnable: {
      get() { return this.$store.state.Panels.enableMoving; },
      set(val) { this.$store.commit('Panels/enableMoving', val); },
    },
  },
};
</script>

<style scoped>

</style>
