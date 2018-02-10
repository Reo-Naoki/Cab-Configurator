<template>
  <img v-if="!is404"
       :src="url"
       :alt="'3D-' + color.fullname"
       @error="is404 = true"
  >
  <NoImage @404="emit404()" v-else :color="color" />
</template>

<script>
import ColorImageMixin from './ColorImageMixin';
import NoImage from './NoImage';

export default {
  name: 'Color3D',
  components: { NoImage },
  mixins: [ColorImageMixin],
  computed: {
    url() {
      return `${this.colorBaseURL}/${this.color.color_code}/3d-${this.color.color_code}.jpg`;
    },
  },
};
</script>
