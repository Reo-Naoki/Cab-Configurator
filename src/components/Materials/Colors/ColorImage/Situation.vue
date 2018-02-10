<template>
  <img v-if="!is404"
       :src="url"
       :alt="'situation-' + color.fullname"
       @error="is404 = true"
  >
  <NoImage @404="emit404()" :color="color" v-else/>
</template>

<script>
import NoImage from './NoImage';
import ColorImageMixin from './ColorImageMixin';

export default {
  name: 'Situation',
  mixins: [ColorImageMixin],
  components: { NoImage },
  computed: {
    url() {
      return `${this.colorBaseURL}/${this.color.color_code}/situation-${this.color.color_code}.jpg`;
    },
  },
};
</script>
