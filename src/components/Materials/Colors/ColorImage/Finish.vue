<template>
  <img v-if="!is404 && type === 'img'"
       :src="url"
       :alt="'finish-' + color.finish"
       @error="is404 = true"
  >
  <div v-else-if="!is404 && type === 'background'" :style="{ backgroundImage: url }"></div>
  <NoImage @404="emit404()" v-else :color="color" :type="type"/>
</template>

<script>
import NoImage from './NoImage';
import ColorImageMixin from './ColorImageMixin';

export default {
  name: 'Finish',
  mixins: [ColorImageMixin],
  components: { NoImage },
  computed: {
    url() {
      return `${this.colorBaseURL}/textures/${this.color.manufacturerName.charAt(0)}-${this.color.finish}.jpg`;
    },
  },
};
</script>
