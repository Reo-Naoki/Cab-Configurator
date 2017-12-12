<template>
  <div class="wrapper-line">
    <div class="inline-block">Afficher les fixations</div>
    <el-switch v-model="showConnections"></el-switch>
  </div>
</template>

<script>
import { Switch } from 'element-ui';
import { mapGetters } from 'vuex';

export default {
  name: 'ConnectionsDisplayer',
  components: {
    [Switch.name]: Switch,
  },
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    showConnections: {
      get() { return this.isItemDisplayed('connections'); },
      set(val) { this.$store.dispatch(val ? 'DisplayManager/showItems' : 'DisplayManager/hideItems', ['connections']); },
    },
  },
};
</script>

<style scoped>

</style>
