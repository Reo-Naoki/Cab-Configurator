<template>
  <div class="toolbar-div">
    <el-button class="toolbar-button" @click="changeEdgeAutoApplier()" :title="'Auto Edge'" >
      <img src="../../../../../assets/images/AutoEdge.png" alt="" width="28" height="28" :style="`vertical-align: sub; opacity: 0.7;`" />
    </el-button>
    <EdgeAutoApplier v-if="enableEdgeAutoApplier"/>
  </div>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';
import EdgeAutoApplier from './EdgeAutoApplier';

export default {
  name: 'AutoEdgeButton',
  components: {
    [Button.name]: Button,
    EdgeAutoApplier,
  },
  computed: {
    ...mapState('Panels', [
      'enableEdgeAutoApplier',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
  },
  methods: {
    changeEdgeAutoApplier() {
      this.$store.commit('Panels/enableEdgeAutoApplier', !this.enableEdgeAutoApplier);
    },
  },
};
</script>
