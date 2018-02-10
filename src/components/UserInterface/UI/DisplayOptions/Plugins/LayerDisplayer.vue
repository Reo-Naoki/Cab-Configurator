<template>
  <div class="wrapper-line">
    <div class="inline-block">{{layer.name}}</div>
    <el-switch v-model="showConnections"></el-switch>
  </div>
</template>

<script>
import { Switch } from 'element-ui';
import { mapGetters } from 'vuex';

export default {
  name: 'LayerDisplayer',
  components: {
    [Switch.name]: Switch,
  },
  props: ['layer'],
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    showConnections: {
      get() { return this.isItemDisplayed(this.layer.name); },
      set(val) { this.$store.dispatch(val ? 'DisplayManager/showItems' : 'DisplayManager/hideItems', [this.layer.name]); },
    },
  },
};
</script>
