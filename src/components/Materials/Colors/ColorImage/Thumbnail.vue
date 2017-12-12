<template>
  <img v-if="!is404"
       :src="url"
       :alt="'thumbnail-' + color.fullname"
       @error="is404 = true"
  >
  <ColorMain v-else :color="color" @404="emit404()"/>
</template>

<script>
import ColorImageMixin from './ColorImageMixin';
import ColorMain from './ColorMain';


export default {
  name: 'Thumbnail',
  components: { ColorMain },
  mixins: [ColorImageMixin],
  computed: {
    url() {
      return `${this.colorBaseURL}/${this.color.color_code}/thumbnail-${this.color.color_code}.jpg`;
    },
  },
};
</script>

<style scoped>

</style>
