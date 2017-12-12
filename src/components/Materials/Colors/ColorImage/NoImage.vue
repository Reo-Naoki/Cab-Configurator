<template>
  <img v-if="type === 'img'" :src="url" :alt="'no-image-' + color.fullname">
  <div v-else :style="{ backgroundImage: url }"></div>
</template>

<script>
import ColorImageMixin from './ColorImageMixin';
import NoImageJPG from '../assets/noimage.jpg';

export default {
  name: 'NoImage',
  mixins: [ColorImageMixin],
  computed: {
    url() {
      // eslint-disable-next-line global-require
      return NoImageJPG;
    },
  },
  mounted() {
    this.emit404();
  },
};
</script>

<style scoped>

</style>
