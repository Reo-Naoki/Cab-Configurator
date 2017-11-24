import Vue from 'vue';

const EventBus = new Vue({
  computed: {
    controls: {
      get() { return this.orbitControls || null; },
      set(controls) { this.orbitControls = controls; },
    },
  },
});
export default EventBus;
window.EventBus = EventBus;
