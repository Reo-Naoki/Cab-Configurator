<template>
  <el-button class="toolbar-button" @click="measureDistance()" :style="`${enableMeasure ? 'backgroundColor:lightgray' : ''}`" title="Ruler" >
    <svg aria-hidden="true" focusable="false" width="1.7em" height="1.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
         preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64">
      <path d="M60.905 48.851L15.148 3.094C14.443 2.389 13.503 2 12.5 2s-1.942.389-2.649 1.094L3.095 9.85A3.72 3.72 0 0 0 2 12.499c0
              1.004.389 1.943 1.095 2.648L48.85 60.906c.705.705 1.646 1.094 2.649 1.094s1.944-.389 2.648-1.094l6.759-6.759a3.75 3.75
              0 0 0-.001-5.296m-1.285 4.012l-6.758 6.758c-.723.723-2.005.723-2.728 0L4.379
              13.861c-.361-.361-.561-.845-.561-1.362s.199-1.002.562-1.364l6.755-6.755c.363-.362.848-.562
              1.365-.562s1.002.199 1.363.561l.258.258l-6.898 6.896l1.458 1.46l6.898-6.897l1.46 1.461l-3.126 3.127l1.458
              1.459l3.126-3.128l1.461 1.46l-3.128 3.128l1.459 1.459l3.128-3.128l1.459 1.459l-3.127 3.129l1.46 1.459l3.127-3.127l1.46
              1.459l-6.899 6.898l1.462 1.46l6.896-6.899l1.46 1.46l-3.128 3.128l1.46 1.459l3.127-3.127l1.461 1.46l-3.129 3.127l1.459
              1.459l3.128-3.128l1.46 1.461l-3.128 3.127l1.46 1.459l3.127-3.127l1.459 1.458l-6.896 6.899l1.46 1.46l6.897-6.898l1.459
              1.459l-3.128 3.128l1.46 1.459l3.127-3.127l1.461 1.46l-3.129 3.127l1.461 1.459l3.127-3.126l1.459 1.459l-3.128 3.127l1.46
              1.459l3.127-3.127l1.46 1.459l-6.897 6.898l1.46 1.46l6.896-6.899l1.46 1.46l-3.128 3.128l1.46 1.461l3.128-3.129l1.46
              1.46l-3.129 3.127l1.459 1.459l3.128-3.128l1.46 1.461l-3.128 3.127l1.461 1.459l3.127-3.127l.256.256a1.93 1.93 0 0 1-.001 2.725"
              fill="#626262"/>
      <circle cx="12.366" cy="14.942" r="2.365" fill="#626262"/>
      <circle cx="22.898" cy="25.473" r="2.364" fill="#626262"/>
      <circle cx="47.709" cy="50.284" r="2.364" fill="#626262"/>
    </svg>
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
