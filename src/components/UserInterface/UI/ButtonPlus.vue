<template>
  <div class="bouton-plus" @click="addPanel">+<br>&zwj;</div>
</template>

<script>
import EventBus from '../../EventBus/EventBus';

export default {
  name: 'ButtonPlus',
  methods: {
    addPanel() {
      this.$store.dispatch('Panels/addPanel').then(() => EventBus.$emit('save'));
    },
  },
};
</script>

<style scoped>

</style>
