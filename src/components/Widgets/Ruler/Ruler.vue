<template>
  <div v-if="begin != null && end != null">
   <vgl-geometry ref="geometry" name="ruler" :position-attribute="vertices"></vgl-geometry>
   <vgl-line ref="line" geometry="ruler" material="ruler"></vgl-line>
  </div>
</template>

<script>
export default {
  name: 'Ruler',
  props: {
    begin: {
      required: true,
    },
    end: {
      required: true,
    },
  },
  computed: {
    vertices() {
      const { begin: { position: { x: bx, y: by, z: bz } }, end: { position: { x: ex, y: ey, z: ez } } } = this;
      return [bx, by, bz, ex, ey, ez];
    },
  },
  mounted() {
    window.ruler = this;
  },
};
</script>

<style scoped>

</style>
