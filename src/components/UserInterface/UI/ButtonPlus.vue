<template>
  <div v-if="showCreatePanelButton" class="bouton-plus" @click="addPanel">+<br>&zwj;</div>
</template>

<script>
import EventBus from '../../EventBus/EventBus';

export default {
  name: 'ButtonPlus',
  computed: {
    createPanelMode() {
      if (!this.$route.query.mode) return -1;
      return this.$route.query.mode[4];
    },
    showCreatePanelButton() {
      if (this.createPanelMode === '1') return true;
      return false;
    },
  },
  methods: {
    addPanel() {
      this.$store.dispatch('Panels/addPanel').then(() => EventBus.$emit('save'));
    },
  },
};
</script>
