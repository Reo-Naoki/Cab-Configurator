<template>
  <img v-if="!is404"
       :src="url"
       :alt="'big-' + color.fullname"
       @error="is404 = true"
  >
  <NoImage @404="emit404()" :color="color" v-else/>
</template>

<script>
import ColorImageMixin from './ColorImageMixin';
import NoImage from './NoImage';

export default {
  name: 'Big',
  components: { NoImage },
  mixins: [ColorImageMixin],
  computed: {
    url() {
      return `${this.colorBaseURL}/${this.color.color_code}/big-color-${this.color.color_code}.jpg`;
    },
  },
};
</script>

<style scoped>

</style>
