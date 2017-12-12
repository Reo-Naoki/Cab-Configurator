<template>
  <img v-if="!is404"
       :src="url"
       :alt="'main-' + color.fullname"
       @error="is404 = true"
  >
  <Color3D v-else :color="color" @404="emit404()"/>
</template>

<script>
import ColorImageMixin from './ColorImageMixin';
import Color3D from './Color3D';

export default {
  name: 'ColorMain',
  components: { Color3D },
  mixins: [ColorImageMixin],
  computed: {
    url() {
      return `${this.colorBaseURL}/${this.color.color_code}/main-color-${this.color.color_code}.jpg`;
    },
  },
};
</script>

<style scoped>

</style>
