<template>
  <el-button class="toolbar-button" @click="measureDistance()" :style="`${enableMeasure ? 'backgroundColor:antiquewhite !important' : ''}`" title="Ruler" >
    <img src="../../../../../assets/images/Ruler.png" alt="" width="28" height="28" style="vertical-align: sub; opacity: 0.7;" />
  </el-button>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';

export default {
  name: 'RulerButton',
  components: {
    [Button.name]: Button,
  },
  computed: {
    ...mapState('Panels', [
      'enableMeasure',
    ]),
  },
  methods: {
    measureDistance() {
      this.$store.commit('Panels/enableMeasure', !this.enableMeasure);
    },
  },
};
</script>
