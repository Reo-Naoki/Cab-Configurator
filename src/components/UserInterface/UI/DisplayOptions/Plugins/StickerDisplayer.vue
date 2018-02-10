<template>
  <div class="wrapper-line">
    <div class="inline-block">Afficher les Etiquettes</div>
    <el-switch v-model="showStickers"></el-switch>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Switch } from 'element-ui';

export default {
  name: 'StickersDisplayer',
  components: { [Switch.name]: Switch },
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    showStickers: {
      get() { return this.isItemDisplayed('stickers'); },
      set(val) { this.$store.dispatch(val ? 'DisplayManager/showItems' : 'DisplayManager/hideItems', ['stickers']); },
    },
  },
};
</script>
