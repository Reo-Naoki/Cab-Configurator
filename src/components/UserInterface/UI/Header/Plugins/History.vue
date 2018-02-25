<template>
  <div v-if="false"></div>
</template>
<script>
import EventBus from '../../../../EventBus/EventBus';

export default {
  name: 'History',
  data() {
    return {
      index: -1,
      history: [],
      busy: false,
    };
  },
  mounted() {
    EventBus.$on('save', this.save);
    EventBus.$on('undo', this.undo);
    EventBus.$on('redo', this.redo);
    EventBus.$on('cancel', this.cancel);
    EventBus.$on('saveAndReset', this.saveAndReset);
  },
  methods: {
    async undo() {
      if (this.busy) return;
      if (this.index <= 0) return;
      this.busy = true;
      this.index -= 1;
      await this.$store.dispatch('Panels/deserialize', this.history[this.index]);
      this.busy = false;
    },
    async redo() {
      if (this.busy) return;
      if (this.index < 0 || this.index >= this.history.length - 1) return;
      this.busy = true;
      this.index += 1;
      await this.$store.dispatch('Panels/deserialize', this.history[this.index]);
      this.busy = false;
    },
    async cancel() {
      if (this.busy) return;
      if (this.index < 0 || this.index > this.history.length - 1) return;
      this.busy = true;
      await this.$store.dispatch('Panels/deserialize', this.history[this.index]);
      this.busy = false;
    },
    resetIndex(index = this.history.length - 1) {
      this.index = index;
      return index;
    },
    save() {
      this.history.splice(this.index + 1);
      this.history.push(JSON.parse(JSON.stringify(this.$store.getters['Panels/serialize'])));
      this.resetIndex();
    },
    saveAndReset() {
      this.history = [];
      this.history.push(JSON.parse(JSON.stringify(this.$store.getters['Panels/serialize'])));
      this.resetIndex();
    },
  },
};
</script>
